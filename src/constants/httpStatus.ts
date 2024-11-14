const HTTP_STATUS = {
  OK: 200, // thành công
  CREATED: 201, // tạo mới
  ACCEPTED: 202, // chấp nhận
  NO_CONTENT: 204, // không có nội dung
  UNPROCESSABLE_ENTITY: 422, // lỗi do dữ liệu không hợp lệ
  UNAUTHORIZED: 401, // không có quyền truy cập vào tài nguyên hoặc hết hạn đăng nhập
  NOT_FOUND: 404, // không tìm thấy dữ liệu
  INTERNAL_SERVER_ERROR: 500, // lỗi do server xử lý dữ liệu gặp lỗi ngoài ý muốn của người dùng
  FORBIDDEN: 403, // lỗi do người dùng không có quyền truy cập vào tài nguyên
  BAD_REQUEST: 400 // lỗi do dữ liệu gửi lên không hợp lệ
} as const

export default HTTP_STATUS
