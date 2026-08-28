import Link from "next/link";
import { formatEventDate, coverPhotoStyle } from "./shared";
import type { AlbumHeroProps } from "./types";

export function MinimalHero({
  albumName,
  eventDate,
  ctaHref,
  ctaLabel,
  coverPhotoUrl,
  coverPosY,
}: AlbumHeroProps) {
  return (
    <div
      className="tpl-minimal"
      style={coverPhotoStyle(
        coverPhotoUrl,
        coverPosY,
        "linear-gradient(rgba(250,250,248,0.9), rgba(250,250,248,0.9))"
      )}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500&family=Work+Sans:wght@300;400&display=swap"
      />
      <style>{`
        .tpl-minimal {
          min-height: calc(100vh - var(--header-h));
          background: #fafaf8; color: #1c1c1a; font-family: "Work Sans", sans-serif;
          display: flex; align-items: center; padding: 64px;
        }
        .tpl-minimal .surface { max-width: 480px; display: flex; flex-direction: column; gap: 22px; }
        .tpl-minimal .eyebrow { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #98978f; font-weight: 500; }
        .tpl-minimal h1 { font-family: "Fraunces", Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: -0.01em; margin: 0; text-wrap: balance; }
        .tpl-minimal .date { font-size: 13.5px; color: #4c4c48; font-variant-numeric: tabular-nums; }
        .tpl-minimal .cta {
          margin-top: 8px; width: fit-content; color: #1c1c1a; text-decoration: none;
          font-size: 13.5px; letter-spacing: 0.02em; border-bottom: 1px solid #1c1c1a; padding-bottom: 2px;
        }
      `}</style>
      <div className="surface">
        <h1>{albumName}</h1>
        <span className="eyebrow">Wedding Album</span>
        {formatEventDate(eventDate) && <span className="date">{formatEventDate(eventDate)}</span>}
        <Link className="cta" href={ctaHref}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
