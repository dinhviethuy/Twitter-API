import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/errors.middlewares'

// connect database
databaseService.connect()

// create express app
const app = express()
const port = 3001

app.use(express.json())
app.use('/users', usersRouter)

// tạo wrapper cho các route handler
app.use(defaultErrorHandler)

// start server
app.listen(port, () => {
  console.log(`Running on port ${port}`)
})
