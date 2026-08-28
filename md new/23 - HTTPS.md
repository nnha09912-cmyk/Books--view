# 23. HTTPS — BOOKS VIEW

## 1. Mục đích

Khi BOOKS VIEW chạy trên production, toàn bộ kết nối giữa trình duyệt và server phải sử dụng HTTPS.

```text
HTTP ❌
HTTPS ✅
```

Ví dụ:

```text
http://booksview.vn
```

không được dùng làm kết nối chính cho production.

Phải sử dụng:

```text
https://booksview.vn
```

HTTPS sử dụng TLS để mã hóa dữ liệu trên đường truyền.

---

# 2. HTTPS bảo vệ dữ liệu trên đường truyền

Mô hình:

```text
Browser
   ↕
 HTTPS / TLS
   ↕
BOOKS VIEW Server
```

Các dữ liệu nhạy cảm khi truyền giữa browser và server không được gửi qua HTTP không mã hóa.

Đặc biệt:

```text
Password
Session
Customer Information
```

---

# 3. Password

Không được gửi password qua HTTP không mã hóa.

Không:

```text
Browser
 ↓
HTTP
 ↓
Password
```

Production:

```text
Browser
 ↓
HTTPS
 ↓
Password
 ↓
BOOKS VIEW Server
```

Lưu ý:

> HTTPS bảo vệ password trên đường truyền. Nó không thay thế việc lưu password an toàn trong database.

Password vẫn phải được xử lý bằng cơ chế hash/password storage an toàn phía server.

---

# 4. Session

Session đặc biệt quan trọng vì session có thể đại diện cho phiên đăng nhập của người dùng.

Nếu session bị đánh cắp, attacker có thể tìm cách sử dụng phiên đó.

Do đó:

```text
Browser
 ↓
HTTPS
 ↓
Server
```

Session Cookie nên có các thuộc tính phù hợp:

```text
Secure
HttpOnly
SameSite
```

`Secure` giúp Cookie chỉ được gửi qua HTTPS.

`HttpOnly` giúp JavaScript phía browser không đọc trực tiếp Cookie.

`SameSite` giúp hạn chế việc Cookie được gửi trong một số tình huống cross-site.

---

# 5. Customer Information

BOOKS VIEW có thể xử lý dữ liệu:

```text
Tên
SĐT
Email
Album
Selection
Comment
```

Các dữ liệu này không được truyền qua HTTP không mã hóa trong production.

Ví dụ:

```text
Customer
 ↓
Tên + SĐT
 ↓
HTTPS
 ↓
BOOKS VIEW
```

---

# 6. HTTPS áp dụng cho toàn bộ Production

Không chỉ trang Login.

Toàn bộ production website phải sử dụng HTTPS, bao gồm:

```text
/dashboard
/albums/...
/album/...
/gallery
/api/...
```

Đặc biệt các API:

```text
Login
Guest Gate
Password
Like
Star
Comment
Download
Admin
```

đều phải hoạt động qua HTTPS.

---

# 7. HTTP phải chuyển sang HTTPS

Nếu người dùng truy cập:

```text
http://booksview.vn
```

hệ thống nên chuyển hướng sang:

```text
https://booksview.vn
```

Mô hình:

```text
HTTP
 ↓
301 / 308 Redirect
 ↓
HTTPS
```

Mục tiêu là không để người dùng tiếp tục sử dụng kết nối HTTP cho website production.

---

# 8. HSTS

Production có thể sử dụng:

```text
Strict-Transport-Security
```

hay HSTS.

Mục đích là yêu cầu browser ưu tiên sử dụng HTTPS đối với domain.

Khái niệm:

```text
Browser
 ↓
BOOKS VIEW
 ↓
HSTS
 ↓
HTTPS only
```

HSTS là một lớp bảo vệ bổ sung.

---

# 9. HTTPS và API

API của BOOKS VIEW cũng phải chạy qua HTTPS.

Ví dụ:

```text
https://booksview.vn/api/...
```

Không:

```text
http://booksview.vn/api/...
```

Đặc biệt:

```text
Login
Guest Gate
Password
Like
Star
Comment
Download
Admin
```

---

# 10. HTTPS và Google Drive

BOOKS VIEW sử dụng Google Drive trong một số luồng ảnh.

Khi sử dụng tài nguyên hoặc URL từ dịch vụ bên ngoài, ưu tiên HTTPS nếu dịch vụ cung cấp HTTPS.

Không nên đưa tài nguyên HTTP không mã hóa vào production HTTPS nếu không cần thiết.

---

# 11. HTTPS không thay thế các lớp bảo mật khác

Có HTTPS không có nghĩa BOOKS VIEW đã an toàn hoàn toàn.

HTTPS chủ yếu bảo vệ:

```text
Dữ liệu trên đường truyền
```

BOOKS VIEW vẫn cần:

```text
HTTPS
+
Authentication
+
Authorization
+
CSRF Protection
+
Input Validation
+
XSS Protection
+
Rate Limiting
+
Session Security
+
Database Security
+
File Security
+
Audit Log
```

---

# 12. Mô hình bảo mật tổng thể

```text
                INTERNET
                   │
                 HTTPS
                   │
                   ▼
              BOOKS VIEW
                   │
        ┌──────────┴──────────┐
        │                     │
 Authentication          Authorization
        │                     │
        └──────────┬──────────┘
                   │
              API Security
                   │
        ┌──────────┼──────────┐
        │          │          │
      CSRF      Validation   Rate Limit
        │          │          │
        └──────────┴──────────┘
                   │
                Prisma
                   │
              PostgreSQL
```

---

# 13. Checklist HTTPS

```text
□ Production dùng HTTPS
□ Không dùng HTTP làm kết nối chính cho production
□ HTTP redirect sang HTTPS
□ Login chạy HTTPS
□ API chạy HTTPS
□ Dashboard chạy HTTPS
□ Album chạy HTTPS
□ Gallery chạy HTTPS
□ Session truyền qua HTTPS
□ Password truyền qua HTTPS
□ Customer Information truyền qua HTTPS
□ Session Cookie có Secure
□ Session Cookie có HttpOnly
□ SameSite được cấu hình phù hợp
□ Có thể bật HSTS
□ Không dùng tài nguyên HTTP không cần thiết
```

---

# 14. Nguyên tắc cuối cùng

> **HTTPS = bảo vệ dữ liệu trên đường truyền giữa người dùng và BOOKS VIEW.**

BOOKS VIEW production:

```text
HTTP ❌
HTTPS ✅
```

Không được gửi các dữ liệu nhạy cảm qua HTTP không mã hóa:

```text
Password
Session
Customer Information
```

HTTPS là lớp bảo vệ đường truyền và phải được kết hợp với các lớp bảo mật khác của BOOKS VIEW.
