import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Check, ChevronDown, ChevronUp, Camera, Printer, Gift, ShieldAlert, CornerDownRight } from "lucide-react";
import type { WebsiteTemplateProps, WebsitePricingPlanData } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

function BwPricingCard({ plan, showCta }: { plan: WebsitePricingPlanData; showCta: boolean }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    plan.features.length > 0 || plan.printProducts.length > 0 || plan.gifts.length > 0 || plan.notes.length > 0;
  return (
    <div className="bw-plan-card">
      <h3>{plan.name}</h3>
      <div className="bw-plan-card-price">
        <strong>{plan.price}</strong>
        {plan.unit && <span>{plan.unit}</span>}
      </div>
      {plan.tagline && <p className="bw-plan-tagline">&quot;{plan.tagline}&quot;</p>}
      {plan.description && (
        <div className="bw-plan-desc">
          <span className="bw-plan-desc-label">
            <Camera size={13} /> Dịch vụ
          </span>
          <p>{plan.description}</p>
        </div>
      )}
      {showCta && (
        <a className="bw-cta" href="#contact" style={{ justifyContent: "center" }}>
          Tư vấn ngay
        </a>
      )}
      {hasDetails && (
        <>
          <button type="button" className="bw-plan-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="bw-plan-details">
              {plan.features.length > 0 && (
                <ul className="bw-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.printProducts.length > 0 && (
                <div className="bw-plan-sub">
                  <span className="bw-plan-sub-label">
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
                <div className="bw-plan-sub">
                  <span className="bw-plan-sub-label">
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
                <div className="bw-plan-sub">
                  <span className="bw-plan-sub-label">
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

/** TEMPLATE 04 — BLACK & WHITE EDITORIAL (BOOKS_VIEW_TEMPLATES/
 * template-04-*.md, visual-reference-4.png "R STUDIO"). Black background,
 * every photo forced grayscale, split hero (bold headline left / portrait
 * right), fashion-magazine feel — art photography, not warmth. */
export function BWEditorialWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;

  return (
    <div className="tpl-web-bw">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;900&display=swap" />
      <style>{`
        .tpl-web-bw { background: #0a0a0a; color: #f5f5f5; font-family: "Archivo", sans-serif; }
        .tpl-web-bw img { filter: grayscale(1); }
        .tpl-web-bw .bw-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; border-bottom: 1px solid #232323;
        }
        .tpl-web-bw .bw-brand { display: flex; align-items: center; gap: 10px; font-weight: 900; font-size: 15px; letter-spacing: 0.06em; }
        .tpl-web-bw .bw-brand img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
        .tpl-web-bw .bw-nav { display: flex; gap: 24px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
        .tpl-web-bw .bw-nav a { color: #b5b5b5; text-decoration: none; }
        .tpl-web-bw .bw-nav a:hover { color: #fff; }
        .tpl-web-bw .bw-hero {
          display: grid; grid-template-columns: 1fr 1fr; min-height: 76vh;
        }
        .tpl-web-bw .bw-hero-text { display: flex; flex-direction: column; justify-content: center; padding: 48px; }
        .tpl-web-bw .bw-hero h1 { font-weight: 900; font-size: clamp(34px, 5vw, 58px); line-height: 1.02; margin: 0 0 18px; text-transform: uppercase; }
        .tpl-web-bw .bw-hero p { font-size: 14px; color: #b5b5b5; max-width: 380px; margin: 0 0 26px; line-height: 1.7; }
        .tpl-web-bw .bw-cta {
          display: inline-flex; align-items: center; gap: 6px; background: #f5f5f5; color: #0a0a0a;
          font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 13px 24px; text-decoration: none; width: fit-content;
        }
        .tpl-web-bw .bw-cta:hover { background: #d8d8d8; }
        .tpl-web-bw .bw-hero-img { position: relative; background-size: cover; background-position: center; background-color: #1a1a1a; }

        .tpl-web-bw .bw-section { padding: 80px 48px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-bw .bw-section-head { margin-bottom: 40px; }
        .tpl-web-bw .bw-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a8a8a; font-weight: 700; }
        .tpl-web-bw .bw-section-head h2 { font-weight: 900; font-size: 26px; margin: 8px 0 0; text-transform: uppercase; }
        .tpl-web-bw .bw-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
        .tpl-web-bw .bw-grid img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; }

        .tpl-web-bw .bw-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-bw .bw-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-bw .bw-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #1a1a1a; margin-bottom: 12px; }
        .tpl-web-bw .bw-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-bw .bw-album-card h3 { font-size: 15px; font-weight: 800; margin: 0 0 2px; text-transform: uppercase; }
        .tpl-web-bw .bw-album-card p { font-size: 12px; color: #8a8a8a; margin: 0; }

        .tpl-web-bw .bw-about p { font-size: 15px; color: #d0d0d0; line-height: 1.8; max-width: 640px; }

        .tpl-web-bw .bw-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tpl-web-bw .bw-plan-card { border: 1px solid #232323; padding: 28px 24px; background: #141414; display: flex; flex-direction: column; }
        .tpl-web-bw .bw-plan-card h3 { font-size: 15px; font-weight: 800; text-transform: uppercase; margin: 0 0 10px; }
        .tpl-web-bw .bw-plan-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .tpl-web-bw .bw-plan-card-price strong { font-size: 24px; color: #fff; }
        .tpl-web-bw .bw-plan-card-price span { font-size: 12px; color: #8a8a8a; }
        .tpl-web-bw .bw-plan-tagline { font-style: italic; font-size: 13px; color: #b5b5b5; margin: 0 0 14px; }
        .tpl-web-bw .bw-plan-desc { margin: 0 0 14px; }
        .tpl-web-bw .bw-plan-desc-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #b5b5b5; margin-bottom: 6px; }
        .tpl-web-bw .bw-plan-desc p { font-size: 13px; color: #b5b5b5; line-height: 1.7; margin: 0; }
        .tpl-web-bw .bw-plan-toggle { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 12px 0 0; margin-top: auto; font-size: 12.5px; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase; color: #f5f5f5; cursor: pointer; font-family: inherit; }
        .tpl-web-bw .bw-plan-details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #232323; display: flex; flex-direction: column; gap: 16px; }
        .tpl-web-bw .bw-plan-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tpl-web-bw .bw-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #d0d0d0; line-height: 1.5; }
        .tpl-web-bw .bw-plan-features svg { color: #fff; flex-shrink: 0; margin-top: 2px; }
        .tpl-web-bw .bw-plan-sub-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #b5b5b5; margin-bottom: 8px; }
        .tpl-web-bw .bw-plan-sub ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .tpl-web-bw .bw-plan-sub ul li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #d0d0d0; line-height: 1.5; }
        .tpl-web-bw .bw-plan-sub ul li svg { flex-shrink: 0; margin-top: 2px; color: #8a8a8a; }

        .tpl-web-bw .bw-contact { border-top: 1px solid #232323; padding: 48px 48px 24px; }
        .tpl-web-bw .bw-contact-row { display: flex; gap: 28px; flex-wrap: wrap; font-size: 13px; color: #b5b5b5; margin-bottom: 20px; }
        .tpl-web-bw .bw-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-bw .bw-footer-bottom { max-width: 1240px; margin: 0 auto; font-size: 11px; color: #6a6a6a; }

        @media (max-width: 900px) {
          .tpl-web-bw .bw-nav { display: none; }
          .tpl-web-bw .bw-hero { grid-template-columns: 1fr; }
          .tpl-web-bw .bw-hero-img { min-height: 320px; }
          .tpl-web-bw .bw-grid { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-bw .bw-header, .tpl-web-bw .bw-section, .tpl-web-bw .bw-contact { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      <header className="bw-header">
        <div className="bw-brand">
          {studio.logoUrl && <img src={studio.logoUrl} alt={studio.name} />}
          {studio.name}
        </div>
        <nav className="bw-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Về chúng tôi</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
      </header>

      <section className="bw-hero">
        <div className="bw-hero-text">
          <h1>The Art of Photography</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="bw-cta" href="#portfolio">
              View Portfolio
            </a>
          )}
        </div>
        <div className="bw-hero-img" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined} />
      </section>

      {showPortfolio && (
        <section className="bw-section" id="portfolio">
          <div className="bw-section-head">
            <span className="bw-eyebrow">Portfolio</span>
            <h2>Selected Works</h2>
          </div>
          <div className="bw-grid">
            {featuredPhotos.map((url) => (
              <img key={url} src={url} alt="" />
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="bw-section" id="albums">
          <div className="bw-section-head">
            <span className="bw-eyebrow">Collections</span>
            <h2>Album</h2>
          </div>
          <div className="bw-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="bw-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="bw-section bw-about" id="about">
          <div className="bw-section-head">
            <span className="bw-eyebrow">About Us</span>
            <h2>{studio.name}</h2>
          </div>
          <p>{studio.description}</p>
        </section>
      )}

      {showPricing && (
        <section className="bw-section" id="pricing">
          <div className="bw-section-head">
            <span className="bw-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="bw-pricing">
            {pricingPlans.map((plan) => (
              <BwPricingCard key={plan.id} plan={plan} showCta={showContact} />
            ))}
          </div>
        </section>
      )}

      {showContact && (
        <footer className="bw-contact" id="contact">
          <div className="bw-contact-row">
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
          <div className="bw-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
