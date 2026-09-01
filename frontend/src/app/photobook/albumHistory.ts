import type { AlbumBook } from "./layoutEngine";

/** Client-only "Lịch sử Album" — every album a Studio creates in this
 * demo is kept here (not just the most recent one) so revisiting one
 * doesn't require recreating it. Demo albums self-expire 30 days after
 * creation; this only applies to these demo entries, never to a real
 * customer Album elsewhere in the app. */
export interface AlbumHistoryEntry {
  id: string;
  name: string;
  createdAt: number;
  expiresAt: number;
  views: number;
  book: AlbumBook;
  pagePx: { w: number; h: number };
}

const HISTORY_KEY = "photobook:history";
export const DEMO_ALBUM_LIFETIME_DAYS = 30;
const LIFETIME_MS = DEMO_ALBUM_LIFETIME_DAYS * 24 * 60 * 60 * 1000;

/** A full crypto.randomUUID() (36 chars incl. dashes) makes the /view
 * share link needlessly long — 10 random alphanumeric chars is still
 * ~62^10 combinations, plenty for a demo store that only ever holds a
 * handful of entries per browser. */
function shortId(len = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function readRaw(): AlbumHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as AlbumHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeRaw(list: AlbumHistoryEntry[]): boolean {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/** Purges anything past its expiresAt before returning — the closest a
 * client-only demo can get to "auto-delete after 1 month" since there's
 * no server cron; expiry is enforced lazily whenever the list is read. */
export function loadHistory(): AlbumHistoryEntry[] {
  const list = readRaw();
  const now = Date.now();
  const alive = list.filter((e) => e.expiresAt > now);
  if (alive.length !== list.length) writeRaw(alive);
  return alive;
}

export function addHistoryEntry(
  book: AlbumBook,
  pagePx: { w: number; h: number },
  name: string
): { list: AlbumHistoryEntry[]; entry: AlbumHistoryEntry; saved: boolean } {
  const now = Date.now();
  const entry: AlbumHistoryEntry = {
    id: shortId(),
    name: name.trim() || "Album không tên",
    createdAt: now,
    expiresAt: now + LIFETIME_MS,
    views: 0,
    book,
    pagePx,
  };
  const list = [entry, ...loadHistory()];
  const saved = writeRaw(list);
  return { list, entry, saved };
}

export function removeHistoryEntry(id: string): AlbumHistoryEntry[] {
  const list = loadHistory().filter((e) => e.id !== id);
  writeRaw(list);
  return list;
}

/** Distinguishes "album exists, nobody has opened the link yet" (still
 * a valid, visible entry) from "no such album" (truly absent/expired) —
 * callers must never treat views === 0 as "doesn't exist". */
export function getHistoryEntry(id: string): AlbumHistoryEntry | null {
  return loadHistory().find((e) => e.id === id) ?? null;
}

export function bumpViews(id: string): void {
  const list = loadHistory();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return;
  const next = [...list];
  next[idx] = { ...next[idx], views: next[idx].views + 1 };
  writeRaw(next);
}

export function formatCreatedAt(ts: number): string {
  return new Date(ts).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatExpiry(expiresAt: number): string {
  const days = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
  return days <= 0 ? "Hết hạn" : `Còn ${days} ngày`;
}
