# 26. ALBUM SECURITY CONTROLS — BOOKS VIEW

## 1. Mục đích

`Album Security` là khu vực bảo mật riêng của từng Album.

Mục tiêu:

> Cho phép chủ Album kiểm soát **Album đang mở hay khóa, link truy cập, mật khẩu, session và quyền Guest**.

Không cần tạo website bảo mật riêng cho từng Album.

---

# 2. Cấu trúc

Mỗi Album có:

```text
Album Settings
    ↓
Album Security
```

Các nhóm chính:

```text
Album Security
│
├── Active / Locked
├── Album Link
│   └── Rotate Link
├── Primary Password
│   └── Change Password
├── Revoke Sessions
└── Guest Access
```

Có thể liên kết thêm với:

```text
Download Permission
Download Password
Expiration
```

nếu các chức năng này được bật trong Album Settings.

---

# 3. Active / Locked

Đây là trạng thái truy cập của Album.

## Active

```text
ACTIVE
 ↓
Khách có thể truy cập Album
```

Album hoạt động bình thường.

## Locked

```text
LOCKED
 ↓
Khách không thể tiếp tục truy cập Album
```

Có thể dùng khi:

- tạm thời không muốn khách truy cập
- Album đang chỉnh sửa
- cần khóa khẩn cấp
- muốn giữ dữ liệu nhưng tạm ngừng truy cập

Lock Album không phải Delete Album.

```text
Album
 ├── Photos
 ├── Selections
 ├── Comments
 └── Settings
```

Dữ liệu vẫn được giữ lại, chỉ thay đổi trạng thái truy cập.

---

# 4. Album Link

Mỗi Album có một link truy cập riêng.

Ví dụ:

```text
/album/abc123xyz
```

Nên sử dụng `linkToken` đủ ngẫu nhiên và khó đoán thay vì dùng ID database nội bộ làm link nếu không cần.

Ví dụ:

```text
/album/{linkToken}
```

`linkToken` nên:

```text
Random
Khó đoán
Đủ dài
```

Biết URL không đồng nghĩa với việc có mọi quyền trong Album.

Server vẫn phải kiểm tra quyền truy cập.

---

# 5. Rotate Link

`Rotate Link` = đổi link truy cập Album.

Ví dụ:

```text
Link hiện tại:
/album/abc123
```

Chủ Album bấm:

```text
Rotate Link
```

Hệ thống tạo link mới:

```text
/album/x7K92mPq
```

Link cũ:

```text
abc123
```

không còn được sử dụng.

---

# 6. Khi nào cần Rotate Link?

Ví dụ:

```text
Link Album
 ↓
Đã gửi cho nhiều người
 ↓
Không muốn link cũ tiếp tục hoạt động
 ↓
Rotate Link
```

Hoặc:

```text
Nghi ngờ link bị chia sẻ ngoài ý muốn
 ↓
Rotate Link
```

`Rotate Link` chỉ thay đổi quyền truy cập bằng link.

```text
Rotate Link
≠
Delete Album
```

Photos, Selections, Comments và các dữ liệu khác vẫn giữ nguyên.

---

# 7. Primary Password

Album có thể có:

```text
Primary Password
```

Đây là mật khẩu dành cho người có quyền cao hơn Guest thông thường.

Ví dụ:

```text
Cô dâu / Chú rể
Primary Customer
```

Sau khi xác thực, Primary Customer có thể sử dụng các chức năng được bảo vệ theo chính sách của Album.

Ví dụ:

```text
Primary Customer
 ↓
Authentication
 ↓
Quyền Primary Customer
 ↓
Star
```

Các quyền thực tế phải tuân theo Settings của Album.

---

# 8. Change Password

Chủ Album có thể đổi Primary Password.

Ví dụ giao diện:

```text
Current Password
[••••••••]

New Password
[••••••••]

Confirm Password
[••••••••]
```

Server phải:

```text
Validate
 ↓
Hash Password
 ↓
Save
```

Không lưu password dạng plaintext.

---

# 9. Đổi Password và Session

Khi Primary Password thay đổi, các session được xác thực bằng password cũ cần được xem xét.

Có thể thực hiện:

```text
Change Password
 ↓
Revoke old Primary Sessions
 ↓
Khách xác thực lại
```

Mục tiêu là tránh tình trạng:

```text
Password cũ
 ↓
Session cũ
 ↓
Vẫn hoạt động mãi
```

---

# 10. Revoke Sessions

Cho phép chủ Album:

```text
Revoke Sessions
```

Mục đích là hủy các session truy cập hiện tại của Album.

Luồng:

```text
Album
 ↓
Revoke Sessions
 ↓
Session phù hợp bị vô hiệu hóa
 ↓
Khách phải xác thực lại
```

Có thể sử dụng khi:

```text
Nghi ngờ người khác đang truy cập Album
```

hoặc:

```text
Đã đổi Primary Password
 ↓
Revoke old sessions
```

---

# 11. Guest Access

Guest Access kiểm soát quyền truy cập của khách thông thường.

Có thể có các trạng thái:

```text
Allowed
Restricted
Disabled
```

tùy thiết kế cuối cùng.

Guest chỉ có các quyền mà Album cho phép.

Ví dụ:

```text
Guest
 ├── View
 ├── Like
 └── Comment
```

Guest không mặc nhiên có:

```text
Primary Customer
Star
Download
Admin
```

---

# 12. Guest và Primary Customer phải tách nhau

Không dùng một cơ chế quyền duy nhất cho cả Guest và Primary Customer.

Ví dụ:

```text
Guest
 ├── View
 ├── Like
 └── Comment
```

và:

```text
Primary Customer
 ├── View
 ├── Like
 ├── Star
 └── Download nếu Album cho phép
```

Quyền thực tế phải được kiểm tra ở server và tuân theo Settings của Album.

---

# 13. Download Permission

Phần Download liên kết với Image Security.

Ví dụ:

```text
☐ Cho phép tải ảnh
```

Nếu bật:

```text
☑ Cho phép tải ảnh
```

có thể yêu cầu:

```text
Download Password
```

Luồng:

```text
Download
 ↓
Album cho phép tải?
 ↓
YES
 ↓
Download Password
 ↓
Verify
 ↓
Generate Download Image
 ↓
Download
```

Không cho khách tải thumbnail hoặc ảnh gốc Google Drive trực tiếp.

Nếu cần tạo file download:

```text
Google Drive Original
 ↓
Server
 ↓
Resize
 ↓
Cạnh dài tối đa 2048px
 ↓
Nén
 ↓
Download
```

---

# 14. Server phải kiểm tra Album Security

Không được chỉ đổi trạng thái bằng frontend.

Phải:

```text
Client
 ↓
API
 ↓
Authentication
 ↓
Authorization
 ↓
Album Ownership / Permission
 ↓
Validation
 ↓
Update Album Security
```

Khi khách truy cập:

```text
Guest Request
 ↓
Album tồn tại?
 ↓
Album Active?
 ↓
Link hợp lệ?
 ↓
Guest Access được phép?
 ↓
Cho phép / Từ chối
```

---

# 15. Không dùng URL để thay thế Authorization

Ví dụ:

```text
/album/abc123
```

không có nghĩa ai biết URL cũng mặc nhiên có mọi quyền.

Server vẫn phải kiểm tra:

```text
Album
 ↓
Access
 ↓
Session
 ↓
Guest / Primary Customer
 ↓
Permission
```

---

# 16. Audit Log

Các thay đổi bảo mật của Album nên được ghi vào Audit Log.

Có thể sử dụng:

```text
ALBUM_LOCKED
ALBUM_UNLOCKED
ALBUM_LINK_ROTATED
ALBUM_PASSWORD_CHANGED
ALBUM_SESSIONS_REVOKED
GUEST_ACCESS_CHANGED
```

Ví dụ:

```text
ALBUM_LINK_ROTATED

Actor:
user@example.com

Album:
Wedding Minh & Lan

Time:
28/08/2026 22:30

Result:
SUCCESS
```

Không ghi password hoặc Session Token nguyên dạng vào log.

---

# 17. Giao diện đề xuất

```text
┌──────────────────────────────────────┐
│ Album Security                       │
├──────────────────────────────────────┤
│                                      │
│ Status                               │
│ ● Active              [Lock Album]   │
│                                      │
│ Album Link                           │
│ https://.../album/abc123             │
│ [Copy Link] [Rotate Link]            │
│                                      │
│ Primary Password                     │
│ ● Enabled                            │
│ [Change Password]                    │
│                                      │
│ Sessions                             │
│ [Revoke Sessions]                    │
│                                      │
│ Guest Access                         │
│ ● Allowed                            │
│                                      │
└──────────────────────────────────────┘
```

---

# 18. Luồng bảo mật tổng thể

```text
                    ALBUM
                      │
              ┌───────┴───────┐
              │               │
           Status            Link
              │               │
        Active/Locked     Rotate Link
              │
        ┌─────┴─────┐
        │           │
      Guest      Primary
      Access     Customer
        │           │
        │      Primary Password
        │           │
        │         Session
        │           │
        └─────┬─────┘
              │
          Album Access
```

---

# 19. Album Security và Download

Nếu Album có:

```text
☑ Cho phép tải ảnh
```

thì Download phải tiếp tục kiểm tra:

```text
Album Access
 ↓
Download Permission
 ↓
Download Password nếu bật
 ↓
Authorization
 ↓
Generate Download File
 ↓
Download
```

Không được chỉ ẩn nút Download bằng frontend.

---

# 20. Album Security và Expiration

Nếu Album có:

```text
Ngày hết hạn
```

thì khi khách truy cập:

```text
Request
 ↓
Album
 ↓
Expiration Check
 ↓
Còn hạn?
 ├── YES → Continue
 └── NO  → Reject / Expired
```

Ngày hết hạn phải được kiểm tra phía server.

---

# 21. Checklist Album Security

```text
□ Có Active / Locked
□ Lock không xóa Album
□ Có Album Link
□ Link dùng token khó đoán
□ Có Rotate Link
□ Link cũ bị vô hiệu hóa sau khi Rotate
□ Rotate Link không xóa dữ liệu
□ Có Primary Password
□ Password được hash
□ Không lưu plaintext password
□ Có Change Password
□ Có Revoke Sessions
□ Đổi password xử lý session cũ phù hợp
□ Có Guest Access
□ Guest và Primary Customer tách quyền
□ Download Permission được kiểm tra server-side
□ Download Password nếu cần
□ Không cho tải thumbnail
□ Không cho tải Google Drive Original trực tiếp
□ Download có thể tạo file resize/nén riêng
□ Expiration được kiểm tra server-side
□ Không dùng URL thay thế Authorization
□ Có Audit Log cho thay đổi bảo mật
□ Không ghi password vào Audit Log
□ Không ghi Session Token vào Audit Log
□ API có Authentication
□ API có Authorization
□ API có Validation
```

---

# 22. Nguyên tắc cuối cùng

`Album Security Controls` là **bộ khóa của từng Album**.

```text
Album Security
│
├── Active / Locked
├── Album Link
│   └── Rotate Link
├── Primary Password
│   └── Change Password
├── Revoke Sessions
└── Guest Access
```

Có thể liên kết thêm:

```text
Download Permission
Download Password
Expiration
```

Mục tiêu:

```text
Album có đang mở không?
        ↓
Ai được truy cập?
        ↓
Dùng link nào?
        ↓
Có cần mật khẩu không?
        ↓
Session nào còn hiệu lực?
        ↓
Guest được làm gì?
        ↓
Download có được phép không?
```

> **Album Security Controls = bộ kiểm soát quyền truy cập của từng Album.**

`Album Security` bảo vệ **một Album cụ thể**; còn `Admin Security` bảo vệ **toàn bộ hệ thống BOOKS VIEW**.
