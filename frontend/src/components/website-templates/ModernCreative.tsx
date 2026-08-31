import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 06 — MODERN & CREATIVE (BOOKS_VIEW_TEMPLATES/template-06-*.md,
 * visual-reference-4.png "KIEN STUDIO"). White/black high-contrast type,
 * an asymmetric bento-style photo grid (mixed tile sizes) instead of a
 * uniform grid, solid black CTA — experimental, commercial, colorful via
 * the photos themselves rather than an accent palette. */
export function ModernCreativeWebsite({ studio, sections, albums, featuredPhotos }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const bento = featuredPhotos.slice(0, 4);

  return (
    <div className="tpl-web-modern">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;900&display=swap" />
      <style>{`
        .tpl-web-modern { background: #fff; color: #0a0a0a; font-family: "Archivo", sans-serif; }
        .tpl-web-modern .mc-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; border-bottom: 3px solid #0a0a0a;
        }
        .tpl-web-modern .mc-brand { font-weight: 900; font-size: 16px; letter-spacing: -0.01em; }
        .tpl-web-modern .mc-nav { display: flex; gap: 24px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .tpl-web-modern .mc-nav a { color: #0a0a0a; text-decoration: none; }
        .tpl-web-modern .mc-hero {
          display: grid; grid-template-columns: 1fr 1.1fr; gap: 32px; align-items: center;
          padding: 56px 48px; max-width: 1280px; margin: 0 auto;
        }
        .tpl-web-modern .mc-hero h1 { font-weight: 900; font-size: clamp(32px, 4.6vw, 52px); line-height: 1.02; margin: 0 0 18px; text-transform: uppercase; }
        .tpl-web-modern .mc-hero p { font-size: 14px; color: #4a4a4a; max-width: 380px; margin: 0 0 24px; }
        .tpl-web-modern .mc-cta {
          display: inline-flex; align-items: center; gap: 6px; background: #0a0a0a; color: #fff;
          font-size: 13px; font-weight: 800; text-transform: uppercase; padding: 13px 24px; text-decoration: none; width: fit-content;
        }
        .tpl-web-modern .mc-bento { display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); gap: 8px; aspect-ratio: 1/1; }
        .tpl-web-modern .mc-bento img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-modern .mc-bento :nth-child(1) { grid-row: span 2; }

        .tpl-web-modern .mc-section { padding: 72px 48px; max-width: 1280px; margin: 0 auto; border-top: 1px solid #e5e5e5; }
        .tpl-web-modern .mc-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 36px; }
        .tpl-web-modern .mc-section-head h2 { font-weight: 900; font-size: 24px; text-transform: uppercase; margin: 0; }
        .tpl-web-modern .mc-eyebrow { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #9a9a9a; font-weight: 700; }
        .tpl-web-modern .mc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .tpl-web-modern .mc-grid img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; }

        .tpl-web-modern .mc-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-modern .mc-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-modern .mc-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #f2f2f2; margin-bottom: 12px; }
        .tpl-web-modern .mc-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-modern .mc-album-card h3 { font-size: 15px; font-weight: 800; margin: 0 0 2px; text-transform: uppercase; }
        .tpl-web-modern .mc-album-card p { font-size: 12px; color: #8a8a8a; margin: 0; }

        .tpl-web-modern .mc-about p { font-size: 15px; color: #333; line-height: 1.8; max-width: 640px; }

        .tpl-web-modern .mc-contact { background: #0a0a0a; color: #fff; padding: 48px 48px 24px; }
        .tpl-web-modern .mc-contact-row { display: flex; gap: 28px; flex-wrap: wrap; font-size: 13px; color: #d0d0d0; margin-bottom: 20px; }
        .tpl-web-modern .mc-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-modern .mc-footer-bottom { font-size: 11px; color: #7a7a7a; }

        @media (max-width: 900px) {
          .tpl-web-modern .mc-nav { display: none; }
          .tpl-web-modern .mc-hero { grid-template-columns: 1fr; }
          .tpl-web-modern .mc-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-modern .mc-header, .tpl-web-modern .mc-section, .tpl-web-modern .mc-contact { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      <header className="mc-header">
        <div className="mc-brand">{studio.name}</div>
        <nav className="mc-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">About</a>}
          {showContact && <a href="#contact">Contact</a>}
        </nav>
      </header>

      <section className="mc-hero">
        <div>
          <h1>Creative Photography Studio</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="mc-cta" href="#portfolio">
              View Portfolio
            </a>
          )}
        </div>
        {bento.length > 0 && (
          <div className="mc-bento">
            {bento.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        )}
      </section>

      {showPortfolio && (
        <section className="mc-section" id="portfolio">
          <div className="mc-section-head">
            <h2>Latest Works</h2>
            <span className="mc-eyebrow">Portfolio</span>
          </div>
          <div className="mc-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="mc-section" id="albums">
          <div className="mc-section-head">
            <h2>Album</h2>
            <span className="mc-eyebrow">Collections</span>
          </div>
          <div className="mc-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="mc-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="mc-section mc-about" id="about">
          <div className="mc-section-head">
            <h2>About {studio.name}</h2>
            <span className="mc-eyebrow">Studio</span>
          </div>
          <p>{studio.description}</p>
        </section>
      )}

      {showContact && (
        <footer className="mc-contact" id="contact">
          <div className="mc-contact-row">
            {studio.address && (
              <span>
                <MapPin size={14} />
                {studio.address}
              </span>
            )}
            {studio.phone && (
              <span>
                <Phone size={14} />
                {studio.phone}
              </span>
            )}
            <span>
              <Mail size={14} />
              {studio.email}
            </span>
          </div>
          <div className="mc-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
