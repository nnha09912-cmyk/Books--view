import type { CSSProperties } from "react";

/** When the studio has picked a real cover photo (Gallery → Change Cover),
 * layers it under each template's own tint/gradient so the photo shows
 * through while staying legible with that template's text colors — same
 * idea as Spotify's "colorized" album art. `overlay` is any valid CSS
 * background-image layer (a flat rgba() tint doubled as a 2-stop gradient,
 * or a template's own decorative gradient at reduced opacity). Returns
 * undefined when there's no cover photo, so the template's static CSS
 * background (gradient/flat color) applies unchanged. */
export function coverPhotoStyle(
  coverPhotoUrl: string | null,
  coverPosY: number,
  overlay: string
): CSSProperties | undefined {
  if (!coverPhotoUrl) return undefined;
  const safeUrl = coverPhotoUrl.replace(/"/g, "%22");
  return {
    backgroundImage: `${overlay}, url("${safeUrl}")`,
    backgroundSize: "cover",
    backgroundPosition: `50% ${coverPosY}%`,
  };
}

/** "12.12.2026" — the dot-separated format used across every template's
 * hero (distinct from the slash-separated vi-VN format used elsewhere in
 * the app for expiry/lockout dates). Returns null when unset so callers
 * can hide the date line entirely rather than render an empty string. */
export function formatEventDate(eventDate: string | null): string | null {
  if (!eventDate) return null;
  const d = new Date(eventDate);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
}

export function footLine(expiryDate: string | null) {
  const expiry = expiryDate
    ? `Hạn chọn ảnh: ${new Date(expiryDate).toLocaleDateString("vi-VN")} · `
    : "";
  return `${expiry}Không cần đăng nhập`;
}
