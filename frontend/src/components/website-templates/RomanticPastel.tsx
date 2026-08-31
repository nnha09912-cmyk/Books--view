import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 07 — ROMANTIC PASTEL (BOOKS_VIEW_TEMPLATES/template-07-*.md,
 * visual-reference-3.png "LAVIE STUDIO"). Soft blush/cream background,
 * warm serif headline, rounded pink pill CTA — gentle, romantic, airy. */
export function RomanticPastelWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  return (
    <div className="tpl-web-romantic">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Jost:wght@400;500;600&display=swap"
      />
      <style>{`
        .tpl-web-romantic { background: #fdf5f2; color: #4a3835; font-family: "Jost", sans-serif; }
        .tpl-web-romantic .rp-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(253,245,242,0.9); backdrop-filter: blur(6px);
        }
        .tpl-web-romantic .rp-brand { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 20px; letter-spacing: 0.02em; color: #c98a80; }
        .tpl-web-romantic .rp-nav { display: flex; gap: 26px; font-size: 12.5px; color: #7a625d; }
        .tpl-web-romantic .rp-nav a { color: inherit; text-decoration: none; }
        .tpl-web-romantic .rp-nav a:hover { color: #c98a80; }
        .tpl-web-romantic .rp-hero {
          display: grid; grid-template-columns: 1fr 1.15fr; gap: 40px; align-items: center;
          padding: 40px 48px 72px; max-width: 1280px; margin: 0 auto;
        }
        .tpl-web-romantic .rp-hero h1 { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: clamp(34px, 4.6vw, 54px); line-height: 1.08; margin: 0 0 20px; color: #3a2b28; }
        .tpl-web-romantic .rp-hero p { font-size: 14.5px; color: #8a726c; max-width: 380px; margin: 0 0 28px; line-height: 1.75; }
        .tpl-web-romantic .rp-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #e3a89c; color: #fff;
          font-size: 13px; font-weight: 600; padding: 13px 28px; border-radius: 999px; text-decoration: none;
          transition: background 0.2s ease;
        }
        .tpl-web-romantic .rp-cta:hover { background: #d6897a; }
        .tpl-web-romantic .rp-hero-frame { border-radius: 24px 24px 120px 24px; overflow: hidden; aspect-ratio: 4/5; background: #f1ddd6; }
        .tpl-web-romantic .rp-hero-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .tpl-web-romantic .rp-section { padding: 64px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-romantic .rp-section-head { text-align: center; margin-bottom: 40px; }
        .tpl-web-romantic .rp-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c98a80; font-weight: 600; }
        .tpl-web-romantic .rp-section-head h2 { font-family: "Cormorant Garamond", serif; font-weight: 700; font-size: 30px; margin: 8px 0 0; color: #3a2b28; }
        .tpl-web-romantic .rp-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .tpl-web-romantic .rp-grid img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; border-radius: 14px; }

        .tpl-web-romantic .rp-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-romantic .rp-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-romantic .rp-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #f1ddd6; border-radius: 16px; margin-bottom: 12px; }
        .tpl-web-romantic .rp-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-romantic .rp-album-card h3 { font-family: "Cormorant Garamond", serif; font-size: 19px; font-weight: 600; margin: 0 0 2px; }
        .tpl-web-romantic .rp-album-card p { font-size: 12.5px; color: #a08a84; margin: 0; }

        .tpl-web-romantic .rp-about { text-align: center; }
        .tpl-web-romantic .rp-about p { font-size: 15px; line-height: 1.85; color: #6a5450; max-width: 600px; margin: 0 auto; }

        .tpl-web-romantic .rp-pricing { display: flex; flex-direction: column; gap: 12px; max-width: 640px; margin: 0 auto; text-align: left; }
        .tpl-web-romantic .rp-plan { border: 1px solid #f1ddd6; border-radius: 14px; overflow: hidden; background: #fff; }
        .tpl-web-romantic .rp-plan-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 15px 20px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; }
        .tpl-web-romantic .rp-plan-name { font-size: 14px; font-weight: 700; }
        .tpl-web-romantic .rp-plan-price { display: flex; align-items: baseline; gap: 12px; }
        .tpl-web-romantic .rp-plan-price strong { font-family: "Cormorant Garamond", serif; font-size: 18px; color: #c98a80; }
        .tpl-web-romantic .rp-plan-price span { font-size: 11px; color: #a08a84; }
        .tpl-web-romantic .rp-plan-head svg { color: #c98a80; transition: transform 0.2s ease; flex-shrink: 0; }
        .tpl-web-romantic .rp-plan.open .rp-plan-head svg { transform: rotate(180deg); }
        .tpl-web-romantic .rp-plan-body { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
        .tpl-web-romantic .rp-plan.open .rp-plan-body { max-height: 320px; }
        .tpl-web-romantic .rp-plan-body-inner { padding: 0 20px 16px; }
        .tpl-web-romantic .rp-plan-body p { font-size: 13px; color: #8a726c; line-height: 1.7; margin: 0 0 10px; }
        .tpl-web-romantic .rp-plan-body ul { margin: 0; padding-left: 18px; font-size: 13px; color: #6a5450; line-height: 1.9; }

        .tpl-web-romantic .rp-contact { background: #f1ddd6; padding: 44px 48px 22px; }
        .tpl-web-romantic .rp-contact-row { display: flex; justify-content: center; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #6a5450; margin-bottom: 18px; }
        .tpl-web-romantic .rp-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-romantic .rp-footer-bottom { text-align: center; font-size: 11px; color: #9a8580; border-top: 1px solid #e3c9c1; padding-top: 16px; }

        @media (max-width: 900px) {
          .tpl-web-romantic .rp-nav { display: none; }
          .tpl-web-romantic .rp-hero { grid-template-columns: 1fr; padding-top: 8px; }
          .tpl-web-romantic .rp-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <header className="rp-header">
        <div className="rp-brand">{studio.name}</div>
        <nav className="rp-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="rp-hero">
        <div>
          <h1>Capturing Love Stories Beautifully</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="rp-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
        {(featuredPhotos[0] || studio.cover) && (
          <div className="rp-hero-frame">
            <img src={featuredPhotos[0] ?? studio.cover ?? ""} alt="" />
          </div>
        )}
      </section>

      {showPortfolio && (
        <section className="rp-section" id="portfolio">
          <div className="rp-section-head">
            <span className="rp-eyebrow">Featured Galleries</span>
            <h2>Bộ sưu tập nổi bật</h2>
          </div>
          <div className="rp-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="rp-section" id="albums">
          <div className="rp-section-head">
            <span className="rp-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="rp-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="rp-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="rp-section rp-about" id="about">
          <div className="rp-section-head">
            <span className="rp-eyebrow">Về chúng tôi</span>
            <h2>Về {studio.name}</h2>
          </div>
          <p>{studio.description}</p>
        </section>
      )}

      {showPricing && (
        <section className="rp-section" id="pricing">
          <div className="rp-section-head">
            <span className="rp-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="rp-pricing">
            {pricingPlans.map((plan) => {
              const open = openPlan === plan.id;
              return (
                <div key={plan.id} className={`rp-plan${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="rp-plan-head"
                    onClick={() => setOpenPlan(open ? null : plan.id)}
                  >
                    <span className="rp-plan-name">{plan.name}</span>
                    <div className="rp-plan-price">
                      <strong>{plan.price}</strong>
                      {plan.unit && <span>{plan.unit}</span>}
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div className="rp-plan-body">
                    <div className="rp-plan-body-inner">
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
        <footer className="rp-contact" id="contact">
          <div className="rp-contact-row">
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
          <div className="rp-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
