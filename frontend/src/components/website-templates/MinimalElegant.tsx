import Link from "next/link";
import { Phone, Mail, MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

/** A section only renders when there's no explicit WebsiteSection row
 * disabling it — with no Studio Editor yet to create those rows, every
 * template's fixed default section set stays fully visible until one
 * exists (spec: "Template quyết định ... thứ tự / bật/tắt section", but a
 * missing row is not the same as an explicit "off"). */
function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 01 — MINIMAL ELEGANT (BOOKS_VIEW_TEMPLATES/template-01-*.md).
 * Cream + black + yellow/blue accent — "Direction A" from the master
 * spec's locked Design Direction (section 6/37), matching the "1997
 * Studio" visual reference exactly: split hero (headline left, arched
 * photo right with two overlapping accent circles), underlined section
 * eyebrows, a soft-yellow "About" band, dark footer with icon contact
 * rows. Fixed section order: Header → Hero → Portfolio nổi bật → Albums →
 * About Studio → Contact → Footer. */
export function MinimalElegantWebsite({ studio, sections, albums, featuredPhotos }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");

  return (
    <div className="tpl-web-minimal">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Manrope:wght@400;500;700&display=swap"
      />
      <style>{`
        .tpl-web-minimal {
          --wm-yellow: #f2b134;
          --wm-blue: #5b8fd4;
          --wm-cream: #faf6ee;
          --wm-ink: #1a1a1a;
          background: var(--wm-cream);
          color: var(--wm-ink);
          font-family: "Manrope", "Jost", sans-serif;
        }
        .tpl-web-minimal .wm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(250,246,238,0.92); backdrop-filter: blur(6px);
        }
        .tpl-web-minimal .wm-brand { display: flex; align-items: center; gap: 10px; }
        .tpl-web-minimal .wm-brand img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
        .tpl-web-minimal .wm-brand span {
          font-family: "Jost", sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase;
        }
        .tpl-web-minimal .wm-nav { display: flex; align-items: center; gap: 26px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
        .tpl-web-minimal .wm-nav a { color: var(--wm-ink); text-decoration: none; padding-bottom: 4px; border-bottom: 2px solid transparent; }
        .tpl-web-minimal .wm-nav a:hover { border-bottom-color: var(--wm-yellow); }
        .tpl-web-minimal .wm-cta {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--wm-yellow); color: var(--wm-ink); font-weight: 700; font-size: 13px;
          padding: 11px 22px; border-radius: 999px; text-decoration: none; white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tpl-web-minimal .wm-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(0,0,0,0.15); }
        .tpl-web-minimal .wm-cta.outline { background: transparent; border: 1.5px solid var(--wm-ink); }

        .tpl-web-minimal .wm-hero {
          display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 40px;
          padding: 40px 48px 90px; max-width: 1280px; margin: 0 auto;
        }
        .tpl-web-minimal .wm-hero h1 {
          font-family: "Jost", sans-serif; font-weight: 700; text-transform: uppercase;
          font-size: clamp(34px, 4.6vw, 54px); line-height: 1.08; margin: 0 0 18px;
        }
        .tpl-web-minimal .wm-hero-sub {
          display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          padding-bottom: 6px; border-bottom: 3px solid var(--wm-yellow); margin-bottom: 18px;
        }
        .tpl-web-minimal .wm-hero p { font-size: 15px; line-height: 1.7; color: #4a4638; max-width: 420px; margin: 0 0 26px; }
        .tpl-web-minimal .wm-hero-art { position: relative; }
        .tpl-web-minimal .wm-hero-art .frame {
          width: 100%; aspect-ratio: 4/5; border-radius: 260px 260px 0 0;
          background: #ece7dc; background-size: cover; background-position: center;
          position: relative; z-index: 2;
        }
        .tpl-web-minimal .wm-hero-art .dot {
          position: absolute; border-radius: 50%; z-index: 1;
        }
        .tpl-web-minimal .wm-hero-art .dot.yellow { width: 130px; height: 130px; background: var(--wm-yellow); left: -30px; bottom: 40px; }
        .tpl-web-minimal .wm-hero-art .dot.blue { width: 68px; height: 68px; background: var(--wm-blue); left: 30px; bottom: 0; }

        .tpl-web-minimal .wm-section { padding: 80px 48px; max-width: 1280px; margin: 0 auto; }
        .tpl-web-minimal .wm-section-head {
          display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 44px; position: relative;
        }
        .tpl-web-minimal .wm-section-head h2 {
          font-family: "Jost", sans-serif; font-weight: 700; text-transform: uppercase;
          font-size: 13px; letter-spacing: 0.14em; padding-bottom: 8px; border-bottom: 3px solid var(--wm-yellow);
        }
        .tpl-web-minimal .wm-nav-arrows { position: absolute; right: 0; display: flex; gap: 8px; }
        .tpl-web-minimal .wm-nav-arrows button {
          width: 36px; height: 36px; border-radius: 50%; border: 1px solid #ddd3bd; background: #fff;
          display: flex; align-items: center; justify-content: center; cursor: default; color: var(--wm-ink);
        }
        .tpl-web-minimal .wm-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;
        }
        .tpl-web-minimal .wm-grid img {
          width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 14px; display: block;
        }
        .tpl-web-minimal .wm-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 26px; }
        .tpl-web-minimal .wm-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-minimal .wm-album-card .thumb {
          width: 100%; aspect-ratio: 4/3; border-radius: 14px; margin-bottom: 14px; display: block;
          background: #ece7dc; overflow: hidden;
        }
        .tpl-web-minimal .wm-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
        .tpl-web-minimal .wm-album-card:hover img { transform: scale(1.05); }
        .tpl-web-minimal .wm-album-card h3 { font-family: "Jost", sans-serif; font-size: 17px; margin: 0 0 4px; font-weight: 700; }
        .tpl-web-minimal .wm-album-card p { font-size: 13px; color: #8a7f68; margin: 0; }

        .tpl-web-minimal .wm-about-wrap { padding: 0 48px 90px; max-width: 1280px; margin: 0 auto; }
        .tpl-web-minimal .wm-about {
          background: #f7e6bf; border-radius: 28px; padding: 48px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
          position: relative; overflow: visible;
        }
        .tpl-web-minimal .wm-about h2 { font-family: "Jost", sans-serif; font-weight: 700; font-size: 28px; margin: 0 0 14px; text-transform: uppercase; }
        .tpl-web-minimal .wm-about p { font-size: 15px; line-height: 1.8; color: #4a4638; margin: 0 0 22px; }
        .tpl-web-minimal .wm-about-img { position: relative; }
        .tpl-web-minimal .wm-about-img img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 18px; display: block; }
        .tpl-web-minimal .wm-about-img .dot.blue {
          position: absolute; width: 90px; height: 90px; border-radius: 50%; background: var(--wm-blue);
          right: -24px; bottom: -24px; z-index: -1;
        }

        .tpl-web-minimal .wm-contact {
          background: var(--wm-ink); color: #fdfcfa; padding: 56px 48px 28px;
        }
        .tpl-web-minimal .wm-contact-grid {
          max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 32px; padding-bottom: 32px;
        }
        .tpl-web-minimal .wm-contact-grid h3 { font-family: "Jost", sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 10px; text-transform: uppercase; }
        .tpl-web-minimal .wm-contact-grid p { font-size: 13px; color: #b8b2a3; margin: 0 0 14px; line-height: 1.6; }
        .tpl-web-minimal .wm-contact-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #ddd8ca; margin-bottom: 8px; }
        .tpl-web-minimal .wm-contact-row svg { color: var(--wm-yellow); flex-shrink: 0; }
        .tpl-web-minimal .wm-footer-bottom {
          max-width: 1280px; margin: 0 auto; border-top: 1px solid #3a3730; padding-top: 20px;
          text-align: center; font-size: 12px; color: #8a8478;
        }

        @media (max-width: 900px) {
          .tpl-web-minimal .wm-hero { grid-template-columns: 1fr; padding-bottom: 60px; }
          .tpl-web-minimal .wm-nav { display: none; }
          .tpl-web-minimal .wm-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-minimal .wm-about { grid-template-columns: 1fr; }
          .tpl-web-minimal .wm-contact-grid { grid-template-columns: 1fr; }
          .tpl-web-minimal .wm-header, .tpl-web-minimal .wm-section, .tpl-web-minimal .wm-about-wrap, .tpl-web-minimal .wm-contact { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      <header className="wm-header">
        <div className="wm-brand">
          {studio.logoUrl && <img src={studio.logoUrl} alt={studio.name} />}
          <span>{studio.name}</span>
        </div>
        <nav className="wm-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
        {showContact && (
          <a className="wm-cta" href="#contact">
            Tư vấn ngay
          </a>
        )}
      </header>

      <section className="wm-hero">
        <div>
          <span className="wm-hero-sub">Wedding &amp; Portrait Photography</span>
          <h1>{studio.name}</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="wm-cta" href="#portfolio">
              Xem Portfolio <ArrowRight size={15} />
            </a>
          )}
        </div>
        <div className="wm-hero-art">
          <div className="frame" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined} />
          <div className="dot yellow" />
          <div className="dot blue" />
        </div>
      </section>

      {showPortfolio && (
        <section className="wm-section" id="portfolio">
          <div className="wm-section-head">
            <h2>Portfolio nổi bật</h2>
            <div className="wm-nav-arrows">
              <button type="button" aria-hidden>
                <ChevronLeft size={16} />
              </button>
              <button type="button" aria-hidden>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="wm-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="wm-section" id="albums">
          <div className="wm-section-head">
            <h2>Album</h2>
          </div>
          <div className="wm-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="wm-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <div className="wm-about-wrap" id="about">
          <div className="wm-about">
            <div>
              <h2>Về {studio.name}</h2>
              <p>{studio.description}</p>
              {showContact && (
                <a className="wm-cta outline" href="#contact">
                  Tìm hiểu thêm
                </a>
              )}
            </div>
            {featuredPhotos[0] && (
              <div className="wm-about-img">
                <img src={featuredPhotos[0]} alt="" />
                <div className="dot blue" />
              </div>
            )}
          </div>
        </div>
      )}

      {showContact && (
        <footer className="wm-contact" id="contact">
          <div className="wm-contact-grid">
            <div>
              <h3>{studio.name}</h3>
              <p>Wedding &amp; Portrait Photography</p>
            </div>
            <div>
              <h3>Thông tin liên hệ</h3>
              {studio.address && (
                <div className="wm-contact-row">
                  <MapPin size={15} />
                  {studio.address}
                </div>
              )}
              {studio.phone && (
                <div className="wm-contact-row">
                  <Phone size={15} />
                  {studio.phone}
                </div>
              )}
              <div className="wm-contact-row">
                <Mail size={15} />
                {studio.email}
              </div>
            </div>
            <div>
              <h3>Album</h3>
              {albums.slice(0, 4).map((a) => (
                <p key={a.id} style={{ marginBottom: 4 }}>
                  {a.name}
                </p>
              ))}
            </div>
          </div>
          <div className="wm-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
