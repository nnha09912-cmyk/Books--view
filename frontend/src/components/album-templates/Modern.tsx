import Link from "next/link";
import { formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function ModernHero({
  albumName,
  description,
  photoCount,
  eventDate,
  ctaHref,
  ctaLabel,
  coverPhotoUrl,
  coverPosY,
}: AlbumHeroProps) {
  return (
    <div
      className="tpl-modern"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(243,237,225,0.82), rgba(243,237,225,0.82))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800&family=Karla:wght@400;500&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "NVN Harman Western";
          src: url("/fonts/NVNHarman-Western.ttf") format("truetype");
          font-display: swap;
        }
        .tpl-modern {
          position: relative; min-height: calc(100vh - var(--header-h));
          background: #f3ede1; color: #221f1a; font-family: "Karla", sans-serif;
          display: flex; flex-direction: column; justify-content: space-between;
          padding: 48px; gap: 32px; overflow: hidden;
        }
        .tpl-modern::before {
          /* Paper-grain texture — an SVG feTurbulence noise filter tiled
             over the cream ground, kept faint (low opacity) so it reads as
             texture, not visual noise. */
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="180"%3E%3Cfilter id="n"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23n)" opacity="0.5"/%3E%3C/svg%3E');
          opacity: 0.35; mix-blend-mode: multiply;
        }
        .tpl-modern::after {
          content: ""; position: absolute; left: 48px; right: 48px; bottom: 30%; height: 2px; background: #ff4b3e;
        }
        .tpl-modern .top-row { position: relative; display: flex; justify-content: space-between; align-items: flex-start; }
        .tpl-modern .eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #ff4b3e; font-weight: 600; }
        .tpl-modern .index { font-family: "Unbounded", sans-serif; font-size: 13px; color: #8a8378; }
        .tpl-modern h1 {
          position: relative;
          font-family: "NVN Harman Western", "Unbounded", sans-serif; font-weight: 400;
          font-size: clamp(52px, 10vw, 104px);
          line-height: 0.9; letter-spacing: 0; max-width: 12ch; margin: 0; text-wrap: balance;
        }
        .tpl-modern .date {
          font-family: "Unbounded", sans-serif; font-size: 13px; letter-spacing: 0.04em;
          color: #ff4b3e; margin-top: 10px; display: block; font-variant-numeric: tabular-nums;
        }
        .tpl-modern .bottom-row { position: relative; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
        .tpl-modern .desc { font-family: "SF Display Thin", "Karla", sans-serif; font-size: 15px; line-height: 1.6; max-width: 34ch; color: #4a453c; }
        .tpl-modern .cta {
          background: #ff4b3e; color: #f3ede1; padding: 15px 30px; text-decoration: none;
          font-size: 14px; font-weight: 500; letter-spacing: 0.02em; border-radius: 2px; flex-shrink: 0;
        }
      `}</style>
      <div className="top-row">
        <span className="eyebrow">Wedding Album</span>
        <span className="index">{photoCount} ảnh</span>
      </div>
      <div>
        <h1>{albumName}</h1>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
      </div>
      <div className="bottom-row">
        <p className="desc">
          {description ?? "Chọn ảnh yêu thích của anh chị. Không cần cài app, không cần đăng nhập."}
        </p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel} →
        </Link>
      </div>
    </div>
  );
}
