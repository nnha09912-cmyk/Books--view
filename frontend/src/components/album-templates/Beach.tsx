import Link from "next/link";
import { footLine, formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function BeachHero({
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
      className="tpl-beach"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(180deg, rgba(90,59,99,0.75) 0%, rgba(177,83,63,0.65) 42%, rgba(242,130,90,0.55) 62%, rgba(251,196,139,0.55) 78%, rgba(255,227,186,0.6) 100%)"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "Fafo Script";
          src: url("/fonts/FafoScript-Regular.ttf") format("truetype");
          font-display: swap;
        }
        .tpl-beach {
          position: relative; min-height: calc(100vh - var(--header-h));
          overflow: hidden; font-family: "Nunito", sans-serif;
          display: flex; align-items: flex-end; justify-content: center; text-align: center;
          background: linear-gradient(180deg, #5a3b63 0%, #b1533f 42%, #f2825a 62%, #fbc48b 78%, #ffe3ba 100%);
          padding-bottom: 64px;
        }
        .tpl-beach::before {
          content: ""; position: absolute; left: 50%; top: 22%; width: 130px; height: 130px;
          border-radius: 50%; background: #ffe9c7; transform: translate(-50%, -50%);
          box-shadow: 0 0 70px 12px rgba(255,233,199,0.45);
        }
        .tpl-beach::after {
          content: ""; position: absolute; left: 0; right: 0; top: 48%; height: 1px;
          background: rgba(255,255,255,0.3);
        }
        .tpl-beach .surface {
          position: relative; max-width: 560px; display: flex; flex-direction: column; align-items: center; gap: 12px;
          padding: 28px 32px 0; border-radius: 20px;
          background: linear-gradient(180deg, transparent, rgba(42,33,64,0.28) 30%, rgba(42,33,64,0.28));
        }
        .tpl-beach .eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #fff3e4; font-weight: 600; }
        .tpl-beach h1 { font-family: "Fafo Script", "Prata", cursive, serif; font-weight: 400; font-size: 62px; color: #fff3e4; margin: 0; text-shadow: 0 2px 20px rgba(0,0,0,0.25); text-wrap: balance; }
        .tpl-beach .date { font-size: 14px; color: rgba(255,243,228,0.85); font-variant-numeric: tabular-nums; }
        .tpl-beach .desc { font-family: "SF Display Thin", "Nunito", sans-serif; color: rgba(255,243,228,0.9); font-size: 16px; line-height: 1.65; }
        .tpl-beach .cta {
          margin-top: 10px; padding: 13px 34px; border-radius: 100px; text-decoration: none;
          background: rgba(255,255,255,0.16); border: 1px solid rgba(255,255,255,0.6);
          color: #fff3e4; font-size: 14px; backdrop-filter: blur(6px);
        }
        .tpl-beach .foot { color: rgba(255,243,228,0.75); font-size: 13px; margin-top: 4px; }
      `}</style>
      <div className="surface">
        <span className="eyebrow">Our Wedding Story</span>
        <h1>{albumName}</h1>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
        <p className="desc">{description ?? "Love, captured by the sea."}</p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel}
        </Link>
        <p className="foot">{footLine(expiryDate)}</p>
      </div>
    </div>
  );
}
