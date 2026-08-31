import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 09 — MOODY DARK (BOOKS_VIEW_TEMPLATES/template-09-*.md,
 * visual-reference-3.png "NOIR STUDIO"). Pure black background, a large
 * moody portrait as hero, small eyebrow + bold headline, outline CTA,
 * a tall feature portrait in the portfolio grid — dramatic, editorial. */
export function MoodyDarkWebsite({ studio, sections, albums, featuredPhotos }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");

  return (
    <div className="tpl-web-moody">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Jost:wght@400;500;600&display=swap" />
      <style>{`
        .tpl-web-moody { background: #050505; color: #ece8e2; font-family: "Jost", sans-serif; }
        .tpl-web-moody .md-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(5,5,5,0.85); backdrop-filter: blur(6px);
        }
        .tpl-web-moody .md-brand { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: 20px; letter-spacing: 0.04em; }
        .tpl-web-moody .md-nav { display: flex; gap: 26px; font-size: 12px; color: #a39d92; letter-spacing: 0.04em; }
        .tpl-web-moody .md-nav a { color: inherit; text-decoration: none; }
        .tpl-web-moody .md-nav a:hover { color: #fff; }
        .tpl-web-moody .md-hero {
          display: grid; grid-template-columns: 1fr 1fr; min-height: 82vh;
        }
        .tpl-web-moody .md-hero-text { display: flex; flex-direction: column; justify-content: center; padding: 48px; }
        .tpl-web-moody .md-eyebrow { font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #8a8378; font-weight: 600; margin-bottom: 14px; }
        .tpl-web-moody .md-hero h1 { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: clamp(34px, 4.8vw, 54px); line-height: 1.08; margin: 0 0 20px; }
        .tpl-web-moody .md-hero p { font-size: 14px; color: #a39d92; max-width: 380px; margin: 0 0 26px; line-height: 1.75; }
        .tpl-web-moody .md-cta {
          display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #ece8e2;
          border: 1.5px solid #4a463d; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em;
          padding: 12px 26px; text-decoration: none; width: fit-content;
        }
        .tpl-web-moody .md-cta:hover { background: #ece8e2; color: #050505; border-color: #ece8e2; }
        .tpl-web-moody .md-hero-img { background-size: cover; background-position: center; background-color: #1a1a1a; filter: grayscale(0.15) brightness(0.85); }

        .tpl-web-moody .md-section { padding: 80px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-moody .md-section-head { margin-bottom: 40px; }
        .tpl-web-moody .md-section-head h2 { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: 28px; margin: 8px 0 0; }
        .tpl-web-moody .md-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 200px; gap: 6px; }
        .tpl-web-moody .md-grid img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(0.15) brightness(0.9); }
        .tpl-web-moody .md-grid :nth-child(1) { grid-row: span 2; }

        .tpl-web-moody .md-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-moody .md-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-moody .md-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #1a1a1a; margin-bottom: 12px; }
        .tpl-web-moody .md-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(0.15) brightness(0.9); }
        .tpl-web-moody .md-album-card h3 { font-family: "Cormorant Garamond", serif; font-size: 18px; font-weight: 600; margin: 0 0 2px; }
        .tpl-web-moody .md-album-card p { font-size: 12px; color: #857f74; margin: 0; }

        .tpl-web-moody .md-about p { font-size: 15px; color: #b8b2a6; line-height: 1.85; max-width: 640px; }

        .tpl-web-moody .md-contact { border-top: 1px solid #1f1e1a; padding: 44px 48px 22px; }
        .tpl-web-moody .md-contact-row { display: flex; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #a39d92; margin-bottom: 18px; }
        .tpl-web-moody .md-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-moody .md-footer-bottom { font-size: 11px; color: #6b665c; }

        @media (max-width: 900px) {
          .tpl-web-moody .md-nav { display: none; }
          .tpl-web-moody .md-hero { grid-template-columns: 1fr; }
          .tpl-web-moody .md-hero-img { min-height: 320px; }
          .tpl-web-moody .md-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 160px; }
        }
      `}</style>

      <header className="md-header">
        <div className="md-brand">{studio.name}</div>
        <nav className="md-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="md-hero">
        <div className="md-hero-text">
          <span className="md-eyebrow">We Capture</span>
          <h1>The Moments You Feel</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="md-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
        <div className="md-hero-img" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined} />
      </section>

      {showPortfolio && (
        <section className="md-section" id="portfolio">
          <div className="md-section-head">
            <span className="md-eyebrow">Selected Stories</span>
            <h2>Portfolio nổi bật</h2>
          </div>
          <div className="md-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="md-section" id="albums">
          <div className="md-section-head">
            <span className="md-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="md-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="md-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="md-section md-about" id="about">
          <div className="md-section-head">
            <span className="md-eyebrow">Về chúng tôi</span>
            <h2>{studio.name}</h2>
          </div>
          <p>{studio.description}</p>
        </section>
      )}

      {showContact && (
        <footer className="md-contact" id="contact">
          <div className="md-contact-row">
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
          <div className="md-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
