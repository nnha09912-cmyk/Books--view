# BOOKS VIEW — ADMIN ACCOUNT

## 1. Mục đích

BOOKS VIEW chỉ cần **một website duy nhất**.

Tài khoản Admin không sử dụng một website riêng và không tạo hệ thống đăng nhập riêng.

Admin đăng nhập cùng hệ thống:

```text
localhost:3000/dashboard
```

Sau khi đăng nhập, hệ thống xác định `role` của tài khoản.

```text
USER
 ↓
/dashboard
 ↓
Dashboard người dùng bình thường
```

và:

```text
ADMIN
 ↓
/dashboard
 ↓
Dashboard người dùng
 +
Khu vực Quản trị hệ thống
```

Mục tiêu là giữ kiến trúc đơn giản, dùng chung website, database và hệ thống authentication nhưng **quyền Admin phải được kiểm tra riêng ở server**.

---

# 2. Hai loại tài khoản chính

BOOKS VIEW có hai nhóm tài khoản:

```text
USER
ADMIN
```

## USER

Người dùng/studio thông thường.

Có quyền quản lý dữ liệu thuộc tài khoản của mình:

```text
Dashboard
Albums
Customers
Photos
Selections
Settings
```

USER không được truy cập các chức năng quản trị toàn hệ thống.

---

## ADMIN

Admin là tài khoản quản trị BOOKS VIEW.

Admin vẫn sử dụng:

```text
localhost:3000/dashboard
```

nhưng có thêm khu vực:

```text
QUẢN TRỊ HỆ THỐNG
```

Admin có thể xem và xử lý dữ liệu người dùng theo quyền được cấp.

---

# 3. Không tạo website Admin riêng

Không tạo:

```text
admin.booksview...
console.booksview...
```

cho hệ thống hiện tại.

Tất cả vẫn nằm trong:

```text
localhost:3000
```

Ví dụ:

```text
localhost:3000/dashboard
```

USER và ADMIN đều đăng nhập tại đây.

Sau khi đăng nhập:

```text
USER
 ↓
Dashboard bình thường
```

```text
ADMIN
 ↓
Dashboard
 ↓
+ Quản trị hệ thống
```

---

# 4. Giao diện Dashboard của USER

USER nhìn thấy giao diện quản lý bình thường:

```text
BOOKS VIEW

Dashboard
Albums
Khách hàng
Photos
Lựa chọn
Cài đặt
```

USER chỉ được truy cập dữ liệu thuộc tài khoản/studio của mình.

Ví dụ:

```text
User A
 ↓
Album A1
Album A2
Album A3
```

User A không được xem:

```text
Album B1
Album B2
```

của User B.

---

# 5. Giao diện Dashboard của ADMIN

ADMIN vẫn ở:

```text
/dashboard
```

nhưng Sidebar có thêm:

```text
QUẢN TRỊ HỆ THỐNG

Người dùng
Kiểm duyệt ảnh
Cảnh báo
Audit Log
```

Có thể tổ chức:

```text
Quản lý của tôi
├── Dashboard
├── Albums
├── Khách hàng
└── Cài đặt

Quản trị hệ thống
├── Người dùng
├── Kiểm duyệt ảnh
├── Cảnh báo
└── Audit Log
```

Không cần tạo giao diện hoàn toàn khác với hệ thống hiện tại.

Chỉ mở rộng Dashboard dựa trên quyền tài khoản.

---

# 6. Quản lý Người dùng

ADMIN có thể vào:

```text
Dashboard
 ↓
Quản trị hệ thống
 ↓
Người dùng
```

Danh sách người dùng cần hiển thị tối thiểu:

```text
Tên
Email
Loại tài khoản
Số Album
Trạng thái
Ngày đăng nhập gần nhất
```

Ví dụ:

```text
Nguyễn Văn A
abc@gmail.com
USER
5 Albums
Active
```

```text
Trần Văn B
xyz@gmail.com
USER
2 Albums
Active
```

---

# 7. Email và số Album

ADMIN có thể nhìn thấy:

```text
Email
 ↓
Tài khoản
 ↓
Số Album thuộc tài khoản
```

Ví dụ:

```text
abc@gmail.com
5 Albums
```

Bấm vào người dùng:

```text
abc@gmail.com
        ↓
User Detail
```

ADMIN có thể xem danh sách Album của tài khoản đó.

---

# 8. Xem chi tiết một User

Khi ADMIN bấm vào User:

```text
Nguyễn Văn A
abc@gmail.com
```

mở trang chi tiết tương tự Dashboard của User đó nhưng ở chế độ quản trị.

Có thể hiển thị:

```text
Thông tin tài khoản
Tên
Email
Trạng thái
Ngày tạo
Đăng nhập gần nhất

Thống kê
Số Album
Số ảnh
Số khách
```

và:

```text
Albums
```

Ví dụ:

```text
Wedding Minh & Lan
842 ảnh
Active

Wedding Huy & Ngọc
156 ảnh
Active
```

---

# 9. ADMIN có thể xem Album của User

ADMIN bấm:

```text
Wedding Minh & Lan
```

có thể mở giao diện Album tương tự người dùng.

Ví dụ:

```text
Album
 ↓
Photos
 ↓
Selections
 ↓
Comments
 ↓
Settings
```

Mục đích:

- hỗ trợ người dùng
- kiểm tra lỗi
- xử lý sự cố
- kiểm tra nội dung
- hỗ trợ vận hành hệ thống

ADMIN không được tự động có quyền sửa/xóa mọi dữ liệu nếu permission đó chưa được cấp.

---

# 10. Chế độ "View As User"

Nên có khái niệm:

```text
Xem như người dùng
```

Ví dụ:

```text
ADMIN
 ↓
User A
 ↓
Album A
 ↓
Xem giao diện
```

Mục đích là để ADMIN có thể kiểm tra:

> Người dùng này thực tế đang nhìn thấy gì?

Điều này tốt hơn việc ADMIN phải truy cập database thủ công.

Nếu chức năng này được triển khai, hệ thống phải ghi Audit Log.

---

# 11. Không được biến ADMIN thành USER

Không được cho browser gửi:

```json
{
  "role": "ADMIN"
}
```

hoặc:

```json
{
  "isAdmin": true
}
```

rồi server tin dữ liệu đó.

Role phải được xác định từ authentication/session/database phía server.

```text
Login
 ↓
Session
 ↓
Server lấy User
 ↓
Role
 ↓
Authorization
```

---

# 12. Kiểm duyệt ảnh

ADMIN có khu vực:

```text
Quản trị hệ thống
 ↓
Kiểm duyệt ảnh
```

Mục đích:

> Kiểm tra nội dung người dùng upload để bảo vệ an toàn, uy tín và trách nhiệm vận hành của BOOKS VIEW.

---

# 13. Quét nội dung ảnh

Ảnh người dùng upload có thể được đưa qua hệ thống kiểm tra nội dung.

Luồng:

```text
User Upload
 ↓
Content Safety Scan
 ↓
Phân tích
 ↓
Kết quả
```

Không nên coi kết quả AI là kết luận tuyệt đối.

Nên phân loại:

```text
SAFE
REVIEW
HIGH RISK
```

---

# 14. Các nhóm cảnh báo

Hệ thống có thể phát hiện/cảnh báo các nhóm nội dung như:

```text
⚠ Bạo lực
⚠ Máu me / nội dung ghê rợn
⚠ Vũ khí
⚠ Khỏa thân / nội dung tình dục
⚠ Tự gây hại
⚠ Khủng bố / cực đoan
⚠ Nội dung thù ghét
⚠ Nội dung nguy hiểm khác
```

Ví dụ:

```text
Photo #A821

⚠ Bạo lực
Confidence: 94%

Status:
HIGH RISK
```

Sau đó đưa vào:

```text
Moderation Queue
```

để ADMIN/Moderator xem xét.

---

# 15. AI không tự động quyết định tất cả

Không nên thiết kế:

```text
AI
 ↓
Có bạo lực
 ↓
Xóa ảnh ngay
```

Mà nên:

```text
AI
 ↓
Phát hiện khả năng vi phạm
 ↓
REVIEW
 ↓
ADMIN / MODERATOR
 ↓
Quyết định
```

Có thể có các kết quả:

```text
✓ Không vi phạm
⚑ Vi phạm
? Cần xem thêm
```

---

# 16. Kiểm duyệt phải tôn trọng quyền riêng tư

ADMIN có quyền kiểm duyệt vì trách nhiệm vận hành.

Tuy nhiên:

> Quyền kiểm duyệt không có nghĩa ADMIN được xem ảnh người dùng tùy ý.

Nên chỉ cho phép xem những ảnh:

```text
được báo cáo
hoặc
được hệ thống đánh dấu REVIEW/HIGH RISK
hoặc
cần xử lý sự cố
```

Không nên có nút:

```text
Xem tất cả ảnh của mọi người
```

một cách mặc định.

---

# 17. Permission cho kiểm duyệt

Nên tách permission:

```text
moderation.view
moderation.preview
moderation.original
moderation.download
```

Ví dụ:

```text
Moderator
 ↓
moderation.preview
 ↓
Xem preview
```

Không đồng nghĩa:

```text
moderation.download
```

---

# 18. Không cho tải ảnh kiểm duyệt mặc định

ADMIN/Moderator có thể cần:

```text
Xem ảnh
```

nhưng không nhất thiết được:

```text
Download Original
```

Ưu tiên:

```text
Moderation Preview
 ↓
Xem ảnh
 ↓
Không tải ảnh gốc
```

Nếu thật sự cần quyền tải ảnh gốc thì phải cấp permission riêng và ghi Audit Log.

---

# 19. Audit Log

Mọi thao tác nhạy cảm của ADMIN phải được ghi lại.

Ví dụ:

```text
28/08/2026 21:35

Admin:
admin@booksview...

Action:
VIEW_PHOTO

User:
abc@gmail.com

Album:
Wedding Minh & Lan

Photo:
#A821

Reason:
Content Moderation
```

Các hành động cần audit:

```text
VIEW_USER
VIEW_ALBUM
VIEW_PHOTO
VIEW_ORIGINAL
DOWNLOAD
MODERATION_ACTION
CHANGE_USER_STATUS
CHANGE_PERMISSION
```

---

# 20. Lý do xem ảnh

Khi ADMIN xem ảnh kiểm duyệt, nên có mục đích:

```text
Reason
```

Ví dụ:

```text
Content Moderation
User Report
Security Review
Technical Support
Policy Violation
```

Mục tiêu:

```text
Purpose
 ↓
Permission
 ↓
Access
 ↓
Audit Log
```

---

# 21. Bảo vệ thông tin người dùng

ADMIN có thể xem Email và thông tin cần thiết để vận hành.

Nhưng dữ liệu không cần thiết nên hạn chế.

Ví dụ SĐT có thể hiển thị:

```text
090****123
```

thay vì:

```text
0901234567
```

nếu không cần toàn bộ số.

Không trả các dữ liệu bí mật như:

```text
Password
Password Hash
Session Token
OAuth Secret
Database Credential
API Key
```

---

# 22. ADMIN không được truy cập Database trực tiếp từ Browser

Không được:

```text
Browser
 ↓
PostgreSQL
```

Mà phải:

```text
Browser
 ↓
API / Server
 ↓
Authorization
 ↓
Prisma
 ↓
PostgreSQL
```

Mọi hành động ADMIN phải đi qua server.

---

# 23. ADMIN xem dữ liệu User phải kiểm tra quyền

Ví dụ:

```text
GET /api/admin/users/USER_ID
```

Server phải kiểm tra:

```text
Request
 ↓
Session
 ↓
Role = ADMIN?
 ↓
Permission?
 ↓
YES
 ↓
Lấy dữ liệu
```

Nếu USER thường gọi API:

```text
USER
 ↓
/api/admin/users/...
 ↓
403 Forbidden
```

---

# 24. ADMIN không được sửa ID để vượt quyền

Ví dụ ADMIN đang xem:

```text
User A
```

không được dùng cách sửa URL/request để lấy dữ liệu ngoài phạm vi permission.

Mọi resource vẫn phải được server kiểm tra.

```text
Admin Session
 ↓
Requested User
 ↓
Permission
 ↓
Access
```

---

# 25. Tài khoản ADMIN phải được bảo vệ mạnh hơn USER

ADMIN có quyền lớn hơn nên cần:

```text
Session bảo mật
Password mạnh
Rate limiting
Login protection
Audit Log
Revoke Session
```

Nếu triển khai MFA/2FA sau này, nên ưu tiên bắt buộc cho ADMIN trước.

---

# 26. Khóa / vô hiệu hóa tài khoản

ADMIN có thể cần:

```text
Active
Suspended
Disabled
```

Ví dụ:

```text
User
 ↓
Vi phạm chính sách
 ↓
ADMIN
 ↓
Suspend
```

Sau khi bị khóa:

```text
Session hiện tại
 ↓
Revoke
```

để tài khoản không tiếp tục sử dụng session cũ.

---

# 27. Không dùng quyền ADMIN cho Customer

Customer chỉ có quyền trong Album được phép:

```text
Customer
 ↓
Album
 ↓
Photos
 ↓
Selection
 ↓
Comment
```

Customer không thể:

```text
/admin
/system
/api/admin/*
```

Server phải từ chối.

---

# 28. Cấu trúc quyền tổng thể

```text
BOOKS VIEW
│
├── USER
│   └── /dashboard
│       ├── Albums
│       ├── Customers
│       ├── Photos
│       └── Settings
│
└── ADMIN
    └── /dashboard
        │
        ├── Chức năng USER
        │
        └── QUẢN TRỊ HỆ THỐNG
            ├── Người dùng
            ├── Kiểm duyệt ảnh
            ├── Cảnh báo
            └── Audit Log
```

---

# 29. Luồng ADMIN hoàn chỉnh

```text
ADMIN
 ↓
Login
 ↓
Authentication
 ↓
Admin Session
 ↓
/dashboard
 ↓
Kiểm tra role
 ↓
Hiển thị khu vực Quản trị
```

Sau đó:

```text
Quản trị
 ↓
Người dùng
 ↓
Chọn User
 ↓
Xem User Detail
 ↓
Chọn Album
 ↓
Xem Album
```

Hoặc:

```text
Quản trị
 ↓
Kiểm duyệt ảnh
 ↓
Content Safety Scan
 ↓
REVIEW / HIGH RISK
 ↓
ADMIN kiểm tra
 ↓
Quyết định
 ↓
Audit Log
```

---

# 30. Nguyên tắc riêng tư

BOOKS VIEW phải cân bằng:

```text
QUYỀN RIÊNG TƯ
        +
TRÁCH NHIỆM VẬN HÀNH
        +
AN TOÀN NỘI DUNG
```

Nguyên tắc:

> ADMIN có quyền cần thiết để vận hành và bảo vệ BOOKS VIEW, nhưng không có quyền xem dữ liệu người dùng tùy ý.

Mọi truy cập dữ liệu nhạy cảm phải:

```text
Có mục đích
+
Có permission
+
Server kiểm tra
+
Audit Log
```

---

# 31. Checklist ADMIN

```text
□ USER và ADMIN dùng chung website
□ Login tại /dashboard
□ Không tạo website Admin riêng
□ ADMIN có giao diện quản trị mở rộng
□ USER không thấy khu vực quản trị
□ ADMIN xem được danh sách User
□ ADMIN xem Email
□ ADMIN xem số Album của User
□ ADMIN mở được User Detail
□ ADMIN có thể xem Album của User
□ Có chế độ View As User nếu triển khai
□ Không tin role từ browser
□ Role kiểm tra server-side
□ ADMIN API có authorization
□ Customer không gọi được Admin API
□ Có Content Safety Scan
□ Có cảnh báo bạo lực
□ Có cảnh báo vũ khí
□ Có cảnh báo khủng bố/cực đoan
□ Có cảnh báo nội dung tình dục/khỏa thân
□ Có cảnh báo tự gây hại
□ AI chỉ hỗ trợ phát hiện
□ Nội dung nghi vấn đưa vào Moderation Queue
□ Không cho ADMIN xem tất cả ảnh mặc định
□ Permission Moderation tách riêng
□ Không cho tải ảnh kiểm duyệt mặc định
□ Có Audit Log
□ Có Reason khi truy cập ảnh nhạy cảm
□ Không log password/token/secret
□ Có thể Suspend User
□ Suspend phải revoke session phù hợp
□ ADMIN Session được bảo vệ mạnh
```

---

# 32. Nguyên tắc cuối cùng

BOOKS VIEW chỉ có **một website**:

```text
localhost:3000
```

Hai loại tài khoản:

```text
USER
 ↓
/dashboard
 ↓
Dashboard bình thường
```

```text
ADMIN
 ↓
/dashboard
 ↓
Dashboard
+
Quản trị hệ thống
```

**ADMIN không phải là một website khác.**

ADMIN chỉ là **một role có quyền cao hơn trong cùng hệ thống BOOKS VIEW**.

Mục tiêu cuối:

```text
Một Website
+
Một Login
+
Một Database
+
Một hệ thống Session
+
Role/Permission rõ ràng
+
ADMIN Dashboard mở rộng
+
Content Moderation
+
Audit Log
+
Bảo vệ quyền riêng tư
```
