import Link from "next/link";
import { footLine, formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function RomanticHero({
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
      className="tpl-romantic"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(251,238,238,0.78), rgba(251,238,238,0.78))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "NVN Bellarina";
          src: url("/fonts/NVNBellarina-Regular.ttf") format("truetype");
          font-display: swap;
        }
        .tpl-romantic {
          position: relative; min-height: calc(100vh - var(--header-h));
          overflow: hidden; display: flex; align-items: flex-end;
          background: #fbeeee; font-family: "Jost", sans-serif;
        }
        .tpl-romantic::before {
          content: ""; position: absolute; inset: 0;
          background:
            radial-gradient(60% 50% at 85% 15%, rgba(217,180,143,0.35), transparent 60%),
            radial-gradient(70% 60% at 10% 90%, rgba(201,138,147,0.4), transparent 65%);
        }
        .tpl-romantic .surface {
          position: relative; padding: 64px; max-width: 620px;
          display: flex; flex-direction: column; gap: 12px;
        }
        .tpl-romantic .eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #c98a93; font-weight: 600; }
        .tpl-romantic h1 { font-family: "NVN Bellarina", "Cormorant Garamond", cursive, serif; font-weight: 400; font-size: 64px; color: #4a2b33; margin: 0; text-wrap: balance; }
        .tpl-romantic .date { font-size: 14px; letter-spacing: 0.04em; color: #c98a93; font-variant-numeric: tabular-nums; margin-top: 2px; }
        .tpl-romantic .desc { font-family: "SF Display Thin", "Jost", sans-serif; font-size: 17px; line-height: 1.75; font-weight: 300; color: #7d4f57; }
        .tpl-romantic .cta {
          margin-top: 14px; padding: 12px 0; width: fit-content;
          border-bottom: 1px solid #c98a93; color: #4a2b33;
          font-size: 14px; letter-spacing: 0.05em; text-transform: uppercase; text-decoration: none;
        }
        .tpl-romantic .foot { font-size: 13px; color: #a97984; margin-top: 6px; }
      `}</style>
      <div className="surface">
        <span className="eyebrow">Welcome to our wedding album ♡</span>
        <h1>{albumName}</h1>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
        <p className="desc">{description ?? "Từng khoảnh khắc — từng cảm xúc."}</p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel} →
        </Link>
        <p className="foot">{footLine(expiryDate)}</p>
      </div>
    </div>
  );
}
