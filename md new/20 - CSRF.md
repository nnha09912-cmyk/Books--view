# 20. CSRF — BOOKS VIEW

## 1. Mục đích

CSRF (Cross-Site Request Forgery) là hình thức một website khác cố lợi dụng phiên đăng nhập của người dùng để gửi request đến BOOKS VIEW thay người dùng.

Ví dụ:

```text
Người dùng đang đăng nhập BOOKS VIEW
          ↓
        Session
          ↓
Website khác cố gửi request
          ↓
BOOKS VIEW
```

BOOKS VIEW phải có cơ chế chống CSRF phù hợp với cách authentication/session của hệ thống.

---

# 2. Các API phải được bảo vệ

Tất cả API làm thay đổi dữ liệu:

```text
POST
PUT
PATCH
DELETE
```

phải có cơ chế CSRF phù hợp với authentication.

Đặc biệt:

```text
Delete
Like
Star
Comment
Change Password
Change Album
```

Ngoài ra, các thao tác nhạy cảm khác cũng phải được áp dụng cùng nguyên tắc.

---

# 3. CSRF không phải XSS

CSRF và XSS là hai vấn đề khác nhau.

### XSS

```text
XSS
 ↓
JavaScript độc hại chạy trong BOOKS VIEW
```

### CSRF

```text
Website khác
 ↓
Cố gửi request
 ↓
BOOKS VIEW
```

Vì vậy BOOKS VIEW phải xử lý cả:

```text
XSS Protection
+
CSRF Protection
```

---

# 4. Delete

Ví dụ:

```text
DELETE /api/albums/{id}
```

Luồng phải là:

```text
Request
 ↓
Authentication
 ↓
CSRF Check
 ↓
Authorization
 ↓
Validation
 ↓
Business Rules
 ↓
Delete
```

Không được chỉ kiểm tra:

```text
Có Session?
 ↓
Cho phép Delete
```

---

# 5. Like

Khách bấm:

```text
♥ Like
```

request thay đổi Selection phải được bảo vệ.

Ví dụ:

```text
POST /api/selections
```

Server phải kiểm tra:

```text
Authentication
 ↓
CSRF
 ↓
Authorization
 ↓
Validation
 ↓
Album Access
 ↓
Photo thuộc Album?
 ↓
Create Like
```

Website khác không được tự ý gửi request khiến khách Like ảnh.

---

# 6. Star

Tương tự Like:

```text
⭐ Star
```

Server phải kiểm tra:

```text
Session
 ↓
CSRF
 ↓
Customer / Album Access
 ↓
Quyền STAR
 ↓
Photo thuộc Album?
 ↓
Create STAR
```

Không được chỉ dựa vào giao diện hoặc dữ liệu browser gửi lên.

---

# 7. Comment

Comment là thao tác ghi dữ liệu:

```text
POST /api/comments
```

Phải kiểm tra:

```text
Authentication
+
CSRF
+
Authorization
+
Input Validation
+
Album Access
+
Photo thuộc Album
```

Sau đó mới lưu Comment.

CSRF không thay thế Comment Security.

Comment vẫn phải chống:

```text
XSS
HTML Injection
JavaScript Injection
Script Injection
```

---

# 8. Change Password

Đây là thao tác nhạy cảm.

Ví dụ:

```text
PATCH /api/account/password
```

Luồng:

```text
Change Password
 ↓
Authentication
 ↓
CSRF
 ↓
Validation
 ↓
Current Password / Authentication Step
 ↓
Change Password
 ↓
Revoke Sessions nếu cần
```

Không để website khác có thể tự ý gửi request đổi mật khẩu.

---

# 9. Change Album

Các thay đổi:

```text
Tên Album
Mô tả
Mật khẩu Album
Cho phép Download
Ngày hết hạn
Template
```

ví dụ:

```text
PATCH /api/albums/{id}
```

phải kiểm tra:

```text
Authentication
 ↓
CSRF
 ↓
Authorization
 ↓
Album thuộc User?
 ↓
Validation
 ↓
Business Rules
 ↓
Update
```

---

# 10. CSRF Token

Một phương án phổ biến là CSRF Token.

Khái niệm:

```text
Server
 ↓
Tạo CSRF Token
 ↓
Frontend
 ↓
Gửi Token trong request
 ↓
Server kiểm tra
```

Ví dụ request:

```text
POST /api/comments
```

có thể gửi token qua header:

```text
X-CSRF-Token: <token>
```

Nếu token không hợp lệ:

```text
403 Forbidden
```

Không nên tự thiết kế một thuật toán bảo mật mới; phải dùng cơ chế phù hợp với authentication/session hiện tại của BOOKS VIEW.

---

# 11. Authentication quyết định cách chống CSRF

Trước khi triển khai CSRF phải xác định BOOKS VIEW đang dùng authentication nào.

Ví dụ:

```text
Cookie Session
```

hoặc:

```text
Bearer Token
```

hoặc cơ chế khác.

Cơ chế CSRF phải phù hợp với cách credential được gửi.

Không copy một đoạn CSRF code bất kỳ vào project mà không kiểm tra authentication hiện tại.

---

# 12. SameSite Cookie

Nếu sử dụng Session Cookie, nên cấu hình các thuộc tính phù hợp:

```text
HttpOnly
Secure
SameSite
```

`SameSite` giúp hạn chế việc Cookie được gửi trong một số request cross-site.

Không nên tùy tiện dùng:

```text
SameSite=None
```

nếu hệ thống không thực sự cần cross-site cookie.

Nếu sử dụng `SameSite=None`, Cookie phải đi cùng `Secure`.

SameSite là một lớp bảo vệ, không nên xem nó là lý do để bỏ qua việc thiết kế CSRF phù hợp.

---

# 13. Origin / Referer

Có thể kiểm tra thêm:

```text
Origin
```

hoặc:

```text
Referer
```

đối với các request nhạy cảm.

Ví dụ:

```text
Origin: https://booksview...
```

Nếu nguồn request không phù hợp:

```text
403 Forbidden
```

Đây là lớp phòng thủ bổ sung, không thay thế toàn bộ CSRF protection.

---

# 14. GET không được dùng để thay đổi dữ liệu

Không nên:

```text
GET /api/delete-album/{id}
```

hoặc:

```text
GET /api/like/{photoId}
```

GET nên dùng cho việc đọc dữ liệu.

```text
GET
 ↓
READ
```

Thay đổi dữ liệu dùng:

```text
POST
PUT
PATCH
DELETE
```

Ví dụ:

```text
GET
→ Xem Album

POST
→ Like

POST
→ Comment

DELETE
→ Delete
```

---

# 15. CSRF không thay thế Authorization

Ví dụ:

```text
CSRF ✓
```

nhưng User A cố xóa Album của User B:

```text
Authorization ❌
```

→ vẫn phải từ chối.

Vì vậy:

```text
CSRF
+
Authorization
```

là hai lớp khác nhau.

CSRF chỉ chứng minh request phù hợp với cơ chế chống request giả mạo; nó không chứng minh người đó có quyền thực hiện hành động.

---

# 16. CSRF không thay thế Input Validation

Ví dụ:

```text
CSRF ✓
```

nhưng dữ liệu:

```text
photoId = dữ liệu không hợp lệ
```

thì vẫn phải reject.

Luồng đầy đủ:

```text
Request
 ↓
Authentication
 ↓
CSRF
 ↓
Authorization
 ↓
Input Validation
 ↓
Business Rules
 ↓
Database
```

---

# 17. Các thao tác của Customer

Customer có thể có các thao tác:

```text
♥ Like
⭐ Star
💬 Comment
Submit Selection
```

Các request làm thay đổi dữ liệu phải được bảo vệ theo cơ chế CSRF phù hợp.

---

# 18. Các thao tác của User / Studio

Các thao tác thay đổi dữ liệu gồm:

```text
Create Album
Change Album
Delete Album
Change Album Password
Change Download Permission
Change Expiration
Upload
Delete Photo
Reorder Photo
Change Cover
```

Các API tương ứng phải áp dụng:

```text
Authentication
+
CSRF
+
Authorization
+
Validation
```

---

# 19. Các thao tác của ADMIN

ADMIN cũng phải được bảo vệ CSRF.

Ví dụ:

```text
Suspend User
Change User Status
Moderation Action
Change Permission
Delete User
Delete Album
```

Luồng:

```text
ADMIN
 ↓
Authentication
 ↓
CSRF
 ↓
Admin Authorization
 ↓
Validation
 ↓
Business Rules
 ↓
Action
 ↓
Audit Log
```

---

# 20. Kiến trúc bảo mật API

Mọi API thay đổi dữ liệu nên tuân theo một pipeline thống nhất:

```text
Client
 ↓
API
 ↓
Authentication
 ↓
CSRF Protection
 ↓
Authorization
 ↓
Input Validation
 ↓
Business Rules
 ↓
Database
```

Không tạo API đặc biệt bỏ qua các lớp bảo mật này.

---

# 21. Ví dụ Delete Album

```text
USER
 ↓
Bấm Delete
 ↓
DELETE Request
 ↓
Authentication
 ↓
CSRF Check
 ↓
Authorization
 ↓
User có quyền?
 ↓
Album thuộc User?
 ↓
Validation
 ↓
Business Rules
 ↓
Delete
 ↓
Audit Log
```

Với ADMIN:

```text
ADMIN
 ↓
Delete
 ↓
Authentication
 ↓
CSRF
 ↓
Admin Permission
 ↓
Business Rules
 ↓
Delete
 ↓
Audit Log
```

---

# 22. Các API cần kiểm tra CSRF

## Customer

```text
□ Like
□ Star
□ Comment
□ Submit Selection
```

## User / Studio

```text
□ Create Album
□ Change Album
□ Delete Album
□ Change Album Password
□ Change Download Permission
□ Change Expiration
□ Upload
□ Delete Photo
□ Reorder Photo
□ Change Cover
```

## Account

```text
□ Change Password
□ Change Email
□ Các thao tác thay đổi thông tin tài khoản
```

## ADMIN

```text
□ Suspend User
□ Change User Status
□ Moderation Action
□ Change Permission
□ Delete User
□ Delete Album
```

---

# 23. Checklist CSRF

```text
□ Xác định authentication hiện tại
□ CSRF protection phù hợp với authentication
□ POST được bảo vệ
□ PUT được bảo vệ
□ PATCH được bảo vệ
□ DELETE được bảo vệ
□ Delete được bảo vệ
□ Like được bảo vệ
□ Star được bảo vệ
□ Comment được bảo vệ
□ Change Password được bảo vệ
□ Change Album được bảo vệ
□ Admin Actions được bảo vệ
□ Không dùng GET để thay đổi dữ liệu
□ Session Cookie có SameSite phù hợp
□ Có thể kiểm tra Origin/Referer như lớp bổ sung
□ CSRF không thay thế Authentication
□ CSRF không thay thế Authorization
□ CSRF không thay thế Input Validation
□ Request không hợp lệ phải bị từ chối
```

---

# 24. Nguyên tắc cuối cùng

BOOKS VIEW thống nhất pipeline:

```text
              API
               ↓
        Authentication
               ↓
          CSRF Check
               ↓
         Authorization
               ↓
        Input Validation
               ↓
        Business Rules
               ↓
            Database
```

Đặc biệt với các thao tác nguy hiểm:

```text
DELETE
CHANGE PASSWORD
CHANGE ALBUM
SUSPEND USER
MODERATION
CHANGE PERMISSION
```

không được bỏ qua các lớp kiểm tra phù hợp.

> **CSRF là một lớp bảo vệ API, không phải cơ chế phân quyền.**
>
> **Authentication xác định người dùng là ai.**
>
> **CSRF bảo vệ request khỏi bị giả mạo theo cơ chế authentication của ứng dụng.**
>
> **Authorization xác định người đó có quyền làm việc đó hay không.**
>
> **Validation kiểm tra dữ liệu có hợp lệ hay không.**
