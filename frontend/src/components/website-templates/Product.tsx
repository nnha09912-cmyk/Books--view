import { useState } from "react";
import Link from "next/link";
import { Camera, Lightbulb, LayoutGrid, HeartHandshake, ShoppingBag, Phone, Mail, MapPin, Check, ChevronDown, ChevronUp, Printer, Gift, ShieldAlert, CornerDownRight } from "lucide-react";
import type { WebsiteTemplateProps, WebsitePricingPlanData } from "./types";

function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

function PrPricingCard({ plan, showCta }: { plan: WebsitePricingPlanData; showCta: boolean }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    plan.features.length > 0 || plan.printProducts.length > 0 || plan.gifts.length > 0 || plan.notes.length > 0;
  return (
    <div className="pr-plan-card">
      <h3>{plan.name}</h3>
      <div className="pr-plan-card-price">
        <strong>{plan.price}</strong>
        {plan.unit && <span>{plan.unit}</span>}
      </div>
      {plan.tagline && <p className="pr-plan-tagline">&quot;{plan.tagline}&quot;</p>}
      {plan.description && (
        <div className="pr-plan-desc">
          <span className="pr-plan-desc-label">
            <Camera size={13} /> Dịch vụ
          </span>
          <p>{plan.description}</p>
        </div>
      )}
      {showCta && (
        <a className="pr-cta" href="#contact" style={{ justifyContent: "center" }}>
          Tư vấn ngay
        </a>
      )}
      {hasDetails && (
        <>
          <button type="button" className="pr-plan-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="pr-plan-details">
              {plan.features.length > 0 && (
                <ul className="pr-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.printProducts.length > 0 && (
                <div className="pr-plan-sub">
                  <span className="pr-plan-sub-label">
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
                <div className="pr-plan-sub">
                  <span className="pr-plan-sub-label">
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
                <div className="pr-plan-sub">
                  <span className="pr-plan-sub-label">
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

/** TEMPLATE 17 — PRODUCT / SẢN PHẨM (BOOKS_VIEW_TEMPLATES/template-17-*.md,
 * visual-reference-2.png "PRODUCT STUDIO"). Cream/beige e-commerce feel:
 * a product-style hero, a feature-icon row, Albums shown as "Danh mục sản
 * phẩm" categories, featuredPhotos as "Sản phẩm nổi bật" — commercial. */
export function ProductWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;

  return (
    <div className="tpl-web-product">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap" />
      <style>{`
        .tpl-web-product { background: #f7f1e7; color: #2e2620; font-family: "Jost", sans-serif; }
        .tpl-web-product .pr-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px; background: rgba(247,241,231,0.92); backdrop-filter: blur(6px);
          position: sticky; top: 0; z-index: 10; border-bottom: 1px solid #e6dcc8;
        }
        .tpl-web-product .pr-brand { font-weight: 700; font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; }
        .tpl-web-product .pr-nav { display: flex; align-items: center; gap: 24px; font-size: 12.5px; color: #6b5f4d; }
        .tpl-web-product .pr-nav a { color: inherit; text-decoration: none; }
        .tpl-web-product .pr-nav a:hover { color: #2e2620; }
        .tpl-web-product .pr-hero {
          display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
          padding: 56px 48px; max-width: 1280px; margin: 0 auto;
        }
        .tpl-web-product .pr-hero h1 { font-weight: 700; font-size: clamp(28px, 4vw, 42px); line-height: 1.16; margin: 0 0 18px; }
        .tpl-web-product .pr-hero p { font-size: 14px; color: #6b5f4d; max-width: 380px; margin: 0 0 26px; line-height: 1.7; }
        .tpl-web-product .pr-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #2e2620; color: #f7f1e7;
          font-size: 13px; font-weight: 600; padding: 13px 28px; text-decoration: none;
          transition: background 0.2s ease;
        }
        .tpl-web-product .pr-cta:hover { background: #4a3f34; }
        .tpl-web-product .pr-hero-photo { border-radius: 18px; overflow: hidden; aspect-ratio: 4/5; background: #ecdfc6; }
        .tpl-web-product .pr-hero-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .tpl-web-product .pr-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; padding: 0 48px 60px; max-width: 1240px; margin: 0 auto; }
        .tpl-web-product .pr-feature { text-align: center; }
        .tpl-web-product .pr-feature svg { color: #a8875a; margin-bottom: 10px; }
        .tpl-web-product .pr-feature h4 { font-size: 12.5px; font-weight: 700; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 0.02em; }
        .tpl-web-product .pr-feature p { font-size: 11.5px; color: #8a7c65; margin: 0; }

        .tpl-web-product .pr-section { padding: 60px 48px; max-width: 1240px; margin: 0 auto; border-top: 1px solid #e6dcc8; }
        .tpl-web-product .pr-section-head { text-align: center; margin-bottom: 36px; }
        .tpl-web-product .pr-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #a8875a; font-weight: 600; }
        .tpl-web-product .pr-section-head h2 { font-weight: 700; font-size: 22px; margin: 8px 0 0; }

        .tpl-web-product .pr-cat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
        .tpl-web-product .pr-cat-card { text-decoration: none; color: inherit; display: block; text-align: center; }
        .tpl-web-product .pr-cat-card .thumb { width: 100%; aspect-ratio: 1/1; border-radius: 14px; overflow: hidden; background: #ecdfc6; margin-bottom: 10px; }
        .tpl-web-product .pr-cat-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-product .pr-cat-card h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; margin: 0; }

        .tpl-web-product .pr-prod-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; }
        .tpl-web-product .pr-prod-card { border-radius: 14px; overflow: hidden; background: #fff; box-shadow: 0 2px 10px rgba(46,38,32,0.06); }
        .tpl-web-product .pr-prod-card img { width: 100%; aspect-ratio: 1/1; object-fit: cover; display: block; }

        .tpl-web-product .pr-about { display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; }
        .tpl-web-product .pr-about p { font-size: 14.5px; color: #6b5f4d; line-height: 1.85; max-width: 480px; margin: 0 0 18px; }
        .tpl-web-product .pr-about-photo { width: 220px; aspect-ratio: 4/3; border-radius: 14px; overflow: hidden; background: #ecdfc6; }
        .tpl-web-product .pr-about-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .tpl-web-product .pr-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tpl-web-product .pr-plan-card { border: 1px solid #e6dcc8; border-radius: 10px; padding: 28px 24px; background: #fff; display: flex; flex-direction: column; text-align: left; }
        .tpl-web-product .pr-plan-card h3 { font-size: 15px; font-weight: 700; margin: 0 0 10px; }
        .tpl-web-product .pr-plan-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .tpl-web-product .pr-plan-card-price strong { font-size: 24px; color: #a8875a; }
        .tpl-web-product .pr-plan-card-price span { font-size: 12px; color: #8a7c65; }
        .tpl-web-product .pr-plan-tagline { font-style: italic; font-size: 13px; color: #6b5f4d; margin: 0 0 14px; }
        .tpl-web-product .pr-plan-desc { margin: 0 0 14px; }
        .tpl-web-product .pr-plan-desc-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #a8875a; margin-bottom: 6px; }
        .tpl-web-product .pr-plan-desc p { font-size: 13px; color: #6b5f4d; line-height: 1.7; margin: 0; }
        .tpl-web-product .pr-plan-toggle { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 12px 0 0; margin-top: auto; font-size: 12.5px; font-weight: 600; color: #a8875a; cursor: pointer; font-family: inherit; }
        .tpl-web-product .pr-plan-details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #e6dcc8; display: flex; flex-direction: column; gap: 16px; }
        .tpl-web-product .pr-plan-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tpl-web-product .pr-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #2e2620; line-height: 1.5; }
        .tpl-web-product .pr-plan-features svg { color: #a8875a; flex-shrink: 0; margin-top: 2px; }
        .tpl-web-product .pr-plan-sub-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #a8875a; margin-bottom: 8px; }
        .tpl-web-product .pr-plan-sub ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .tpl-web-product .pr-plan-sub ul li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #2e2620; line-height: 1.5; }
        .tpl-web-product .pr-plan-sub ul li svg { flex-shrink: 0; margin-top: 2px; color: #8a7c65; }

        .tpl-web-product .pr-contact { background: #2e2620; color: #f7f1e7; padding: 44px 48px 22px; }
        .tpl-web-product .pr-contact-row { display: flex; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #cbbfa8; margin-bottom: 18px; }
        .tpl-web-product .pr-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-product .pr-footer-bottom { font-size: 11px; color: #8a7c65; }

        @media (max-width: 900px) {
          .tpl-web-product .pr-nav { display: none; }
          .tpl-web-product .pr-hero { grid-template-columns: 1fr; }
          .tpl-web-product .pr-features { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-product .pr-cat-grid, .tpl-web-product .pr-prod-grid { grid-template-columns: repeat(3, 1fr); }
          .tpl-web-product .pr-about { grid-template-columns: 1fr; }
          .tpl-web-product .pr-about-photo { width: 100%; }
        }
      `}</style>

      <header className="pr-header">
        <div className="pr-brand">{studio.name}</div>
        <nav className="pr-nav">
          {showAlbums && <a href="#categories">Sản phẩm</a>}
          {showAbout && <a href="#about">Về chúng tôi</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
          <ShoppingBag size={16} />
        </nav>
      </header>

      <section className="pr-hero">
        <div>
          <h1>Sản phẩm chất lượng, nâng tầm giá trị</h1>
          <p>{studio.description ?? "Chụp ảnh sản phẩm chuyên nghiệp, tôn vinh thương hiệu của bạn."}</p>
          {showAlbums && (
            <a className="pr-cta" href="#categories">
              Khám Phá Ngay
            </a>
          )}
        </div>
        {(featuredPhotos[0] || studio.cover) && (
          <div className="pr-hero-photo">
            <img src={featuredPhotos[0] ?? studio.cover ?? ""} alt="" />
          </div>
        )}
      </section>

      <div className="pr-features">
        <div className="pr-feature">
          <Camera size={24} strokeWidth={1.4} />
          <h4>Hình ảnh chất lượng cao</h4>
          <p>Sắc nét đến từng chi tiết</p>
        </div>
        <div className="pr-feature">
          <Lightbulb size={24} strokeWidth={1.4} />
          <h4>Ánh sáng chuyên nghiệp</h4>
          <p>Tối ưu màu sắc sản phẩm</p>
        </div>
        <div className="pr-feature">
          <LayoutGrid size={24} strokeWidth={1.4} />
          <h4>Bố cục ấn tượng</h4>
          <p>Tăng giá trị thương hiệu</p>
        </div>
        <div className="pr-feature">
          <HeartHandshake size={24} strokeWidth={1.4} />
          <h4>Hỗ trợ tận tâm</h4>
          <p>Đồng hành cùng bạn</p>
        </div>
      </div>

      {showAlbums && (
        <section className="pr-section" id="categories">
          <div className="pr-section-head">
            <span className="pr-eyebrow">Shop by category</span>
            <h2>Danh mục sản phẩm</h2>
          </div>
          <div className="pr-cat-grid">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="pr-cat-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showPortfolio && (
        <section className="pr-section" id="portfolio">
          <div className="pr-section-head">
            <span className="pr-eyebrow">Best sellers</span>
            <h2>Sản phẩm nổi bật</h2>
          </div>
          <div className="pr-prod-grid">
            {featuredPhotos.map((url) => (
              <div className="pr-prod-card" key={url}>
                <img src={url} alt="" />
              </div>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <section className="pr-section pr-about" id="about">
          <div>
            <span className="pr-eyebrow">Về chúng tôi</span>
            <p style={{ marginTop: 14 }}>{studio.description}</p>
          </div>
          {featuredPhotos[1] && (
            <div className="pr-about-photo">
              <img src={featuredPhotos[1]} alt="" />
            </div>
          )}
        </section>
      )}

      {showPricing && (
        <section className="pr-section" id="pricing">
          <div className="pr-section-head">
            <span className="pr-eyebrow">Bảng giá</span>
            <h2>Các gói dịch vụ</h2>
          </div>
          <div className="pr-pricing">
            {pricingPlans.map((plan) => (
              <PrPricingCard key={plan.id} plan={plan} showCta={showContact} />
            ))}
          </div>
        </section>
      )}

      {showContact && (
        <footer className="pr-contact" id="contact">
          <div className="pr-contact-row">
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
          <div className="pr-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
