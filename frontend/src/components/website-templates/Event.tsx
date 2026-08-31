import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, MapPin, Sparkles, Video, Radio, Film, ChevronDown } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 16 — EVENT / SỰ KIỆN (BOOKS_VIEW_TEMPLATES/template-16-*.md,
 * visual-reference-2.png "EVENT STUDIO"). Black + gold, cinematic
 * full-bleed hero, Albums shown as "Sự kiện nổi bật" cards, a static
 * services row (per the reference's own icon set) — corporate/event feel. */
export function EventWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;
  const [openPlan, setOpenPlan] = useState<string | null>(null);

  return (
    <div className="tpl-web-event">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap" />
      <style>{`
        .tpl-web-event { background: #0c0c0c; color: #f2ede0; font-family: "Jost", sans-serif; }
        .tpl-web-event .ev-accent { color: #c9a154; }
        .tpl-web-event .ev-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; border-bottom: 1px solid #221f16;
        }
        .tpl-web-event .ev-brand { font-weight: 700; font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; }
        .tpl-web-event .ev-nav { display: flex; gap: 24px; font-size: 12px; color: #a89f8a; letter-spacing: 0.03em; }
        .tpl-web-event .ev-nav a { color: inherit; text-decoration: none; }
        .tpl-web-event .ev-nav a:hover { color: #f2ede0; }
        .tpl-web-event .ev-hero {
          position: relative; min-height: 78vh; display: flex; align-items: center;
          padding: 56px 48px; background-size: cover; background-position: center; background-color: #1a1a1a;
        }
        .tpl-web-event .ev-hero::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(6,6,6,0.82) 0%, rgba(6,6,6,0.25) 65%); }
        .tpl-web-event .ev-hero-inner { position: relative; z-index: 1; max-width: 500px; }
        .tpl-web-event .ev-hero h1 { font-weight: 700; font-size: clamp(32px, 4.8vw, 52px); line-height: 1.06; margin: 0 0 18px; text-transform: uppercase; }
        .tpl-web-event .ev-hero p { font-size: 14px; color: #cfc7b3; max-width: 400px; margin: 0 0 26px; }
        .tpl-web-event .ev-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #c9a154; color: #17140c;
          font-size: 13px; font-weight: 700; padding: 13px 28px; text-decoration: none;
          transition: background 0.2s ease;
        }
        .tpl-web-event .ev-cta:hover { background: #b38a3e; }

        .tpl-web-event .ev-section { padding: 68px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-event .ev-section-head { text-align: center; margin-bottom: 40px; }
        .tpl-web-event .ev-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c9a154; font-weight: 700; }
        .tpl-web-event .ev-section-head h2 { font-weight: 700; font-size: 26px; margin: 8px 0 0; text-transform: uppercase; }

        .tpl-web-event .ev-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 22px; }
        .tpl-web-event .ev-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-event .ev-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #1a1a1a; margin-bottom: 12px; }
        .tpl-web-event .ev-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-event .ev-album-card h3 { font-size: 14.5px; font-weight: 700; margin: 0 0 2px; text-transform: uppercase; }
        .tpl-web-event .ev-album-card p { font-size: 12px; color: #a89f8a; margin: 0; }

        .tpl-web-event .ev-services { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .tpl-web-event .ev-service { text-align: center; }
        .tpl-web-event .ev-service svg { color: #c9a154; margin-bottom: 12px; }
        .tpl-web-event .ev-service h4 { font-size: 13.5px; font-weight: 700; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.03em; }
        .tpl-web-event .ev-service p { font-size: 12px; color: #a89f8a; margin: 0; line-height: 1.6; }

        .tpl-web-event .ev-banner {
          background: #17140c; padding: 56px 48px; text-align: center; border-top: 1px solid #221f16; border-bottom: 1px solid #221f16;
        }
        .tpl-web-event .ev-banner h3 { font-size: 24px; font-weight: 700; margin: 0 0 14px; text-transform: uppercase; }
        .tpl-web-event .ev-banner p { font-size: 14px; color: #a89f8a; margin: 0 0 22px; }

        .tpl-web-event .ev-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .tpl-web-event .ev-grid img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; }

        .tpl-web-event .ev-about p { font-size: 15px; color: #cfc7b3; line-height: 1.85; max-width: 640px; margin: 0 auto; text-align: center; }

        .tpl-web-event .ev-pricing { display: flex; flex-direction: column; gap: 12px; max-width: 720px; margin: 0 auto; }
        .tpl-web-event .ev-plan { border: 1px solid #221f16; overflow: hidden; background: #141310; }
        .tpl-web-event .ev-plan-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; }
        .tpl-web-event .ev-plan-name { font-size: 14px; font-weight: 700; }
        .tpl-web-event .ev-plan-price { display: flex; align-items: baseline; gap: 12px; }
        .tpl-web-event .ev-plan-price strong { font-size: 17px; color: #c9a154; }
        .tpl-web-event .ev-plan-price span { font-size: 11px; color: #a89f8a; }
        .tpl-web-event .ev-plan-head svg { color: #a89f8a; transition: transform 0.2s ease; flex-shrink: 0; }
        .tpl-web-event .ev-plan.open .ev-plan-head svg { transform: rotate(180deg); }
        .tpl-web-event .ev-plan-body { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
        .tpl-web-event .ev-plan.open .ev-plan-body { max-height: 320px; }
        .tpl-web-event .ev-plan-body-inner { padding: 0 20px 18px; }
        .tpl-web-event .ev-plan-body p { font-size: 13px; color: #a89f8a; line-height: 1.7; margin: 0 0 10px; }
        .tpl-web-event .ev-plan-body ul { margin: 0; padding-left: 18px; font-size: 13px; color: #cfc7b3; line-height: 1.9; }

        .tpl-web-event .ev-contact { background: #050505; padding: 44px 48px 22px; }
        .tpl-web-event .ev-contact-row { display: flex; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #a89f8a; margin-bottom: 18px; }
        .tpl-web-event .ev-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-event .ev-footer-bottom { font-size: 11px; color: #6b6250; }

        @media (max-width: 900px) {
          .tpl-web-event .ev-nav { display: none; }
          .tpl-web-event .ev-services { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-event .ev-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>

      <header className="ev-header">
        <div className="ev-brand">{studio.name}</div>
        <nav className="ev-nav">
          {showAlbums && <a href="#albums">Sự kiện</a>}
          <a href="#services">Dịch vụ</a>
          {showPortfolio && <a href="#portfolio">Gallery</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="ev-hero" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined}>
        <div className="ev-hero-inner">
          <h1>We Capture Your Moments</h1>
          <p>{studio.description ?? "Lưu giữ cảm xúc — Kết nối khoảnh khắc."}</p>
          {showAlbums && (
            <a className="ev-cta" href="#albums">
              Khám Phá Ngay
            </a>
          )}
        </div>
      </section>

      {showAlbums && (
        <section className="ev-section" id="albums">
          <div className="ev-section-head">
            <span className="ev-eyebrow">Portfolio</span>
            <h2>Sự kiện nổi bật</h2>
          </div>
          <div className="ev-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="ev-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="ev-section" id="services">
        <div className="ev-section-head">
          <span className="ev-eyebrow">What We Do</span>
          <h2>Dịch vụ của chúng tôi</h2>
        </div>
        <div className="ev-services">
          <div className="ev-service">
            <Sparkles size={26} strokeWidth={1.4} />
            <h4>Chụp ảnh sự kiện</h4>
            <p>Ghi lại mọi khoảnh khắc trọn vẹn</p>
          </div>
          <div className="ev-service">
            <Video size={26} strokeWidth={1.4} />
            <h4>Quay phim sự kiện</h4>
            <p>Video cinematic chuyên nghiệp</p>
          </div>
          <div className="ev-service">
            <Radio size={26} strokeWidth={1.4} />
            <h4>Livestream</h4>
            <p>Livestream chất lượng cao ổn định</p>
          </div>
          <div className="ev-service">
            <Film size={26} strokeWidth={1.4} />
            <h4>Hậu kỳ chuyên nghiệp</h4>
            <p>Chỉnh sửa ảnh, video theo yêu cầu</p>
          </div>
        </div>
      </section>

      {showAbout && (
        <section className="ev-banner">
          <h3>
            Mỗi sự kiện là <span className="ev-accent">một câu chuyện</span>
          </h3>
          <p>{studio.description}</p>
        </section>
      )}

      {showPortfolio && (
        <section className="ev-section" id="portfolio">
          <div className="ev-section-head">
            <span className="ev-eyebrow">Gallery</span>
            <h2>Hình ảnh mới nhất</h2>
          </div>
          <div className="ev-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showPricing && (
        <section className="ev-section" id="pricing">
          <div className="ev-section-head">
            <span className="ev-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="ev-pricing">
            {pricingPlans.map((plan) => {
              const open = openPlan === plan.id;
              return (
                <div key={plan.id} className={`ev-plan${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="ev-plan-head"
                    onClick={() => setOpenPlan(open ? null : plan.id)}
                  >
                    <span className="ev-plan-name">{plan.name}</span>
                    <div className="ev-plan-price">
                      <strong>{plan.price}</strong>
                      {plan.unit && <span>{plan.unit}</span>}
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div className="ev-plan-body">
                    <div className="ev-plan-body-inner">
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
        <footer className="ev-contact" id="contact">
          <div className="ev-contact-row">
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
          <div className="ev-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
