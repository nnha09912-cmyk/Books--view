# 01 — Product Guideline

## Triết Lý Sản Phẩm

Books View được xây dựng dựa trên **5 nguyên tắc cốt lõi**:

---

## 1️⃣ **Image First**

Ảnh là trọng tâm — giao diện được thiết kế quanh ảnh, không phải ngược lại.

- Ảnh chiếm **70-80% diện tích** màn hình
- Preview lớn, rõ nét, tải nhanh
- Ít text, nhiều hình ảnh
- Lightbox full-screen không bị che khuất

**Ví dụ**: Gallery page — grid ảnh to, khi click vào là full lightbox, không popup nhỏ.

---

## 2️⃣ **Mobile First**

Khách hàng chủ yếu xem trên **điện thoại** → Mọi tính năng phải hoạt động hoàn hảo trên mobile.

- Responsive từ 320px trở lên
- Touch-friendly: button ≥ 44px, spacing rộng
- Load ảnh cấp tiến (lazy load)
- Offline-friendly nếu có thể

**Ví dụ**: Nút tim/sao phải đủ lớn để bấm dễ dàng, không bị nhầm.

---

## 3️⃣ **Performance First**

Ứng dụng phải **chạy mượt mà**, không chờ đợi.

- Ảnh tải trong < 1s (optimize size, CDN)
- Transition/animation mượt (60fps)
- Không có layout shift
- Bundle size tối thiểu

**Ví dụ**: Khi khách swipe giữa ảnh, không được lag hay delay.

---

## 4️⃣ **Simple**

Mỗi màn hình, mỗi tính năng phải **dễ hiểu ngay lần đầu**.

- 1 action chính trên mỗi màn hình (không quá nhiều button)
- Visual hierarchy rõ ràng
- Copy text ngắn, rõ ràng
- Không advanced features ẩn giấu

**Ví dụ**: Gallery page chỉ có 3 action: xem ảnh, tim, sao. Không có sorting, filter, hay settings phức tạp.

---

## 5️⃣ **Professional**

Books View đại diện cho **thương hiệu photography studio**.

- Design clean, modern, không kitschy
- Typography chuyên nghiệp
- Color palette calmming, không rực rỡ
- Attention to detail: spacing, alignment, polish

**Ví dụ**: Khi khách dùng Books View, họ cảm thấy studio chúng ta là chuyên nghiệp & high-end.

---

## Nguyên Tắc Thiết Kế

### Do ✅
- Tối giản, clean design
- Focus vào content (ảnh)
- Consistent component reuse
- Dark mode support (ảnh nhìn đẹp hơn)
- Whitespace generous

### Don't ❌
- Animations quá (distract)
- Nhiều màu sắc (chia soncenter)
- Trendy design (có thể lỗi thời)
- Custom UI từ đầu (dùng shadcn/ui)
- Heavy JavaScript, slow load

---

## Reference Products

Mở để học, **không lấy code**.

| Sản phẩm | Cái tốt | Cái cần tránh |
|---------|--------|--------------|
| **Maclife** | Simple, fast, clean | UI hơi cũ |
| **Shotpik** | Gallery UX tốt, professional | Phức tạp quá |
| **Gump** | Mobile-first, performance | Feature nhiều |
| **PhotoPrism** | Open-source, flexible | UI quá technical |
| **LibrePhotos** | Minimalist | Community-driven, support kém |

---

## Workflow Khách Hàng (Happy Path)

```
1. Nhận link từ studio
   ↓
2. Mở link, thấy album & folder (nếu có)
   ↓
3. Click vào folder/album
   ↓
4. Xem gallery (grid hoặc carousel)
   ↓
5. Click ảnh → Full lightbox
   ↓
6. Đánh dấu tim (♥) hoặc sao (⭐)
   ↓
7. Continue duyệt hoặc submit
   ↓
8. Thấy confirmation, xong
```

**Duration**: 5-15 phút cho 300 ảnh (scan & pick).

---

## Workflow Studio (Admin)

```
1. Upload ảnh lên Google Drive (organized by folder)
   ↓
2. Vào Books View admin, tạo album từ Drive folder
   ↓
3. Generate unique link cho khách
   ↓
4. Khách xem & chọn
   ↓
5. Studio xem report: ảnh nào được chọn, bao nhiêu
   ↓
6. Export danh sách tim/sao
   ↓
7. Retouch ảnh được chọn tim, upload ảnh đã chọn sao
```

---

## Key Features (MVP)

| Feature | Priority | Notes |
|---------|----------|-------|
| Upload album from Drive | MUST | Sync Google Drive folder |
| Gallery view (grid) | MUST | Responsive, lazy load |
| Lightbox (full screen) | MUST | Swipe, zoom, keyboard nav |
| Like/Favorite (♥) | MUST | Mark for printing/album |
| Star (⭐) | MUST | Mark for downloading |
| Folder navigation | MUST | If album has sub-folders |
| Export selections | MUST | Download CSV/JSON |
| Admin dashboard | MUST | See selections per customer |
| Unique link sharing | MUST | No auth, just link-based |
| Mobile responsive | MUST | Touch-friendly |

---

## Out of Scope (MVP)

- ❌ User authentication (studio side only)
- ❌ Payment integration
- ❌ Comments/reviews
- ❌ Watermark customization
- ❌ Batch download (khách tải 1-1)
- ❌ Advanced analytics
