import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Check, ChevronDown, ChevronUp, Camera, Printer, Gift, ShieldAlert, CornerDownRight } from "lucide-react";
import type { WebsiteTemplateProps, WebsitePricingPlanData } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

function RwPricingCard({ plan, showCta }: { plan: WebsitePricingPlanData; showCta: boolean }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    plan.features.length > 0 || plan.printProducts.length > 0 || plan.gifts.length > 0 || plan.notes.length > 0;
  return (
    <div className="rw-plan-card">
      <h3>{plan.name}</h3>
      <div className="rw-plan-card-price">
        <strong>{plan.price}</strong>
        {plan.unit && <span>{plan.unit}</span>}
      </div>
      {plan.tagline && <p className="rw-plan-tagline">&quot;{plan.tagline}&quot;</p>}
      {plan.description && (
        <div className="rw-plan-desc">
          <span className="rw-plan-desc-label">
            <Camera size={13} /> Dịch vụ
          </span>
          <p>{plan.description}</p>
        </div>
      )}
      {showCta && (
        <a className="rw-cta" href="#contact" style={{ justifyContent: "center" }}>
          Tư vấn ngay
        </a>
      )}
      {hasDetails && (
        <>
          <button type="button" className="rw-plan-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="rw-plan-details">
              {plan.features.length > 0 && (
                <ul className="rw-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.printProducts.length > 0 && (
                <div className="rw-plan-sub">
                  <span className="rw-plan-sub-label">
                    <Printer size={13} /> Sản phẩm in
                  </span>
                  <ul>
                    {plan.printProducts.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.gifts.length > 0 && (
                <div className="rw-plan-sub">
                  <span className="rw-plan-sub-label">
                    <Gift size={13} /> Quà tặng
                  </span>
                  <ul>
                    {plan.gifts.map((g) => (
                      <li key={g}>
                        <CornerDownRight size={12} />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {plan.notes.length > 0 && (
                <div className="rw-plan-sub">
                  <span className="rw-plan-sub-label">
                    <ShieldAlert size={13} /> Lưu ý
                  </span>
                  <ul>
                    {plan.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** TEMPLATE 11 — RUSTIC & WARM (BOOKS_VIEW_TEMPLATES/template-11-*.md,
 * visual-reference-3.png "TERRA STUDIO"). Full-bleed warm sepia hero photo
 * with a dark gradient, italic script-style headline, earthy amber CTA —
 * golden-hour, natural, countryside feel. */
export function RusticWarmWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;

  return (
    <div className="tpl-web-rustic">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600&family=Jost:wght@400;500;600&display=swap"
      />
      <style>{`
        .tpl-web-rustic { background: #f7f0e6; color: #3d2f22; font-family: "Jost", sans-serif; }
        .tpl-web-rustic .rw-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(247,240,230,0.9); backdrop-filter: blur(6px);
        }
        .tpl-web-rustic .rw-brand { font-weight: 600; font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; }
        .tpl-web-rustic .rw-nav { display: flex; gap: 26px; font-size: 12.5px; color: #7a6650; }
        .tpl-web-rustic .rw-nav a { color: inherit; text-decoration: none; }
        .tpl-web-rustic .rw-hero {
          position: relative; min-height: 86vh; display: flex; align-items: center;
          padding: 56px 48px; background-size: cover; background-position: center; background-color: #6b5236;
        }
        .tpl-web-rustic .rw-hero::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(30,20,10,0.6) 0%, rgba(30,20,10,0.15) 60%); }
        .tpl-web-rustic .rw-hero-inner { position: relative; z-index: 1; max-width: 480px; color: #fbf3e6; }
        .tpl-web-rustic .rw-hero h1 { font-family: "Cormorant Garamond", serif; font-style: italic; font-weight: 600; font-size: clamp(32px, 4.6vw, 52px); line-height: 1.14; margin: 0 0 18px; }
        .tpl-web-rustic .rw-hero p { font-size: 14px; color: #e8dcc8; max-width: 380px; margin: 0 0 26px; line-height: 1.7; }
        .tpl-web-rustic .rw-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #c17a44; color: #fff;
          font-size: 13px; font-weight: 600; padding: 13px 28px; text-decoration: none;
          transition: background 0.2s ease;
        }
        .tpl-web-rustic .rw-cta:hover { background: #a8632f; }

        .tpl-web-rustic .rw-section { padding: 72px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-rustic .rw-section-head { text-align: center; margin-bottom: 40px; }
        .tpl-web-rustic .rw-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #ad8656; font-weight: 600; }
        .tpl-web-rustic .rw-section-head h2 { font-weight: 600; font-size: 26px; margin: 8px 0 0; }
        .tpl-web-rustic .rw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .tpl-web-rustic .rw-grid img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; }

        .tpl-web-rustic .rw-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-rustic .rw-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-rustic .rw-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #e8dcc8; margin-bottom: 12px; }
        .tpl-web-rustic .rw-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-rustic .rw-album-card h3 { font-size: 15px; font-weight: 600; margin: 0 0 2px; }
        .tpl-web-rustic .rw-album-card p { font-size: 12.5px; color: #8a7458; margin: 0; }

        .tpl-web-rustic .rw-about { text-align: center; }
        .tpl-web-rustic .rw-about p { font-size: 15px; color: #5a4a38; line-height: 1.85; max-width: 600px; margin: 0 auto; }

        .tpl-web-rustic .rw-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tpl-web-rustic .rw-plan-card { border: 1px solid #e8dcc8; border-radius: 8px; padding: 28px 24px; background: #fff; display: flex; flex-direction: column; text-align: left; }
        .tpl-web-rustic .rw-plan-card h3 { font-size: 15px; font-weight: 700; margin: 0 0 10px; }
        .tpl-web-rustic .rw-plan-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .tpl-web-rustic .rw-plan-card-price strong { font-size: 24px; color: #c17a44; }
        .tpl-web-rustic .rw-plan-card-price span { font-size: 12px; color: #8a7458; }
        .tpl-web-rustic .rw-plan-tagline { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 15px; color: #7a6650; margin: 0 0 14px; }
        .tpl-web-rustic .rw-plan-desc { margin: 0 0 14px; }
        .tpl-web-rustic .rw-plan-desc-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #ad8656; margin-bottom: 6px; }
        .tpl-web-rustic .rw-plan-desc p { font-size: 13px; color: #7a6650; line-height: 1.7; margin: 0; }
        .tpl-web-rustic .rw-plan-toggle { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 12px 0 0; margin-top: auto; font-size: 12.5px; font-weight: 600; color: #c17a44; cursor: pointer; font-family: inherit; }
        .tpl-web-rustic .rw-plan-details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #e8dcc8; display: flex; flex-direction: column; gap: 16px; }
        .tpl-web-rustic .rw-plan-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tpl-web-rustic .rw-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #5a4a38; line-height: 1.5; }
        .tpl-web-rustic .rw-plan-features svg { color: #c17a44; flex-shrink: 0; margin-top: 2px; }
        .tpl-web-rustic .rw-plan-sub-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #ad8656; margin-bottom: 8px; }
        .tpl-web-rustic .rw-plan-sub ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .tpl-web-rustic .rw-plan-sub ul li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #5a4a38; line-height: 1.5; }
        .tpl-web-rustic .rw-plan-sub ul li svg { flex-shrink: 0; margin-top: 2px; color: #8a7458; }

        .tpl-web-rustic .rw-contact { background: #3d2f22; color: #f7f0e6; padding: 44px 48px 22px; }
        .tpl-web-rustic .rw-contact-row { display: flex; justify-content: center; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #d9c6ab; margin-bottom: 18px; }
        .tpl-web-rustic .rw-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-rustic .rw-footer-bottom { text-align: center; font-size: 11px; color: #ad8656; border-top: 1px solid #5a4a38; padding-top: 16px; }

        @media (max-width: 900px) {
          .tpl-web-rustic .rw-nav { display: none; }
          .tpl-web-rustic .rw-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <header className="rw-header">
        <div className="rw-brand">{studio.name}</div>
        <nav className="rw-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="rw-hero" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined}>
        <div className="rw-hero-inner">
          <h1>Natural Love, Beautiful Life</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="rw-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
      </section>

      {showPortfolio && (
        <section className="rw-section" id="portfolio">
          <div className="rw-section-head">
            <span className="rw-eyebrow">Galleries</span>
            <h2>Bộ sưu tập nổi bật</h2>
          </div>
          <div className="rw-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="rw-section" id="albums">
          <div className="rw-section-head">
            <span className="rw-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="rw-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="rw-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="rw-section rw-about" id="about">
          <div className="rw-section-head">
            <span className="rw-eyebrow">Về chúng tôi</span>
            <h2>Về {studio.name}</h2>
          </div>
          <p>{studio.description}</p>
        </section>
      )}

      {showPricing && (
        <section className="rw-section" id="pricing">
          <div className="rw-section-head">
            <span className="rw-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="rw-pricing">
            {pricingPlans.map((plan) => (
              <RwPricingCard key={plan.id} plan={plan} showCta={showContact} />
            ))}
          </div>
        </section>
      )}

      {showContact && (
        <footer className="rw-contact" id="contact">
          <div className="rw-contact-row">
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
          <div className="rw-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
