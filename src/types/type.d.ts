import { Request } from 'express'
import { User } from '~/models/User'
import { TokenPayload } from '../models/requests/User.requests'

// Khai báo thêm thuộc tính user cho request
declare module 'express' {
  interface Request {
    user?: User
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_email_verify_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
  }
}

// Khai báo thêm thuộc tính username cho params
declare module 'express-serve-static-core' {
  interface ParamsDictionary {
    username: string
    follow_user_id: string
    name: string
  }
}
