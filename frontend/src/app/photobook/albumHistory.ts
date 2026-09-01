import type { AlbumBook, AlbumOrientation } from "./layoutEngine";

/** Album persistence — the repository backing both /photobook (Lịch sử
 * Album) and the standalone /album/[albumId] customer viewer. This is a
 * localStorage-backed stand-in for a real backend: every function here
 * is synchronous and keyed by albumId, on purpose, so swapping this file
 * for one that calls a real API (GET /api/albums/:albumId, etc.) later
 * doesn't require touching AlbumBookViewer or either page that calls it
 * — only this module's internals would change.
 *
 * Demo albums self-expire 30 days after creation; this only applies to
 * these demo entries, never to a real customer Album elsewhere in the
 * app. */
export interface AlbumRecord {
  albumId: string;
  title: string;
  albumType: AlbumOrientation;
  pageMode: "single" | "spread";
  cover: AlbumBook["cover"];
  pages: AlbumBook["pages"];
  pagePx: { w: number; h: number };
  createdAt: number;
  expiresAt: number;
  views: number;
}

/** Legacy alias — some call sites still say "history entry" since this
 * doubles as the Lịch sử Album list, not just the standalone viewer's
 * source of truth. */
export type AlbumHistoryEntry = AlbumRecord;

const STORE_KEY = "photobook:history";
export const DEMO_ALBUM_LIFETIME_DAYS = 30;
const LIFETIME_MS = DEMO_ALBUM_LIFETIME_DAYS * 24 * 60 * 60 * 1000;

/** A full crypto.randomUUID() (36 chars incl. dashes) makes the /album
 * link needlessly long — 10 random alphanumeric chars is still ~62^10
 * combinations, plenty for a demo store that only ever holds a handful
 * of entries per browser. */
function shortId(len = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function readRaw(): AlbumRecord[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as AlbumRecord[]) : [];
  } catch {
    return [];
  }
}

function writeRaw(list: AlbumRecord[]): boolean {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/** Purges anything past its expiresAt before returning — the closest a
 * client-only demo can get to "auto-delete after 1 month" since there's
 * no server cron; expiry is enforced lazily whenever the list is read. */
export function loadHistory(): AlbumRecord[] {
  const list = readRaw();
  const now = Date.now();
  const alive = list.filter((e) => e.expiresAt > now);
  if (alive.length !== list.length) writeRaw(alive);
  return alive;
}

export function addHistoryEntry(
  book: AlbumBook,
  pagePx: { w: number; h: number },
  title: string,
  albumType: AlbumOrientation,
  pageMode: "single" | "spread"
): { list: AlbumRecord[]; entry: AlbumRecord; saved: boolean } {
  const now = Date.now();
  const entry: AlbumRecord = {
    albumId: shortId(),
    title: title.trim() || "Album không tên",
    albumType,
    pageMode,
    cover: book.cover,
    pages: book.pages,
    pagePx,
    createdAt: now,
    expiresAt: now + LIFETIME_MS,
    views: 0,
  };
  const list = [entry, ...loadHistory()];
  const saved = writeRaw(list);
  return { list, entry, saved };
}

export function removeHistoryEntry(albumId: string): AlbumRecord[] {
  const list = loadHistory().filter((e) => e.albumId !== albumId);
  writeRaw(list);
  return list;
}

/** Distinguishes "album exists, nobody has opened the link yet" (still
 * a valid, visible entry) from "no such album" (truly absent/expired) —
 * callers must never treat views === 0 as "doesn't exist". */
export function getHistoryEntry(albumId: string): AlbumRecord | null {
  return loadHistory().find((e) => e.albumId === albumId) ?? null;
}

export function bumpViews(albumId: string): void {
  const list = loadHistory();
  const idx = list.findIndex((e) => e.albumId === albumId);
  if (idx === -1) return;
  const next = [...list];
  next[idx] = { ...next[idx], views: next[idx].views + 1 };
  writeRaw(next);
}

/** Reassembles the AlbumBook shape AlbumBookViewer expects from a flat
 * AlbumRecord — keeps the viewer's props unchanged while the repository
 * stores cover/pages at the top level (closer to what a real API
 * response would look like). */
export function toAlbumBook(record: AlbumRecord): AlbumBook {
  return { cover: record.cover, pages: record.pages };
}

export function formatCreatedAt(ts: number): string {
  return new Date(ts).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatExpiry(expiresAt: number): string {
  const days = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  return days <= 0 ? "Hết hạn" : `Còn ${days} ngày`;
}
