import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 02 — DARK CINEMATIC (BOOKS_VIEW_TEMPLATES/template-02-*.md,
 * visual-reference-4.png "AB STUDIO"). Full-bleed dark hero photo with a
 * bottom-left text block, charcoal background throughout, white outline
 * CTA, small captioned album grid — cinematic, premium, high contrast. */
export function DarkCinematicWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  return (
    <div className="tpl-web-dark">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jost:wght@400;600;700&family=Manrope:wght@400;500&display=swap"
      />
      <style>{`
        .tpl-web-dark { background: #0e0e0f; color: #f3f1ec; font-family: "Manrope", sans-serif; }
        .tpl-web-dark .dc-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(14,14,15,0.85); backdrop-filter: blur(6px);
          border-bottom: 1px solid #232326;
        }
        .tpl-web-dark .dc-brand { display: flex; align-items: center; gap: 10px; }
        .tpl-web-dark .dc-brand img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .tpl-web-dark .dc-brand span { font-family: "Jost", sans-serif; font-weight: 700; font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; }
        .tpl-web-dark .dc-nav { display: flex; gap: 26px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
        .tpl-web-dark .dc-nav a { color: #cfcac0; text-decoration: none; }
        .tpl-web-dark .dc-nav a:hover { color: #fff; }
        .tpl-web-dark .dc-hero {
          position: relative; min-height: 86vh; display: flex; align-items: flex-end;
          padding: 56px 48px; background-size: cover; background-position: center;
        }
        .tpl-web-dark .dc-hero::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 85%);
        }
        .tpl-web-dark .dc-hero-inner { position: relative; z-index: 1; max-width: 620px; }
        .tpl-web-dark .dc-hero h1 {
          font-family: "Jost", sans-serif; font-weight: 700; text-transform: uppercase;
          font-size: clamp(32px, 5vw, 56px); line-height: 1.08; margin: 0 0 16px;
        }
        .tpl-web-dark .dc-hero p { font-size: 15px; color: #d8d4cb; max-width: 440px; margin: 0 0 26px; line-height: 1.7; }
        .tpl-web-dark .dc-cta {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1.5px solid #f3f1ec; color: #f3f1ec; background: transparent;
          font-size: 13px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          padding: 13px 28px; border-radius: 999px; text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .tpl-web-dark .dc-cta:hover { background: #f3f1ec; color: #0e0e0f; }

        .tpl-web-dark .dc-section { padding: 84px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-dark .dc-section-head { text-align: center; margin-bottom: 42px; }
        .tpl-web-dark .dc-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8f8a7f; font-weight: 700; }
        .tpl-web-dark .dc-section-head h2 { font-family: "Jost", sans-serif; font-weight: 700; font-size: 28px; margin: 10px 0 0; text-transform: uppercase; }

        .tpl-web-dark .dc-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
        .tpl-web-dark .dc-grid img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; filter: grayscale(0.1) brightness(0.92); }

        .tpl-web-dark .dc-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
        .tpl-web-dark .dc-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-dark .dc-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #1c1c1e; margin-bottom: 12px; }
        .tpl-web-dark .dc-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.35s ease; }
        .tpl-web-dark .dc-album-card:hover img { transform: scale(1.06); }
        .tpl-web-dark .dc-album-card h3 { font-family: "Jost", sans-serif; font-size: 15px; font-weight: 600; margin: 0 0 2px; }
        .tpl-web-dark .dc-album-card p { font-size: 12px; color: #8f8a7f; margin: 0; }

        .tpl-web-dark .dc-about { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .tpl-web-dark .dc-about h2 { font-family: "Jost", sans-serif; font-weight: 700; font-size: 26px; margin: 0 0 16px; text-transform: uppercase; }
        .tpl-web-dark .dc-about p { font-size: 15px; color: #cfcac0; line-height: 1.8; margin: 0; }
        .tpl-web-dark .dc-about img { width: 100%; aspect-ratio: 4/3; object-fit: cover; filter: grayscale(0.3); }

        .tpl-web-dark .dc-pricing { display: flex; flex-direction: column; gap: 12px; max-width: 720px; margin: 0 auto; }
        .tpl-web-dark .dc-plan { border: 1px solid #232326; border-radius: 8px; overflow: hidden; background: #17171a; }
        .tpl-web-dark .dc-plan-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; }
        .tpl-web-dark .dc-plan-name { font-family: "Jost", sans-serif; font-size: 14px; font-weight: 600; }
        .tpl-web-dark .dc-plan-price { display: flex; align-items: baseline; gap: 12px; }
        .tpl-web-dark .dc-plan-price strong { font-family: "Jost", sans-serif; font-size: 17px; color: #f3f1ec; }
        .tpl-web-dark .dc-plan-price span { font-size: 11px; color: #8f8a7f; }
        .tpl-web-dark .dc-plan-head svg { color: #8f8a7f; transition: transform 0.2s ease; flex-shrink: 0; }
        .tpl-web-dark .dc-plan.open .dc-plan-head svg { transform: rotate(180deg); }
        .tpl-web-dark .dc-plan-body { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
        .tpl-web-dark .dc-plan.open .dc-plan-body { max-height: 320px; }
        .tpl-web-dark .dc-plan-body-inner { padding: 0 20px 18px; }
        .tpl-web-dark .dc-plan-body p { font-size: 13px; color: #b5b0a6; line-height: 1.7; margin: 0 0 10px; }
        .tpl-web-dark .dc-plan-body ul { margin: 0; padding-left: 18px; font-size: 13px; color: #cfcac0; line-height: 1.9; }

        .tpl-web-dark .dc-contact { background: #050506; padding: 56px 48px 28px; }
        .tpl-web-dark .dc-contact-grid { max-width: 1240px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 32px; padding-bottom: 28px; }
        .tpl-web-dark .dc-contact-grid h3 { font-family: "Jost", sans-serif; font-weight: 700; font-size: 14px; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.06em; }
        .tpl-web-dark .dc-contact-grid p { font-size: 13px; color: #8f8a7f; margin: 0 0 8px; }
        .tpl-web-dark .dc-contact-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #cfcac0; margin-bottom: 8px; }
        .tpl-web-dark .dc-contact-row svg { color: #8f8a7f; flex-shrink: 0; }
        .tpl-web-dark .dc-footer-bottom { max-width: 1240px; margin: 0 auto; border-top: 1px solid #232326; padding-top: 18px; text-align: center; font-size: 11px; color: #6b665c; }

        @media (max-width: 900px) {
          .tpl-web-dark .dc-header, .tpl-web-dark .dc-hero, .tpl-web-dark .dc-section, .tpl-web-dark .dc-contact { padding-left: 20px; padding-right: 20px; }
          .tpl-web-dark .dc-nav { display: none; }
          .tpl-web-dark .dc-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-dark .dc-about { grid-template-columns: 1fr; }
          .tpl-web-dark .dc-contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="dc-header">
        <div className="dc-brand">
          {studio.logoUrl && <img src={studio.logoUrl} alt={studio.name} />}
          <span>{studio.name}</span>
        </div>
        <nav className="dc-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="dc-hero" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : { background: "linear-gradient(160deg,#2a2a2e,#0e0e0f)" }}>
        <div className="dc-hero-inner">
          <h1>{studio.name}</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="dc-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
      </section>

      {showPortfolio && (
        <section className="dc-section" id="portfolio" style={{ padding: "84px 0" }}>
          <div className="dc-section-head">
            <span className="dc-eyebrow">Album mới nhất</span>
            <h2>Portfolio nổi bật</h2>
          </div>
          <div className="dc-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="dc-section" id="albums">
          <div className="dc-section-head">
            <span className="dc-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="dc-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="dc-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="dc-section dc-about" id="about">
          <div>
            <span className="dc-eyebrow">Về chúng tôi</span>
            <h2>{studio.name}</h2>
            <p>{studio.description}</p>
          </div>
          {featuredPhotos[0] && <img src={featuredPhotos[0]} alt="" />}
        </section>
      )}

      {showPricing && (
        <section className="dc-section" id="pricing">
          <div className="dc-section-head">
            <span className="dc-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="dc-pricing">
            {pricingPlans.map((plan) => {
              const open = openPlan === plan.id;
              return (
                <div key={plan.id} className={`dc-plan${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="dc-plan-head"
                    onClick={() => setOpenPlan(open ? null : plan.id)}
                  >
                    <span className="dc-plan-name">{plan.name}</span>
                    <div className="dc-plan-price">
                      <strong>{plan.price}</strong>
                      {plan.unit && <span>{plan.unit}</span>}
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div className="dc-plan-body">
                    <div className="dc-plan-body-inner">
                      {plan.description && <p>{plan.description}</p>}
                      {plan.features.length > 0 && (
                        <ul>
                          {plan.features.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {showContact && (
        <footer className="dc-contact" id="contact">
          <div className="dc-contact-grid">
            <div>
              <h3>{studio.name}</h3>
              <p>Wedding &amp; Cinematic Photography</p>
            </div>
            <div>
              <h3>Liên hệ</h3>
              {studio.address && (
                <div className="dc-contact-row">
                  <MapPin size={14} />
                  {studio.address}
                </div>
              )}
              {studio.phone && (
                <div className="dc-contact-row">
                  <Phone size={14} />
                  {studio.phone}
                </div>
              )}
              <div className="dc-contact-row">
                <Mail size={14} />
                {studio.email}
              </div>
            </div>
            <div>
              <h3>Album</h3>
              {albums.slice(0, 4).map((a) => (
                <p key={a.id}>{a.name}</p>
              ))}
            </div>
          </div>
          <div className="dc-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
