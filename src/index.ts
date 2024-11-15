import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'
import mediasRouter from './routes/media.routes'
import { initFolder } from './utils/file'
import { config } from 'dotenv'
import { UPLOAD_DIR } from './constants/dir'
import staticRouter from './routes/static.routes'

config()

// Kết nối tới database mongo
databaseService.connect()

// Khởi tạo thư mục uploads
initFolder()

// Tạo server với express
const app = express()

// Tạo biến port từ biến môi trường
const port = process.env.DB_PORT || 4000

// expes.json() để parse request body từ client dưới dạng json, dùng cho POST, PUT, PATCH, DELETE, GET
app.use(express.json())

// Đăng ký route handler cho host/users
app.use('/users', usersRouter)

// Đăng ký router handler cho host/medias
app.use('/medias', mediasRouter)

// Sử dụng middleware xử lý file tĩnh
// app.use('/static', express.static(UPLOAD_DIR)) // Cách 1
app.use('/static', staticRouter) // Cách 2
// Tạo middleware xử lý lỗi mặc định
app.use(defaultErrorHandler)

// Lắng nghe server trên port
app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
