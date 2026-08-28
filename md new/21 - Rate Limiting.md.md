# 21. RATE LIMITING — BOOKS VIEW

## 1. Mục đích

Rate Limiting = **giới hạn số request được phép thực hiện trong một khoảng thời gian**.

Ví dụ:

```text
1 IP
 ↓
100 request / phút
 ↓
Cho phép
```

Nếu vượt quá giới hạn:

```text
101 request
 ↓
429 Too Many Requests
```

Mục đích:

- chống spam
- chống brute-force mật khẩu
- giảm abuse API
- bảo vệ database
- bảo vệ server
- hạn chế bot tự động
- giảm tải tài nguyên hệ thống
- giảm chi phí hạ tầng

---

# 2. Các API cần Rate Limit

BOOKS VIEW nên Rate Limit ít nhất:

```text
Login
Guest Gate
Primary Customer Password
Comment
Like
Star
Download
API
```

Nên bổ sung cho các endpoint nhạy cảm khác:

```text
Password Reset
Change Password
Email Verification
Authentication endpoints
Upload
Content Safety Scan
Admin sensitive actions
```

---

# 3. Login

Login là endpoint cần Rate Limit mạnh.

Ví dụ:

```text
POST /api/auth/login
```

Không được cho phép attacker thử mật khẩu liên tục:

```text
password 1
password 2
password 3
...
password 100000
```

Có thể giới hạn dựa trên:

```text
IP
+
Email / Account
+
Thời gian
```

Ví dụ minh họa:

```text
5 lần thất bại / 5 phút
```

Đây chỉ là ví dụ. Giá trị thực tế phải được điều chỉnh theo hành vi sử dụng.

Có thể sử dụng Progressive Delay sau nhiều lần thất bại.

Không nên khóa tài khoản vĩnh viễn chỉ dựa vào IP hoặc một số lần thử, vì attacker có thể lợi dụng cơ chế đó để khóa tài khoản của người khác.

---

# 4. Guest Gate

BOOKS VIEW có Guest Gate khi khách truy cập Album.

Ví dụ:

```text
POST /api/guest/verify
```

Nếu không Rate Limit, attacker có thể thử thông tin liên tục.

Nên giới hạn theo kết hợp:

```text
IP
+
Album
+
Session
```

Mục tiêu:

```text
Guest Gate
 ↓
Giới hạn số lần thử
 ↓
Ngăn brute-force
```

---

# 5. Primary Customer Password

Primary Customer Password là mật khẩu Album dành cho Cô dâu/Chú rể hoặc Primary Customer.

Ví dụ:

```text
POST /api/album/verify-password
```

Không được cho phép:

```text
password 0000
password 0001
password 0002
...
```

không giới hạn.

Nên có:

```text
Rate Limit
+
Progressive Delay
+
Audit nếu cần
```

Ví dụ:

```text
5 lần sai
 ↓
Tạm thời chờ
 ↓
Thử lại
```

---

# 6. Comment

Comment có thể bị bot spam:

```text
Hello
Hello
Hello
Hello
...
```

Ví dụ:

```text
POST /api/comments
```

nên giới hạn số comment trong một khoảng thời gian.

Có thể kết hợp:

```text
Authentication / Guest Session
+
Rate Limit
+
Input Validation
```

Ví dụ:

```text
10 comments / phút / session
```

Đây chỉ là giá trị minh họa.

---

# 7. Like

Like cũng có thể bị spam bằng cách gửi request liên tục.

Ví dụ:

```text
POST /api/selections
```

Rate Limit giúp giảm request bất thường.

Ngoài Rate Limit, server vẫn phải có Business Rule và Database Constraint.

Ví dụ:

```text
Một Customer
+
Một Photo
+
Một likeType
=
Không tạo duplicate
```

Rate Limit **không thay thế Unique Constraint**.

---

# 8. Star

Star tương tự Like:

```text
POST /api/selections
```

với:

```text
likeType = STAR
```

Phải kết hợp:

```text
Rate Limit
+
Authentication / Customer Session
+
Authorization
+
Validation
+
Database Constraint
```

Đặc biệt Star là chức năng có quyền riêng nên không được chỉ dựa vào frontend.

---

# 9. Download

Download cần Rate Limit vì có thể tạo tải lớn cho server.

BOOKS VIEW có thể xử lý:

```text
Google Drive Original
 ↓
Server
 ↓
Resize
 ↓
2048px
 ↓
Nén
 ↓
Download
```

Nếu một người gọi liên tục:

```text
Download
Download
Download
...
```

server có thể phải xử lý ảnh nhiều lần.

Do đó:

```text
Download
 ↓
Rate Limit
+
Album Access
+
Download Permission
+
Download Password nếu bật
```

---

# 10. API nói chung

Không chỉ các endpoint trên.

API nói chung nên có Rate Limit phù hợp.

Ví dụ:

```text
GET /api/albums
GET /api/photos
POST /api/comments
POST /api/selections
PATCH /api/albums/{id}
DELETE /api/photos/{id}
```

Không nên dùng một mức Rate Limit cho tất cả API.

Nên phân nhóm:

```text
READ API
→ giới hạn cao hơn

WRITE API
→ giới hạn thấp hơn

AUTH API
→ giới hạn rất thấp

PASSWORD VERIFY
→ giới hạn rất thấp

DOWNLOAD
→ Rate Limit riêng
```

---

# 11. Không chỉ Rate Limit theo IP

Chỉ giới hạn theo:

```text
IP
```

là chưa đủ.

Một người có thể thay đổi IP hoặc nhiều người dùng có thể dùng chung một IP.

Tùy endpoint có thể kết hợp:

```text
IP
+
Account
+
Session
+
Album
+
Endpoint
```

Ví dụ:

### Login

```text
IP + Email
```

### Primary Customer Password

```text
IP + Album
```

### Comment

```text
Session + User + Album
```

### Download

```text
User / Session + Album + IP
```

Các khóa thực tế phải được thiết kế phù hợp với hệ thống.

---

# 12. HTTP 429

Khi vượt giới hạn, API nên trả:

```text
429 Too Many Requests
```

Có thể trả thêm:

```text
Retry-After
```

để client biết cần chờ bao lâu.

Ví dụ:

```text
Retry-After: 60
```

Frontend có thể hiển thị:

> Bạn thực hiện quá nhiều lần. Vui lòng thử lại sau.

Không trả database error hoặc stack trace production.

---

# 13. Rate Limit phải ở Server

Không được chỉ làm:

```text
Frontend
 ↓
if clickCount > 10
 ↓
block
```

Attacker có thể bỏ qua frontend.

Phải kiểm tra ở server:

```text
Request
 ↓
Server
 ↓
Rate Limit Check
 ↓
Allow / Reject
```

---

# 14. Rate Limit trong môi trường nhiều server

Nếu BOOKS VIEW chạy nhiều server hoặc serverless instance, không nên chỉ lưu counter trong RAM của một instance.

Ví dụ:

```text
Request
 ↓
Server A
 ↓
Counter A
```

Request tiếp theo:

```text
Request
 ↓
Server B
```

Server B có thể không biết Counter A.

Production nên dùng storage phân tán phù hợp cho Rate Limit.

Ví dụ có thể sử dụng:

```text
Redis / Redis-compatible store
```

hoặc dịch vụ Rate Limit chuyên dụng.

---

# 15. Rate Limit và Database

Rate Limit giúp giảm số request nhưng không thay thế Database Security.

Pipeline:

```text
Rate Limit
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Prisma
 ↓
PostgreSQL
```

Không được coi:

```text
Rate Limit = Security hoàn chỉnh
```

Rate Limit chỉ là một lớp bảo vệ.

---

# 16. Chia Rate Limit theo nhóm

Có thể chia:

```text
AUTH
SENSITIVE
WRITE
READ
DOWNLOAD
```

Ví dụ:

```text
AUTH
→ rất thấp

PASSWORD VERIFY
→ rất thấp

COMMENT / LIKE / STAR
→ thấp đến vừa

READ API
→ vừa đến cao

DOWNLOAD
→ riêng biệt
```

Không nên chốt một con số duy nhất cho toàn hệ thống ngay từ đầu.

Các giá trị phải được điều chỉnh dựa trên hành vi sử dụng thực tế.

---

# 17. Rate Limit và Session Security

Ví dụ:

```text
Customer Session
 ↓
Like
 ↓
Rate Limit
```

Nếu session có dấu hiệu abuse, có thể kết hợp với:

```text
Session Revoke
```

đối với trường hợp phù hợp.

Với ADMIN:

```text
Admin Session
 ↓
Sensitive API
 ↓
Rate Limit
 ↓
Audit Log
```

---

# 18. Content Moderation

Nếu BOOKS VIEW có API:

```text
POST /api/moderation/scan
```

không nên cho client gọi không giới hạn.

Nên có:

```text
Upload
 ↓
Scan Queue
 ↓
Content Safety Scan
```

Không nên:

```text
Client
 ↓
Gọi Scan API hàng nghìn lần
```

---

# 19. Không làm ảnh hưởng người dùng bình thường

Mục tiêu:

```text
Người dùng bình thường
 ↓
Không cảm nhận Rate Limit
```

nhưng:

```text
Bot / Abuse
 ↓
Bị giới hạn
```

Không đặt giới hạn quá thấp khiến khách đang chọn ảnh bình thường liên tục gặp:

```text
429 Too Many Requests
```

---

# 20. Rate Limit + Challenge

Không nhất thiết bắt CAPTCHA/Challenge ngay từ đầu.

Có thể dùng theo mức độ:

```text
Normal
 ↓
Rate Limit
 ↓
Suspicious
 ↓
Challenge / CAPTCHA
 ↓
Continued Abuse
 ↓
Temporary Block
```

Như vậy trải nghiệm của khách bình thường vẫn đơn giản.

---

# 21. Danh sách Rate Limit tối thiểu

```text
□ Login
□ Guest Gate
□ Primary Customer Password
□ Comment
□ Like
□ Star
□ Download
□ API
```

Nên bổ sung:

```text
□ Password Reset
□ Change Password
□ Email Verification
□ Authentication endpoints
□ Upload
□ Content Safety Scan
□ Admin sensitive actions
```

---

# 22. Nguyên tắc tổng thể

Rate Limiting là một lớp trong API Security.

```text
Client
 ↓
Rate Limit
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

Thứ tự kỹ thuật cụ thể có thể được điều chỉnh theo implementation, nhưng Rate Limit phải được thực thi phía server.

---

# 23. Checklist

```text
□ Rate Limit phía server
□ Login có Rate Limit
□ Guest Gate có Rate Limit
□ Primary Customer Password có Rate Limit
□ Comment có Rate Limit
□ Like có Rate Limit
□ Star có Rate Limit
□ Download có Rate Limit
□ API có Rate Limit
□ Password Reset có Rate Limit
□ Change Password có Rate Limit
□ Upload có Rate Limit
□ Content Safety Scan có Rate Limit
□ Admin sensitive actions có Rate Limit
□ Không chỉ giới hạn bằng frontend
□ Không chỉ dựa vào IP
□ Có thể kết hợp IP + Account + Session + Album
□ Vượt giới hạn trả 429
□ Có thể sử dụng Retry-After
□ Không trả stack trace
□ Production nhiều instance dùng storage phù hợp
□ Rate Limit không thay thế Authorization
□ Rate Limit không thay thế Validation
□ Rate Limit không thay thế Database Constraint
```

---

# 24. Nguyên tắc cuối cùng

> **Rate Limiting = giới hạn tốc độ sử dụng API để ngăn brute-force, spam, abuse và bảo vệ tài nguyên BOOKS VIEW.**

Đặc biệt:

```text
Login
Guest Gate
Primary Customer Password
Comment
Like
Star
Download
API
```

đều phải có chính sách Rate Limit phù hợp.

Không cần chốt cứng một mức request/phút cho toàn hệ thống ngay trong tài liệu. Nên cấu hình theo từng nhóm API và điều chỉnh sau khi có dữ liệu sử dụng thực tế.
