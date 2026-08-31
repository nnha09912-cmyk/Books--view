import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 10 — CLEAN MINIMAL (BOOKS_VIEW_TEMPLATES/template-10-*.md,
 * visual-reference-3.png "PURE STUDIO"). Near-white background, centered
 * hero copy over a faint full-bleed photo, grey outline CTA, plain grid
 * gallery — the quietest, least ornamented template of the set. */
export function CleanMinimalWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  return (
    <div className="tpl-web-clean">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600&display=swap" />
      <style>{`
        .tpl-web-clean { background: #fafafa; color: #2a2a2a; font-family: "Jost", sans-serif; }
        .tpl-web-clean .cm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; border-bottom: 1px solid #ececec;
        }
        .tpl-web-clean .cm-brand { font-weight: 600; font-size: 15px; letter-spacing: 0.1em; text-transform: uppercase; }
        .tpl-web-clean .cm-nav { display: flex; gap: 26px; font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; color: #7a7a7a; }
        .tpl-web-clean .cm-nav a { color: inherit; text-decoration: none; }
        .tpl-web-clean .cm-nav a:hover { color: #2a2a2a; }
        .tpl-web-clean .cm-hero {
          position: relative; min-height: 66vh; display: flex; align-items: center; justify-content: center;
          text-align: center; background-size: cover; background-position: center; background-color: #efefef;
        }
        .tpl-web-clean .cm-hero::before { content: ""; position: absolute; inset: 0; background: rgba(250,250,250,0.72); }
        .tpl-web-clean .cm-hero-inner { position: relative; z-index: 1; max-width: 520px; padding: 0 24px; }
        .tpl-web-clean .cm-hero h1 { font-weight: 600; font-size: clamp(28px, 4vw, 42px); line-height: 1.2; margin: 0 0 14px; letter-spacing: -0.01em; }
        .tpl-web-clean .cm-hero p { font-size: 13.5px; color: #6a6a6a; margin: 0 0 26px; }
        .tpl-web-clean .cm-cta {
          display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #2a2a2a;
          border: 1px solid #c4c4c4; font-size: 12.5px; font-weight: 500; letter-spacing: 0.04em;
          padding: 12px 26px; text-decoration: none;
        }
        .tpl-web-clean .cm-cta:hover { border-color: #2a2a2a; }

        .tpl-web-clean .cm-section { padding: 72px 48px; max-width: 1200px; margin: 0 auto; }
        .tpl-web-clean .cm-section-head { text-align: center; margin-bottom: 40px; }
        .tpl-web-clean .cm-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #a0a0a0; font-weight: 500; }
        .tpl-web-clean .cm-section-head h2 { font-weight: 500; font-size: 24px; margin: 8px 0 0; letter-spacing: -0.01em; }
        .tpl-web-clean .cm-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .tpl-web-clean .cm-grid img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; }

        .tpl-web-clean .cm-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-clean .cm-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-clean .cm-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #efefef; margin-bottom: 12px; }
        .tpl-web-clean .cm-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-clean .cm-album-card h3 { font-size: 14.5px; font-weight: 500; margin: 0 0 2px; }
        .tpl-web-clean .cm-album-card p { font-size: 12px; color: #9a9a9a; margin: 0; }

        .tpl-web-clean .cm-about { text-align: center; }
        .tpl-web-clean .cm-about p { font-size: 14.5px; color: #5a5a5a; line-height: 1.85; max-width: 560px; margin: 0 auto 26px; }
        .tpl-web-clean .cm-outline-btn {
          display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #2a2a2a;
          border: 1px solid #c4c4c4; font-size: 12.5px; font-weight: 500; letter-spacing: 0.04em;
          padding: 11px 24px; text-decoration: none;
        }

        .tpl-web-clean .cm-pricing { display: flex; flex-direction: column; gap: 12px; max-width: 640px; margin: 0 auto; text-align: left; }
        .tpl-web-clean .cm-plan { border: 1px solid #e2e2e2; overflow: hidden; background: #fff; }
        .tpl-web-clean .cm-plan-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 15px 20px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; }
        .tpl-web-clean .cm-plan-name { font-size: 13.5px; font-weight: 600; }
        .tpl-web-clean .cm-plan-price { display: flex; align-items: baseline; gap: 12px; }
        .tpl-web-clean .cm-plan-price strong { font-size: 16px; font-weight: 600; }
        .tpl-web-clean .cm-plan-price span { font-size: 11px; color: #a0a0a0; }
        .tpl-web-clean .cm-plan-head svg { color: #a0a0a0; transition: transform 0.2s ease; flex-shrink: 0; }
        .tpl-web-clean .cm-plan.open .cm-plan-head svg { transform: rotate(180deg); }
        .tpl-web-clean .cm-plan-body { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
        .tpl-web-clean .cm-plan.open .cm-plan-body { max-height: 320px; }
        .tpl-web-clean .cm-plan-body-inner { padding: 0 20px 16px; }
        .tpl-web-clean .cm-plan-body p { font-size: 13px; color: #6a6a6a; line-height: 1.7; margin: 0 0 10px; }
        .tpl-web-clean .cm-plan-body ul { margin: 0; padding-left: 18px; font-size: 13px; color: #5a5a5a; line-height: 1.9; }

        .tpl-web-clean .cm-contact { background: #f2f2f2; padding: 40px 48px 20px; }
        .tpl-web-clean .cm-contact-row { display: flex; justify-content: center; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #6a6a6a; margin-bottom: 16px; }
        .tpl-web-clean .cm-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-clean .cm-footer-bottom { text-align: center; font-size: 11px; color: #9a9a9a; border-top: 1px solid #e2e2e2; padding-top: 14px; }

        @media (max-width: 900px) {
          .tpl-web-clean .cm-nav { display: none; }
          .tpl-web-clean .cm-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <header className="cm-header">
        <div className="cm-brand">{studio.name}</div>
        <nav className="cm-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">About</a>}
          {showContact && <a href="#contact">Contact</a>}
        </nav>
      </header>

      <section className="cm-hero" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined}>
        <div className="cm-hero-inner">
          <h1>Pure Moments, True Stories</h1>
          <p>{studio.description ?? "Minimal. Natural. Timeless."}</p>
          {showPortfolio && (
            <a className="cm-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
      </section>

      {showPortfolio && (
        <section className="cm-section" id="portfolio">
          <div className="cm-section-head">
            <span className="cm-eyebrow">Wedding Galleries</span>
            <h2>Portfolio</h2>
          </div>
          <div className="cm-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="cm-section" id="albums">
          <div className="cm-section-head">
            <span className="cm-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="cm-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="cm-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="cm-section cm-about" id="about">
          <div className="cm-section-head">
            <span className="cm-eyebrow">About</span>
            <h2>{studio.name}</h2>
          </div>
          <p>{studio.description}</p>
          <a className="cm-outline-btn" href="#contact">
            Read More
          </a>
        </section>
      )}

      {showPricing && (
        <section className="cm-section" id="pricing">
          <div className="cm-section-head">
            <span className="cm-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="cm-pricing">
            {pricingPlans.map((plan) => {
              const open = openPlan === plan.id;
              return (
                <div key={plan.id} className={`cm-plan${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="cm-plan-head"
                    onClick={() => setOpenPlan(open ? null : plan.id)}
                  >
                    <span className="cm-plan-name">{plan.name}</span>
                    <div className="cm-plan-price">
                      <strong>{plan.price}</strong>
                      {plan.unit && <span>{plan.unit}</span>}
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div className="cm-plan-body">
                    <div className="cm-plan-body-inner">
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
        <footer className="cm-contact" id="contact">
          <div className="cm-contact-row">
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
          <div className="cm-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
