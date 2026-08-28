import Link from "next/link";
import { formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function EditorialHero({
  albumName,
  description,
  eventDate,
  ctaHref,
  ctaLabel,
  coverPhotoUrl,
  coverPosY,
}: AlbumHeroProps) {
  const [first, ...rest] = albumName.split(" ");
  const second = rest.join(" ");
  return (
    <div
      className="tpl-editorial"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(242,240,234,0.85), rgba(242,240,234,0.85))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "VL Gilroy Light";
          src: url("/fonts/VL-Gilroy-Light.otf") format("opentype");
          font-display: swap;
        }
        .tpl-editorial {
          min-height: calc(100vh - var(--header-h));
          background: #f2f0ea; color: #111; font-family: "Barlow Condensed", sans-serif;
          display: grid; grid-template-columns: 1fr 1.1fr; grid-template-rows: auto 1fr auto;
          gap: 0 40px; padding: 48px;
        }
        .tpl-editorial .masthead {
          grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: baseline;
          border-bottom: 2px solid #111; padding-bottom: 16px;
          text-transform: uppercase; letter-spacing: 0.08em; font-size: 13px; font-weight: 600;
        }
        .tpl-editorial .kicker { color: #ff3b1f; }
        .tpl-editorial .heading-cell { grid-column: 1 / 2; align-self: end; }
        .tpl-editorial h1 {
          font-family: "VL Gilroy Light", "Bodoni Moda", Georgia, sans-serif;
          font-size: clamp(48px, 8vw, 80px); font-weight: 400; line-height: 0.96;
          margin: 28px 0 0; text-wrap: balance;
        }
        .tpl-editorial .date { font-size: 15px; margin-top: 10px; color: #6b6a63; font-variant-numeric: tabular-nums; }
        .tpl-editorial .side {
          grid-column: 2 / 3; align-self: end; display: flex; flex-direction: column; gap: 10px;
          padding-left: 28px; border-left: 1px solid #111;
        }
        .tpl-editorial .side .eyebrow {
          font-family: "Barlow Condensed", sans-serif; font-size: 12px; letter-spacing: 0.1em;
          text-transform: uppercase; color: #6b6a63; font-weight: 600;
        }
        .tpl-editorial .desc { font-family: "SF Display Thin", "Barlow Condensed", sans-serif; font-size: 18px; line-height: 1.5; text-transform: none; letter-spacing: normal; }
        .tpl-editorial .cta {
          color: #ff3b1f; text-transform: uppercase; letter-spacing: 0.06em; font-size: 15px;
          font-weight: 600; text-decoration: none; width: fit-content;
        }
        .tpl-editorial .foot {
          grid-column: 1 / -1; margin-top: 28px; padding-top: 16px; border-top: 1px solid #111;
          text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px; color: #6b6a63;
        }
        @media (max-width: 640px) {
          .tpl-editorial { grid-template-columns: 1fr; }
          .tpl-editorial .heading-cell, .tpl-editorial .side { grid-column: 1 / -1; padding-left: 0; border-left: none; }
        }
      `}</style>
      <div className="masthead">
        <span>Issue 01</span>
        <span className="kicker">The Wedding</span>
      </div>
      <div className="heading-cell">
        <h1>
          {first}
          {second && (
            <>
              <br />
              {second}
            </>
          )}
        </h1>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
      </div>
      <div className="side">
        <span className="eyebrow">A Visual Story</span>
        <p className="desc">
          {description ?? "Khoảnh khắc trong một câu chuyện tình được kể lại bằng ảnh."}
        </p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel} →
        </Link>
      </div>
      <div className="foot">Books View — Wedding Story — Không cần đăng nhập</div>
    </div>
  );
}
