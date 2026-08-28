// Reads publicly-shared ("Anyone with the link") Google Drive folders using
// only an API key — no OAuth, no per-studio login. The studio just shares a
// Drive folder as link-viewable and pastes the link into Books View.

import { prisma } from "@/lib/db";

const DRIVE_API = "https://www.googleapis.com/drive/v3";

export interface DriveImageFile {
  id: string;
  name: string;
  mimeType: string;
  size: string | null;
  thumbnailLink: string | null;
}

/** Reserved so Album.name can be auto-filled from the actual Drive folder
 * name when a studio leaves the album name blank. */
export async function getDriveFolderName(folderId: string): Promise<string | null> {
  const key = requireApiKey();
  const url = new URL(`${DRIVE_API}/files/${folderId}`);
  url.searchParams.set("fields", "name");
  url.searchParams.set("key", key);
  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const data = await res.json();
  return typeof data.name === "string" ? data.name : null;
}

/** Google appends its own small default size (usually =s220) to
 * thumbnailLink — bump it up so the "thumbnail" is actually large enough
 * to fill the gallery grid/lightbox, still far lighter than the original. */
export function driveThumbnailUrl(thumbnailLink: string, size = 1600): string {
  return thumbnailLink.replace(/=s\d+$/, `=s${size}`);
}

/** Direct download link for a Drive file — used as-is (no bytes touch our
 * server) so pasting a Drive folder link stays instant regardless of album
 * size, matching photo.maclife.vn's approach. Kept only as the `originalUrl`
 * fallback for on-screen display; the gated guest Download endpoint fetches
 * real bytes via fetchDriveFileBytes below instead of ever handing this URL
 * to a guest. */
export function driveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/** Fetches a Drive file's actual bytes server-side — only called from the
 * gated Download endpoint, which resizes the result before it ever reaches
 * a guest. Never used for the gallery/import path, which deliberately never
 * touches file bytes (see module comment) to keep import instant. */
export async function fetchDriveFileBytes(fileId: string): Promise<Buffer> {
  const key = requireApiKey();
  const url = new URL(`${DRIVE_API}/files/${fileId}`);
  url.searchParams.set("alt", "media");
  url.searchParams.set("key", key);
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Không tải được ảnh từ Google Drive (status ${res.status}).`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Accepts a full Drive folder share link or a bare folder ID. */
export function extractDriveFolderId(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  // Bare ID pasted directly (Drive IDs are alphanumeric/-/_ , usually 20+ chars)
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;
  return null;
}

/** Same sanitization drive-import and drive-sync both apply to a Drive
 * file's name before storing/matching it as Photo.filename — kept in one
 * place so the two routes can never drift and silently stop matching. */
export function sanitizeDriveFilename(name: string) {
  return name.replace(/[\\/:*?"<>|]/g, "_").replace(/^\.+/, "");
}

function requireApiKey(): string {
  const key = process.env.GOOGLE_DRIVE_API_KEY;
  if (!key) throw new Error("GOOGLE_DRIVE_API_KEY chưa được cấu hình trên server.");
  return key;
}

export interface DriveImportResult {
  added: number;
  skipped: number;
  errors: string[];
}

/** Shared by drive-import (paste a link, add its photos) and drive-sync
 * (re-check the album's already-linked folder) — deliberately additive
 * only: detect new files, add them, skip anything already there by
 * filename. Never touches existing Photo rows, so it can never delete a
 * photo, orphan a guest's selection, or create a second album — sync is
 * just "does this folder have anything we don't have yet." */
export async function importNewPhotosFromDrive(
  albumId: string,
  folderId: string
): Promise<DriveImportResult> {
  const driveFiles = await listDriveImages(folderId);
  if (driveFiles.length === 0) {
    throw new Error(
      "Không tìm thấy ảnh nào trong folder — kiểm tra chế độ chia sẻ (Anyone with the link)."
    );
  }

  const existing = await prisma.photo.findMany({
    where: { albumId },
    select: { filename: true, googleDriveId: true },
  });
  const existingNames = new Set(existing.map((p) => p.filename));
  // Drive file ID is the reliable identity — a filename can be reused (or a
  // file renamed) without it being a different photo. Older rows imported
  // before this field was populated fall back to filename matching so they
  // still count as "already have it" and don't get re-added as duplicates.
  const existingDriveIds = new Set(
    existing.map((p) => p.googleDriveId).filter((id): id is string => !!id)
  );

  let added = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const file of driveFiles) {
    const filename = sanitizeDriveFilename(file.name);
    if (!filename) continue;
    if (existingDriveIds.has(file.id) || existingNames.has(filename)) {
      skipped++;
      continue;
    }
    try {
      const previewUrl = file.thumbnailLink
        ? driveThumbnailUrl(file.thumbnailLink, 1600)
        : driveDownloadUrl(file.id);
      await prisma.photo.create({
        data: {
          albumId,
          filename,
          originalUrl: driveDownloadUrl(file.id),
          thumbnailUrl: previewUrl,
          previewUrl,
          fileSize: file.size ? Number(file.size) : null,
          mimeType: file.mimeType || null,
          googleDriveId: file.id,
        },
      });
      existingNames.add(filename);
      existingDriveIds.add(file.id);
      added++;
    } catch (e) {
      errors.push(`${filename}: ${String(e instanceof Error ? e.message : e)}`);
    }
  }

  const photoCount = await prisma.photo.count({ where: { albumId } });
  await prisma.album.update({
    where: { id: albumId },
    data: { photoCount, googleDriveFolderId: folderId },
  });

  return { added, skipped, errors };
}

/** Lists image files directly inside a public Drive folder (non-recursive). */
export async function listDriveImages(folderId: string): Promise<DriveImageFile[]> {
  const key = requireApiKey();
  const files: DriveImageFile[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${DRIVE_API}/files`);
    url.searchParams.set("q", `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`);
    url.searchParams.set("fields", "nextPageToken, files(id, name, mimeType, size, thumbnailLink)");
    url.searchParams.set("pageSize", "1000");
    url.searchParams.set("key", key);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const msg = body?.error?.message ?? res.statusText;
      throw new Error(
        res.status === 404
          ? "Không tìm thấy folder — kiểm tra lại link hoặc chế độ chia sẻ (Anyone with the link)."
          : `Lỗi Google Drive API: ${msg}`
      );
    }
    const data = await res.json();
    files.push(...(data.files ?? []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}
