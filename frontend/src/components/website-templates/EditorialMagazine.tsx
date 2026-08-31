import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** TEMPLATE 12 — EDITORIAL MAGAZINE (BOOKS_VIEW_TEMPLATES/template-12-*.md,
 * visual-reference-3.png the unnamed "MAISON STUDIO"-style card). Huge
 * black magazine headline, a numbered editorial list of Albums (01/02/03…)
 * instead of a plain grid, big monogram letter accent — fashion-editorial. */
export function EditorialMagazineWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;
  const [openPlan, setOpenPlan] = useState<string | null>(null);
  const monogram = studio.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="tpl-web-editorial">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;800;900&family=Jost:wght@400;500&display=swap" />
      <style>{`
        .tpl-web-editorial { background: #f6f4f0; color: #171613; font-family: "Jost", sans-serif; }
        .tpl-web-editorial .em-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; border-bottom: 1px solid #1717131a;
        }
        .tpl-web-editorial .em-brand { font-weight: 800; font-size: 15px; letter-spacing: 0.02em; }
        .tpl-web-editorial .em-nav { display: flex; gap: 24px; font-size: 12px; color: #4a4844; letter-spacing: 0.02em; }
        .tpl-web-editorial .em-nav a { color: inherit; text-decoration: none; }
        .tpl-web-editorial .em-nav a:hover { color: #171613; }
        .tpl-web-editorial .em-hero { padding: 56px 48px 40px; max-width: 1280px; margin: 0 auto; }
        .tpl-web-editorial .em-hero-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; margin-bottom: 32px; }
        .tpl-web-editorial .em-hero h1 { font-family: "Archivo", sans-serif; font-weight: 900; font-size: clamp(46px, 8vw, 96px); line-height: 0.94; margin: 0; letter-spacing: -0.01em; }
        .tpl-web-editorial .em-hero-tag { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: #7a776e; text-align: right; max-width: 160px; }
        .tpl-web-editorial .em-hero-row { display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: end; }
        .tpl-web-editorial .em-hero-photo { aspect-ratio: 16/10; overflow: hidden; background: #ded9cd; }
        .tpl-web-editorial .em-hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-editorial .em-hero-desc p { font-size: 14px; color: #4a4844; line-height: 1.8; margin: 0 0 22px; }
        .tpl-web-editorial .em-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #171613; color: #f6f4f0;
          font-size: 12.5px; font-weight: 600; letter-spacing: 0.03em; padding: 12px 26px; text-decoration: none;
        }
        .tpl-web-editorial .em-cta:hover { background: #37352e; }

        .tpl-web-editorial .em-section { padding: 64px 48px; max-width: 1280px; margin: 0 auto; border-top: 1px solid #1717131a; }
        .tpl-web-editorial .em-section-head { margin-bottom: 36px; }
        .tpl-web-editorial .em-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #a09c8e; font-weight: 600; }
        .tpl-web-editorial .em-section-head h2 { font-family: "Archivo", sans-serif; font-weight: 800; font-size: 24px; margin: 8px 0 0; }

        .tpl-web-editorial .em-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .tpl-web-editorial .em-list-item { text-decoration: none; color: inherit; display: block; }
        .tpl-web-editorial .em-list-num { font-family: "Archivo", sans-serif; font-weight: 900; font-size: 34px; color: #d8d4c8; margin-bottom: 10px; }
        .tpl-web-editorial .em-list-item .thumb { width: 100%; aspect-ratio: 3/4; overflow: hidden; background: #ded9cd; margin-bottom: 12px; }
        .tpl-web-editorial .em-list-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-editorial .em-list-item h3 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; margin: 0 0 2px; }
        .tpl-web-editorial .em-list-item p { font-size: 11.5px; color: #8a8678; margin: 0; text-transform: uppercase; letter-spacing: 0.03em; }

        .tpl-web-editorial .em-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .tpl-web-editorial .em-grid img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; }

        .tpl-web-editorial .em-about { display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; }
        .tpl-web-editorial .em-about p { font-size: 14.5px; color: #4a4844; line-height: 1.85; max-width: 540px; margin: 0; }
        .tpl-web-editorial .em-monogram { font-family: "Archivo", sans-serif; font-weight: 900; font-size: 96px; line-height: 1; color: #171613; }

        .tpl-web-editorial .em-pricing { display: flex; flex-direction: column; gap: 12px; max-width: 720px; }
        .tpl-web-editorial .em-plan { border: 1px solid #1717131a; overflow: hidden; background: #fff; }
        .tpl-web-editorial .em-plan-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; }
        .tpl-web-editorial .em-plan-name { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
        .tpl-web-editorial .em-plan-price { display: flex; align-items: baseline; gap: 12px; }
        .tpl-web-editorial .em-plan-price strong { font-family: "Archivo", sans-serif; font-weight: 900; font-size: 17px; }
        .tpl-web-editorial .em-plan-price span { font-size: 11px; color: #a09c8e; }
        .tpl-web-editorial .em-plan-head svg { color: #a09c8e; transition: transform 0.2s ease; flex-shrink: 0; }
        .tpl-web-editorial .em-plan.open .em-plan-head svg { transform: rotate(180deg); }
        .tpl-web-editorial .em-plan-body { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
        .tpl-web-editorial .em-plan.open .em-plan-body { max-height: 320px; }
        .tpl-web-editorial .em-plan-body-inner { padding: 0 20px 18px; }
        .tpl-web-editorial .em-plan-body p { font-size: 13px; color: #4a4844; line-height: 1.7; margin: 0 0 10px; }
        .tpl-web-editorial .em-plan-body ul { margin: 0; padding-left: 18px; font-size: 13px; color: #302e29; line-height: 1.9; }

        .tpl-web-editorial .em-contact { background: #171613; color: #f6f4f0; padding: 44px 48px 22px; }
        .tpl-web-editorial .em-contact-row { display: flex; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #c8c5bb; margin-bottom: 18px; }
        .tpl-web-editorial .em-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-editorial .em-footer-bottom { font-size: 11px; color: #7a776e; }

        @media (max-width: 900px) {
          .tpl-web-editorial .em-nav { display: none; }
          .tpl-web-editorial .em-hero-row { grid-template-columns: 1fr; }
          .tpl-web-editorial .em-list, .tpl-web-editorial .em-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-editorial .em-about { grid-template-columns: 1fr; text-align: center; }
          .tpl-web-editorial .em-monogram { margin: 0 auto; }
        }
      `}</style>

      <header className="em-header">
        <div className="em-brand">{studio.name}</div>
        <nav className="em-nav">
          {showAlbums && <a href="#albums">Album</a>}
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAbout && <a href="#about">About</a>}
          {showContact && <a href="#contact">Contact</a>}
        </nav>
      </header>

      <section className="em-hero">
        <div className="em-hero-top">
          <h1>Wedding Stories</h1>
          <div className="em-hero-tag">For Modern Romantics — Editorial Photography</div>
        </div>
        <div className="em-hero-row">
          {(featuredPhotos[0] || studio.cover) && (
            <div className="em-hero-photo">
              <img src={featuredPhotos[0] ?? studio.cover ?? ""} alt="" />
            </div>
          )}
          <div className="em-hero-desc">
            {studio.description && <p>{studio.description}</p>}
            {showPortfolio && (
              <a className="em-cta" href="#portfolio">
                Xem Portfolio
              </a>
            )}
          </div>
        </div>
      </section>

      {showAlbums && (
        <section className="em-section" id="albums">
          <div className="em-section-head">
            <span className="em-eyebrow">Collections</span>
            <h2>Album</h2>
          </div>
          <div className="em-list">
            {albums.map((a, i) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="em-list-item">
                <div className="em-list-num">{pad(i + 1)}</div>
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showPortfolio && (
        <section className="em-section" id="portfolio">
          <div className="em-section-head">
            <span className="em-eyebrow">Portfolio</span>
            <h2>Tác phẩm nổi bật</h2>
          </div>
          <div className="em-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="em-section em-about" id="about">
          <div>
            <span className="em-eyebrow">About {studio.name}</span>
            <p style={{ marginTop: 16 }}>{studio.description}</p>
          </div>
          <div className="em-monogram">{monogram}</div>
        </section>
      )}

      {showPricing && (
        <section className="em-section" id="pricing">
          <div className="em-section-head">
            <span className="em-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="em-pricing">
            {pricingPlans.map((plan) => {
              const open = openPlan === plan.id;
              return (
                <div key={plan.id} className={`em-plan${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="em-plan-head"
                    onClick={() => setOpenPlan(open ? null : plan.id)}
                  >
                    <span className="em-plan-name">{plan.name}</span>
                    <div className="em-plan-price">
                      <strong>{plan.price}</strong>
                      {plan.unit && <span>{plan.unit}</span>}
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div className="em-plan-body">
                    <div className="em-plan-body-inner">
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
        <footer className="em-contact" id="contact">
          <div className="em-contact-row">
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
          <div className="em-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
