## 1. Các Tính Năng Đã Triển Khai
### Hạ tầng
- Docker Compose (Auth, User, Postgres, Redis)
- PostgreSQL + Sequelize ORM
- Redis Cache (session, blacklist token)

### Auth Service
- Đăng ký, xác thực email
- Đăng nhập, refresh token, logout
- Thống kê tổng số user

### User Service
- Hồ sơ cá nhân
- Tìm kiếm user
- Kết bạn: gửi – chấp nhận – từ chối – hủy
- Danh sách bạn bè & thống kê

---

## 2. Kết Quả Kiểm Thử
- Đăng ký + verify email: PASS  
- Đăng nhập + refresh token: PASS  
- Logout: PASS  
- Update hồ sơ: PASS  
- Tìm kiếm user: PASS  
- Quy trình kết bạn: PASS  

---

## 3. API Documentation

### Auth Service — http://localhost:3001

#### POST /auth/register  
→ Tạo tài khoản mới và gửi email xác thực.

#### POST /auth/login  
→ Kiểm tra thông tin đăng nhập và trả về access_token + refresh_token.

#### POST /auth/logout  
→ Thu hồi phiên bằng cách đưa refresh_token vào blacklist (Redis).

#### POST /auth/refresh  
→ Cấp access_token mới khi access_token cũ hết hạn.

#### GET /auth/verify-email/:token  
→ Kích hoạt tài khoản dựa trên token được gửi qua email.

#### GET /auth/stats  
→ Trả về tổng số người dùng trong hệ thống.

---

### User Service — http://localhost:3002

#### GET /users/me  
→ Lấy thông tin cá nhân của user hiện tại.

#### PATCH /users/me  
→ Cập nhật hồ sơ (avatar, họ tên, ngày sinh, ...).

#### GET /users/search?q=...  
→ Tìm kiếm người dùng theo tên hoặc email.

#### GET /users/:id  
→ Xem hồ sơ public của một user khác (không cần đăng nhập).

#### GET /users/friends  
→ Lấy danh sách bạn bè đã chấp nhận.

#### GET /users/friends/pending  
→ Lấy danh sách lời mời kết bạn chưa xử lý.

#### POST /users/friends/request/:id  
→ Gửi lời mời kết bạn đến user khác.

#### PUT /users/friends/accept/:friendship_id
→ Chấp nhận lời mời kết bạn.

#### DELETE /users/friends/reject/:friendship_id  
→ Từ chối hoặc hủy kết bạn.

#### GET /users/stats  
→ Thống kê số lượng bạn bè, pending, total.

---

