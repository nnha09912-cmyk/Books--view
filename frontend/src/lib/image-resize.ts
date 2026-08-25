import sharp from "sharp";

/** Longest-edge cap for the web-facing preview — same idea as
 * photo.maclife.vn's proxy: never ship the full multi-MB original for
 * on-screen viewing, only for the explicit Download action. Pixel
 * dimensions (not DPI, which browsers ignore) are what actually shrinks
 * the file and speeds up loading. */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 82;

/** Resizes raw image bytes down to fit within MAX_EDGE on the longest
 * side (never upscales) and re-encodes as JPEG. Auto-rotates based on
 * EXIF orientation and strips metadata as a side effect of re-encoding. */
export async function resizeForWeb(bytes: Buffer): Promise<Buffer> {
  return sharp(bytes)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}
