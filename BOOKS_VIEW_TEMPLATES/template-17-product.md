# BOOKS VIEW — STUDIO WEBSITE TEMPLATE
## 17 — Product / Sản phẩm

**Status:** FINAL DESIGN SPEC  
**Module:** Studio Website  
**Source of Truth:** `BOOKS_VIEW_Studio_Website_Templates_FINAL.md`

> Đây là Template Website dành cho Studio, không phải Album Proofing/Landing Page gửi khách.

## 1. Mục đích

Template: **Product / Sản phẩm**  
Phù hợp: **Product / Commercial / Brand / E-commerce**

Template phải tạo cảm giác website thương hiệu của một Studio chuyên nghiệp, photography-first, gọn và dễ xem.

## 2. Cấu trúc dữ liệu

Template không sở hữu dữ liệu riêng. Template nhận dữ liệu từ:

```text
Studio
Website
Albums
Portfolio Photos
Services
Contact
Branding
```

## 3. Section

```text
Header
Hero
Featured / Portfolio
Albums / Collections
About Studio
Services (nếu phù hợp)
Latest Works
Location
Contact
Footer
```

Template có thể thay đổi thứ tự và cách trình bày các section nhưng không thay đổi data model.

## 4. Responsive

Bắt buộc hỗ trợ:

```text
Desktop
Tablet
Mobile
```

Mobile phải giữ hierarchy của Hero → Portfolio/Albums → About/Services → Contact.

## 5. Interaction

Các CTA chính có thể gồm:

```text
XEM PORTFOLIO
XEM ALBUM
TÌM HIỂU THÊM
LIÊN HỆ
TƯ VẤN NGAY
```

Album trên Studio Website phải dẫn tới Album tương ứng trong BOOKS VIEW, không upload lại ảnh.

## 6. Performance

- Hero ưu tiên tải trước.
- Gallery lazy-load.
- Dùng ảnh tối ưu/thumbnail.
- Không tải toàn bộ ảnh full-resolution khi mở trang.
- Không để gallery chặn initial rendering.

## 7. Không được làm

- Không biến thành Dashboard.
- Không đưa Like/Star/Comment/Selection Manager lên Studio Website trừ khi một feature riêng yêu cầu.
- Không tạo codebase riêng cho Studio.
- Không tạo hosting riêng cho Studio.
- Không duplicate component nếu có thể dùng component chung.


## Visual Direction
- Product / Commercial.
- Cream/white.
- Product-first.
- Clean studio lighting.
- Grid sản phẩm.
- Có thể dùng icon cho service/value.
- Typography commercial.

## Layout Reference
```text
Header
↓
Product Hero
↓
Giá trị dịch vụ
↓
Danh mục sản phẩm
↓
Sản phẩm nổi bật
↓
Về Product Studio
↓
Contact
```

## Product Categories

```text
Mỹ phẩm
Thời trang
Trang sức
Đồ gia dụng
Thực phẩm
```

## Value Cards

```text
Hình ảnh chất lượng cao
Ánh sáng chuyên nghiệp
Bố cục ấn tượng
Hỗ trợ tận tâm
```
