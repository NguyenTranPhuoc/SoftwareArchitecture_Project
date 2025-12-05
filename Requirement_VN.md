# Phân tích Yêu cầu Hệ thống Chat OTT (Bản đầy đủ)

Tài liệu này trình bày các yêu cầu chức năng và phi chức năng cho việc xây dựng ứng dụng nhắn tin OTT (tương tự Zalo) cho một đồ án cấp đại học.

---

## 1. Yêu cầu Chức năng (Functional Requirements)

Đây là những chức năng cụ thể mà hệ thống **phải làm được**, được phân chia theo từng module.

### 👤 Module 1: Quản lý Người dùng và Xác thực

* **F.1.1: Đăng ký tài khoản:** Người dùng mới có thể tạo tài khoản bằng số điện thoại (hoặc email) và mật khẩu.
* **F.1.2: Xác thực tài khoản qua email:** Sau khi đăng ký bằng email, hệ thống sẽ gửi một liên kết xác thực đến địa chỉ email đó. Người dùng phải nhấp vào liên kết để kích hoạt tài khoản trước khi có thể đăng nhập.
* **F.1.3: Đăng nhập:** Người dùng đã có tài khoản (đã được xác thực) có thể đăng nhập vào hệ thống.
* **F.1.4: Đăng xuất:** Người dùng có thể đăng xuất khỏi tài khoản của mình.
* **F.1.5: Quản lý thông tin cá nhân:** Người dùng có thể xem và cập nhật thông tin cơ bản của mình (ví dụ: tên hiển thị, ảnh đại diện).
* **F.1.6: Tìm kiếm người dùng:** Người dùng có thể tìm kiếm người dùng khác trong hệ thống dựa trên tên hoặc số điện thoại/email.

### 👥 Module 2: Quản lý Danh bạ và Mối quan hệ

* **F.2.1: Gửi lời mời kết bạn:** Người dùng có thể gửi lời mời kết bạn đến người dùng khác.
* **F.2.2: Chấp nhận/Từ chối kết bạn:** Người dùng có thể xem và chấp nhận hoặc từ chối lời mời kết bạn.
* **F.2.3: Xem danh bạ:** Người dùng có thể xem danh sách bạn bè của mình.
* **F.2.4: Hủy kết bạn:** Người dùng có thể xóa một người bạn khỏi danh bạ của mình.

### 💬 Module 3: Nhắn tin (Chat)

* **F.3.1: Chat 1-1:** Người dùng có thể bắt đầu cuộc trò chuyện riêng tư với một người dùng khác.
* **F.3.2: Tạo nhóm chat:** Người dùng có thể tạo một nhóm chat mới và mời các thành viên khác tham gia.
* **F.3.3: Thêm thành viên vào nhóm:** Quản trị viên nhóm có thể thêm người dùng mới vào nhóm chat đã có.
* **F.3.4: Gửi/Nhận tin nhắn văn bản:** Người dùng có thể gửi và nhận tin nhắn dạng text trong cả chat 1-1 và chat nhóm.
* **F.3.5: Gửi/Nhận đa phương tiện:**
    * Gửi/nhận **hình ảnh** (image).
    * Gửi/nhận **video** ngắn.
    * Gửi/nhận **tài liệu** (document, ví dụ: .pdf, .docx).
    * Gửi/nhận **biểu tượng cảm xúc** (emotion/emoji).
* **F.3.6: Xem lịch sử trò chuyện:** Người dùng có thể tải và xem lại các tin nhắn cũ trong một cuộc trò chuyện.
* **F.3.7: Hiển thị danh sách cuộc trò chuyện:** Hệ thống hiển thị danh sách các cuộc trò chuyện gần đây của người dùng.
* **F.3.8: Hiển thị trạng thái hoạt động:** Hệ thống hiển thị các chỉ báo trạng thái theo thời gian thực, ví dụ: thông báo **"đang nhập..."** (typing...) khi người dùng khác đang gõ tin nhắn.

### 📊 Module 4: Thống kê

* **F.4.1: Thống kê cho người dùng:**
    * Người dùng có thể xem một vài thống kê đơn giản về hoạt động của chính mình (ví dụ: tổng số tin nhắn đã gửi, số lượng bạn bè/nhóm đang tham gia).
* **F.4.2: Thống kê cho quản trị viên (Admin):**
    * Admin có thể xem các thống kê tổng quan về hệ thống (ví dụ: tổng số người dùng, tổng số tin nhắn được gửi trong ngày, số lượng nhóm đang hoạt động).

---

## 2. Yêu cầu Phi chức năng (Non-functional Requirements)

Đây là các yêu cầu về đặc tính, chất lượng của hệ thống, mô tả cách hệ thống **nên hoạt động như thế nào**.

* **N.F.1: Hiệu năng (Performance):**
    * **Phản hồi nhanh:** Tin nhắn và trạng thái ("đang nhập...") nên được gửi và nhận gần như trong thời gian thực (độ trễ dưới 2 giây trong điều kiện mạng ổn định).
    * **Tải giao diện:** Giao diện người dùng (UI) phải tải và phản hồi các thao tác một cách mượt mà, không bị giật, lag.

* **N.F.2: Tính khả dụng (Usability):**
    * **Giao diện thân thiện:** Giao diện ứng dụng cần phải trực quan, sạch sẽ và dễ sử dụng cho người dùng phổ thông.
    * **Nhất quán:** Thiết kế giao diện và luồng hoạt động trên các nền tảng (web, mobile) cần có sự nhất quán.

* **N.F.3: Độ tin cậy (Reliability):**
    * **Hoạt động ổn định:** Hệ thống cần hoạt động ổn định, tránh các lỗi gây crash ứng dụng trong quá trình sử dụng các chức năng chính.
    * **Toàn vẹn dữ liệu:** Hệ thống phải đảm bảo tin nhắn không bị mất hoặc gửi sai người nhận.

* **N.F.4: Bảo mật (Security):**
    * **Mã hóa mật khẩu:** Mật khẩu của người dùng phải được băm (hashing) và lưu trữ an toàn trong cơ sở dữ liệu.
    * **Xác thực:** Mọi yêu cầu truy cập tài nguyên người dùng (ví dụ: xem tin nhắn) đều phải được xác thực.

* **N.F.5: Khả năng bảo trì (Maintainability):**
    * **Code rõ ràng:** Code cần được viết sạch sẽ, có cấu trúc module rõ ràng và có chú thích (comment) ở những phần quan trọng để dễ dàng sửa lỗi và phát triển thêm.
    * **Tuân thủ quy ước:** Áp dụng các quy ước đặt tên (coding convention) nhất quán trong toàn bộ dự án.

* **N.F.6: Khả năng mở rộng (Scalability):**
    * **Kiến trúc module:** Hệ thống nên được thiết kế theo kiến trúc microservices hoặc module hóa để có thể dễ dàng phát triển và triển khai riêng lẻ từng chức năng theo tuần như yêu cầu.
    * **Tương thích Cloud:** Kiến trúc hệ thống phải phù hợp để triển khai trên các nền tảng đám mây (Cloud).