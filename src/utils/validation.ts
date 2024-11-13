import { NextFunction, Response, Request } from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Errors'

// Hàm validate dùng để kiểm tra các điều kiện validate
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Chạy hàm validate
    await validation.run(req)
    // Lấy ra các lỗi trong quá trình validate
    const errors = validationResult(req)
    // Neu khong co loi
    if (errors.isEmpty()) {
      // Chuyển đến middleware tiếp theo
      return next()
    }
    // Nếu có lỗi thì tạo ra một object chứa các lỗi
    const errorsObject = errors.mapped()
    // Tạo ra một object lỗi từ class EntityError(422)
    const entityErrors = new EntityError({ errors: {} })
    // Duyệt qua các lỗi
    for (const key in errorsObject) {
      // Lấy ra message từ lỗi
      const { msg } = errorsObject[key]
      // Nếu lỗi không phải là lỗi 422
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      // Gán lỗi vào object lỗi
      entityErrors.errors[key] = errorsObject[key]
    }
    // Trả về lỗi
    next(entityErrors)
  }
}
