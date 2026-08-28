import Link from "next/link";
import { footLine, formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function LuxuryHero({
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
      className="tpl-luxury"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(14,12,9,0.68), rgba(14,12,9,0.68))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Marcellus&family=Jost:wght@300;400;500&display=swap"
      />
      <style>{`
        .tpl-luxury {
          position: relative; min-height: calc(100vh - var(--header-h));
          background: #0e0c09; color: #efe6d3; font-family: "Jost", sans-serif;
          display: flex; align-items: center; justify-content: center; padding: 40px;
        }
        .tpl-luxury::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(120% 90% at 50% 0%, rgba(201,162,75,0.14), transparent 60%);
        }
        .tpl-luxury .frame { position: absolute; inset: 28px; border: 1px solid rgba(201,162,75,0.45); pointer-events: none; }
        .tpl-luxury .surface {
          position: relative; text-align: center; max-width: 540px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
        }
        .tpl-luxury .eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #c9a24b; font-weight: 500; }
        .tpl-luxury h1 { font-family: "Marcellus", Georgia, serif; font-size: 44px; letter-spacing: 0.01em; margin: 0; text-wrap: balance; }
        .tpl-luxury .date { font-size: 14px; letter-spacing: 0.08em; color: #c9a24b; font-variant-numeric: tabular-nums; }
        .tpl-luxury .desc { font-family: "SF Display Thin", "Jost", sans-serif; font-size: 15.5px; line-height: 1.8; font-weight: 300; letter-spacing: 0.01em; color: #cbbfa0; }
        .tpl-luxury .cta {
          margin-top: 12px; padding: 15px 44px; background: #c9a24b; color: #0e0c09; text-decoration: none;
          font-size: 12.5px; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600;
        }
        .tpl-luxury .foot { margin-top: 2px; letter-spacing: 0.06em; text-transform: uppercase; font-size: 10.5px; color: #a4906a; }
      `}</style>
      <div className="frame" />
      <div className="surface">
        <span className="eyebrow">The Wedding</span>
        <h1>{albumName}</h1>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
        <p className="desc">{description ?? "A collection of our favorite moments."}</p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel}
        </Link>
        <p className="foot">{footLine(expiryDate)}</p>
      </div>
    </div>
  );
}
