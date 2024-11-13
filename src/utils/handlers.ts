import { NextFunction, Request, Response, RequestHandler } from 'express'

// Hàm wrapRequestHandler dùng để bọc một hàm xử lý request
export const wrapRequestHandler = (func: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Promise.resolve(func(req, res, next)).catch(next)
    // Thử nghiệm với async/await
    try {
      // Chạy hàm xử lý request
      await func(req, res, next)
    } catch (error) {
      // Nếu có lỗi thì chuyển đến middleware xử lý lỗi
      next(error)
    }
  }
}
