import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGE } from '~/constants/messages'

// Khai báo kiểu dữ liệu cho lỗi
type ErrorsType = Record<
  string,
  {
    msg: string
    [key: string]: any
  }
>

// Khai báo class ErrorWithStatus để tạo ra một lỗi với status code và message
export class ErrorWithStatus {
  message: string
  status: number
  constructor({ message, status }: { message: string; status: number }) {
    this.message = message
    this.status = status
  }
}

// Khai báo class EntityError để tạo ra một lỗi 422 với message và errors
export class EntityError extends ErrorWithStatus {
  errors: ErrorsType
  constructor({ message = USERS_MESSAGE.VALIDATION_ERROR, errors }: { message?: string; errors: ErrorsType }) {
    // Gọi hàm khởi tạo của class cha
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}
