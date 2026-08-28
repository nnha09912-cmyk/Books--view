import { readFile } from "fs/promises";
import path from "path";
import { fetchDriveFileBytes } from "@/lib/google-drive";
import { resizeForDownload } from "@/lib/image-resize";

export function downloadFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "") + ".jpg";
}

/** Shared by the single-photo and ZIP download routes — fetches a photo's
 * real source bytes (Drive or local disk) and resizes it for Download.
 * Never returns the untouched original. */
export async function buildDownloadJpeg(
  albumId: string,
  photo: { filename: string; googleDriveId: string | null }
): Promise<Buffer> {
  const sourceBytes = photo.googleDriveId
    ? await fetchDriveFileBytes(photo.googleDriveId)
    : await readFile(path.join(process.cwd(), "public", "uploads", albumId, photo.filename));
  return resizeForDownload(sourceBytes);
}
