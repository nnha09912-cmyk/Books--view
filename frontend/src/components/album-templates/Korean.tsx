import Link from "next/link";
import { formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function KoreanHero({
  albumName,
  description,
  eventDate,
  ctaHref,
  ctaLabel,
  coverPhotoUrl,
  coverPosY,
}: AlbumHeroProps) {
  return (
    <div
      className="tpl-korean"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(255,251,248,0.82), rgba(255,251,248,0.82))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Gowun+Batang&family=Poppins:wght@300;400;500&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "VL Glamy";
          src: url("/fonts/VL-Glamy-Regular.ttf") format("truetype");
          font-display: swap;
        }
        .tpl-korean {
          position: relative; min-height: calc(100vh - var(--header-h));
          overflow: hidden; background: #fffbf8; font-family: "Poppins", sans-serif;
          display: flex; align-items: center; justify-content: center; text-align: center; padding: 60px;
        }
        .tpl-korean::before {
          content: ""; position: absolute; inset: 0;
          background:
            radial-gradient(32% 40% at 15% 20%, rgba(227,161,143,0.35), transparent 70%),
            radial-gradient(30% 36% at 90% 85%, rgba(247,222,210,0.9), transparent 70%);
        }
        .tpl-korean .surface { position: relative; max-width: 460px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .tpl-korean .ring {
          width: 54px; height: 54px; border-radius: 50%; border: 1px solid #e3a18f;
          display: flex; align-items: center; justify-content: center;
          font-family: "Gowun Batang", Georgia, serif; font-size: 14px; color: #e3a18f; margin-bottom: 4px;
        }
        .tpl-korean .eyebrow { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #e3a18f; font-weight: 400; }
        .tpl-korean h1 { font-family: "VL Glamy", "Gowun Batang", cursive, serif; font-size: 42px; font-weight: 400; color: #4a3f3a; margin: 0; text-wrap: balance; }
        .tpl-korean .date { font-size: 13px; color: #e3a18f; font-variant-numeric: tabular-nums; }
        .tpl-korean .desc { font-family: "SF Display Thin", "Poppins", sans-serif; font-size: 14.5px; line-height: 1.9; font-weight: 300; color: #ab8f83; }
        .tpl-korean .cta {
          margin-top: 12px; padding: 12px 32px; border-radius: 100px; text-decoration: none;
          border: 1px solid #e3a18f; color: #4a3f3a; font-size: 13px; letter-spacing: 0.04em; font-weight: 400;
        }
        .tpl-korean .foot { color: #ab8f83; font-weight: 300; font-size: 12.5px; }
      `}</style>
      <div className="surface">
        <div className="ring">♥</div>
        <span className="eyebrow">Our Wedding Day</span>
        <h1>{albumName}</h1>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
        <p className="desc">{description ?? "Thank you for being part of our story."}</p>
        <Link className="cta" href={ctaHref}>
          {ctaLabel}
        </Link>
        <p className="foot">Không cần đăng nhập</p>
      </div>
    </div>
  );
}
