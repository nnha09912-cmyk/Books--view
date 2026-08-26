// Reads publicly-shared ("Anyone with the link") Google Drive folders using
// only an API key — no OAuth, no per-studio login. The studio just shares a
// Drive folder as link-viewable and pastes the link into Books View.

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
 * size, matching photo.maclife.vn's approach. */
export function driveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
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
