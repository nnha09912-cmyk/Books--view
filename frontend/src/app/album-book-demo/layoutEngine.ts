/** Pure layout math for the Album Book demo — orientation/size rules and
 * the Single/Spread page-mode mapping. No DOM, no state, easy to reason
 * about in isolation from the viewer. */

export type AlbumOrientation = "portrait" | "square" | "landscape";

export interface AlbumSizeOption {
  label: string;
  w: number;
  h: number;
}

/** Đứng and Ngang share the same five physical print sizes — only how the
 * two numbers map to page width/height differs (see computePageSpread). */
export const PORTRAIT_LANDSCAPE_SIZES: AlbumSizeOption[] = [
  { label: "15 × 21 cm", w: 15, h: 21 },
  { label: "20 × 30 cm", w: 20, h: 30 },
  { label: "25 × 35 cm", w: 25, h: 35 },
  { label: "30 × 40 cm", w: 30, h: 40 },
  { label: "30 × 45 cm", w: 30, h: 45 },
];

export const SQUARE_SIZES: AlbumSizeOption[] = [
  { label: "20 × 20 cm", w: 20, h: 20 },
  { label: "25 × 25 cm", w: 25, h: 25 },
  { label: "30 × 30 cm", w: 30, h: 30 },
];

export function sizesForOrientation(orientation: AlbumOrientation): AlbumSizeOption[] {
  return orientation === "square" ? SQUARE_SIZES : PORTRAIT_LANDSCAPE_SIZES;
}

export interface PageSpreadDimensions {
  pageWidth: number;
  pageHeight: number;
  spreadWidth: number;
  spreadHeight: number;
}

/** The spec's core rule: the size Studio picks is always ONE page. Ngang
 * swaps the two numbers (a "20×30" print becomes a 30-wide×20-tall page)
 * instead of just widening a portrait page — Portrait/Square pass through
 * as-is. Spread is always two pages side by side. */
export function computePageSpread(
  orientation: AlbumOrientation,
  size: AlbumSizeOption
): PageSpreadDimensions {
  const pageWidth = orientation === "landscape" ? size.h : size.w;
  const pageHeight = orientation === "landscape" ? size.w : size.h;
  return {
    pageWidth,
    pageHeight,
    spreadWidth: pageWidth * 2,
    spreadHeight: pageHeight,
  };
}

export interface DemoPhoto {
  id: string;
  url: string;
  width: number;
  height: number;
}

/** "Guikhach.com — Quy tắc Trang đơn / Trang đôi": exactly two page
 * types, chosen by the user's own checkbox — never inferred from
 * filename, orientation, dimensions, or upload source. */
export type PageType = "single" | "spread";

export interface FlipPage {
  id: string;
  image: DemoPhoto;
  pageType: PageType;
}

/** Single mode: each file is its own independent page. Spread mode
 * (default): each file already IS a complete two-page spread, ready for
 * the flipbook — the file is never split, cropped, or merged with
 * another; only how it's tagged (and later rendered) differs. */
export function buildFlipPages(photos: DemoPhoto[], singleMode: boolean): FlipPage[] {
  return photos.map((photo) => ({
    id: photo.id,
    image: photo,
    pageType: singleMode ? "single" : "spread",
  }));
}

export interface AlbumBook {
  cover: DemoPhoto | null;
  pages: FlipPage[];
}

/** First upload becomes the Cover (its own thing, unrelated to the
 * Single/Spread rule); everything else becomes body pages tagged by
 * whichever mode was active for this batch. */
export function buildAlbumBook(photos: DemoPhoto[], singleMode: boolean): AlbumBook {
  if (photos.length === 0) return { cover: null, pages: [] };
  const [cover, ...rest] = photos;
  return { cover, pages: buildFlipPages(rest, singleMode) };
}
