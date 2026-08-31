# BOOKS VIEW — STUDIO WEBSITE TEMPLATES

Đây là thư mục đặc tả từng Template Studio.

## Danh sách

01. `template-01-minimal-elegant.md` — **Minimal Elegant** — Wedding / Pre-Wedding / Portrait
02. `template-02-dark-cinematic.md` — **Dark Cinematic** — Wedding / Luxury / Cinematic
03. `template-03-light-natural.md` — **Light & Natural** — Wedding / Portrait / Outdoor
04. `template-04-black-white-editorial.md` — **Black & White Editorial** — Fashion / Portrait / Art
05. `template-05-luxury-elegant.md` — **Luxury & Elegant** — Luxury Wedding / Premium
06. `template-06-modern-creative.md` — **Modern & Creative** — Creative / Fashion / Commercial
07. `template-07-romantic-pastel.md` — **Romantic Pastel** — Romantic Wedding / Portrait
08. `template-08-vintage-film.md` — **Vintage Film** — Wedding / Film / Nostalgic
09. `template-09-moody-dark.md` — **Moody Dark** — Portrait / Wedding / Luxury
10. `template-10-clean-minimal.md` — **Clean Minimal** — Wedding / Natural / Timeless
11. `template-11-rustic-warm.md` — **Rustic & Warm** — Wedding / Outdoor / Natural
12. `template-12-editorial-magazine.md` — **Editorial Magazine** — Wedding / Editorial / Fashion
13. `template-13-nature-green.md` — **Nature Green** — Outdoor / Wedding / Nature
14. `template-14-bold-modern.md` — **Bold & Modern** — Fashion / Commercial / Creative
15. `template-15-yearbook.md` — **Yearbook / Kỷ yếu** — Kỷ yếu / School / Graduation
16. `template-16-event.md` — **Event / Sự kiện** — Event / Conference / Gala / Corporate
17. `template-17-product.md` — **Product / Sản phẩm** — Product / Commercial / Brand / E-commerce

## Quy tắc chung

- Tất cả Template dùng chung Website Engine.
- Không tạo codebase riêng cho từng Studio.
- Không tạo hosting riêng cho từng Studio.
- Template chỉ là Presentation Layer.
- Studio/Album/Photo là Data/Content Layer.
- Đổi Template không được mất dữ liệu.
- Visual reference cuối được lấy từ các mockup đã cung cấp trong cuộc trò chuyện.
- Các mockup là reference để dựng HTML/CSS/React, không phải nội dung để copy nguyên bản.

## Thứ tự triển khai

1. Template Engine
2. Shared components
3. Template 01–06
4. Template 07–14
5. Template 15 Yearbook
6. Template 16 Event
7. Template 17 Product
8. Responsive
9. Preview
10. Publish

## Shared Components nên tái sử dụng

```text
StudioHeader
StudioHero
FeaturedPortfolio
AlbumGrid
AlbumCard
ServiceGrid
AboutSection
LatestWorks
LocationSection
ContactSection
StudioFooter
CTAButton
```
