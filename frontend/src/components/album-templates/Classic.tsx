import Link from "next/link";
import { footLine, formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function ClassicHero({
  albumName,
  description,
  expiryDate,
  eventDate,
  ctaHref,
  ctaLabel,
  coverPhotoUrl,
  coverPosY,
}: AlbumHeroProps) {
  return (
    <div
      className="tpl-classic"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(246,242,233,0.8), rgba(246,242,233,0.8))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "BHN Roses Bolero";
          src: url("/fonts/BHN-Roses-Bolero.otf") format("opentype");
          font-display: swap;
        }
        .tpl-classic {
          position: relative; min-height: calc(100vh - var(--header-h));
          display: flex; align-items: center; justify-content: center;
          background: #f6f2e9;
          font-family: "EB Garamond", Georgia, serif;
        }
        .tpl-classic .surface {
          text-align: center; max-width: 560px;
          padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 18px;
        }
        .tpl-classic .eyebrow {
          font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
          color: #7a2e2e; font-weight: 600;
        }
        .tpl-classic .rule { width: 46px; height: 1px; background: #b08d57; }
        .tpl-classic h1 {
          font-family: "BHN Roses Bolero", "Cormorant Garamond", Georgia, serif;
          font-weight: 400; font-size: 56px; color: #262117; margin: 0; text-wrap: balance;
        }
        .tpl-classic .date { font-size: 15px; letter-spacing: 0.06em; color: #7a2e2e; font-variant-numeric: tabular-nums; }
        .tpl-classic .desc { font-family: "SF Display Thin", "EB Garamond", serif; font-size: 17px; line-height: 1.7; color: #4a4638; }
        .tpl-classic .cta {
          margin-top: 6px; padding: 13px 36px; border: 1px solid #7a2e2e; color: #7a2e2e;
          font-size: 14.5px; letter-spacing: 0.03em; text-decoration: none;
        }
        .tpl-classic .foot { font-size: 13px; color: #8a7f68; margin-top: 2px; }
      `}</style>
      <div className="surface">
        <span className="eyebrow">Welcome to our wedding album</span>
        <div className="rule" />
        <h1>{albumName}</h1>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
        <p className="desc">
          {description ?? "Những khoảnh khắc đáng nhớ của ngày đặc biệt."}
        </p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel}
        </Link>
        <p className="foot">{footLine(expiryDate)}</p>
      </div>
    </div>
  );
}
