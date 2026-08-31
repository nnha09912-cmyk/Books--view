import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Check, ChevronDown, ChevronUp, Camera, Printer, Gift, ShieldAlert, CornerDownRight } from "lucide-react";
import type { WebsiteTemplateProps, WebsitePricingPlanData } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

function BmPricingCard({ plan, showCta }: { plan: WebsitePricingPlanData; showCta: boolean }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    plan.features.length > 0 || plan.printProducts.length > 0 || plan.gifts.length > 0 || plan.notes.length > 0;
  return (
    <div className="bm-plan-card">
      <h3>{plan.name}</h3>
      <div className="bm-plan-card-price">
        <strong>{plan.price}</strong>
        {plan.unit && <span>{plan.unit}</span>}
      </div>
      {plan.tagline && <p className="bm-plan-tagline">&quot;{plan.tagline}&quot;</p>}
      {plan.description && (
        <div className="bm-plan-desc">
          <span className="bm-plan-desc-label">
            <Camera size={13} /> Dịch vụ
          </span>
          <p>{plan.description}</p>
        </div>
      )}
      {showCta && (
        <a className="bm-cta" href="#contact" style={{ justifyContent: "center" }}>
          Tư vấn ngay
        </a>
      )}
      {hasDetails && (
        <>
          <button type="button" className="bm-plan-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="bm-plan-details">
              {plan.features.length > 0 && (
                <ul className="bm-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.printProducts.length > 0 && (
                <div className="bm-plan-sub">
                  <span className="bm-plan-sub-label">
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
                <div className="bm-plan-sub">
                  <span className="bm-plan-sub-label">
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
                <div className="bm-plan-sub">
                  <span className="bm-plan-sub-label">
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

/** TEMPLATE 14 — BOLD & MODERN (BOOKS_VIEW_TEMPLATES/template-14-*.md,
 * visual-reference-3.png "VISION STUDIO"). Black background, oversized
 * bold headline, a single vivid red accent (CTA + numbered tag), tight
 * grayscale-with-red-highlight grid — loud, confident, high-fashion. */
export function BoldModernWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;

  return (
    <div className="tpl-web-bold">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;800;900&display=swap" />
      <style>{`
        .tpl-web-bold { background: #0a0a0a; color: #f2f2f2; font-family: "Archivo", sans-serif; }
        .tpl-web-bold .bm-accent { color: #e2352b; }
        .tpl-web-bold .bm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; border-bottom: 1px solid #1e1e1e;
        }
        .tpl-web-bold .bm-brand { font-weight: 900; font-size: 15px; letter-spacing: 0.02em; }
        .tpl-web-bold .bm-nav { display: flex; gap: 24px; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #999; }
        .tpl-web-bold .bm-nav a { color: inherit; text-decoration: none; }
        .tpl-web-bold .bm-nav a:hover { color: #f2f2f2; }
        .tpl-web-bold .bm-hero {
          display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center;
          padding: 56px 48px; max-width: 1280px; margin: 0 auto;
        }
        .tpl-web-bold .bm-hero h1 { font-weight: 900; font-size: clamp(38px, 6vw, 68px); line-height: 0.98; margin: 0 0 16px; text-transform: uppercase; }
        .tpl-web-bold .bm-hero p { font-size: 13px; color: #999; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 26px; }
        .tpl-web-bold .bm-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #e2352b; color: #fff;
          font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
          padding: 14px 28px; text-decoration: none; width: fit-content;
        }
        .tpl-web-bold .bm-cta:hover { background: #c22a21; }
        .tpl-web-bold .bm-hero-photo { position: relative; aspect-ratio: 4/5; overflow: hidden; background: #1a1a1a; }
        .tpl-web-bold .bm-hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1); }
        .tpl-web-bold .bm-hero-tag {
          position: absolute; top: 16px; right: 16px; background: #e2352b; color: #fff;
          font-weight: 900; font-size: 13px; padding: 6px 12px;
        }

        .tpl-web-bold .bm-section { padding: 76px 48px; max-width: 1280px; margin: 0 auto; border-top: 1px solid #1e1e1e; }
        .tpl-web-bold .bm-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 36px; }
        .tpl-web-bold .bm-section-head h2 { font-weight: 900; font-size: 24px; text-transform: uppercase; margin: 0; }
        .tpl-web-bold .bm-eyebrow { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #666; font-weight: 700; }
        .tpl-web-bold .bm-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
        .tpl-web-bold .bm-grid img { width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block; filter: grayscale(1); transition: filter 0.25s ease; }
        .tpl-web-bold .bm-grid a:hover img { filter: grayscale(0); }

        .tpl-web-bold .bm-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 22px; }
        .tpl-web-bold .bm-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-bold .bm-album-card .thumb { width: 100%; aspect-ratio: 4/3; overflow: hidden; background: #1a1a1a; margin-bottom: 12px; }
        .tpl-web-bold .bm-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1); }
        .tpl-web-bold .bm-album-card h3 { font-size: 15px; font-weight: 800; margin: 0 0 2px; text-transform: uppercase; }
        .tpl-web-bold .bm-album-card p { font-size: 12px; color: #777; margin: 0; }

        .tpl-web-bold .bm-about p { font-size: 15px; color: #ccc; line-height: 1.8; max-width: 640px; }

        .tpl-web-bold .bm-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tpl-web-bold .bm-plan-card { border: 1px solid #1e1e1e; padding: 28px 24px; background: #111; display: flex; flex-direction: column; }
        .tpl-web-bold .bm-plan-card h3 { font-weight: 800; font-size: 15px; text-transform: uppercase; margin: 0 0 10px; }
        .tpl-web-bold .bm-plan-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .tpl-web-bold .bm-plan-card-price strong { font-weight: 900; font-size: 24px; color: #e2352b; }
        .tpl-web-bold .bm-plan-card-price span { font-size: 12px; color: #666; }
        .tpl-web-bold .bm-plan-tagline { font-style: italic; font-size: 13px; color: #999; margin: 0 0 14px; }
        .tpl-web-bold .bm-plan-desc { margin: 0 0 14px; }
        .tpl-web-bold .bm-plan-desc-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #e2352b; margin-bottom: 6px; }
        .tpl-web-bold .bm-plan-desc p { font-size: 13px; color: #999; line-height: 1.7; margin: 0; }
        .tpl-web-bold .bm-plan-toggle { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 12px 0 0; margin-top: auto; font-size: 12.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; color: #e2352b; cursor: pointer; font-family: inherit; }
        .tpl-web-bold .bm-plan-details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #1e1e1e; display: flex; flex-direction: column; gap: 16px; }
        .tpl-web-bold .bm-plan-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tpl-web-bold .bm-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #ccc; line-height: 1.5; }
        .tpl-web-bold .bm-plan-features svg { color: #e2352b; flex-shrink: 0; margin-top: 2px; }
        .tpl-web-bold .bm-plan-sub-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #e2352b; margin-bottom: 8px; }
        .tpl-web-bold .bm-plan-sub ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .tpl-web-bold .bm-plan-sub ul li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #ccc; line-height: 1.5; }
        .tpl-web-bold .bm-plan-sub ul li svg { flex-shrink: 0; margin-top: 2px; color: #666; }

        .tpl-web-bold .bm-contact { background: #050505; padding: 44px 48px 22px; }
        .tpl-web-bold .bm-contact-row { display: flex; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #999; margin-bottom: 18px; }
        .tpl-web-bold .bm-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-bold .bm-footer-bottom { font-size: 11px; color: #555; }

        @media (max-width: 900px) {
          .tpl-web-bold .bm-nav { display: none; }
          .tpl-web-bold .bm-hero { grid-template-columns: 1fr; }
          .tpl-web-bold .bm-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <header className="bm-header">
        <div className="bm-brand">{studio.name}</div>
        <nav className="bm-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">About</a>}
          {showContact && <a href="#contact">Contact</a>}
        </nav>
      </header>

      <section className="bm-hero">
        <div>
          <h1>
            Bold. Modern. <span className="bm-accent">Unique.</span>
          </h1>
          <p>{studio.description ?? "We create. You remember."}</p>
          {showPortfolio && (
            <a className="bm-cta" href="#portfolio">
              Xem Portfolio
            </a>
          )}
        </div>
        {(featuredPhotos[0] || studio.cover) && (
          <div className="bm-hero-photo">
            <img src={featuredPhotos[0] ?? studio.cover ?? ""} alt="" />
            <span className="bm-hero-tag">01</span>
          </div>
        )}
      </section>

      {showPortfolio && (
        <section className="bm-section" id="portfolio">
          <div className="bm-section-head">
            <h2>Latest Works</h2>
            <span className="bm-eyebrow">Portfolio</span>
          </div>
          <div className="bm-grid">
            {featuredPhotos.map((url) => (
              <Link key={url} href="#portfolio">
                <img src={url} alt="" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="bm-section" id="albums">
          <div className="bm-section-head">
            <h2>Album</h2>
            <span className="bm-eyebrow">Collections</span>
          </div>
          <div className="bm-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="bm-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="bm-section bm-about" id="about">
          <div className="bm-section-head">
            <h2>About {studio.name}</h2>
            <span className="bm-eyebrow">Studio</span>
          </div>
          <p>{studio.description}</p>
        </section>
      )}

      {showPricing && (
        <section className="bm-section" id="pricing">
          <div className="bm-section-head">
            <h2>Bảng giá</h2>
            <span className="bm-eyebrow">Các gói dịch vụ</span>
          </div>
          <div className="bm-pricing">
            {pricingPlans.map((plan) => (
              <BmPricingCard key={plan.id} plan={plan} showCta={showContact} />
            ))}
          </div>
        </section>
      )}

      {showContact && (
        <footer className="bm-contact" id="contact">
          <div className="bm-contact-row">
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
          <div className="bm-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
