import Link from "next/link";
import { useState } from "react";
import { Phone, Mail, MapPin, ChevronDown } from "lucide-react";
import type { WebsiteTemplateProps } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

/** TEMPLATE 15 — YEARBOOK / KỶ YẾU (BOOKS_VIEW_TEMPLATES/template-15-*.md,
 * visual-reference-2.png "YEARBOOK STUDIO"). Light sky-blue background,
 * playful headline, Albums shown as class collections ("Lớp học"), an
 * extra "Bộ ảnh mới nhất" strip from featuredPhotos — youthful, energetic. */
export function YearbookWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;
  const [openPlan, setOpenPlan] = useState<string | null>(null);
  const latest = featuredPhotos.slice(0, 4);

  return (
    <div className="tpl-web-yearbook">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Jost:wght@400;500;600&display=swap" />
      <style>{`
        .tpl-web-yearbook { background: #eaf3fb; color: #1e2b3a; font-family: "Jost", sans-serif; }
        .tpl-web-yearbook .yb-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; background: #fff; border-bottom: 1px solid #dbe8f5;
        }
        .tpl-web-yearbook .yb-brand { font-family: "Baloo 2", sans-serif; font-weight: 700; font-size: 17px; color: #1f4e8c; }
        .tpl-web-yearbook .yb-nav { display: flex; gap: 24px; font-size: 12.5px; color: #4a5d73; }
        .tpl-web-yearbook .yb-nav a { color: inherit; text-decoration: none; }
        .tpl-web-yearbook .yb-hero {
          display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; align-items: center;
          padding: 56px 48px; max-width: 1280px; margin: 0 auto;
        }
        .tpl-web-yearbook .yb-hero h1 { font-family: "Baloo 2", sans-serif; font-weight: 800; font-size: clamp(32px, 4.6vw, 50px); line-height: 1.08; margin: 0 0 18px; color: #1f4e8c; }
        .tpl-web-yearbook .yb-hero p { font-size: 14px; color: #4a5d73; max-width: 380px; margin: 0 0 26px; line-height: 1.7; }
        .tpl-web-yearbook .yb-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #1f4e8c; color: #fff;
          font-size: 13px; font-weight: 700; padding: 13px 28px; border-radius: 10px; text-decoration: none;
          transition: background 0.2s ease;
        }
        .tpl-web-yearbook .yb-cta:hover { background: #163c6e; }
        .tpl-web-yearbook .yb-hero-photo { border-radius: 20px; overflow: hidden; aspect-ratio: 16/11; background: #cfe0f2; }
        .tpl-web-yearbook .yb-hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .tpl-web-yearbook .yb-section { padding: 60px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-yearbook .yb-section-head { text-align: center; margin-bottom: 36px; }
        .tpl-web-yearbook .yb-eyebrow { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #6a97c8; font-weight: 700; }
        .tpl-web-yearbook .yb-section-head h2 { font-family: "Baloo 2", sans-serif; font-weight: 700; font-size: 24px; margin: 8px 0 0; color: #1f4e8c; }

        .tpl-web-yearbook .yb-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 20px; }
        .tpl-web-yearbook .yb-album-card { text-decoration: none; color: inherit; display: block; background: #fff; border-radius: 14px; padding: 10px; box-shadow: 0 2px 10px rgba(31,78,140,0.08); }
        .tpl-web-yearbook .yb-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; border-radius: 10px; background: #cfe0f2; margin-bottom: 10px; }
        .tpl-web-yearbook .yb-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-yearbook .yb-album-card h3 { font-size: 14.5px; font-weight: 700; margin: 0 4px 2px; }
        .tpl-web-yearbook .yb-album-card p { font-size: 12px; color: #7a8a9c; margin: 0 4px; }

        .tpl-web-yearbook .yb-about { display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; background: #fff; border-radius: 20px; padding: 40px; }
        .tpl-web-yearbook .yb-about p { font-size: 14.5px; color: #4a5d73; line-height: 1.85; max-width: 480px; margin: 0 0 18px; }
        .tpl-web-yearbook .yb-polaroid { width: 120px; aspect-ratio: 4/5; background: #fff; border: 6px solid #fff; box-shadow: 0 4px 16px rgba(31,78,140,0.16); transform: rotate(-4deg); overflow: hidden; }
        .tpl-web-yearbook .yb-polaroid img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-yearbook .yb-polaroid.two { transform: rotate(5deg); margin-left: -32px; margin-top: 24px; }
        .tpl-web-yearbook .yb-polaroids { display: flex; }

        .tpl-web-yearbook .yb-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .tpl-web-yearbook .yb-grid img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; border-radius: 12px; }

        .tpl-web-yearbook .yb-pricing { display: flex; flex-direction: column; gap: 12px; max-width: 640px; margin: 0 auto; text-align: left; }
        .tpl-web-yearbook .yb-plan { border: none; border-radius: 14px; overflow: hidden; background: #fff; box-shadow: 0 2px 10px rgba(31,78,140,0.08); }
        .tpl-web-yearbook .yb-plan-head { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 15px 20px; background: transparent; border: none; cursor: pointer; text-align: left; font-family: inherit; color: inherit; }
        .tpl-web-yearbook .yb-plan-name { font-size: 14px; font-weight: 700; }
        .tpl-web-yearbook .yb-plan-price { display: flex; align-items: baseline; gap: 12px; }
        .tpl-web-yearbook .yb-plan-price strong { font-family: "Baloo 2", sans-serif; font-size: 17px; color: #1f4e8c; }
        .tpl-web-yearbook .yb-plan-price span { font-size: 11px; color: #7a8a9c; }
        .tpl-web-yearbook .yb-plan-head svg { color: #6a97c8; transition: transform 0.2s ease; flex-shrink: 0; }
        .tpl-web-yearbook .yb-plan.open .yb-plan-head svg { transform: rotate(180deg); }
        .tpl-web-yearbook .yb-plan-body { max-height: 0; overflow: hidden; transition: max-height 0.25s ease; }
        .tpl-web-yearbook .yb-plan.open .yb-plan-body { max-height: 320px; }
        .tpl-web-yearbook .yb-plan-body-inner { padding: 0 20px 16px; }
        .tpl-web-yearbook .yb-plan-body p { font-size: 13px; color: #4a5d73; line-height: 1.7; margin: 0 0 10px; }
        .tpl-web-yearbook .yb-plan-body ul { margin: 0; padding-left: 18px; font-size: 13px; color: #1e2b3a; line-height: 1.9; }

        .tpl-web-yearbook .yb-contact { background: #fff; border-top: 1px solid #dbe8f5; padding: 40px 48px 20px; }
        .tpl-web-yearbook .yb-contact-row { display: flex; justify-content: center; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #4a5d73; margin-bottom: 16px; }
        .tpl-web-yearbook .yb-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-yearbook .yb-footer-bottom { text-align: center; font-size: 11px; color: #8a9bad; }

        @media (max-width: 900px) {
          .tpl-web-yearbook .yb-nav { display: none; }
          .tpl-web-yearbook .yb-hero { grid-template-columns: 1fr; }
          .tpl-web-yearbook .yb-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-yearbook .yb-about { grid-template-columns: 1fr; text-align: center; }
          .tpl-web-yearbook .yb-polaroids { justify-content: center; margin-top: 20px; }
        }
      `}</style>

      <header className="yb-header">
        <div className="yb-brand">{studio.name}</div>
        <nav className="yb-nav">
          {showAlbums && <a href="#albums">Album</a>}
          {showPortfolio && <a href="#portfolio">Ảnh mới</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="yb-hero">
        <div>
          <h1>Thanh xuân rực rỡ</h1>
          <p>{studio.description ?? "Kỷ yếu — Thanh xuân đáng nhớ."}</p>
          {showAlbums && (
            <a className="yb-cta" href="#albums">
              Xem Album
            </a>
          )}
        </div>
        {(featuredPhotos[0] || studio.cover) && (
          <div className="yb-hero-photo">
            <img src={featuredPhotos[0] ?? studio.cover ?? ""} alt="" />
          </div>
        )}
      </section>

      {showAlbums && (
        <section className="yb-section" id="albums">
          <div className="yb-section-head">
            <span className="yb-eyebrow">Collections</span>
            <h2>Album nổi bật</h2>
          </div>
          <div className="yb-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="yb-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="yb-section" id="about">
          <div className="yb-about">
            <div>
              <span className="yb-eyebrow">Về chúng tôi</span>
              <p style={{ marginTop: 14 }}>{studio.description}</p>
            </div>
            {featuredPhotos.length > 0 && (
              <div className="yb-polaroids">
                <div className="yb-polaroid">
                  <img src={featuredPhotos[0]} alt="" />
                </div>
                {featuredPhotos[1] && (
                  <div className="yb-polaroid two">
                    <img src={featuredPhotos[1]} alt="" />
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {latest.length > 0 && (
        <section className="yb-section" id="portfolio">
          <div className="yb-section-head">
            <span className="yb-eyebrow">Bộ ảnh mới nhất</span>
            <h2>Ảnh mới cập nhật</h2>
          </div>
          <div className="yb-grid">
            {latest.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showPricing && (
        <section className="yb-section" id="pricing">
          <div className="yb-section-head">
            <span className="yb-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="yb-pricing">
            {pricingPlans.map((plan) => {
              const open = openPlan === plan.id;
              return (
                <div key={plan.id} className={`yb-plan${open ? " open" : ""}`}>
                  <button
                    type="button"
                    className="yb-plan-head"
                    onClick={() => setOpenPlan(open ? null : plan.id)}
                  >
                    <span className="yb-plan-name">{plan.name}</span>
                    <div className="yb-plan-price">
                      <strong>{plan.price}</strong>
                      {plan.unit && <span>{plan.unit}</span>}
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div className="yb-plan-body">
                    <div className="yb-plan-body-inner">
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
        <footer className="yb-contact" id="contact">
          <div className="yb-contact-row">
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
          <div className="yb-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
