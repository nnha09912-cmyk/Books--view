import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Gem, Users, Heart, Check, ChevronDown, ChevronUp, Camera, Printer, Gift, ShieldAlert, CornerDownRight } from "lucide-react";
import type { WebsiteTemplateProps, WebsitePricingPlanData } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

function LxPricingCard({ plan, showCta }: { plan: WebsitePricingPlanData; showCta: boolean }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    plan.features.length > 0 || plan.printProducts.length > 0 || plan.gifts.length > 0 || plan.notes.length > 0;
  return (
    <div className="lx-plan-card">
      <h3>{plan.name}</h3>
      <div className="lx-plan-card-price">
        <strong>{plan.price}</strong>
        {plan.unit && <span>{plan.unit}</span>}
      </div>
      {plan.tagline && <p className="lx-plan-tagline">&quot;{plan.tagline}&quot;</p>}
      {plan.description && (
        <div className="lx-plan-desc">
          <span className="lx-plan-desc-label">
            <Camera size={13} /> Dịch vụ
          </span>
          <p>{plan.description}</p>
        </div>
      )}
      {showCta && (
        <a className="lx-cta" href="#contact" style={{ justifyContent: "center" }}>
          Tư vấn ngay
        </a>
      )}
      {hasDetails && (
        <>
          <button type="button" className="lx-plan-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="lx-plan-details">
              {plan.features.length > 0 && (
                <ul className="lx-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.printProducts.length > 0 && (
                <div className="lx-plan-sub">
                  <span className="lx-plan-sub-label">
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
                <div className="lx-plan-sub">
                  <span className="lx-plan-sub-label">
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
                <div className="lx-plan-sub">
                  <span className="lx-plan-sub-label">
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

/** TEMPLATE 05 — LUXURY & ELEGANT (BOOKS_VIEW_TEMPLATES/template-05-*.md,
 * visual-reference-4.png "LUXE STUDIO"). Champagne/beige background, large
 * serif headline, a "Premium Quality / Creative Team / Happy Clients"
 * feature row (per the spec's own example) — premium wedding, not loud. */
export function LuxuryElegantWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;

  return (
    <div className="tpl-web-luxury">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500;600&display=swap"
      />
      <style>{`
        .tpl-web-luxury { background: #f4ede2; color: #2c241c; font-family: "Jost", sans-serif; }
        .tpl-web-luxury .lx-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(244,237,226,0.92); backdrop-filter: blur(6px);
        }
        .tpl-web-luxury .lx-brand { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: 20px; letter-spacing: 0.04em; }
        .tpl-web-luxury .lx-nav { display: flex; gap: 26px; font-size: 12.5px; letter-spacing: 0.04em; }
        .tpl-web-luxury .lx-nav a { color: #6b5d4a; text-decoration: none; }
        .tpl-web-luxury .lx-nav a:hover { color: #2c241c; }
        .tpl-web-luxury .lx-hero {
          min-height: 78vh; display: flex; align-items: center; padding: 48px;
          background-size: cover; background-position: center; background-color: #e5d8c3; position: relative;
        }
        .tpl-web-luxury .lx-hero::before { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(244,237,226,0.94) 0%, rgba(244,237,226,0.55) 45%, rgba(244,237,226,0.05) 75%); }
        .tpl-web-luxury .lx-hero-inner { position: relative; z-index: 1; max-width: 460px; }
        .tpl-web-luxury .lx-hero h1 { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: clamp(32px, 4.4vw, 52px); line-height: 1.12; margin: 0 0 18px; }
        .tpl-web-luxury .lx-cta {
          display: inline-flex; align-items: center; gap: 6px; background: transparent; color: #2c241c;
          border: 1.5px solid #2c241c; font-size: 12.5px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase;
          padding: 12px 26px; text-decoration: none;
        }
        .tpl-web-luxury .lx-cta:hover { background: #2c241c; color: #f4ede2; }

        .tpl-web-luxury .lx-section { padding: 80px 48px; max-width: 1220px; margin: 0 auto; }
        .tpl-web-luxury .lx-section-head { text-align: center; margin-bottom: 42px; }
        .tpl-web-luxury .lx-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #a08f6b; font-weight: 600; }
        .tpl-web-luxury .lx-section-head h2 { font-family: "Cormorant Garamond", serif; font-weight: 600; font-size: 32px; margin: 8px 0 0; }
        .tpl-web-luxury .lx-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
        .tpl-web-luxury .lx-grid img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; }

        .tpl-web-luxury .lx-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 48px; text-align: center; }
        .tpl-web-luxury .lx-feature svg { color: #a08f6b; margin-bottom: 10px; }
        .tpl-web-luxury .lx-feature h4 { font-size: 14px; font-weight: 600; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.04em; }
        .tpl-web-luxury .lx-feature p { font-size: 12.5px; color: #7a6d59; margin: 0; }

        .tpl-web-luxury .lx-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
        .tpl-web-luxury .lx-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-luxury .lx-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #e5d8c3; margin-bottom: 12px; }
        .tpl-web-luxury .lx-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-luxury .lx-album-card h3 { font-family: "Cormorant Garamond", serif; font-size: 19px; font-weight: 600; margin: 0 0 2px; }
        .tpl-web-luxury .lx-album-card p { font-size: 12.5px; color: #8a7c65; margin: 0; }

        .tpl-web-luxury .lx-about { text-align: center; }
        .tpl-web-luxury .lx-about p { font-size: 15px; line-height: 1.8; color: #4a3f31; max-width: 620px; margin: 0 auto; }

        .tpl-web-luxury .lx-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tpl-web-luxury .lx-plan-card { border: 1px solid #ddccae; border-radius: 6px; padding: 28px 26px; background: #fbf7ef; display: flex; flex-direction: column; }
        .tpl-web-luxury .lx-plan-card h3 { font-family: "Cormorant Garamond", serif; font-size: 18px; font-weight: 600; margin: 0 0 10px; }
        .tpl-web-luxury .lx-plan-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .tpl-web-luxury .lx-plan-card-price strong { font-family: "Cormorant Garamond", serif; font-size: 26px; color: #a08f6b; }
        .tpl-web-luxury .lx-plan-card-price span { font-size: 12px; color: #8a7c65; }
        .tpl-web-luxury .lx-plan-tagline { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 15px; color: #6b5d4a; margin: 0 0 14px; }
        .tpl-web-luxury .lx-plan-desc { margin: 0 0 14px; }
        .tpl-web-luxury .lx-plan-desc-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #a08f6b; margin-bottom: 6px; }
        .tpl-web-luxury .lx-plan-desc p { font-size: 13px; color: #6b5d4a; line-height: 1.7; margin: 0; }
        .tpl-web-luxury .lx-plan-toggle { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 12px 0 0; margin-top: auto; font-size: 12.5px; font-weight: 600; color: #a08f6b; cursor: pointer; font-family: inherit; }
        .tpl-web-luxury .lx-plan-details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #ddccae; display: flex; flex-direction: column; gap: 16px; }
        .tpl-web-luxury .lx-plan-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tpl-web-luxury .lx-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #4a3f31; line-height: 1.5; }
        .tpl-web-luxury .lx-plan-features svg { color: #a08f6b; flex-shrink: 0; margin-top: 2px; }
        .tpl-web-luxury .lx-plan-sub-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: #a08f6b; margin-bottom: 8px; }
        .tpl-web-luxury .lx-plan-sub ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .tpl-web-luxury .lx-plan-sub ul li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #4a3f31; line-height: 1.5; }
        .tpl-web-luxury .lx-plan-sub ul li svg { flex-shrink: 0; margin-top: 2px; color: #8a7c65; }

        .tpl-web-luxury .lx-contact { background: #2c241c; color: #f4ede2; padding: 48px 48px 24px; }
        .tpl-web-luxury .lx-contact-row { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; font-size: 13px; color: #d8cdb9; margin-bottom: 20px; }
        .tpl-web-luxury .lx-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-luxury .lx-footer-bottom { text-align: center; font-size: 11px; color: #9a8d73; border-top: 1px solid #453b2d; padding-top: 18px; }

        @media (max-width: 900px) {
          .tpl-web-luxury .lx-nav { display: none; }
          .tpl-web-luxury .lx-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-luxury .lx-features { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="lx-header">
        <div className="lx-brand">{studio.name}</div>
        <nav className="lx-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="lx-hero" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined}>
        <div className="lx-hero-inner">
          <h1>Luxury Wedding Photography</h1>
          {studio.description && <p style={{ fontSize: 15, color: "#5a4d3c", marginBottom: 26 }}>{studio.description}</p>}
          {showPortfolio && (
            <a className="lx-cta" href="#portfolio">
              View Portfolio
            </a>
          )}
        </div>
      </section>

      {showPortfolio && (
        <section className="lx-section" id="portfolio">
          <div className="lx-section-head">
            <span className="lx-eyebrow">Featured Galleries</span>
            <h2>Portfolio nổi bật</h2>
          </div>
          <div className="lx-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
          <div className="lx-features">
            <div className="lx-feature">
              <Gem size={22} />
              <h4>Premium Quality</h4>
              <p>Chất lượng ảnh cao cấp</p>
            </div>
            <div className="lx-feature">
              <Users size={22} />
              <h4>Creative Team</h4>
              <p>Đội ngũ giàu kinh nghiệm</p>
            </div>
            <div className="lx-feature">
              <Heart size={22} />
              <h4>Happy Clients</h4>
              <p>Khách hàng hài lòng</p>
            </div>
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="lx-section" id="albums">
          <div className="lx-section-head">
            <span className="lx-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="lx-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="lx-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="lx-section lx-about" id="about">
          <div className="lx-section-head">
            <span className="lx-eyebrow">Về chúng tôi</span>
            <h2>{studio.name}</h2>
          </div>
          <p>{studio.description}</p>
        </section>
      )}

      {showPricing && (
        <section className="lx-section" id="pricing">
          <div className="lx-section-head">
            <span className="lx-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="lx-pricing">
            {pricingPlans.map((plan) => (
              <LxPricingCard key={plan.id} plan={plan} showCta={showContact} />
            ))}
          </div>
        </section>
      )}

      {showContact && (
        <footer className="lx-contact" id="contact">
          <div className="lx-contact-row">
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
          <div className="lx-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
