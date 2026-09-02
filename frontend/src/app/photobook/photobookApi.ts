import type { AlbumBook, AlbumOrientation, CoverSpec, DemoPhoto } from "./layoutEngine";

/** Photobook repository — now server-real (Prisma `Photobook` table +
 * Vercel Blob), replacing the old localStorage-backed albumHistory.ts.
 * Same shape of surface (fetch/create/delete/format helpers) on purpose,
 * so the editor page's own logic barely changed — only how each function
 * is implemented did. */
export interface PhotobookRecord {
  id: string;
  shareId: string;
  title: string;
  albumType: AlbumOrientation;
  pageMode: "single" | "spread";
  cover: AlbumBook["cover"];
  pages: AlbumBook["pages"];
  pageWidthPx: number;
  pageHeightPx: number;
  views: number;
  createdAt: string;
  expiresAt: string;
}

async function uploadPhoto(blobUrl: string): Promise<DemoPhoto> {
  const blob = await fetch(blobUrl).then((r) => r.blob());
  const form = new FormData();
  form.append("file", blob, "photo.jpg");
  const res = await fetch("/api/photobooks/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Không tải được ảnh lên");
  return { id: crypto.randomUUID(), url: data.url, width: data.width, height: data.height };
}

/** Uploads every image a freshly-built AlbumBook references (cover + every
 * page) — each local blob: URL becomes a real, resized (2048px/72dpi)
 * Vercel Blob URL. Runs once, right before persisting; editing itself
 * (drag/drop, cover pick, arranging pages) never touches the network. */
async function uploadBook(book: AlbumBook): Promise<AlbumBook> {
  const cover: CoverSpec | null =
    book.cover?.kind === "photo"
      ? { kind: "photo", photo: await uploadPhoto(book.cover.photo.url) }
      : book.cover;
  const pages = await Promise.all(
    book.pages.map(async (p) => ({ ...p, image: await uploadPhoto(p.image.url) }))
  );
  return { cover, pages };
}

export async function fetchHistory(): Promise<PhotobookRecord[]> {
  const res = await fetch("/api/photobooks", { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data as PhotobookRecord[];
}

export async function createPhotobook(
  book: AlbumBook,
  pagePx: { w: number; h: number },
  title: string,
  albumType: AlbumOrientation,
  pageMode: "single" | "spread"
): Promise<PhotobookRecord> {
  const uploaded = await uploadBook(book);
  const res = await fetch("/api/photobooks", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title.trim() || "Album không tên",
      albumType,
      pageMode,
      cover: uploaded.cover,
      pages: uploaded.pages,
      pageWidthPx: pagePx.w,
      pageHeightPx: pagePx.h,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Không thể tạo Photobook");
  return data as PhotobookRecord;
}

export async function deletePhotobook(id: string): Promise<void> {
  await fetch(`/api/photobooks/${id}`, { method: "DELETE", credentials: "include" });
}

export function toAlbumBook(record: PhotobookRecord): AlbumBook {
  return { cover: record.cover, pages: record.pages };
}

export function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatExpiry(iso: string): string {
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  return days <= 0 ? "Hết hạn" : `Còn ${days} ngày`;
}
