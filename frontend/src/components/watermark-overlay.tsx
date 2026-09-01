import {
  buildWatermarkTileSvg,
  hexToRgba,
  watermarkTileFit,
  watermarkTileSize,
  type WatermarkConfig,
} from "@/lib/watermark-demo";

/** Shared render logic for the watermark demo — used both by the admin
 * "Khung ảnh demo" preview and the real thumbnail overlay in the public
 * gallery, so the two never drift apart. Purely decorative: absolutely
 * positioned, `pointerEvents: none`, meant to sit inside a `position:
 * relative` container the size of one photo/preview tile. Default (no
 * repeat) and "Theo lưới" both render dead straight, on purpose — only
 * "45 độ" tilts anything.
 *
 * posX/posY are a % of the container, not raw px — the demo preview box
 * (~200px) and a real gallery thumbnail (often 300-700px) are wildly
 * different sizes, so a fixed px offset would reach the demo box's edge
 * while barely moving on a real photo, or vice versa. % scales the same
 * way in both. */
export function WatermarkOverlay({ config }: { config: WatermarkConfig }) {
  if (!config.enabled) return null;
  const alpha = Math.max(0, Math.min(1, config.opacity / 100));
  const repeating = config.repeatLevel > 0;

  if (!repeating) {
    if (config.type === "text") {
      return (
        <span
          style={{
            position: "absolute",
            left: `calc(50% + ${config.posX}%)`,
            top: `calc(50% + ${config.posY}%)`,
            transform: "translate(-50%, -50%)",
            fontWeight: 600,
            fontSize: config.fontSize,
            color: hexToRgba(config.textColor, alpha),
            WebkitTextStroke: `0.5px rgba(0,0,0,${(alpha * 0.4).toFixed(2)})`,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {config.text.trim() || "Guikhach.com"}
        </span>
      );
    }
    if (!config.imageDataUrl) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={config.imageDataUrl}
        alt=""
        style={{
          position: "absolute",
          left: `calc(50% + ${config.posX}%)`,
          top: `calc(50% + ${config.posY}%)`,
          transform: "translate(-50%, -50%)",
          width: 56,
          height: "auto",
          opacity: alpha,
          pointerEvents: "none",
        }}
      />
    );
  }

  const fit = watermarkTileFit(config);
  const tile = watermarkTileSize(fit, config.repeatLevel);
  const tileImage =
    config.type === "text"
      ? `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
          buildWatermarkTileSvg(config.text, tile, config.opacity, config.fontSize, config.textColor)
        )}")`
      : config.imageDataUrl
        ? `url("${config.imageDataUrl}")`
        : undefined;
  if (!tileImage) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: config.gripMode === "diagonal" ? "-40%" : 0,
        backgroundImage: tileImage,
        backgroundRepeat: "repeat",
        backgroundSize: `${tile.width}px ${tile.height}px`,
        backgroundPosition: `calc(50% + ${config.posX}%) calc(50% + ${config.posY}%)`,
        transform: config.gripMode === "diagonal" ? "rotate(45deg)" : undefined,
        opacity: config.type === "image" ? alpha : 1,
        pointerEvents: "none",
      }}
    />
  );
}
