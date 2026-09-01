# System Owner — Mô tả hiện trạng implementation

**Route gốc:** `/system-owner`
**Mục đích tài liệu:** Ghi lại đúng những gì đã được code, không phải spec dự định — đối chiếu với `00 ADMIN.md` để biết phần nào đã làm, phần nào chưa.

---

## 1. Cơ chế truy cập

- Không có app/login riêng cho System Owner. Dùng chung hệ thống đăng nhập Studio (`/login`), sau khi đăng nhập, `role` trong bảng `Studio` quyết định có vào được `/system-owner` hay không.
- **Chặn ở 2 lớp:**
  - Client (`useSystemOwner()` — [use-system-owner.ts](../frontend/src/lib/use-system-owner.ts)): gọi `/api/auth/me`, nếu `role !== "ADMIN"` thì `router.replace("/dashboard")`; nếu 401 thì đá về `/login`. Đây **chỉ là UX**, không phải bảo mật thật.
  - Server: mỗi route `/api/admin/*` tự kiểm tra lại `getCurrentStudio()` + `role === "ADMIN"` độc lập với client — comment trong code nói rõ đây là ranh giới bảo mật thật, để dù JS tắt hoặc client bị bypass thì API vẫn từ chối.
- Không có khái niệm "tài khoản System Owner" tách biệt — bất kỳ Studio nào có `role = ADMIN` trong DB đều vào được toàn bộ khu vực này.

## 2. Layout & Sidebar

- `OwnerShell` ([owner-shell.tsx](../frontend/src/components/system-owner/owner-shell.tsx)): tái dùng `AppHeader` (đổi `studioName="System Owner"`), ghép với `OwnerSidebar` riêng — **không** đụng vào `Sidebar`/`AdminShell` của Studio thường.
- `OwnerSidebar` ([owner-sidebar.tsx](../frontend/src/components/system-owner/owner-sidebar.tsx)) — 6 mục, theo đúng thứ tự hiển thị:

| # | Nhãn | Route | Icon |
|---|------|-------|------|
| 1 | Tổng quan | `/system-owner` | LayoutDashboard |
| 2 | Người dùng | `/system-owner/users` | Users |
| 3 | Kiểm duyệt | `/system-owner/moderation` | ShieldAlert |
| 4 | Albums | `/system-owner/albums` | Images |
| 5 | Audit Log | `/system-owner/audit` | History |
| 6 | Bảo mật | `/system-owner/security` | ShieldCheck |

- Cuối sidebar có mục **"Cài đặt hệ thống"** — hiển thị dạng disabled (`cursor: not-allowed`, opacity 0.6, tooltip "Chưa triển khai"). Đây là placeholder, chưa có route/trang thật.

## 3. Từng trang — nội dung & nguồn dữ liệu

### 3.1 Tổng quan — `/system-owner`
- 4 thẻ số liệu: **Studio đang hoạt động**, **Người dùng** (Customer + Studio cộng lại), **Ảnh chờ kiểm duyệt**, **Security Alerts**.
- 2 thẻ đầu lấy dữ liệu thật từ `GET /api/admin/overview` (đếm trực tiếp bằng Prisma: `studio.count`, `customer.count`).
- 2 thẻ sau **cố ý không giả số** — hiển thị "Chưa kết nối" vì Content Safety Scan / hệ thống cảnh báo bảo mật chưa được xây; comment trong route nói rõ đây là quyết định có chủ đích, không phải thiếu sót.
- Có khối "Nguyên tắc quyền riêng tư": nhắc rằng System Owner chỉ xem nội dung khi có mục đích kiểm duyệt/xử lý sự cố, mọi truy cập đều ghi Audit Log, và không có quyền "xem tất cả ảnh" mặc định.

### 3.2 Người dùng — `/system-owner/users`
- Bảng danh sách: Tên, Email, Số album, Đăng nhập cuối, Trạng thái (Active/Suspended) — có ô tìm kiếm theo tên/email (lọc phía client).
- Dữ liệu thật từ `GET /api/admin/users`.
- Click vào tên → `/system-owner/users/[id]` (chi tiết 1 user): thông tin liên hệ, 3 thẻ số liệu (số album, đăng nhập gần nhất, ngày tạo), và bảng album của user đó. Route `GET /api/admin/users/[id]`, có xử lý 404 riêng (hiển thị "Không tìm thấy người dùng").

### 3.3 Kiểm duyệt — `/system-owner/moderation`
- Grid card ảnh đang chờ duyệt, mỗi card có nhãn trạng thái (`Needs Review` / `Reported`) và nút "Xem" mở dialog preview.
- Dialog preview có ghi chú "Truy cập này được ghi Audit Log", 2 nút hành động **✓ Safe** / **⚑ Vi phạm** — **cả hai nút hiện tại chỉ đóng dialog, chưa gọi API thật nào** (chưa có backend xử lý quyết định moderation).
- **Toàn bộ trang này còn dùng mock data** (`moderationQueue` trong [system-owner-mock-data.ts](../frontend/src/lib/system-owner-mock-data.ts)), chưa có route `/api/admin/moderation*` nào cả — khác với Users/Albums/Audit/Overview đã nối API thật.

### 3.4 Albums — `/system-owner/albums`
- Bảng: Album, Studio, Số ảnh, Trạng thái, Ngày hết hạn. Dữ liệu thật từ `GET /api/admin/albums`. Có ghi chú phụ đề: "Tổng quan nền tảng, không thay thế quản lý Album của Studio".
- Click vào album → `/system-owner/albums/[id]`: xem chi tiết 1 album ở **chế độ chỉ đọc** — banner cảnh báo rõ ràng: *"Chế độ chỉ xem — dành cho hỗ trợ/kiểm tra sự cố. Không thể sửa hoặc xoá dữ liệu từ đây. Lượt xem này đã được ghi Audit Log."* Hiển thị grid ảnh (thumbnail + lượt like/star), link "Quay lại" trỏ về trang user (studio) sở hữu album. Route `GET /api/admin/albums/[id]`, có xử lý 404.

### 3.5 Audit Log — `/system-owner/audit`
- Bảng: Thời gian, Người thực hiện (tên + email), Hành động (font mono), Resource.
- Dữ liệu thật từ `GET /api/admin/audit` → đọc bảng `AdminAccessLog` qua Prisma (tối đa 100 dòng gần nhất, sort theo `createdAt desc`). Không lọc theo actor — mọi ADMIN đều thấy toàn bộ log của mọi ADMIN khác (chủ đích, vì mục tiêu là accountability toàn hệ thống).
- **Trạng thái theo memory trước đó của phiên làm việc:** "System Owner/admin layer now live & verified, full Audit Log still deferred" — tức là cơ chế đọc/hiển thị Audit Log đã chạy thật, nhưng **việc thực sự ghi log ở đủ mọi hành động nhạy cảm** (ví dụ: mở dialog moderation, xem album chi tiết) có thể chưa được cắm vào tất cả các nơi cần thiết — cần rà lại từng action nhạy cảm xem đã gọi ghi `AdminAccessLog` chưa, đặc biệt là trang Kiểm duyệt (đang mock hoàn toàn).

### 3.6 Bảo mật — `/system-owner/security`
- 4 thẻ ON/OFF: `Moderation Preview` (ON), `View Original` (OFF), `Download Original` (OFF), `Audit Logging` (ON).
- **Toàn bộ trang này là mock tĩnh** (`securityPermissions` trong file mock) — các thẻ ON/OFF không đọc từ DB thật và không có UI nào để bật/tắt (không có toggle, chỉ hiển thị trạng thái).
- Có in ra danh sách permission keys dạng chuỗi: `moderation.preview • moderation.original • moderation.download • audit.view` — đây là các quyền được nhắc tới trong dialog Moderation (`Access: moderation.preview`), nhưng chưa có bảng permission thật trong DB, chỉ là tài liệu tham chiếu trong UI.

## 4. Tổng kết — cái gì thật, cái gì còn là khung demo

Đã verify trực tiếp bằng cách grep `adminAccessLog` trong toàn bộ `src/app/api/admin/`:

| Trang | Dữ liệu | Ghi Audit Log khi xem? |
|---|---|---|
| Tổng quan | Thật (2/4 số liệu) | **Không** — route `overview` không gọi `adminAccessLog.create` |
| Người dùng (list) | Thật | Không — xem danh sách không ghi log |
| Người dùng (chi tiết 1 user) | Thật | **Có** — `users/[id]/route.ts` gọi `adminAccessLog.create` khi GET |
| Albums (list) | Thật | Không — xem danh sách không ghi log |
| Albums (chi tiết 1 album) | Thật | **Có** — `albums/[id]/route.ts` gọi `adminAccessLog.create` khi GET, khớp với banner "Lượt xem này đã được ghi Audit Log" |
| Audit Log | Thật (đọc bảng `AdminAccessLog`) | — (bản thân trang này chỉ đọc, không tạo entry mới) |
| Kiểm duyệt | **Mock hoàn toàn**, kể cả nút Safe/Vi phạm không làm gì | Không — chưa có route backend nào cho moderation |
| Bảo mật | **Mock hoàn toàn**, không đọc/ghi DB | Không |
| Cài đặt hệ thống | Chưa xây — chỉ là mục disabled trong sidebar | — |

Vậy quy tắc thực tế đang áp dụng: **chỉ có xem chi tiết 1 resource cụ thể (1 user, 1 album) mới ghi Audit Log** — xem danh sách tổng quan (list, overview) thì không, vì đó chưa thật sự "truy cập vào dữ liệu của một người dùng cụ thể".

**Khoảng trống rõ nhất nếu muốn đưa khu vực này lên production:**
1. Trang Kiểm duyệt và Bảo mật cần được nối vào dữ liệu thật (bảng ảnh cần duyệt, bảng permission theo role) — hiện là UI trình diễn không có backend đứng sau. Đặc biệt dialog Moderation ghi rõ "Truy cập này được ghi Audit Log" nhưng route backend cho việc này chưa tồn tại — dòng chữ đó hiện đang **sai** so với thực tế cho đến khi được nối.
2. "Cài đặt hệ thống" chưa có trang — nếu cần thì phải xây từ đầu.
