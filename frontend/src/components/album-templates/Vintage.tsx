import Link from "next/link";
import { formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function VintageHero({
  albumName,
  description,
  eventDate,
  ctaHref,
  ctaLabel,
  coverPhotoUrl,
  coverPosY,
}: AlbumHeroProps) {
  const stamp = formatEventDate(eventDate) ?? new Date().toLocaleDateString("vi-VN");
  return (
    <div
      className="tpl-vintage"
      style={{
        ...coverPhotoStyle(
          coverPhotoUrl,
          coverPosY,
          "linear-gradient(rgba(233,220,192,0.62), rgba(233,220,192,0.62))"
        ),
        ...(coverPhotoUrl ? { filter: "sepia(0.35)" } : {}),
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Domine:wght@400;700&family=Special+Elite&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "SG85 Hien Khanh";
          src: url("/fonts/SG85-HIENKHANH1.ttf") format("truetype");
          font-display: swap;
        }
        .tpl-vintage {
          min-height: calc(100vh - var(--header-h));
          background: #e9dcc0; font-family: "Domine", Georgia, serif;
          display: flex; align-items: center; justify-content: center; padding: 36px;
        }
        .tpl-vintage .postcard {
          padding: 44px; border: 2px solid #3a2b1e; outline: 6px solid #e9dcc0; outline-offset: -14px;
          max-width: 560px; display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 14px;
        }
        .tpl-vintage .eyebrow {
          font-family: "Special Elite", monospace; font-size: 11px; letter-spacing: 0.12em;
          text-transform: uppercase; color: #7d6a4d;
        }
        .tpl-vintage .stamp {
          font-family: "Special Elite", monospace; font-size: 12px; color: #a13d2c;
          border: 1.5px solid #a13d2c; padding: 4px 10px; transform: rotate(-2deg);
        }
        .tpl-vintage h1 {
          font-family: "SG85 Hien Khanh", "Domine", Georgia, serif; font-weight: 400;
          font-size: 52px; color: #3a2b1e; margin: 0; text-wrap: balance;
        }
        .tpl-vintage .desc { font-family: "SF Display Thin", "Domine", serif; font-size: 15.5px; line-height: 1.7; font-style: italic; color: #5a4632; }
        .tpl-vintage .cta {
          margin-top: 6px; padding: 12px 30px; border: 1.5px solid #3a2b1e; color: #3a2b1e;
          font-family: "Special Elite", monospace; font-size: 12.5px; text-decoration: none;
        }
        .tpl-vintage .foot { font-family: "Special Elite", monospace; font-size: 11px; color: #7d6a4d; }
      `}</style>
      <div className="postcard">
        <span className="eyebrow">Our Wedding</span>
        <h1>{albumName}</h1>
        <span className="stamp">{stamp}</span>
        <p className="desc">{description ?? "A collection of memories"}</p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel}
        </Link>
        <p className="foot">— Books View —</p>
      </div>
    </div>
  );
}
