import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Check, ChevronDown, ChevronUp, Camera, Printer, Gift, ShieldAlert, CornerDownRight } from "lucide-react";
import type { WebsiteTemplateProps, WebsitePricingPlanData } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

function LnPricingCard({ plan, showCta }: { plan: WebsitePricingPlanData; showCta: boolean }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    plan.features.length > 0 || plan.printProducts.length > 0 || plan.gifts.length > 0 || plan.notes.length > 0;
  return (
    <div className="ln-plan-card">
      <h3>{plan.name}</h3>
      <div className="ln-plan-card-price">
        <strong>{plan.price}</strong>
        {plan.unit && <span>{plan.unit}</span>}
      </div>
      {plan.tagline && <p className="ln-plan-tagline">&quot;{plan.tagline}&quot;</p>}
      {plan.description && (
        <div className="ln-plan-desc">
          <span className="ln-plan-desc-label">
            <Camera size={13} /> Dịch vụ
          </span>
          <p>{plan.description}</p>
        </div>
      )}
      {showCta && (
        <a className="ln-cta" href="#contact" style={{ justifyContent: "center" }}>
          Tư vấn ngay
        </a>
      )}
      {hasDetails && (
        <>
          <button type="button" className="ln-plan-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="ln-plan-details">
              {plan.features.length > 0 && (
                <ul className="ln-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.printProducts.length > 0 && (
                <div className="ln-plan-sub">
                  <span className="ln-plan-sub-label">
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
                <div className="ln-plan-sub">
                  <span className="ln-plan-sub-label">
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
                <div className="ln-plan-sub">
                  <span className="ln-plan-sub-label">
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

/** TEMPLATE 03 — LIGHT & NATURAL (BOOKS_VIEW_TEMPLATES/template-03-*.md,
 * visual-reference-4.png "Minh Studio"). Airy, pale sage-green wash over
 * white, script wordmark, full-width outdoor hero, quiet serif-free type —
 * friendly and light rather than loud. */
export function LightNaturalWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;

  return (
    <div className="tpl-web-light">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital@1&family=Manrope:wght@400;500;700&display=swap"
      />
      <style>{`
        .tpl-web-light { background: #fdfdfb; color: #2e332c; font-family: "Manrope", sans-serif; }
        .tpl-web-light .ln-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(253,253,251,0.9); backdrop-filter: blur(6px);
        }
        .tpl-web-light .ln-brand { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 24px; }
        .tpl-web-light .ln-nav { display: flex; gap: 26px; font-size: 13px; font-weight: 500; }
        .tpl-web-light .ln-nav a { color: #5c6355; text-decoration: none; }
        .tpl-web-light .ln-nav a:hover { color: #2e332c; }
        .tpl-web-light .ln-hero {
          position: relative; min-height: 74vh; display: flex; align-items: flex-end;
          padding: 48px; background-size: cover; background-position: center;
          background-color: #eef1e7;
        }
        .tpl-web-light .ln-hero-inner { max-width: 480px; }
        .tpl-web-light .ln-hero span.tag { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #6f7a5f; font-weight: 700; }
        .tpl-web-light .ln-hero h1 { font-family: "Cormorant Garamond", serif; font-style: italic; font-weight: 500; font-size: clamp(30px, 4vw, 44px); margin: 8px 0 18px; color: #2e332c; }
        .tpl-web-light .ln-cta {
          display: inline-flex; align-items: center; gap: 6px; background: #fff; color: #2e332c;
          border: 1px solid #d8ddcf; font-size: 13px; font-weight: 600; padding: 11px 24px; border-radius: 4px; text-decoration: none;
        }
        .tpl-web-light .ln-cta:hover { background: #eef1e7; }

        .tpl-web-light .ln-section { padding: 76px 48px; max-width: 1200px; margin: 0 auto; }
        .tpl-web-light .ln-section-head { text-align: center; margin-bottom: 40px; }
        .tpl-web-light .ln-eyebrow { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #8a927c; font-weight: 700; }
        .tpl-web-light .ln-section-head h2 { font-family: "Cormorant Garamond", serif; font-style: italic; font-weight: 500; font-size: 30px; margin: 8px 0 0; }
        .tpl-web-light .ln-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .tpl-web-light .ln-grid img { width: 100%; aspect-ratio: 4/5; object-fit: cover; border-radius: 8px; display: block; }

        .tpl-web-light .ln-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
        .tpl-web-light .ln-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-light .ln-album-card .thumb { width: 100%; aspect-ratio: 4/3; border-radius: 8px; overflow: hidden; background: #eef1e7; margin-bottom: 12px; }
        .tpl-web-light .ln-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-light .ln-album-card h3 { font-size: 15px; font-weight: 700; margin: 0 0 2px; }
        .tpl-web-light .ln-album-card p { font-size: 12px; color: #7a8069; margin: 0; }

        .tpl-web-light .ln-about { background: #eef1e7; text-align: center; }
        .tpl-web-light .ln-about-inner { max-width: 620px; margin: 0 auto; }
        .tpl-web-light .ln-about h2 { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 28px; margin: 8px 0 16px; }
        .tpl-web-light .ln-about p { font-size: 15px; line-height: 1.8; color: #4b5140; }

        .tpl-web-light .ln-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tpl-web-light .ln-plan-card { border: 1px solid #e3e7db; border-radius: 8px; padding: 28px 24px; background: #fff; display: flex; flex-direction: column; text-align: left; }
        .tpl-web-light .ln-plan-card h3 { font-size: 15px; font-weight: 700; margin: 0 0 10px; }
        .tpl-web-light .ln-plan-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .tpl-web-light .ln-plan-card-price strong { font-family: "Cormorant Garamond", serif; font-size: 24px; color: #4b6b3a; }
        .tpl-web-light .ln-plan-card-price span { font-size: 12px; color: #8a927c; }
        .tpl-web-light .ln-plan-tagline { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 15px; color: #5c6355; margin: 0 0 14px; }
        .tpl-web-light .ln-plan-desc { margin: 0 0 14px; }
        .tpl-web-light .ln-plan-desc-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #6f7a5f; margin-bottom: 6px; }
        .tpl-web-light .ln-plan-desc p { font-size: 13px; color: #5c6355; line-height: 1.7; margin: 0; }
        .tpl-web-light .ln-plan-toggle { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 12px 0 0; margin-top: auto; font-size: 12.5px; font-weight: 600; color: #6f7a5f; cursor: pointer; font-family: inherit; }
        .tpl-web-light .ln-plan-details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #eef1e7; display: flex; flex-direction: column; gap: 16px; }
        .tpl-web-light .ln-plan-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tpl-web-light .ln-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #4b5140; line-height: 1.5; }
        .tpl-web-light .ln-plan-features svg { color: #6f7a5f; flex-shrink: 0; margin-top: 2px; }
        .tpl-web-light .ln-plan-sub-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #6f7a5f; margin-bottom: 8px; }
        .tpl-web-light .ln-plan-sub ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .tpl-web-light .ln-plan-sub ul li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #4b5140; line-height: 1.5; }
        .tpl-web-light .ln-plan-sub ul li svg { flex-shrink: 0; margin-top: 2px; color: #8a927c; }

        .tpl-web-light .ln-contact { padding: 56px 48px; text-align: center; border-top: 1px solid #eef1e7; }
        .tpl-web-light .ln-contact-row { display: flex; justify-content: center; gap: 28px; flex-wrap: wrap; font-size: 13px; color: #5c6355; margin: 18px 0 0; }
        .tpl-web-light .ln-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-light .ln-footer-bottom { padding: 22px 48px; text-align: center; font-size: 11px; color: #9aa08b; }

        @media (max-width: 900px) {
          .tpl-web-light .ln-nav { display: none; }
          .tpl-web-light .ln-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <header className="ln-header">
        <div className="ln-brand">{studio.name}</div>
        <nav className="ln-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="ln-hero" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined}>
        <div className="ln-hero-inner">
          <span className="tag">Wedding &amp; Portrait</span>
          <h1>{studio.name}</h1>
          {showPortfolio && (
            <a className="ln-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
      </section>

      {showPortfolio && (
        <section className="ln-section" id="portfolio">
          <div className="ln-section-head">
            <span className="ln-eyebrow">Dự án nổi bật</span>
            <h2>Những khoảnh khắc</h2>
          </div>
          <div className="ln-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="ln-section" id="albums">
          <div className="ln-section-head">
            <span className="ln-eyebrow">Bộ sưu tập</span>
            <h2>Album</h2>
          </div>
          <div className="ln-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="ln-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="ln-about" id="about">
          <div className="ln-section ln-about-inner">
            <span className="ln-eyebrow">Về chúng tôi</span>
            <h2>{studio.name}</h2>
            <p>{studio.description}</p>
          </div>
        </section>
      )}

      {showPricing && (
        <section className="ln-section" id="pricing">
          <div className="ln-section-head">
            <span className="ln-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="ln-pricing">
            {pricingPlans.map((plan) => (
              <LnPricingCard key={plan.id} plan={plan} showCta={showContact} />
            ))}
          </div>
        </section>
      )}

      {showContact && (
        <section className="ln-contact" id="contact">
          <span className="ln-eyebrow">Liên hệ</span>
          <div className="ln-contact-row">
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
        </section>
      )}

      <footer className="ln-footer-bottom">
        © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
      </footer>
    </div>
  );
}
