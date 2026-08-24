# Books View — Design System (Bộ quy tắc thống nhất)

> Đây là bộ quy tắc **chốt** dùng cho toàn bộ sản phẩm, được rút ra từ bản demo HTML (`books-view-html/`). Từ giờ mọi trang, mọi component — dù code bằng HTML thuần hay Next.js/React sau này — đều phải bám theo file này. Nếu cần đổi gì, sửa ở đây trước, rồi mới sửa code.

Template áp dụng: **Classic** (mặc định). Các template khác (Premium, Wedding, Family, Editorial, Minimal) sẽ override phần *Màu sắc* + *Typography*, còn lại giữ nguyên spacing/component/rule.

---

## 1. Typography

| Vai trò | Font | Nguồn |
|---|---|---|
| Heading (h1, h2, h3, logo, tiêu đề) | **Playfair Display** (600, 700) | Google Fonts |
| Body (text, button, input, nav...) | **Inter** (400, 500, 600, 700) | Google Fonts |
| Mono (link, API key, code, số liệu kỹ thuật) | **JetBrains Mono** | Google Fonts |

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
```

### Scale

| Role | Size | Weight | Line-height |
|---|---|---|---|
| H1 | 32px | 700 | 1.2 |
| H2 | 24px | 600 | 1.3 |
| H3 | 18px | 600 | 1.4 |
| Body | 14px | 400 | 1.6 |
| Small | 12px | 400 | 1.5 |
| Button | 14px | 500 | 1.4 |

---

## 2. Màu sắc — Template Classic

### Light mode (mặc định)
| Token | Hex | Dùng cho |
|---|---|---|
| `--primary` | `#1A1A1A` | Text chính, nút primary, sidebar active |
| `--accent` | `#D4A574` (vàng gold ấm) | Brand accent, link, focus ring, nút sao ⭐ |
| `--background` | `#FFFFFF` | Nền chính |
| `--surface` | `#F5F5F5` | Nền card phụ, skeleton, input disabled |
| `--border` | `#E0E0E0` | Viền, chia section |
| `--text-primary` | `rgba(26,26,26,.9)` | Chữ chính |
| `--text-secondary` | `rgba(26,26,26,.6)` | Chữ phụ, placeholder, caption |

### Dark mode
| Token | Hex |
|---|---|
| `--background` | `#0F0F0F` |
| `--surface` | `#1A1A1A` |
| `--border` | `#333333` |
| `--primary` (text/nút) | `#FFFFFF` |
| `--accent` | `#E8C08F` |

### Màu chức năng (không đổi theo template)
| Token | Hex | Dùng cho |
|---|---|---|
| `--like` | `#C1666B` | Nút Thích ♥ (đỏ trầm, hợp tông ảnh cưới, không chói) |
| `--star` | `#D4A574` (= accent) | Nút Sao ⭐ |
| `--success` | `#51CF66` | Toast/badge thành công |
| `--warning` | `#FFD700` | Cảnh báo |
| `--error` | `#E0555B` | Nút xoá, input lỗi, toast lỗi |
| `--info` | `#4C8BF5` | Toast thông tin |

**Quy tắc:** accent thương hiệu (vàng gold) và màu Sao ⭐ dùng chung 1 token vì Sao vốn là icon ngôi sao vàng — không tách riêng để tránh loạn màu. Thích ♥ luôn dùng `--like`, không dùng đỏ tươi (giữ tông "calm, professional" theo nguyên tắc sản phẩm).

---

## 3. Spacing & bo góc

Đơn vị cơ bản: **8px**.

| Token | Giá trị |
|---|---|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `2xl` | 48px |

| Bo góc | Giá trị | Dùng cho |
|---|---|---|
| `radius-sm` | 6px | Input, button, tile ảnh |
| `radius-md` | 8px | Card |
| `radius-lg` | 12px | Modal, card lớn |

Header cao **80px**. Sidebar admin rộng **240px**.

---

## 4. Component chính

| Component | Quy tắc |
|---|---|
| **Button** | 3 size: sm 32px / md 40px / lg 48px (full-width). 4 variant: primary (nền đen), secondary (viền vàng), ghost (chỉ chữ vàng), destructive (nền đỏ). Active thì scale 0.97. |
| **Input** | Cao 36px, viền `--border`, bo 6px. Focus → viền + glow màu accent. Lỗi → viền đỏ + text lỗi bên dưới. |
| **Card** | Nền trắng, viền `--border`, bo 8px. Variant `interactive` → hover nhấc lên nhẹ + đổi viền vàng. |
| **Badge** | Bo tròn pill, 5 variant: primary/secondary/accent/success/like. |
| **Modal** | Overlay đen 50% (dark mode 70%), box bo 12px, animation pop-in 250ms. |
| **Toast** | Góc dưới-phải, viền trái 4px theo màu trạng thái, tự đóng sau ~3.2s. |
| **Tabs** | Gạch chân 2px màu accent khi active. |
| **Switch (toggle)** | Track xám → vàng accent khi bật. |
| **Lightbox** | Nền đen 96%, ảnh giữa màn hình, nút Thích/Sao lớn (52px) ở dưới, điều hướng bằng phím mũi tên + nút trái/phải. |
| **Gallery grid** | Desktop 4 cột / Tablet 3 cột / Mobile 2 cột, gap 16/12/8px, ảnh tỉ lệ vuông 1:1. |

---

## 5. Chuyển động (animation)

| Loại | Thời lượng | Easing |
|---|---|---|
| Vi tương tác (hover, click) | 200ms | `ease-out` |
| Transition thường | 300ms | `cubic-bezier(.2,0,.38,.9)` |
| Modal / Lightbox fade-in | 200–300ms | `ease-out` |

Luôn tôn trọng `prefers-reduced-motion`. Không animate layout (chỉ transform/opacity).

---

## 6. Breakpoint responsive

| Thiết bị | Khoảng |
|---|---|
| Mobile | 320px – 640px |
| Tablet | 641px – 1024px |
| Desktop | 1025px+ |

Touch target tối thiểu 44px (theo nguyên tắc Mobile First).

---

## 7. Icon

Dùng **inline SVG** (stroke-based, stroke-width 2, theo phong cách Lucide/Feather) — không dùng icon font, để nhẹ và dễ đổi màu theo `currentColor`.

---

## 8. Nguồn ảnh demo

Bản HTML prototype dùng ảnh placeholder từ `picsum.photos` (seed cố định để ổn định khi reload). Khi lên code thật sẽ thay bằng ảnh thật từ Google Drive folder của từng album.

---

## 9. File & cấu trúc demo hiện tại

```
books-view-html/
├── assets/
│   ├── style.css     ← toàn bộ token + component ở trên, sửa 1 chỗ áp dụng cả site
│   └── app.js         ← dark mode, toast, like/star, lightbox, tabs, modal
├── index.html          ← hub điều hướng
├── login.html / signup.html
├── dashboard.html
├── albums.html / album-create.html / album-detail.html
├── settings.html
├── landing.html / gallery.html / confirm.html
```

---

## 10. Nguyên tắc không phá vỡ (Never)

- ❌ Không tự chế màu/spacing ngoài token ở trên.
- ❌ Không tạo thêm variant button/badge mới ngoài danh sách.
- ❌ Không đổi font ngoài 3 font đã chọn.
- ❌ Không thêm animation ngoài mục 5 (tránh cảm giác rối, AI-generated).
- ✅ Mọi trang mới đều import chung `style.css` + `app.js`.
