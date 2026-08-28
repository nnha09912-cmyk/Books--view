import sharp from "sharp";

/** Avatars are small and always square-cropped — no reason to keep more
 * than this many pixels on a side. */
const AVATAR_EDGE = 512;
const AVATAR_JPEG_QUALITY = 85;

/** Longest-edge cap for the web-facing preview — same idea as
 * photo.maclife.vn's proxy: never ship the full multi-MB original for
 * on-screen viewing, only for the explicit Download action. Pixel
 * dimensions (not DPI, which browsers ignore) are what actually shrinks
 * the file and speeds up loading. */
const WEB_MAX_EDGE = 1600;
const WEB_JPEG_QUALITY = 82;

/** Longest-edge cap for the guest-facing Download output — bigger than the
 * on-screen preview (guests keep these) but still far lighter than a
 * camera original. DPI has no effect on file size — only pixel count and
 * JPEG quality do — but Download output is still stamped at 72 to match
 * Album Settings' documented output spec. */
const DOWNLOAD_MAX_EDGE = 2048;
const DOWNLOAD_JPEG_QUALITY = 85;
const DOWNLOAD_DPI = 72;

/** Anything past this is either not a real camera photo or a deliberate
 * decompression-bomb attempt — sharp/libvips will refuse to even read
 * metadata for a file that decodes past this pixel count. */
const MAX_PIXELS = 100_000_000; // ~100 megapixels

/** Upstream request-size guards don't cover multipart/form-data (uploads
 * legitimately need to exceed the JSON body cap), so this is the only size
 * ceiling a single uploaded file goes through. */
export const MAX_UPLOAD_FILE_BYTES = 40 * 1024 * 1024;

/** General decode safety ceiling, separate from the stricter upload-specific
 * cap above — a Drive-sourced original being fetched server-side for
 * Download was never subject to the upload cap in the first place, but
 * still needs some bound before sharp touches it. */
const MAX_DECODE_BYTES = 100 * 1024 * 1024;

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

/** Thrown for any file that fails validation — callers must not write the
 * original bytes to disk when this is thrown; the message is always safe
 * to show a user directly. */
export class InvalidImageError extends Error {}

/** Confirms `bytes` actually decodes as one of the allowed image formats
 * and isn't oversized, before any caller is allowed to persist or serve it.
 * A `.jpg` extension proves nothing — this reads the real, decoded format. */
async function decodeImage(bytes: Buffer, maxBytes: number) {
  if (bytes.length > maxBytes) {
    throw new InvalidImageError("File quá lớn.");
  }
  const image = sharp(bytes, { limitInputPixels: MAX_PIXELS, failOn: "error" });
  let metadata;
  try {
    metadata = await image.metadata();
  } catch {
    throw new InvalidImageError("File không phải ảnh hợp lệ.");
  }
  if (!metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
    throw new InvalidImageError("Định dạng ảnh không được hỗ trợ.");
  }
  return image;
}

/** Validates raw bytes are a real, supported, reasonably-sized image, then
 * resizes it down to fit within WEB_MAX_EDGE (never upscales) and re-encodes
 * as JPEG. Auto-rotates based on EXIF orientation and strips metadata as a
 * side effect of re-encoding. Throws InvalidImageError instead of ever
 * producing output for something that isn't actually a valid image — the
 * caller must not write `bytes` to disk unless this call succeeds. */
export async function resizeForWeb(bytes: Buffer): Promise<Buffer> {
  const image = await decodeImage(bytes, MAX_UPLOAD_FILE_BYTES);
  try {
    return await image
      .rotate()
      .resize({
        width: WEB_MAX_EDGE,
        height: WEB_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: WEB_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new InvalidImageError("File không phải ảnh hợp lệ.");
  }
}

/** Validates and center-crops an uploaded avatar down to a small square JPEG
 * — same validate-before-write guarantee as resizeForWeb (throws
 * InvalidImageError instead of ever producing output for a bad file). */
export async function resizeAvatar(bytes: Buffer): Promise<Buffer> {
  const image = await decodeImage(bytes, MAX_UPLOAD_FILE_BYTES);
  try {
    return await image
      .rotate()
      .resize({
        width: AVATAR_EDGE,
        height: AVATAR_EDGE,
        fit: "cover",
        position: "attention",
      })
      .jpeg({ quality: AVATAR_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new InvalidImageError("File không phải ảnh hợp lệ.");
  }
}

/** Same validation as resizeForWeb but produces the larger Download variant
 * (2048px long edge) — used by the gated guest Download endpoint so nobody
 * ever receives the untouched camera original, Drive or local. */
export async function resizeForDownload(bytes: Buffer): Promise<Buffer> {
  const image = await decodeImage(bytes, MAX_DECODE_BYTES);
  try {
    const resized = await image
      .rotate()
      .resize({
        width: DOWNLOAD_MAX_EDGE,
        height: DOWNLOAD_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: DOWNLOAD_JPEG_QUALITY, mozjpeg: true })
      .toBuffer();
    // Stamping density requires a second pass: sharp's withMetadata() also
    // re-attaches whatever EXIF the *source* it's called on still carries.
    // Calling it directly on the original (camera EXIF, possibly GPS,
    // intact) would leak that data back into the Download output. Calling
    // it here — on `resized`, which the pass above already re-encoded with
    // no withMetadata() and therefore has zero EXIF — only ever adds a
    // fresh, minimal resolution-only EXIF block; verified there's no way
    // for the original camera/GPS tags to survive into it.
    return await sharp(resized).withMetadata({ density: DOWNLOAD_DPI }).jpeg({
      quality: DOWNLOAD_JPEG_QUALITY,
      mozjpeg: true,
    }).toBuffer();
  } catch {
    throw new InvalidImageError("File không phải ảnh hợp lệ.");
  }
}
