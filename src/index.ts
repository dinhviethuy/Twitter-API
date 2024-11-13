import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'

// Kết nối tới database mongo
databaseService.connect()

// Tạo server với express
const app = express()

// Tạo biến port từ biến môi trường
const port = process.env.DB_PORT

// expes.json() để parse request body từ client dưới dạng json, dùng cho POST, PUT, PATCH, DELETE, GET
app.use(express.json())

// Đăng ký route handler cho host/users
app.use('/users', usersRouter)

// Tạo middleware xử lý lỗi mặc định
app.use(defaultErrorHandler)

// Lắng nghe server trên port
app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
