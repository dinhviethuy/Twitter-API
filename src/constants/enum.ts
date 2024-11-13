export enum UserVerifyStatus {
  Unverified, // Chưa xác thực
  Verified, // Đã xác thực
  Banned // Bị cấm truy cập
}

// kiểu dữ liệu của token
export enum TokenType {
  AccessToken, // token dùng để xác thực người dùng
  RefreshToken, // token dùng để tạo ra access token mới
  ForgotPasswordToken, // token dùng để xác thực quên mật khẩu
  EmailVerifyToken // token dùng để xác thực email
}
