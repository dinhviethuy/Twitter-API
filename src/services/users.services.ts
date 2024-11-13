import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import databaseServices from './database.services'
import { RegisterReqBody } from '~/models/requests/User.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { config } from 'dotenv'
import { USERS_MESSAGE } from '~/constants/messages'

// Đọc biến môi trường
config()

// Service xử lý logic liên quan đến users
class UsersService {
  // Tạo access_token
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }
  // Tạo refresh_token
  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }
  // Tạo email_verify_token
  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }
  // Tạo forgot_password_token
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }
  // Tạo access_token và refresh_token
  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })])
  }
  // Đăng ký tài khoản
  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    // Tạo email_verify_token
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    // Thêm user vào database
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    // Tạo access_token và refresh_token
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })
    // Thêm refresh_token vào database
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    console.log('email_verify_token: ', email_verify_token)
    // Trả về access_token và refresh_token
    return {
      access_token,
      refresh_token
    }
  }
  // kiểm tra email tồn tại
  async checkEmailExist(email: string) {
    // Kiểm tra email tồn tại trong database users hay không
    const user = await databaseServices.users.findOne({ email })
    return Boolean(user)
  }
  // Login
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify })
    // Thêm refresh_token vào database
    await databaseServices.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    // Trả về access_token và refresh_token
    return {
      access_token,
      refresh_token
    }
  }
  // logout
  async logout(refresh_token: string) {
    // Xóa refresh_token khỏi database
    await databaseServices.refreshTokens.deleteOne({ token: refresh_token })
    // Trả về thông báo
    return {
      message: USERS_MESSAGE.LOGOUT_SUCCESSFUL
    }
  }
  // Verify email
  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      // Tạo access_token và refresh_token
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      // Cập nhật trạng thái verify
      databaseServices.users.updateOne(
        {
          _id: new ObjectId(user_id)
        },
        [
          {
            // Set dùng để cập nhật giá trị
            $set: {
              email_verify_token: '',
              verify: UserVerifyStatus.Verified,
              // updated_at: new Date()
              updated_at: '$$NOW'
            }
            // Cập nhật updated_at
            // $currentDate: { updated_at: true }
          }
        ]
      )
    ])
    const [access_token, refresh_token] = token
    return {
      access_token,
      refresh_token
    }
  }
  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken({ user_id, verify: UserVerifyStatus.Unverified })
    console.log('Resend email: ', email_verify_token)
    // Cập nhật email_verify_token
    databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGE.RESEND_VERIFY_EMAIL_SUCCESSFUL
    }
  }

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify })
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: { updated_at: true }
      }
    )
    console.log('forgot_password_token: ', forgot_password_token)
    return {
      message: USERS_MESSAGE.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(user_id: string, password: string) {
    await databaseServices.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGE.RESET_PASSWORD_SUCCESSFUL
    }
  }
  async getMe(user_id: string) {
    const user = await databaseServices.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }
}

// Tạo một thể hiện của UsersService và xuất nó
const usersServices = new UsersService()
export default usersServices
