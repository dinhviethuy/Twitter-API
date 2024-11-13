import usersServices from '../services/users.services'
import { Request, Response } from 'express'
import { NextFunction, ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/messages'
import {
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  VerifyForgotPasswordTokenReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User // Lấy ra user từ request
  const user_id = user._id as ObjectId
  const result = await usersServices.login({ user_id: user_id.toString(), verify: user.verify })
  res.json({
    message: USERS_MESSAGE.LOGIN_SUCCESSFUL,
    result
  })
  return
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const result = await usersServices.register(req.body)
  res.json({
    message: USERS_MESSAGE.REGISTER_SUCCESSFUL,
    result
  })
  return
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersServices.logout(refresh_token)
  res.json(result)
  return
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>, // Sử dụng VerifyEmailReqBody
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload // Lấy ra user_id từ decoded_email_verify_token
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  // Nếu không tìm thấy user
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.USER_NOT_FOUND
    })
    return
  }
  // Đã verify email
  if (user?.email_verify_token === '') {
    res.json({
      message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }
  // Nếu tìm thấy user và chưa verify email
  const result = await usersServices.verifyEmail(user_id)
  res.json({
    message: USERS_MESSAGE.EMAIL_VERIFY_SUCCESSFUL,
    result
  })
  return
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload // Lấy ra user_id từ decoded_authorization
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGE.USER_NOT_FOUND
    })
    return
  }
  if (user.verify === UserVerifyStatus.Verified) {
    res.json({
      message: USERS_MESSAGE.EMAIL_ALREADY_VERIFIED_BEFORE
    })
    return
  }
  // Gửi lại email verify
  const result = await usersServices.resendVerifyEmail(user_id)
  res.json(result)
  return
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify } = req.user as User // Lấy ra _id và verify từ user
  const result = await usersServices.forgotPassword({ user_id: (_id as ObjectId).toString(), verify: verify })
  // Trả về kết quả
  res.json(result)
  return
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  res.json({
    message: USERS_MESSAGE.VERIFY_FORGOT_PASSWORD_SUCCESSFUL
  })
  return
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload // Lấy ra user_id từ decoded_forgot_password_token
  const { password } = req.body // Lấy ra password từ request
  const result = await usersServices.resetPassword(user_id, password) // Gọi hàm resetPassword
  res.json(result)
  return
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload // Lấy ra user_id từ decoded_authorization
  const user = await usersServices.getMe(user_id) // Gọi hàm getMe
  res.json({
    message: USERS_MESSAGE.GET_ME_SUCCESSFUL,
    user
  })
  return
}

export const updateMeController = async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: 'Update me successful'
  })
  return
}
