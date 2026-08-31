# BOOKS VIEW — STUDIO WEBSITE TEMPLATE
## 06 — Modern & Creative

**Status:** FINAL DESIGN SPEC  
**Module:** Studio Website  
**Source of Truth:** `BOOKS_VIEW_Studio_Website_Templates_FINAL.md`

> Đây là Template Website dành cho Studio, không phải Album Proofing/Landing Page gửi khách.

## 1. Mục đích

Template: **Modern & Creative**  
Phù hợp: **Creative / Fashion / Commercial**

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
- Modern + creative.
- Typography mạnh.
- Grid bất đối xứng.
- Accent màu rõ.
- Portfolio có thể dùng ảnh màu nổi bật.
- Graphic blocks / shape đơn giản.

## Layout Reference
```text
Header
↓
Creative Hero
↓
Latest Works
↓
Featured Albums
↓
About
↓
Contact
```
