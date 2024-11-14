import { UnfollowReqParams } from './../models/requests/User.requests'
import { checkSchema, ParamSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import usersServices from '~/services/users.services'
import { USERS_MESSAGE } from '~/constants/messages'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'
import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enum'
import { REGEX_USERNAME } from '~/constants/regex'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGE.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 6,
      max: 50
    },
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  },
  custom: {
    errorMessage: USERS_MESSAGE.CONFIRM_PASSWORD_DOES_NOT_MATCH,
    options: (value, { req }) => {
      // Kiểm tra confirm_password có trùng với password không
      if (value !== req.body.password) {
        // Nếu không trùng thì trả về lỗi
        throw new Error(USERS_MESSAGE.CONFIRM_PASSWORD_DOES_NOT_MATCH)
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGE.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      try {
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOnPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { user_id } = decoded_forgot_password_token
        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
        if (user === null) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGE.IN_VALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decoded_forgot_password_token = decoded_forgot_password_token // Gán decoded_forgot_password_token vào req
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          // instanceof để kiểm tra error có phải là JsonWebTokenError không
          throw new ErrorWithStatus({
            message: capitalize(error.message),
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGE.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGE.NAME_MUST_BE_A_STRING
  },
  isLength: {
    options: {
      min: 1,
      max: 100
    },
    errorMessage: USERS_MESSAGE.NAME_LENGTH_MUST_BE_FROM_1_TO_100
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true, // Kiểm tra chuẩn ISO8601
      strictSeparator: true // Kiểm tra dấu phân cách
    },
    errorMessage: USERS_MESSAGE.DATE_OF_BIRTH_MUST_BE_ISO8601
  }
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USERS_MESSAGE.IMAGE_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USERS_MESSAGE.IMAGE_LENGTH_MUST_BE_FROM_1_TO_400
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USERS_MESSAGE.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user // Gán user vào req.user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGE.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          options: {
            min: 6,
            max: 50
          },
          errorMessage: USERS_MESSAGE.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50
        },
        isStrongPassword: {
          // Kiểm tra password có đủ mạnh không
          errorMessage: USERS_MESSAGE.PASSWORD_MUST_BE_STRONG,
          options: {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          }
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExistEmail = await usersServices.checkEmailExist(value)
            if (isExistEmail) {
              throw new Error(USERS_MESSAGE.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            const access_token = (value || '').split(' ')[1]
            if (!access_token) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decoded_authorization = await verifyToken({
                token: access_token,
                secretOnPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
              ;(req as Request).decoded_authorization = decoded_authorization // Gán decoded_authorization vào req
            } catch (error) {
              throw new ErrorWithStatus({
                message: capitalize((error as JsonWebTokenError).message),
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    // Áp dụng cho headers
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        trim: true,
        custom: {
          // custom validator để kiểm tra refresh_token có tồn tại trong database không
          options: async (value: string, { req }) => {
            // Kiểm tra refresh_token có tồn tại trong database không
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              // Promise.all để chờ cả 2 hàm verifyToken và tìm refresh_token trong database chạy xong
              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({ token: value, secretOnPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
                databaseService.refreshTokens.findOne({ token: value }) // Tìm refresh_token trong database
              ])
              if (refresh_token === null) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGE.USED_REFRESH_TOKEN_OR_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decoded_refresh_token = decoded_refresh_token // Gán decoded_refresh_token vào req
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                // instanceof để kiểm tra error có phải là JsonWebTokenError không
                throw new ErrorWithStatus({
                  message: capitalize(error.message),
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              throw error
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyTokenValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              // Verify email_verify_token
              const decoded_email_verify_token = await verifyToken({
                token: value,
                secretOnPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
              })
              ;(req as Request).decoded_email_verify_token = decoded_email_verify_token // Gán decoded_email_verify_token vào req
            } catch (error) {
              throw new ErrorWithStatus({
                // Nếu có lỗi thì trả về lỗi
                message: capitalize((error as JsonWebTokenError).message), // Chuyển đổi message lỗi thành chữ hoa
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        isEmail: {
          errorMessage: USERS_MESSAGE.EMAIL_IS_INVALID
        },
        trim: true,
        // custom validator để kiểm tra email có tồn tại trong database không
        custom: {
          // Kiểm tra xem email có tồn tại trong database không
          options: async (value, { req }) => {
            // Tìm user theo email
            const user = await databaseService.users.findOne({
              email: value
            })
            // Nếu không tìm thấy user thì trả về lỗi
            if (user === null) {
              throw new Error(USERS_MESSAGE.USER_NOT_FOUND)
            }
            // Gán user vào req.user
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

// Dùng để kiểm tra token khi reset password
export const resetPasswordValidator = validate(
  // Kiểm tra các điều kiện của password, confirm_password và forgot_password_token
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    // Áp dụng cho body
    ['body']
  )
)

// Dùng để kiểm tra user đã verify email chưa
export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  // Lấy ra trạng thái verify của user
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    // Nếu user chưa verify email thì trả về lỗi
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGE.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  // Nếu đã verify thì chuyển đến middleware tiếp theo
  next()
}

// Dùng để kiểm tra update thông tin của user
export const updateMeValidator = validate(
  checkSchema({
    name: {
      ...nameSchema,
      optional: true,
      notEmpty: undefined
    },
    date_of_birth: {
      ...dateOfBirthSchema,
      optional: true
    },
    bio: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGE.BIO_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 200
        },
        errorMessage: USERS_MESSAGE.BIO_LENGTH_MUST_BE_FROM_1_TO_200
      }
    },
    location: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGE.LOCATION_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 200
        },
        errorMessage: USERS_MESSAGE.LOCATION_LENGTH_MUST_BE_FROM_1_TO_200
      }
    },
    website: {
      optional: true,
      trim: true,
      isString: {
        errorMessage: USERS_MESSAGE.WEBSITE_MUST_BE_A_STRING
      },
      isLength: {
        options: {
          min: 1,
          max: 100
        },
        errorMessage: USERS_MESSAGE.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_100
      }
    },
    username: {
      optional: true,
      isString: {
        errorMessage: USERS_MESSAGE.USER_NAME_MUST_BE_A_STRING
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          // Kiểm tra username có hợp lệ không
          if (!REGEX_USERNAME.test(value)) {
            throw new Error(USERS_MESSAGE.USER_NAME_IS_INVALID_OR_EXISTS)
          }
          // Kiểm tra username đã tồn tại trong database chưa
          const user = await databaseService.users.findOne({ username: value })
          // NẾu user đã tồn tại
          if (user) {
            throw new Error(USERS_MESSAGE.USER_NAME_EXISTED)
          }
        }
      }
    },
    avatar: imageSchema,
    cover_photo: imageSchema
  })
)

export const followValidator = validate(
  checkSchema(
    {
      follow_user_id: {
        custom: {
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.INVALID_FOLLOW_USER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const followed_user = await databaseService.users.findOne({ _id: new ObjectId(value) })
            if (!followed_user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.FOLLOW_USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const { user_id } = req.decoded_authorization as TokenPayload
            if (user_id === value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.NOT_FOLLOW_YOURSELF,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
          }
        }
      }
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      user_id: {
        custom: {
          options: async (value: string, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            const { follow_user_id } = req.params as UnfollowReqParams
            if (user_id === follow_user_id) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.NOT_UNFOLLOW_YOURSELF,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (!ObjectId.isValid(follow_user_id)) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.INVALID_UNFOLLOW_USER_ID,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const followed_user = await databaseService.users.findOne({ _id: new ObjectId(follow_user_id) })
            if (!followed_user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.UNFOLLOW_USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const isFollowing = await databaseService.followers.findOne({
              user_id: new ObjectId(user_id),
              follow_user_id: new ObjectId(follow_user_id)
            })
            if (!isFollowing) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGE.NOT_FOLLOWED_USER,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
          }
        }
      }
    },
    ['params']
  )
)

export const changePasswordValidator = validate(
  checkSchema({
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    old_password: {
      ...passwordSchema,
      custom: {
        options: async (value: string, { req }) => {
          const { user_id } = req.decoded_authorization as TokenPayload
          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const { password } = user
          if (password !== hashPassword(value)) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGE.OLD_PASSWORD_NOT_MATCH,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
    }
  })
)
