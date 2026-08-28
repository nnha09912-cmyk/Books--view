import Link from "next/link";
import { coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

/** "KỶ YẾU" and the "Thanh xuân rực rỡ" tagline are fixed template
 * identity (like Editorial's "Issue 01" masthead) — albumName carries the
 * class/school line instead (e.g. a studio names the album
 * "12A1 · THPT Nguyễn Du"), and description is the free paragraph. */
export function KyYeuHero({
  albumName,
  description,
  eventDate,
  ctaHref,
  ctaLabel,
  coverPhotoUrl,
  coverPosY,
}: AlbumHeroProps) {
  const year = eventDate ? new Date(eventDate).getFullYear() : null;
  return (
    <div
      className="tpl-kyyeu"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(244,239,225,0.85), rgba(244,239,225,0.85))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Mulish:wght@300;400;700&display=swap"
      />
      <style>{`
        @font-face {
          font-family: "SVN-HC Braga Huis";
          src: url("/fonts/SVN-HC-BragaHuis.otf") format("opentype");
          font-display: swap;
        }
        @font-face {
          font-family: "iCielBC Rostrum";
          src: url("/fonts/iCielBCRostrum-Regular.otf") format("opentype");
          font-display: swap;
        }
        .tpl-kyyeu {
          position: relative; min-height: calc(100vh - var(--header-h));
          background:
            linear-gradient(90deg, rgba(22,41,74,0.04) 1px, transparent 1px) 0 0/22px 22px,
            linear-gradient(rgba(22,41,74,0.04) 1px, transparent 1px) 0 0/22px 22px,
            #f4efe1;
          color: #16294a; font-family: "Mulish", sans-serif;
          display: flex; align-items: center; justify-content: center; padding: 48px;
        }
        .tpl-kyyeu .surface {
          max-width: 560px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
        }
        .tpl-kyyeu .badge {
          background: #e2ac3f; color: #16294a; font-weight: 700; font-size: 11px;
          letter-spacing: 0.06em; text-transform: uppercase; padding: 5px 12px;
          border-radius: 4px; transform: rotate(-2deg); margin-bottom: 10px;
        }
        .tpl-kyyeu h1 {
          font-family: "SVN-HC Braga Huis", "Baloo 2", sans-serif; font-weight: 400; font-size: 72px;
          line-height: 0.95; margin: 0;
        }
        .tpl-kyyeu .sub { font-weight: 800; font-size: 16px; margin-top: 6px; }
        .tpl-kyyeu .mark {
          font-family: "iCielBC Rostrum", cursive; font-size: 22px; color: #d65b4a; margin-top: 4px;
          background: linear-gradient(rgba(226,172,63,0.45) 55%, transparent 55%);
          width: fit-content; padding: 0 4px;
        }
        .tpl-kyyeu .desc { font-family: "SF Display Thin", "Mulish", sans-serif; font-size: 15px; line-height: 1.65; color: #5a6c8c; margin-top: 12px; max-width: 42ch; }
        .tpl-kyyeu .cta {
          margin-top: 18px; padding: 13px 28px; border-radius: 10px; background: #16294a;
          color: #f4efe1; font-weight: 700; font-size: 14px; text-decoration: none;
          display: inline-flex; align-items: center; gap: 8px;
        }
      `}</style>
      <div className="surface">
        {year && <span className="badge">Class of {year}</span>}
        <h1>Kỷ Yếu</h1>
        <p className="sub">{albumName}</p>
        <span className="mark">Thanh xuân rực rỡ</span>
        <p className="desc">
          {description ?? "Cảm ơn vì đã cùng nhau tạo nên những tháng năm đẹp nhất tuổi học trò."}
        </p>
        <Link className="cta" href={ctaHref}>
          📷 {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
