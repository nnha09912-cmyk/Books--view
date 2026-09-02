# Deployment Readiness — Guikhach.com trên AZDIGI

**Mục đích:** Đối chiếu source thật với `GUIKHACH_DEPLOYMENT.md` — mọi thông tin dưới đây lấy trực tiếp từ code, không đoán. Đây là Giai đoạn 0 trong kế hoạch 3 giai đoạn (Deploy readiness → Plan/Entitlement → Storage Provider/Pro Cloud).

---

## 1. Cấu trúc source — điểm quan trọng nhất

Repo Git gốc **không phải** là app — toàn bộ app Next.js nằm trong thư mục con:

```text
repo-root/
├── frontend/          ← APP THẬT (Next.js, package.json, prisma/, src/)
├── backend/           ← RỖNG, không dùng
├── database/          ← RỖNG, không dùng
├── components/        ← RỖNG, không dùng
├── public/             ← RỖNG (khác public/ bên trong frontend/)
├── templates/          ← RỖNG, không dùng
├── docs/, md new/       ← tài liệu, không phải code chạy
└── .cpanel.yml          ← (mới) đọc ở root, nhưng phải deploy đúng nội dung frontend/
```

`backend/` trong tài liệu deploy gốc **không tồn tại như thư mục riêng** — toàn bộ "backend" thực chất là các API route bên trong `frontend/src/app/api/*` (Next.js API Routes), chạy chung một process với frontend. Không có server Node riêng nào khác.

**Hệ quả cho cPanel:** "Application root" trong Setup Node.js App phải trỏ vào nơi chứa `frontend/` đã được copy sang (không trỏ thẳng vào repo root), và `.cpanel.yml` phải copy đúng nội dung của `frontend/` — xem mục 6.

---

## 2. Stack thật (từ `frontend/package.json`)

| Thành phần | Giá trị thật |
|---|---|
| Framework | Next.js `14.2.35` (App Router) |
| Node.js tối thiểu | `>=18.17.0` (yêu cầu của chính Next 14, không có `.nvmrc` ghim thêm) |
| Package manager | `npm` (chỉ có `package-lock.json`, không có pnpm/yarn/bun lockfile) |
| Build command | `npm run build` → thực chất chạy `prisma migrate deploy && next build` |
| Start command | `npm start` → `next start` |
| Database | PostgreSQL, qua Prisma (`prisma/schema.prisma`, `provider = "postgresql"`) |
| ORM | Prisma `6.19.3` |
| Auth | JWT tự ký (`jsonwebtoken`) + `bcryptjs` cho mật khẩu — không dùng NextAuth/Clerk/Auth0 |
| Ảnh studio-side (avatar, sync ảnh Google Drive) | **Vercel Blob** (`@vercel/blob`) — xem mục 4 |
| Xử lý ảnh | `sharp` (native binary — xem mục 5) |
| Email | `resend` |

`next.config.mjs` hiện tại **chưa có** `output: "standalone"` — nên bật để giảm dung lượng deploy trên hosting chia sẻ (chỉ copy phần dependency thực sự cần, không phải toàn bộ `node_modules`). Đây là thay đổi config, không ảnh hưởng hành vi app.

---

## 3. Biến môi trường thật (grep trực tiếp trong `src/`, không suy đoán)

```text
DATABASE_URL          (Prisma, không thấy qua grep process.env vì nằm trong schema.prisma)
JWT_SECRET
JWT_EXPIRES_IN
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_DRIVE_API_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
BLOB_READ_WRITE_TOKEN  (SDK @vercel/blob tự đọc ngầm — code không gọi process.env trực tiếp,
                         nhưng put() không truyền token nên bắt buộc phải có biến này)
```

**`.env.example` hiện tại trong repo bị thiếu** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN` — và có 2 biến **không được dùng ở đâu cả** (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — grep toàn bộ `src/` không thấy nơi nào đọc, khả năng là rác từ template khởi tạo dự án). Đã sửa lại `.env.example` cho khớp thực tế — xem mục 7.

---

## 4. Vercel Blob — vẫn cần dù không host trên Vercel

`@vercel/blob` là dịch vụ object storage độc lập (REST API), **không bắt buộc app phải chạy trên hạ tầng Vercel** — chỉ cần một `BLOB_READ_WRITE_TOKEN` hợp lệ, gọi được từ bất kỳ server nào, kể cả AZDIGI. Hiện dùng cho:
- Avatar studio (`api/auth/avatar`)
- Ảnh gốc + preview khi đồng bộ từ Google Drive (`api/albums/[id]/photos/sync`)

Vẫn cần một tài khoản Vercel (free tier có Blob) chỉ để lấy token này — không phải để host app.

---

## 5. `sharp` — rủi ro cần lưu ý khi cài trên server

`sharp` cài native binary riêng theo hệ điều hành/kiến trúc máy chạy nó. **Không được copy `node_modules` từ máy Mac local lên AZDIGI** — bắt buộc phải chạy `npm install` (hoặc nút "Run NPM Install" trong Setup Node.js App của cPanel) trực tiếp trên server AZDIGI để nó tự tải đúng binary Linux. `next.config.mjs` đã khai `serverComponentsExternalPackages: ["sharp"]` sẵn, đúng hướng.

---

## 6. `.cpanel.yml` — bản nháp

Đã tạo `.cpanel.yml` ở root repo (mẫu, có placeholder `USERNAME` — cần điền khi thiết lập cPanel thật, mình sẽ hướng dẫn từng bước lúc đó):

```yaml
---
deployment:
  tasks:
    - export DEPLOYPATH=/home/USERNAME/guikhach-app/
    - /bin/cp -R frontend/. $DEPLOYPATH
```

Cách hoạt động: cPanel Git Version Control clone toàn bộ repo vào một thư mục riêng, sau đó chạy các `tasks` này để copy **nội dung của `frontend/`** (không phải cả repo) sang `DEPLOYPATH` — chính là nơi Setup Node.js App sẽ trỏ "Application root" vào. `DEPLOYPATH` là placeholder, cần đúng đường dẫn thật trên server bạn (theo username cPanel).

Sau khi copy, vẫn cần chạy `npm install` + build trên server (cPanel Node.js App tự làm qua nút "Run NPM Install", hoặc thêm task `npm install --production=false && npm run build` vào `.cpanel.yml` nếu muốn tự động hoá toàn bộ — để bàn khi tới bước triển khai thật).

---

## 7. `.env.example` — đã cập nhật khớp thực tế

Đã sửa file `frontend/.env.example`: bỏ 2 biến rác không dùng, thêm 3 biến bị thiếu (`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN`).

---

## 8. Quyết định đã chốt (từ buổi thảo luận)

- **Gói dịch vụ (Plan):** lưu field đơn giản trên `Studio`, không tách bảng `Subscription` riêng.
- **GuikhachCloud storage (Pro Cloud, Giai đoạn 2):** lưu trực tiếp trên ổ đĩa AZDIGI hosting, không dùng Vercel Blob/S3-compatible cho phần này. *(Lưu ý: khác với Vercel Blob đang dùng cho avatar/ảnh sync hiện tại ở mục 4 — hai luồng lưu trữ độc lập với nhau.)*
- **AZDIGI:** bạn đã có tài khoản/hosting đang dùng, có quyền truy cập cPanel — chỉ chưa từng thiết lập Node.js App + Git deployment cho project cụ thể này, sẽ hướng dẫn từng bước khi tới lúc.

---

## 8b. Đã tìm và sửa: `npm run build` từng lỗi thật

Chạy thử `npm run build` (đúng lệnh production thật, không phải `next dev`) phát hiện lỗi build-blocking, không liên quan gì tới AZDIGI hay `output: standalone`:

```text
useSearchParams() should be wrapped in a suspense boundary
  at /settings
  at /reset-password
```

Next.js 14 chặn hẳn bước prerender nếu `useSearchParams()` không được bọc `<Suspense>` — lỗi có sẵn từ trước, chỉ `next build` mới bắt được (không xuất hiện lúc chạy `next dev`). Đã sửa cả 2 trang theo đúng pattern chuẩn của Next.js (tách phần dùng `useSearchParams()` ra component con, bọc `<Suspense>` ở component cha) — không đổi giao diện/hành vi, đã build lại thành công **38/38 trang**, đã kiểm tra trực tiếp trên trình duyệt cả `/settings?tab=billing` và `/reset-password?token=...` vẫn hoạt động đúng.

## 9. Còn thiếu để deploy thật (cần làm khi tới bước đó, không phải bây giờ)

- Domain `guikhach.com` trỏ DNS về AZDIGI + bật HTTPS.
- Tạo Node.js App trong cPanel (chọn version Node ≥18.17, xác nhận Application root/URL/startup file thật theo những gì cPanel AZDIGI của bạn hỗ trợ).
- Thiết lập Git repository trong cPanel, gắn `.cpanel.yml` ở trên.
- Tạo database PostgreSQL thật trên AZDIGI (hoặc xác nhận AZDIGI có hỗ trợ PostgreSQL — nhiều gói shared hosting cPanel chỉ có MySQL mặc định, **cần kiểm tra trực tiếp trong cPanel của bạn**, đây là điểm chưa xác nhận được từ source code).
- Cấu hình toàn bộ biến môi trường ở mục 3 trên server (không qua Git).
