/** Watermark — a real, persisted feature. `Album.watermarkConfig` (Json
 * column, schema.prisma) is the source of truth: the Settings tab saves it
 * via PATCH /api/albums/:id, and the public gallery reads it back from GET
 * /api/public/album/:linkToken. This module holds the shared shape and the
 * pure tile-sizing math `WatermarkOverlay` needs to render it identically
 * in both places — no I/O of its own. There's still no photo-processing
 * pipeline to burn this into a downloaded/exported file — it's a
 * view-time-only overlay (a deterrent against screenshotting a photo a
 * guest isn't allowed to download), not a way to mark files that leave the
 * app some other way. */

export interface WatermarkConfig {
  enabled: boolean;
  type: "text" | "image";
  text: string;
  /** data: URL, not blob: — blob URLs die with the tab/document that
   * created them, so they can't survive being read back from a different
   * page (Settings tab vs. the public gallery route). */
  imageDataUrl: string | null;
  /** % of the container's width/height, not px — see WatermarkOverlay. */
  posX: number;
  posY: number;
  /** 0 = a single logo/text, no repeat. 1-100 = density once repeating —
   * a continuous slider, not a small set of discrete counts. */
  repeatLevel: number;
  gripMode: "grid" | "diagonal";
  /** 0-100 */
  opacity: number;
  /** px, text watermark only */
  fontSize: number;
  /** hex, e.g. "#ffffff" — text watermark only */
  textColor: string;
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const int = parseInt(full, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  if (Number.isNaN(int)) return `rgba(255,255,255,${alpha.toFixed(2)})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
}

export interface TileFit {
  width: number;
  height: number;
}

/** The text's own TIGHT rendered box, no padding baked in — a repeat tile
 * is this plus a density-controlled gap (see watermarkTileSize), kept
 * separate so the gap number stays exact instead of compounding with a
 * padding that's already inside the fit. Character-width is a rough
 * sans-serif average (~0.6× font size); good enough for a tiling estimate,
 * not real text measurement. */
export function estimateTextTileFit(text: string, fontSize: number): TileFit {
  const label = text.trim() || "Guikhach.com";
  const width = Math.ceil(label.length * fontSize * 0.62);
  const height = Math.ceil(fontSize * 1.2);
  return { width, height };
}

const IMAGE_TILE_FIT: TileFit = { width: 56, height: 56 };

export function watermarkTileFit(config: Pick<WatermarkConfig, "type" | "text" | "fontSize">): TileFit {
  return config.type === "text" ? estimateTextTileFit(config.text, config.fontSize) : IMAGE_TILE_FIT;
}

/** Maps the 0-100 density slider onto a tile size: content box + a gap
 * that shrinks from very spread out (low density — repeats fall mostly
 * outside a small preview frame) down to a tight ~5px between rows at 100%
 * density, regardless of font size. Additive, not a multiplier on the fit —
 * that's what keeps the 100% gap a fixed, predictable number instead of
 * scaling up with font size. Vertical closes down further than horizontal
 * at max density (5px vs 20px) — packing rows this close still reads as
 * separate lines of text, whereas the same horizontal gap would start
 * running words together. */
export function watermarkTileSize(fit: TileFit, repeatLevel: number): TileFit {
  const density = Math.max(0, Math.min(100, repeatLevel)) / 100;
  const maxGap = 240;
  const minGapX = 20;
  const minGapY = 5;
  const gapX = maxGap - density * (maxGap - minGapX);
  const gapY = maxGap - density * (maxGap - minGapY);
  return {
    width: Math.round(fit.width + gapX),
    height: Math.round(fit.height + gapY),
  };
}

/** Repeat tile rendered as an inline SVG data-URI, opacity baked straight
 * into the fill so a tiled text watermark doesn't need a second CSS
 * opacity layered on top. Left un-rotated on purpose — "Theo lưới" must
 * read as a plain straight row/column grid; the diagonal look for "45 độ"
 * comes entirely from rotating the tiled layer itself, not the glyph
 * inside each tile. */
export function buildWatermarkTileSvg(
  text: string,
  tile: TileFit,
  opacity: number,
  fontSize: number,
  textColor: string
): string {
  const label = text.trim() || "Guikhach.com";
  const escaped = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const alpha = Math.max(0, Math.min(1, opacity / 100));
  const strokeAlpha = (alpha * 0.4).toFixed(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tile.width}" height="${tile.height}"><text x="${tile.width / 2}" y="${tile.height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="${fontSize}" font-weight="600" fill="${hexToRgba(textColor, alpha)}" stroke="rgba(0,0,0,${strokeAlpha})" stroke-width="0.6">${escaped}</text></svg>`;
}
