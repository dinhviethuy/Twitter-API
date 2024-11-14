import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

// Hàm xử lý lỗi mặc định
export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Nếu lỗi là một instance của ErrorWithStatus
  if (err instanceof ErrorWithStatus) {
    // Trả về lỗi với status code và message
    res.status(err.status).json(omit(err, 'status'))
    return
  }
  Object.getOwnPropertyNames(err).forEach((key) => {
    // dùng Object.getOwnPropertyNames để lấy ra các key của err
    Object.defineProperty(err, key, { enumerable: true }) // dùng Object.defineProperty để đặt thuộc tính enumerable của key là true
  })
  // Trả về lỗi 500 và message lỗi
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    // Trả về thông tin lỗi
    errorInfo: omit(err, 'stack') // dùng lodash.omit để loại bỏ thuộc tính stack
  })
  return
}
