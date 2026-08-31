# GUIKHACH.COM — STUDIO WEBSITE TEMPLATE MASTER SPEC
## FINAL / LOCKED SOURCE OF TRUTH

**Version:** 2.0  
**Module:** Studio Website  
**Status:** ĐÃ CHỐT — không thiết kế lại hướng này trừ khi có yêu cầu mới.

---

## 1. Phạm vi

Đây là hệ thống **Template Website dành cho Studio**, hoàn toàn khác với giao diện Album Proofing/Landing Page gửi khách.

### Studio Website tập trung vào

- Brand
- Portfolio
- Studio Story
- Services
- Albums
- Featured Work
- Location
- Contact
- Social

### Album Proofing tập trung vào

- Xem ảnh
- Like
- Star
- Comment
- Selection
- Download
- QR Code
- Share

Hai hệ thống có thể dùng chung dữ liệu GUIKHACH.COM nhưng **UX/UI và Template phải tách biệt**.

---

## 2. Mục tiêu

Khi người dùng sử dụng gói Pro, hệ thống tạo cho họ một **Studio Website**.

Ví dụ:

```text
Tên Studio: 1997 Studio
Slug: 1997
URL: guikhach.com/1997
```

Studio có thể gửi URL này cho khách để xem toàn bộ website của Studio.

---

## 3. Kiến trúc phù hợp hosting

Do hosting hiện tại có giới hạn số domain/website, **không tạo hosting riêng cho từng Studio**.

Dùng:

```text
ONE DOMAIN
+
ONE APPLICATION
+
MANY STUDIO ROUTES
```

Ví dụ:

```text
guikhach.com/1997
guikhach.com/abc-studio
guikhach.com/minh-wedding
guikhach.com/xyz
```

Tất cả chạy cùng một GUIKHACH.COM Application.

Sau này mới có thể mở rộng:

```text
1997.bookview.com
```

hoặc:

```text
1997studio.com
```

---

## 4. Gói Pro

Quy trình:

```text
Mua Pro
↓
Tạo Studio Website
↓
Nhập tên Studio
↓
Tạo / kiểm tra Slug
↓
Chọn Template
↓
Nhập nội dung
↓
Preview
↓
Publish
↓
guikhach.com/{studio-slug}
```

---

# 5. Template Engine

Có khoảng **10–15 Template**, có thể mở rộng thêm.

Tất cả dùng chung một Website Engine:

```text
Website Engine
├── Template 01
├── Template 02
├── ...
└── Template 15+
```

Template quyết định:

- Layout
- Typography
- Spacing
- Color
- Hero
- Gallery
- Cards
- Buttons
- Navigation
- Footer
- Visual Identity

Đổi Template **không được làm mất dữ liệu Studio**.

---

# 6. Design Direction ĐÃ CHỐT

Phong cách tổng thể được lấy cảm hứng từ mẫu màu người dùng cung cấp, nhưng **không copy nguyên thiết kế**.

### Ngôn ngữ màu

```text
Cream / Off-white
+
Black Typography
+
Yellow
+
Blue
+
Coral
+
Peach
+
Pink
```

### Ngôn ngữ hình ảnh

- Photography-first
- Rounded cards
- Graphic accent
- Hình học đơn giản
- Circle / dot / line
- CTA dạng rounded
- Typography đậm, rõ
- Nền sáng
- Màu accent dùng có chủ đích
- Gọn nhưng có cá tính
- Trẻ trung nhưng chuyên nghiệp

Hai hướng visual đã demo:

### Direction A

```text
Cream
+
Black
+
Yellow
+
Blue
```

Cảm giác:

```text
Modern
Friendly
Clean
Creative
```

### Direction B

```text
Cream
+
Black
+
Coral
+
Peach
+
Pink
```

Cảm giác:

```text
Romantic
Soft
Premium
Wedding
```

**Không dùng mẫu tham khảo như một website để copy. Chỉ dùng nó làm Color / Graphic / Visual Language Reference.**

---

# 7. Visual Reference

File hình đi kèm:

```text
studio-template-color-reference.png
```

Hình này là reference cho:

- màu sắc;
- accent;
- rounded card;
- hình học;
- typography;
- graphic language;
- visual energy.

---

# 8. Cấu trúc Section chung

Các section có thể gồm:

```text
Header
Hero
Featured Photos
Portfolio
Collections / Albums
Services
About Studio
Selected Works
Latest Works
Product Showcase
Event Showcase
Yearbook Showcase
Location
Contact
Social Links
Footer
```

Không bắt buộc Template nào cũng có tất cả section.

Template được phép thay đổi:

- thứ tự;
- layout;
- bật/tắt section;
- visual treatment.

---

# 9. TEMPLATE 01 — MINIMAL ELEGANT

Phong cách:

```text
Minimal
Elegant
Wedding
Editorial
```

Bố cục:

```text
Header
↓
Hero lớn
↓
Portfolio nổi bật
↓
Featured Albums
↓
About Studio
↓
Location / Contact
↓
Footer
```

Visual:

- nền sáng;
- typography tinh tế;
- ảnh cưới lớn;
- nhiều khoảng trắng;
- navigation nhỏ;
- CTA tối giản.

Phù hợp Wedding / Pre-Wedding / Portrait.

---

# 10. TEMPLATE 02 — DARK CINEMATIC

Phong cách:

```text
Dark
Cinematic
Luxury
Emotional
```

Bố cục:

```text
Hero Dark
↓
Album nổi bật
↓
Selected Work
↓
About Studio
↓
Contact
```

Visual:

- nền tối;
- ảnh cinematic;
- contrast cao;
- typography sáng;
- cảm giác điện ảnh.

---

# 11. TEMPLATE 03 — LIGHT & NATURAL

Phong cách:

```text
Light
Natural
Romantic
Wedding
```

Visual:

- nền trắng/sáng;
- ảnh tự nhiên;
- màu nhẹ;
- typography thanh lịch;
- thân thiện.

---

# 12. TEMPLATE 04 — BLACK & WHITE EDITORIAL

Phong cách:

```text
Black & White
Editorial
Fashion
Art Photography
```

Visual:

- đen trắng;
- typography editorial;
- ảnh chân dung;
- bố cục magazine;
- ít màu;
- nghệ thuật.

---

# 13. TEMPLATE 05 — LUXURY & ELEGANT

Phong cách:

```text
Luxury
Elegant
Premium Wedding
```

Visual:

- cream;
- beige;
- serif;
- ảnh cưới cao cấp;
- spacing rộng;
- card tinh tế.

Có thể có:

```text
Premium Quality
Creative Team
Happy Clients
```

---

# 14. TEMPLATE 06 — MODERN & CREATIVE

Phong cách:

```text
Modern
Creative
Colorful
Experimental
```

Visual:

- typography mạnh;
- grid bất đối xứng;
- ảnh nhiều màu;
- graphic accent;
- layout hiện đại.

Phù hợp:

```text
Creative
Fashion
Commercial
Portrait
Brand Photography
```

---

# 15. TEMPLATE 07 — ROMANTIC PASTEL

Phong cách:

```text
Romantic
Pastel
Soft Wedding
```

Visual:

- pastel;
- hồng;
- beige;
- ảnh cưới;
- typography mềm;
- nhẹ nhàng.

---

# 16. TEMPLATE 08 — VINTAGE FILM

Phong cách:

```text
Vintage
Film
Analog
Nostalgic
```

Visual:

- cream;
- film aesthetic;
- vintage photography;
- grain;
- typography retro.

---

# 17. TEMPLATE 09 — MOODY DARK

Phong cách:

```text
Moody
Dark
Portrait
Luxury
```

Visual:

- nền đen;
- chân dung tương phản;
- gallery tối;
- typography nhỏ;
- premium.

---

# 18. TEMPLATE 10 — CLEAN MINIMAL

Phong cách:

```text
Clean
Minimal
Natural
Timeless
```

Visual:

- nền trắng;
- ảnh lớn;
- typography rõ;
- ít decoration;
- navigation đơn giản.

---

# 19. TEMPLATE 11 — RUSTIC & WARM

Phong cách:

```text
Rustic
Warm
Natural
Wedding
```

Visual:

- nâu;
- beige;
- vàng ấm;
- ảnh outdoor;
- handwritten + serif.

---

# 20. TEMPLATE 12 — EDITORIAL MAGAZINE

Phong cách:

```text
Editorial
Magazine
Modern Wedding
```

Visual:

- typography lớn;
- số thứ tự;
- magazine layout;
- ảnh lớn + ảnh nhỏ;
- khoảng trắng.

Ví dụ:

```text
01 Couple Session
02 Wedding Day
03 Portrait
04 Family Session
```

---

# 21. TEMPLATE 13 — NATURE GREEN

Phong cách:

```text
Nature
Organic
Green
Outdoor
```

Visual:

- xanh lá;
- thiên nhiên;
- organic texture;
- botanical decoration nhẹ;
- serif typography.

---

# 22. TEMPLATE 14 — BOLD & MODERN

Phong cách:

```text
Bold
Modern
Fashion
Commercial
```

Visual:

- typography rất lớn;
- black/white;
- accent mạnh;
- grid rõ;
- editorial.

---

# 23. TEMPLATE 15 — YEARBOOK / KỶ YẾU

Template chuyên ngành cho:

```text
Kỷ yếu
School
Graduation
Yearbook
```

Hero:

```text
THANH XUÂN
RỰC RỠ

KỶ YẾU — THANH XUÂN ĐÁNG NHỚ

[ XEM ALBUM ]
```

Sections:

```text
Hero
↓
Album nổi bật
↓
Các lớp / Collections
↓
Về Yearbook Studio
↓
Bộ ảnh mới nhất
↓
Contact
```

Visual:

- trẻ trung;
- pastel;
- ảnh nhóm;
- collage;
- handwriting nhẹ;
- graphic playful.

---

# 24. TEMPLATE 16 — EVENT / SỰ KIỆN

Template chuyên ngành cho:

```text
Event
Conference
Gala
Opening
Corporate Event
Showroom
Wedding Event
```

Hero:

```text
WE CAPTURE
YOUR MOMENTS

Lưu giữ cảm xúc — Kết nối khoảnh khắc
```

Sections:

```text
Hero
↓
Sự kiện nổi bật
↓
Dịch vụ
↓
Câu chuyện Studio
↓
Hình ảnh mới nhất
↓
Contact
```

Dịch vụ:

```text
Chụp ảnh sự kiện
Quay phim sự kiện
Livestream
Hậu kỳ
```

Visual:

- cinematic;
- stage;
- spotlight;
- crowd;
- gala;
- corporate;
- graphic accent hiện đại.

---

# 25. TEMPLATE 17 — PRODUCT / GIỚI THIỆU SẢN PHẨM

Template chuyên ngành cho:

```text
Product Photography
Commercial
E-commerce
Brand
Food
Fashion
Cosmetics
Jewelry
```

Hero:

```text
SẢN PHẨM CHẤT LƯỢNG
NÂNG TẦM GIÁ TRỊ

Chụp ảnh sản phẩm chuyên nghiệp
Tôn vinh thương hiệu của bạn
```

Sections:

```text
Hero
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

Visual:

- clean;
- commercial;
- cream/white;
- product-first;
- grid rõ;
- chuyên nghiệp.

---

# 26. DANH SÁCH FINAL

```text
01 Minimal Elegant
02 Dark Cinematic
03 Light & Natural
04 Black & White Editorial
05 Luxury & Elegant
06 Modern & Creative
07 Romantic Pastel
08 Vintage Film
09 Moody Dark
10 Clean Minimal
11 Rustic & Warm
12 Editorial Magazine
13 Nature Green
14 Bold & Modern
15 Yearbook / Kỷ yếu
16 Event / Sự kiện
17 Product / Sản phẩm
```

Đây là **master library**. MVP có thể triển khai 10–15 template trước nhưng kiến trúc phải hỗ trợ toàn bộ.

---

# 27. DATA MODEL

## Studio

```text
Studio
├── id
├── name
├── slug
├── logo
├── cover
├── description
├── address
├── phone
├── email
├── socialLinks
└── branding
```

## Website

```text
Website
├── id
├── studioId
├── templateId
├── status
├── published
└── settings
```

## Section

```text
WebsiteSection
├── id
├── websiteId
├── type
├── enabled
├── order
└── settings
```

## Album

```text
Album
├── id
├── studioId
├── title
├── cover
├── description
└── status
```

---

# 28. QUY TẮC KIẾN TRÚC

Bắt buộc phân biệt:

```text
Template = Presentation
Studio   = Data
Album    = Content
Photo    = Asset
Website  = Configuration
```

Không trộn các lớp.

```text
Studio
↓
Website
↓
Template
↓
Sections
↓
Studio Data + Albums
↓
Public Website
```

---

# 29. STUDIO EDITOR

Không xây CSS editor tự do.

Không yêu cầu Studio biết code.

Studio chỉ chỉnh:

```text
Tên Studio
Logo
Cover
Featured Photos
Headline
Description
Albums
Services
Address
Phone
Email
Social Links
```

Template kiểm soát:

```text
Typography
Spacing
Layout
Component Style
Section Design
Color System
```

---

# 30. TEMPLATE SWITCHING

Đổi Template:

```text
Template 03
↓
Template 15
```

Không được mất:

- Studio information
- Logo
- Cover
- Album
- Photo
- Customer
- Selection
- Contact

Chỉ thay đổi presentation layer.

---

# 31. ALBUM INTEGRATION

Website Studio lấy Album đã có trong GUIKHACH.COM.

Không upload lại ảnh.

```text
Studio 1997
├── Website
└── Albums
    ├── Đám cưới An & Minh
    ├── Pre-Wedding
    └── Kỷ yếu 12A1
```

Website chỉ tham chiếu Album.

---

# 32. URL

MVP:

```text
guikhach.com/{studio-slug}
```

Ví dụ:

```text
guikhach.com/1997
guikhach.com/minh-studio
guikhach.com/abc-photo
```

Có thể có:

```text
/{studio-slug}/portfolio
/{studio-slug}/albums
/{studio-slug}/about
/{studio-slug}/contact
```

---

# 33. PREVIEW & PUBLISH

```text
Website
↓
Template
↓
Edit
↓
Preview
↓
Publish
```

Preview:

```text
Desktop
Tablet
Mobile
```

---

# 34. SEO

Mỗi Studio Website cần:

```text
Title
Description
Favicon
OG Image
Canonical URL
```

---

# 35. PERFORMANCE

- Ưu tiên Cover.
- Lazy-load gallery.
- Dùng thumbnail/optimized images.
- Không tải toàn bộ full-resolution portfolio ngay khi mở.
- Không để gallery chặn initial rendering.

---

# 36. IMPLEMENTATION ORDER

Claude triển khai theo thứ tự:

```text
1. Architecture
2. Data Model
3. Template Schema
4. Section Schema
5. Template Engine
6. Template Preview
7. Template 01–10
8. Template 11–14
9. Template 15 Yearbook
10. Template 16 Event
11. Template 17 Product
12. Studio Editor
13. Publish
14. Responsive
15. SEO
16. Performance
```

Không code 17 website độc lập.

Không duplicate component.

Không tạo CSS riêng cho từng Studio.

---

# 37. FINAL DESIGN LOCK

**ĐÃ THỐNG NHẤT. KHÔNG THIẾT KẾ LẠI PHẦN TEMPLATE STUDIO NÀY.**

Visual direction cuối:

```text
Cream / Off-white
+
Black Typography
+
Yellow / Blue
+
Coral / Peach / Pink
+
Rounded Cards
+
Simple Geometric Shapes
+
Photography-first Layout
```

Các Template phải giữ tinh thần này nhưng mỗi Template có cá tính riêng.

---

# 38. FINAL PRODUCT VISION

```text
GUIKHACH.COM
│
├── Studio Website
│   ├── Templates
│   ├── Portfolio
│   ├── Albums
│   ├── About
│   ├── Services
│   ├── Location
│   └── Contact
│
├── Photo Proofing
│   ├── Masonry
│   ├── Grid
│   ├── 3D Carousel
│   └── Lightbox
│
├── Album Book
│   └── PageFlip
│
├── Multi-User Selection
│
└── Filter & Copy
```

## Định nghĩa sản phẩm

> **Một tài khoản Studio → một không gian thương hiệu riêng → một website riêng → nhiều Album → nhiều khách hàng → toàn bộ dữ liệu dùng chung trong GUIKHACH.COM.**

---

# 39. CLAUDE RULE

Khi đọc file này, Claude phải xem đây là **Source of Truth cuối cùng cho Studio Website Template**.

Không tự ý:

- đổi concept;
- đổi mục đích Template;
- nhập Template Studio vào Album Proofing;
- thiết kế lại hệ thống;
- tạo mỗi Studio một codebase;
- tạo mỗi Studio một hosting site;
- bỏ Yearbook/Event/Product;
- biến hệ thống thành page builder tự do.

Nếu cần đề xuất cải tiến kỹ thuật, phải giữ nguyên Design Direction đã khóa.
