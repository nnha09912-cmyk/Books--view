import Link from "next/link";
import { footLine, formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function NatureHero({
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
      className="tpl-nature"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(238,232,214,0.72), rgba(238,232,214,0.72))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "FZ Remsen Script";
          src: url("/fonts/FZ-SG-RemsenScript.ttf") format("truetype");
          font-display: swap;
        }
        .tpl-nature {
          position: relative; min-height: calc(100vh - var(--header-h));
          overflow: hidden; background: #eee8d6; font-family: "Mulish", sans-serif;
          display: flex; align-items: center;
        }
        .tpl-nature::before {
          content: ""; position: absolute; inset: 0;
          background:
            radial-gradient(38% 55% at 100% 0%, rgba(74,93,58,0.35), transparent 70%),
            radial-gradient(45% 45% at 0% 100%, rgba(179,98,59,0.22), transparent 70%);
        }
        .tpl-nature .surface {
          position: relative; padding: 60px; max-width: 600px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .tpl-nature .eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #b3623b; font-weight: 600; }
        .tpl-nature h1 { font-family: "FZ Remsen Script", "Fraunces", cursive, serif; font-weight: 400; font-size: 58px; color: #263422; margin: 0; text-wrap: balance; }
        .tpl-nature .date { font-size: 14px; color: #b3623b; font-variant-numeric: tabular-nums; }
        .tpl-nature .desc { font-family: "SF Display Thin", "Mulish", sans-serif; font-size: 16px; line-height: 1.7; color: #45523a; }
        .tpl-nature .cta {
          margin-top: 14px; width: fit-content; padding: 13px 30px; border-radius: 100px;
          background: #4a5d3a; color: #f3f1e4; font-size: 13.5px; text-decoration: none;
        }
        .tpl-nature .foot { margin-top: 4px; font-size: 13px; color: #5c6b4c; }
      `}</style>
      <div className="surface">
        <span className="eyebrow">Our Story</span>
        <h1>{albumName}</h1>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
        <p className="desc">{description ?? "Together, where our story begins."}</p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel}
        </Link>
        <p className="foot">{footLine(expiryDate)}</p>
      </div>
    </div>
  );
}
