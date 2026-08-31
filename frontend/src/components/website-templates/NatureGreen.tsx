import Link from "next/link";
import { Phone, Mail, MapPin, Leaf } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 13 — NATURE GREEN (BOOKS_VIEW_TEMPLATES/template-13-*.md,
 * visual-reference-3.png "GREENLIGHT STUDIO"). Deep forest-green
 * background, full-bleed forest hero photo, green pill CTA, leaf-icon
 * accent in About — outdoor, organic, nature-forward weddings. */
export function NatureGreenWebsite({ studio, sections, albums, featuredPhotos }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");

  return (
    <div className="tpl-web-nature">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap" />
      <style>{`
        .tpl-web-nature { background: #14231a; color: #eef2ea; font-family: "Jost", sans-serif; }
        .tpl-web-nature .ng-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(20,35,26,0.9); backdrop-filter: blur(6px);
        }
        .tpl-web-nature .ng-brand { font-weight: 700; font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; }
        .tpl-web-nature .ng-nav { display: flex; gap: 26px; font-size: 12.5px; color: #b9c7b4; }
        .tpl-web-nature .ng-nav a { color: inherit; text-decoration: none; }
        .tpl-web-nature .ng-hero {
          position: relative; min-height: 84vh; display: flex; align-items: center;
          padding: 56px 48px; background-size: cover; background-position: center; background-color: #1e3324;
        }
        .tpl-web-nature .ng-hero::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10,18,12,0.72) 0%, rgba(10,18,12,0.2) 65%); }
        .tpl-web-nature .ng-hero-inner { position: relative; z-index: 1; max-width: 480px; }
        .tpl-web-nature .ng-hero h1 { font-weight: 700; font-size: clamp(30px, 4.4vw, 48px); line-height: 1.12; margin: 0 0 18px; }
        .tpl-web-nature .ng-hero p { font-size: 14px; color: #cdd8c8; max-width: 380px; margin: 0 0 26px; line-height: 1.7; }
        .tpl-web-nature .ng-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #6b9d5e; color: #fff;
          font-size: 13px; font-weight: 600; padding: 13px 28px; border-radius: 999px; text-decoration: none;
          transition: background 0.2s ease;
        }
        .tpl-web-nature .ng-cta:hover { background: #588048; }

        .tpl-web-nature .ng-section { padding: 72px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-nature .ng-section-head { text-align: center; margin-bottom: 40px; }
        .tpl-web-nature .ng-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8fae82; font-weight: 600; }
        .tpl-web-nature .ng-section-head h2 { font-weight: 700; font-size: 26px; margin: 8px 0 0; }
        .tpl-web-nature .ng-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .tpl-web-nature .ng-grid img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; border-radius: 6px; }

        .tpl-web-nature .ng-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-nature .ng-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-nature .ng-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #1e3324; border-radius: 8px; margin-bottom: 12px; }
        .tpl-web-nature .ng-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-nature .ng-album-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 2px; }
        .tpl-web-nature .ng-album-card p { font-size: 12.5px; color: #8fae82; margin: 0; }

        .tpl-web-nature .ng-about { display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: center; }
        .tpl-web-nature .ng-about-icon { width: 72px; height: 72px; border-radius: 50%; background: #1e3324; display: flex; align-items: center; justify-content: center; color: #8fae82; flex-shrink: 0; }
        .tpl-web-nature .ng-about p { font-size: 15px; color: #cdd8c8; line-height: 1.85; max-width: 600px; margin: 0; }

        .tpl-web-nature .ng-contact { background: #0e1a12; padding: 44px 48px 22px; }
        .tpl-web-nature .ng-contact-row { display: flex; justify-content: center; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #b9c7b4; margin-bottom: 18px; }
        .tpl-web-nature .ng-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-nature .ng-footer-bottom { text-align: center; font-size: 11px; color: #6b8560; border-top: 1px solid #23392a; padding-top: 16px; }

        @media (max-width: 900px) {
          .tpl-web-nature .ng-nav { display: none; }
          .tpl-web-nature .ng-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-nature .ng-about { grid-template-columns: 1fr; text-align: center; }
          .tpl-web-nature .ng-about-icon { margin: 0 auto; }
        }
      `}</style>

      <header className="ng-header">
        <div className="ng-brand">{studio.name}</div>
        <nav className="ng-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="ng-hero" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined}>
        <div className="ng-hero-inner">
          <h1>In Nature, Everything Is Beautiful</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="ng-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
      </section>

      {showPortfolio && (
        <section className="ng-section" id="portfolio">
          <div className="ng-section-head">
            <span className="ng-eyebrow">Nature Galleries</span>
            <h2>Bộ sưu tập nổi bật</h2>
          </div>
          <div className="ng-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="ng-section" id="albums">
          <div className="ng-section-head">
            <span className="ng-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="ng-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="ng-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="ng-section ng-about" id="about">
          <div className="ng-about-icon">
            <Leaf size={30} strokeWidth={1.4} />
          </div>
          <p>{studio.description}</p>
        </section>
      )}

      {showContact && (
        <footer className="ng-contact" id="contact">
          <div className="ng-contact-row">
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
          <div className="ng-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
