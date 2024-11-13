import { createHash } from 'crypto'
import { config } from 'dotenv'

config()

// Hàm tạo mã băm sha256
export function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

// Hàm tạo mã băm password
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
