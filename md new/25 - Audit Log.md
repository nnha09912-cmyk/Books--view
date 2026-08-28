# 25. AUDIT LOG — BOOKS VIEW

## 1. Mục đích

Audit Log là **nhật ký bảo mật và vận hành của BOOKS VIEW**.

Nó không liên quan đến:

```text
Quản lý nhân viên
Chấm công
Lương
Tài chính
CRM
```

Mục đích chính:

> Biết **ai — lúc nào — đã thực hiện hành động gì — trên dữ liệu nào — kết quả ra sao**.

Ví dụ:

```text
User A
 ↓
28/08/2026 21:30
 ↓
Xóa Album
 ↓
Album: Wedding Minh & Lan
```

---

# 2. Audit Log không phải Activity Log

Không cần ghi mọi thao tác nhỏ của người dùng như:

```text
Click nút
Di chuyển chuột
Hover
Mở menu
Đóng modal
```

Audit Log tập trung vào các hành động:

```text
Bảo mật
+
Thay đổi dữ liệu quan trọng
+
Quản trị
+
Kiểm duyệt
+
Xử lý sự cố
```

---

# 3. Authentication Events

Các sự kiện liên quan tài khoản:

```text
LOGIN
LOGIN_FAILED
LOGOUT
PASSWORD_CHANGED
SESSION_REVOKED
```

Ví dụ:

```text
LOGIN

Actor:
user@example.com

Time:
28/08/2026 21:30

Result:
SUCCESS
```

Hoặc:

```text
LOGIN_FAILED

Account:
user@example.com

Time:
28/08/2026 21:31

Result:
FAILED
```

Các log này giúp phát hiện hoạt động đăng nhập bất thường.

---

# 4. Album Events

Các hành động quan trọng:

```text
ALBUM_CREATED
ALBUM_DELETED
ALBUM_PASSWORD_CHANGED
ALBUM_LINK_ROTATED
```

Ví dụ:

```text
ALBUM_PASSWORD_CHANGED

Actor:
user@example.com

Album:
Wedding Minh & Lan

Time:
28/08/2026 21:40

Result:
SUCCESS
```

---

# 5. ALBUM_LINK_ROTATED

Nếu Album đang có link:

```text
/album/abc123
```

sau đó chủ Album đổi link:

```text
/album/xyz789
```

thì ghi:

```text
ALBUM_LINK_ROTATED
```

Mục đích:

```text
Ai đổi?
 ↓
Khi nào?
 ↓
Album nào?
```

Không cần lưu token/link bí mật nguyên bản vào log nếu không cần thiết.

---

# 6. Photo Events

Các hành động quan trọng:

```text
PHOTO_IMPORTED
PHOTO_DELETED
```

Ví dụ:

```text
PHOTO_IMPORTED

Actor:
user@example.com

Album:
Wedding Minh & Lan

Photo:
Photo ID xxx

Source:
Google Drive

Time:
28/08/2026 21:45
```

Không lưu Google Drive API Key hoặc credential vào Audit Log.

---

# 7. Selection Events

BOOKS VIEW có:

```text
♥ Like
⭐ Star
```

Có thể ghi:

```text
SELECTION_CHANGED
```

Ví dụ:

```text
SELECTION_CHANGED

Actor:
Customer Session

Album:
Wedding Minh & Lan

Photo:
Photo #A821

Action:
LIKE_ADDED
```

Hoặc:

```text
LIKE_REMOVED
STAR_ADDED
STAR_REMOVED
```

Nếu muốn đơn giản hóa database, có thể dùng:

```text
SELECTION_CHANGED
```

và lưu thêm:

```text
likeType
action
photoId
```

---

# 8. Audit Log cần lưu gì?

Tối thiểu nên có:

```text
id
timestamp
actor
actorType
action
resourceType
resourceId
result
```

Ví dụ:

```text
ID:
log_123

Time:
28/08/2026 21:45

Actor:
user@example.com

Actor Type:
USER

Action:
ALBUM_PASSWORD_CHANGED

Resource:
ALBUM

Resource ID:
album_123

Result:
SUCCESS
```

---

# 9. Actor Type

Nên phân biệt:

```text
USER
CUSTOMER
ADMIN
SYSTEM
```

Ví dụ:

```text
USER
 ↓
ALBUM_CREATED
```

```text
CUSTOMER
 ↓
SELECTION_CHANGED
```

```text
ADMIN
 ↓
VIEW_USER
```

```text
SYSTEM
 ↓
PHOTO_IMPORTED
```

Điều này giúp phân tích sự cố rõ hơn.

---

# 10. Không lưu Password

Tuyệt đối không lưu password vào Audit Log.

Không:

```text
PASSWORD_CHANGED

oldPassword:
abc123

newPassword:
xyz789
```

Chỉ ghi:

```text
PASSWORD_CHANGED
```

và:

```text
Actor
Time
Result
```

---

# 11. Không lưu Session Token

Không lưu Session Token vào Audit Log.

Không:

```text
sessionToken:
eyJhbGciOi...
```

Nếu cần xác định Session, sử dụng một ID nội bộ/an toàn hoặc mã đã được xử lý phù hợp.

---

# 12. Không lưu Secret / API Key

Audit Log không được chứa:

```text
DATABASE_URL
GOOGLE_DRIVE_API_KEY
GOOGLE_CLIENT_SECRET
AUTH_SECRET
OAUTH_SECRET
```

Audit Log là nhật ký bảo mật, **không phải nơi lưu secret**.

---

# 13. ADMIN xem Audit Log

ADMIN có thể vào:

```text
/dashboard
 ↓
Quản trị hệ thống
 ↓
Audit Log
```

Có thể lọc theo:

```text
Actor
Action
Date
Resource
Result
```

Ví dụ:

```text
[28/08/2026]

LOGIN
user@gmail.com
SUCCESS

ALBUM_CREATED
user@gmail.com
SUCCESS

PHOTO_IMPORTED
user@gmail.com
SUCCESS

LOGIN_FAILED
abc@gmail.com
FAILED
```

---

# 14. Audit Log giúp xử lý sự cố

Ví dụ User báo:

> Tôi không xóa Album.

ADMIN kiểm tra:

```text
Audit Log
 ↓
ALBUM_DELETED
 ↓
Actor: user@example.com
 ↓
Time: 28/08/2026 22:15
```

Nếu phát hiện:

```text
Actor:
ADMIN
```

thì có thể tiếp tục điều tra.

---

# 15. Audit Log và quyền riêng tư

Audit Log cũng chứa dữ liệu nhạy cảm nên phải được bảo vệ.

USER bình thường không được xem Audit Log hệ thống:

```text
USER
 ↓
Audit Log
 ↓
❌
```

ADMIN có permission phù hợp mới được xem:

```text
ADMIN
 ↓
audit.view
 ↓
Audit Log
```

Nếu sau này có nhiều cấp Admin/Moderator, có thể tách:

```text
audit.view
audit.export
```

---

# 16. Không cho sửa Audit Log tùy tiện

Audit Log có mục đích lưu lịch sử.

Không nên cho User:

```text
Edit Log
Delete Log
```

ADMIN cũng không nên có chức năng sửa nội dung log tùy ý.

Nếu hệ thống có chính sách retention/xóa log theo thời hạn, việc đó phải là quy trình quản trị riêng và bản thân hành động đó nên được ghi nhận.

---

# 17. ADMIN xem ảnh

Nếu ADMIN mở ảnh của User để kiểm duyệt:

```text
ADMIN
 ↓
VIEW_PHOTO
 ↓
Audit Log
```

Có thể ghi:

```text
Actor:
ADMIN

Action:
VIEW_PHOTO

Reason:
CONTENT_MODERATION
```

Mục đích là đảm bảo các truy cập dữ liệu nhạy cảm có thể được truy vết.

---

# 18. Không biến Audit Log thành Tracking

Audit Log không phải hệ thống theo dõi mọi hoạt động của khách.

Không cần ghi:

```text
Mouse movement
Scroll
Hover
Mở ảnh
Đóng ảnh
Click từng nút
```

trừ khi đó thực sự là sự kiện bảo mật hoặc thao tác quan trọng cần ghi.

Mục tiêu:

```text
Security
+
Accountability
+
Troubleshooting
```

không phải theo dõi người dùng.

---

# 19. Event chính của BOOKS VIEW

## Authentication

```text
LOGIN
LOGIN_FAILED
LOGOUT
PASSWORD_CHANGED
SESSION_REVOKED
```

## Album

```text
ALBUM_CREATED
ALBUM_DELETED
ALBUM_PASSWORD_CHANGED
ALBUM_LINK_ROTATED
```

## Photo

```text
PHOTO_IMPORTED
PHOTO_DELETED
```

## Selection

```text
SELECTION_CHANGED
```

## Security / Admin

Có thể bổ sung:

```text
VIEW_USER
VIEW_ALBUM
VIEW_PHOTO
MODERATION_ACTION
USER_SUSPENDED
PERMISSION_CHANGED
```

---

# 20. Công thức Audit Log

Có thể nhớ đơn giản:

```text
AI?
 ↓
Actor

KHI NÀO?
 ↓
Timestamp

LÀM GÌ?
 ↓
Action

TRÊN CÁI GÌ?
 ↓
Resource

KẾT QUẢ?
 ↓
Success / Failed
```

Ví dụ:

```text
ADMIN
 ↓
28/08/2026 22:10
 ↓
VIEW_PHOTO
 ↓
Photo #A821
 ↓
CONTENT_MODERATION
 ↓
SUCCESS
```

---

# 21. Audit Log và Security

Audit Log hoạt động cùng các lớp bảo mật khác:

```text
Authentication
 ↓
Authorization
 ↓
Action
 ↓
Audit Log
```

Audit Log không thay thế:

```text
Authentication
Authorization
CSRF
Input Validation
Rate Limiting
Session Security
```

Nó ghi nhận rằng một hành động đã xảy ra sau khi các lớp bảo mật cần thiết được kiểm tra.

---

# 22. Checklist Audit Log

```text
□ Audit Log chỉ phục vụ Security / Accountability / Troubleshooting
□ Không liên quan quản lý nhân viên
□ Không liên quan tài chính
□ Ghi LOGIN
□ Ghi LOGIN_FAILED
□ Ghi LOGOUT
□ Ghi PASSWORD_CHANGED
□ Ghi SESSION_REVOKED
□ Ghi ALBUM_CREATED
□ Ghi ALBUM_DELETED
□ Ghi ALBUM_PASSWORD_CHANGED
□ Ghi ALBUM_LINK_ROTATED
□ Ghi PHOTO_IMPORTED
□ Ghi PHOTO_DELETED
□ Ghi SELECTION_CHANGED
□ Có thể ghi VIEW_USER
□ Có thể ghi VIEW_ALBUM
□ Có thể ghi VIEW_PHOTO
□ Có thể ghi MODERATION_ACTION
□ Có thể ghi USER_SUSPENDED
□ Có thể ghi PERMISSION_CHANGED
□ Có timestamp
□ Có actor
□ Có actorType
□ Có action
□ Có resource
□ Có resourceId khi cần
□ Có result
□ Không lưu password
□ Không lưu session token
□ Không lưu API key
□ Không lưu secret
□ USER không được xem Audit Log hệ thống
□ ADMIN cần permission để xem
□ Không cho sửa log tùy tiện
□ Không biến Audit Log thành tracking mọi thao tác
```

---

# 23. Nguyên tắc cuối cùng

> **Audit Log = nhật ký bảo mật và trách nhiệm của BOOKS VIEW.**

Nó phải trả lời được:

```text
AI?
 ↓
Ai thực hiện?

KHI NÀO?
 ↓
Thời điểm nào?

LÀM GÌ?
 ↓
Hành động gì?

TRÊN CÁI GÌ?
 ↓
Album / Photo / Account nào?

KẾT QUẢ?
 ↓
Success / Failed
```

Audit Log:

```text
≠ Quản lý nhân viên
≠ Chấm công
≠ Tài chính
≠ CRM
≠ Tracking người dùng
```

Nó chỉ phục vụ:

```text
Security
+
Accountability
+
Troubleshooting
+
Moderation
```

của BOOKS VIEW.
