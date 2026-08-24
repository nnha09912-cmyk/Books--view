export type AlbumStatus = "active" | "expired" | "archived" | "completed";

export const albumStatusLabel: Record<string, string> = {
  active: "Đang mở",
  expired: "Hết hạn",
  archived: "Lưu trữ",
  completed: "Hoàn tất",
};

export const albumStatusBadge: Record<
  string,
  "accent" | "secondary" | "success"
> = {
  active: "accent",
  expired: "secondary",
  archived: "secondary",
  completed: "success",
};

export interface MockActivity {
  avatarSeed: number;
  text: string;
  meta: string;
}

export const mockActivity: MockActivity[] = [
  { avatarSeed: 32, text: "Minh Anh vừa chọn 24 ảnh ♥", meta: "Đám cưới An & Minh · 5 phút trước" },
  { avatarSeed: 45, text: "Bảo Trân đã nộp lựa chọn", meta: "Kỷ yếu 12A1 · 1 giờ trước" },
  { avatarSeed: 5, text: "Chị Hoa đã xem album", meta: "Gia đình chị Hoa · 2 ngày trước" },
];

export const picsum = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const pravatar = (seed: number, size = 64) =>
  `https://i.pravatar.cc/${size}?img=${seed}`;
