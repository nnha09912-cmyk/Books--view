import Link from "next/link";
import { useState } from "react";
import { Camera, Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 08 — VINTAGE FILM (BOOKS_VIEW_TEMPLATES/template-08-*.md,
 * visual-reference-3.png "MEMORY STUDIO"). Cream background, a bordered
 * black & white hero photo, serif headline, filmstrip-style gallery,
 * camera-icon accent in About — nostalgic, timeless, documentary feel. */
export function VintageFilmWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  return (
    <div className="tpl-web-vintage">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Jost:wght@400;500&display=swap"
      />
      <style>{`
        .tpl-web-vintage { background: #f4ede1; color: #3a332a; font-family: "Jost", sans-serif; }
        .tpl-web-vintage img.bw { filter: grayscale(1) contrast(1.05) sepia(0.08); }
        .tpl-web-vintage .vf-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; border-bottom: 1px solid #ddd0ba;
        }
        .tpl-web-vintage .vf-brand { font-family: "Playfair Display", serif; font-weight: 700; font-size: 19px; letter-spacing: 0.02em; }
        .tpl-web-vintage .vf-nav { display: flex; gap: 24px; font-size: 12.5px; color: #6b5f4f; }
        .tpl-web-vintage .vf-nav a { color: inherit; text-decoration: none; }
        .tpl-web-vintage .vf-hero {
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;
          padding: 60px 48px; max-width: 1240px; margin: 0 auto;
        }
        .tpl-web-vintage .vf-hero-frame { border: 10px solid #fff; box-shadow: 0 6px 24px rgba(58,51,42,0.18); aspect-ratio: 4/5; overflow: hidden; }
        .tpl-web-vintage .vf-hero-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-vintage .vf-hero h1 { font-family: "Playfair Display", serif; font-weight: 700; font-size: clamp(30px, 4vw, 44px); line-height: 1.14; margin: 0 0 18px; }
        .tpl-web-vintage .vf-hero p { font-size: 14px; color: #6b5f4f; max-width: 380px; margin: 0 0 26px; line-height: 1.75; }
        .tpl-web-vintage .vf-cta {
          display: inline-flex; align-items: center; gap: 8px; background: transparent; color: #3a332a;
          border: 1.5px solid #3a332a; font-size: 12.5px; font-weight: 600; letter-spacing: 0.03em;
          padding: 12px 26px; text-decoration: none; width: fit-content;
        }
        .tpl-web-vintage .vf-cta:hover { background: #3a332a; color: #f4ede1; }

        .tpl-web-vintage .vf-section { padding: 64px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-vintage .vf-section-head { text-align: center; margin-bottom: 36px; }
        .tpl-web-vintage .vf-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #a1937a; font-weight: 600; }
        .tpl-web-vintage .vf-section-head h2 { font-family: "Playfair Display", serif; font-weight: 700; font-size: 27px; margin: 8px 0 0; }
        .tpl-web-vintage .vf-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; border-top: 6px solid #fff; border-bottom: 6px solid #fff; }
        .tpl-web-vintage .vf-grid img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; }

        .tpl-web-vintage .vf-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-vintage .vf-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-vintage .vf-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #e6dac3; border: 6px solid #fff; box-shadow: 0 3px 10px rgba(58,51,42,0.15); margin-bottom: 12px; }
        .tpl-web-vintage .vf-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-vintage .vf-album-card h3 { font-family: "Playfair Display", serif; font-size: 17px; font-weight: 700; margin: 0 0 2px; }
        .tpl-web-vintage .vf-album-card p { font-size: 12.5px; color: #8a7c65; margin: 0; }

        .tpl-web-vintage .vf-about { display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; }
        .tpl-web-vintage .vf-about p { font-size: 14.5px; color: #5a4f40; line-height: 1.85; max-width: 520px; margin: 0; }
        .tpl-web-vintage .vf-about-icon { width: 88px; height: 88px; border-radius: 50%; background: #e6dac3; display: flex; align-items: center; justify-content: center; color: #8a7c65; flex-shrink: 0; }

        .tpl-web-vintage .vf-pricing { display: flex; flex-direction: column; gap: 12px; max-width: 720px; margin: 0 auto; }
        .tpl-web-vintage .vf-plan { border: 1px solid #ddd0ba; overflow: hidden; background: #fff; }
        .tpl-web-vintage .vf-plan-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 22px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; }
        .tpl-web-vintage .vf-plan-name { font-family: "Playfair Display", serif; font-size: 16px; font-weight: 700; }
        .tpl-web-vintage .vf-plan-price { display: flex; align-items: baseline; gap: 12px; }
        .tpl-web-vintage .vf-plan-price strong { font-family: "Playfair Display", serif; font-size: 18px; }
        .tpl-web-vintage .vf-plan-price span { font-size: 11px; color: #a1937a; }
        .tpl-web-vintage .vf-plan-head svg { color: #a1937a; transition: transform 0.2s ease; flex-shrink: 0; }
        .tpl-web-vintage .vf-plan.open .vf-plan-head svg { transform: rotate(180deg); }
        .tpl-web-vintage .vf-plan-body { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
        .tpl-web-vintage .vf-plan.open .vf-plan-body { max-height: 320px; }
        .tpl-web-vintage .vf-plan-body-inner { padding: 0 22px 18px; }
        .tpl-web-vintage .vf-plan-body p { font-size: 13px; color: #6b5f4f; line-height: 1.7; margin: 0 0 10px; }
        .tpl-web-vintage .vf-plan-body ul { margin: 0; padding-left: 18px; font-size: 13px; color: #5a4f40; line-height: 1.9; }

        .tpl-web-vintage .vf-contact { background: #3a332a; color: #f4ede1; padding: 44px 48px 22px; }
        .tpl-web-vintage .vf-contact-row { display: flex; justify-content: center; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #d9cdb8; margin-bottom: 18px; }
        .tpl-web-vintage .vf-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-vintage .vf-footer-bottom { text-align: center; font-size: 11px; color: #a1937a; border-top: 1px solid #544a3c; padding-top: 16px; }

        @media (max-width: 900px) {
          .tpl-web-vintage .vf-nav { display: none; }
          .tpl-web-vintage .vf-hero { grid-template-columns: 1fr; }
          .tpl-web-vintage .vf-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-vintage .vf-about { grid-template-columns: 1fr; text-align: center; }
          .tpl-web-vintage .vf-about-icon { margin: 0 auto; }
        }
      `}</style>

      <header className="vf-header">
        <div className="vf-brand">{studio.name}</div>
        <nav className="vf-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="vf-hero">
        {(featuredPhotos[0] || studio.cover) && (
          <div className="vf-hero-frame">
            <img className="bw" src={featuredPhotos[0] ?? studio.cover ?? ""} alt="" />
          </div>
        )}
        <div>
          <h1>Timeless Memories, Real Emotions</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="vf-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
      </section>

      {showPortfolio && (
        <section className="vf-section" id="portfolio">
          <div className="vf-section-head">
            <span className="vf-eyebrow">Our Works</span>
            <h2>Tác phẩm nổi bật</h2>
          </div>
          <div className="vf-grid">
            {featuredPhotos.map((url) => (
              <img className="bw" key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="vf-section" id="albums">
          <div className="vf-section-head">
            <span className="vf-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="vf-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="vf-album-card">
                <div className="thumb">{a.coverUrl && <img className="bw" src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="vf-section vf-about" id="about">
          <p>{studio.description}</p>
          <div className="vf-about-icon">
            <Camera size={34} strokeWidth={1.4} />
          </div>
        </section>
      )}

      {showPricing && (
        <section className="vf-section" id="pricing">
          <div className="vf-section-head">
            <span className="vf-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="vf-pricing">
            {pricingPlans.map((plan) => {
              const open = openPlan === plan.id;
              return (
                <div key={plan.id} className={`vf-plan${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="vf-plan-head"
                    onClick={() => setOpenPlan(open ? null : plan.id)}
                  >
                    <span className="vf-plan-name">{plan.name}</span>
                    <div className="vf-plan-price">
                      <strong>{plan.price}</strong>
                      {plan.unit && <span>{plan.unit}</span>}
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div className="vf-plan-body">
                    <div className="vf-plan-body-inner">
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
        <footer className="vf-contact" id="contact">
          <div className="vf-contact-row">
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
          <div className="vf-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
