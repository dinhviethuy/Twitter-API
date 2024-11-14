# Twitter API

## Các bước chạy code
- Clone code:

```bash
git clone <repository_url>
```
- Cài đặt thư viện phụ thuộc:

```bash
npm i
```
- Chạy dự án:
```bash
npm run dev
```
#### Open running on port http://localhost:4000

## API Users ```http://localhost:4000/users```
### 1. Đăng nhập
- Path: ``/login``

- Method: ``POST``

- Body:

```json
{
  "email": "string",
  "password": "string"
}
```
### 2. Đăng nhập bằng Google OAuth
- Path: ```/oauth/google```

- Method: ``GET``

### 3. Đăng ký
- Path: ``/register``

- Method: ```POST```

- Body:

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "confirm_password": "string",
  "date_of_birth": "iso8601"
}
```
### 4. Đăng xuất
- Path: ```/logout```

- Method: ```POST```

- Headers:

```makefile
Authorization: Bearer <token>
```

- Body:

```json
{
  "refresh_token": "string"
}
```
### 5. Refresh Token
- Path: ```/refresh-token```

- Method: ``POST``

- Body:

```json
{
  "refresh_token": "string"
}
```
### 6. Xác minh email
- Path: ``/verify-email``

- Method: ``POST``

- Body:

```json
{
  "email_verify_token": "string"
}
```
### 7. Gửi lại email xác minh
- Path: ``/resend-verify-email``

- Method: ``POST``

- Headers:

```makefile
Authorization: Bearer <access_token>
```
### 8. Quên mật khẩu
- Path: ```/forgot-password```

- Method: ``POST``

- Body:

```json
{
  "email": "string"
}
```
### 9. Xác minh token quên mật khẩu
- Path: ``/verify-forgot-password``

- Method: ```POST```

- Body:

```json
{
  "forgot_password_token": "string"
}
```
### 10. Đặt lại mật khẩu
- Path: ```/reset-password```

- Method: ```POST```

- Body:

```json
{
  "password": "string",
  "confirm_password": "string",
  "forgot_password_token": "string"
}
```
### 11. Lấy thông tin cá nhân
- Path: ``/me``

- Method: ``GET``

- Headers:

```makefile
Authorization: Bearer <token>
```
### 12. Cập nhật thông tin cá nhân

- Path: ```/me```

- Method: ``PATCH``

- Headers:

```makefile
Authorization: Bearer <token>
```
- Body: 

  - Fields:  ``name``, ``date_of_birth``, ``location``, ``bio``, ``avatar``, ``cover_photo``, ``website``, ``username``

### 13. Lấy hồ sơ người dùng theo username
- Path: ``/:username``

- Method: ```GET```
### 14. Theo dõi người dùng
- Path: ```/follow```

- Method: ```POST```

- Headers:

```makefile
Authorization: Bearer <token>
```
- Body:
```json
{
  "follow_user_id": "string"
}
```

### 15. Bỏ theo dõi người dùng
- Path: ```/follow/:follow_user_id```

- Method: ```DELETE```

- Headers:
```makefile
Authorization: Bearer <token>
```

### 16. Đổi mật khẩu
- Path: ```/change-password```

- Method: ```PUT```
- Headers:
```makefile
Authorization: Bearer <token>
```
- Body:

```json
{
  "old_password": "string",
  "password": "string",
  "confirm_password": "string"
}
```
