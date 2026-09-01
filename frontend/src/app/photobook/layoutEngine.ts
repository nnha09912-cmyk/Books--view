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

/** A physical cover material — a plain CSS approximation of the leather/
 * fabric swatch board (not a photo), used as "Bìa da" when the Studio
 * hasn't picked one of their own photos as the cover. */
export interface MaterialSwatch {
  id: string;
  label: string;
  texture: "leather" | "fabric";
  swatchCss: string;
}

const leather = (hi: string, mid: string, lo: string) =>
  `radial-gradient(circle at 28% 22%, ${hi}, ${mid} 55%, ${lo} 100%)`;
const fabric = (a: string, b: string) =>
  `repeating-linear-gradient(45deg, ${a}, ${a} 2px, ${b} 2px, ${b} 4px), repeating-linear-gradient(-45deg, ${a}, ${a} 2px, ${b} 2px, ${b} 4px)`;

export const COVER_MATERIALS: MaterialSwatch[] = [
  { id: "01", label: "01 · Da nâu", texture: "leather", swatchCss: leather("#a2603a", "#8a4c2c", "#623620") },
  { id: "02", label: "02 · Da đen", texture: "leather", swatchCss: leather("#3a4442", "#2b332f", "#1c211f") },
  { id: "03", label: "03 · Da xám", texture: "leather", swatchCss: leather("#b7bac0", "#9a9ea5", "#797d84") },
  { id: "04", label: "04 · Da be", texture: "leather", swatchCss: leather("#d9bd8f", "#c7a575", "#a4835a") },
  { id: "05", label: "05 · Vải xám", texture: "fabric", swatchCss: fabric("#767871", "#616359") },
  { id: "06", label: "06 · Vải đỏ", texture: "fabric", swatchCss: fabric("#8c2634", "#761f2b") },
  { id: "07", label: "07 · Vải xanh rêu", texture: "fabric", swatchCss: fabric("#5f7d70", "#4c6759") },
  { id: "08", label: "08 · Vải đỏ đậm", texture: "fabric", swatchCss: fabric("#7a1b2c", "#631523") },
];

export type CoverSpec = { kind: "photo"; photo: DemoPhoto } | { kind: "material"; material: MaterialSwatch };

export interface AlbumBook {
  cover: CoverSpec | null;
  pages: FlipPage[];
}

/** Cover is chosen explicitly now (Bìa hình = one of the Studio's own
 * photos, Bìa da = a plain material) rather than always defaulting to
 * the first upload — so if that photo was also picked as cover it's
 * pulled out of the body queue to avoid showing it twice. */
export function buildAlbumBook(photos: DemoPhoto[], singleMode: boolean, cover: CoverSpec): AlbumBook {
  const bodyPhotos = cover.kind === "photo" ? photos.filter((p) => p.id !== cover.photo.id) : photos;
  return { cover, pages: buildFlipPages(bodyPhotos, singleMode) };
}
