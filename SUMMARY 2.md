1. Kiểm tra Postgres đang chạy

brew services list | grep postgresql


Nếu chưa chạy:

brew services start postgresql@16


2. Vào thư mục frontend, cài đặt (chỉ cần lần đầu hoặc khi có thay đổi package)

cd "/Users/duytran/Downloads/PHAM MEM/6._Wed app/16._ Wed app - claude/frontend"
npm install


3. Chạy dev server

npm run dev


Mở trình duyệt: http://localhost:3000

4. Đăng nhập demo

Email: quyen@booksview.vn

Mật khẩu: password123

Các lệnh khác nếu cần

# Seed lại dữ liệu mẫu (xóa data cũ, tạo lại từ đầu)
npm run db:seed

# Kiểm tra lỗi TypeScript trước khi build
npx tsc --noEmit

# Build production (nhớ tắt dev server trước, không chạy song song)
npm run build


Nếu muốn chạy thử app Books Filter (desktop) luôn:

cd "/Users/duytran/Downloads/PHAM MEM/4._Books Filter/Books Filter + noi roi"
npm run tauri dev