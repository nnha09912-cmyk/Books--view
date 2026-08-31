import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Camera,
  Printer,
  Gift,
  ShieldAlert,
  CornerDownRight,
} from "lucide-react";
import type { WebsiteTemplateProps, WebsitePricingPlanData } from "./types";

/** A section only renders when there's no explicit WebsiteSection row
 * disabling it — with no Studio Editor yet to create those rows, every
 * template's fixed default section set stays fully visible until one
 * exists (spec: "Template quyết định ... thứ tự / bật/tắt section", but a
 * missing row is not the same as an explicit "off"). */
function isEnabled(sections: WebsiteTemplateProps["sections"], type: string) {
  const row = sections.find((s) => s.type === type);
  return row ? row.enabled : true;
}

function WmPricingCard({ plan, showCta }: { plan: WebsitePricingPlanData; showCta: boolean }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    plan.features.length > 0 || plan.printProducts.length > 0 || plan.gifts.length > 0 || plan.notes.length > 0;
  return (
    <div className="wm-plan-card">
      <h3>{plan.name}</h3>
      <div className="wm-plan-card-price">
        <strong>{plan.price}</strong>
        {plan.unit && <span>{plan.unit}</span>}
      </div>
      {plan.tagline && <p className="wm-plan-tagline">&quot;{plan.tagline}&quot;</p>}
      {plan.description && (
        <div className="wm-plan-desc">
          <span className="wm-plan-desc-label">
            <Camera size={13} /> Dịch vụ
          </span>
          <p>{plan.description}</p>
        </div>
      )}
      {showCta && (
        <a className="wm-cta" href="#contact" style={{ justifyContent: "center" }}>
          Tư vấn ngay
        </a>
      )}
      {hasDetails && (
        <>
          <button type="button" className="wm-plan-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="wm-plan-details">
              {plan.features.length > 0 && (
                <ul className="wm-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.printProducts.length > 0 && (
                <div className="wm-plan-sub">
                  <span className="wm-plan-sub-label">
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
                <div className="wm-plan-sub">
                  <span className="wm-plan-sub-label">
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
                <div className="wm-plan-sub">
                  <span className="wm-plan-sub-label">
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

/** TEMPLATE 01 — MINIMAL ELEGANT (BOOKS_VIEW_TEMPLATES/template-01-*.md).
 * Cream + black + yellow/blue accent — "Direction A" from the master
 * spec's locked Design Direction (section 6/37), matching the "1997
 * Studio" visual reference exactly: split hero (headline left, arched
 * photo right with two overlapping accent circles), underlined section
 * eyebrows, a soft-yellow "About" band, dark footer with icon contact
 * rows. Fixed section order: Header → Hero → Portfolio nổi bật → Albums →
 * About Studio → Contact → Footer. */
export function MinimalElegantWebsite({ studio, sections, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const showPortfolio = isEnabled(sections, "portfolio") && featuredPhotos.length > 0;
  const showAlbums = isEnabled(sections, "albums") && albums.length > 0;
  const showAbout = isEnabled(sections, "about") && !!studio.description;
  const showContact = isEnabled(sections, "contact");
  const showPricing = pricingPlans.length > 0;

  // Single-row auto-sliding portfolio banner: advances one item every 4s
  // (or on manual prev/next), looping forever in both directions. Standard
  // bidirectional "doubled track" trick — the last `visibleCount` photos
  // are prepended and the first `visibleCount` are appended, so stepping
  // one past either real end shows pixels identical to the opposite real
  // end, and we can snap back invisibly (transition disabled for one
  // frame) instead of jumping visibly.
  const visibleCount = 4;
  const photoCount = featuredPhotos.length;
  const canLoop = photoCount > visibleCount;
  const carouselPhotos = canLoop
    ? [...featuredPhotos.slice(-visibleCount), ...featuredPhotos, ...featuredPhotos.slice(0, visibleCount)]
    : featuredPhotos;
  const [carouselOffset, setCarouselOffset] = useState(canLoop ? visibleCount : 0);
  const [carouselTransition, setCarouselTransition] = useState(true);

  function stepForward() {
    setCarouselOffset((o) => o + 1);
  }
  function stepBackward() {
    setCarouselOffset((o) => o - 1);
  }

  // Re-arms itself on every offset change (auto tick, manual click, or a
  // wrap-snap) — a manual click this way always pushes the next auto-step
  // a full 4s out, instead of an auto-tick landing right on top of it.
  useEffect(() => {
    if (!canLoop) return;
    const id = setTimeout(stepForward, 4000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carouselOffset, canLoop]);

  useEffect(() => {
    if (!canLoop) return;
    const atEnd = carouselOffset === visibleCount + photoCount;
    const atStart = carouselOffset === visibleCount - 1;
    if (!atEnd && !atStart) return;
    const t = setTimeout(() => {
      setCarouselTransition(false);
      setCarouselOffset(atEnd ? visibleCount : visibleCount + photoCount - 1);
    }, 650);
    return () => clearTimeout(t);
  }, [carouselOffset, canLoop, photoCount]);

  useEffect(() => {
    if (carouselTransition) return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setCarouselTransition(true)));
    return () => cancelAnimationFrame(raf);
  }, [carouselTransition]);

  return (
    <div className="tpl-web-minimal">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&family=Manrope:wght@400;500;700&display=swap"
      />
      <style>{`
        .tpl-web-minimal {
          --wm-yellow: #f2b134;
          --wm-blue: #5b8fd4;
          --wm-cream: #faf6ee;
          --wm-ink: #1a1a1a;
          background: var(--wm-cream);
          color: var(--wm-ink);
          font-family: "Manrope", "Jost", sans-serif;
        }
        .tpl-web-minimal .wm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 48px; position: sticky; top: 0; z-index: 10;
          background: rgba(250,246,238,0.92); backdrop-filter: blur(6px);
        }
        .tpl-web-minimal .wm-brand { display: flex; align-items: center; gap: 10px; }
        .tpl-web-minimal .wm-brand img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
        .tpl-web-minimal .wm-brand span {
          font-family: "Jost", sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 0.02em; text-transform: uppercase;
        }
        .tpl-web-minimal .wm-nav { display: flex; align-items: center; gap: 26px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
        .tpl-web-minimal .wm-nav a { color: var(--wm-ink); text-decoration: none; padding-bottom: 4px; border-bottom: 2px solid transparent; }
        .tpl-web-minimal .wm-nav a:hover { border-bottom-color: var(--wm-yellow); }
        .tpl-web-minimal .wm-cta {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--wm-yellow); color: var(--wm-ink); font-weight: 700; font-size: 13px;
          padding: 11px 22px; border-radius: 999px; text-decoration: none; white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .tpl-web-minimal .wm-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(0,0,0,0.15); }
        .tpl-web-minimal .wm-cta.outline { background: transparent; border: 1.5px solid var(--wm-ink); }

        .tpl-web-minimal .wm-hero {
          display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 40px;
          padding: 40px 48px 90px; max-width: 1280px; margin: 0 auto;
        }
        .tpl-web-minimal .wm-hero h1 {
          font-family: "Jost", sans-serif; font-weight: 700; text-transform: uppercase;
          font-size: clamp(34px, 4.6vw, 54px); line-height: 1.08; margin: 0 0 18px;
        }
        .tpl-web-minimal .wm-hero-sub {
          display: inline-block; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          padding-bottom: 6px; border-bottom: 3px solid var(--wm-yellow); margin-bottom: 18px;
        }
        .tpl-web-minimal .wm-hero p { font-size: 15px; line-height: 1.7; color: #4a4638; max-width: 420px; margin: 0 0 26px; }
        .tpl-web-minimal .wm-hero-art { position: relative; }
        .tpl-web-minimal .wm-hero-art .frame {
          width: 100%; aspect-ratio: 4/5; border-radius: 260px 260px 0 0;
          background: #ece7dc; background-size: cover; background-position: center;
          position: relative; z-index: 2;
        }
        .tpl-web-minimal .wm-hero-art .dot {
          position: absolute; border-radius: 50%; z-index: 1;
        }
        .tpl-web-minimal .wm-hero-art .dot.yellow { width: 130px; height: 130px; background: var(--wm-yellow); left: -30px; bottom: 40px; }
        .tpl-web-minimal .wm-hero-art .dot.blue { width: 68px; height: 68px; background: var(--wm-blue); left: 30px; bottom: 0; }

        .tpl-web-minimal .wm-section { padding: 80px 48px; max-width: 1280px; margin: 0 auto; }
        .tpl-web-minimal .wm-section-head {
          display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 44px; position: relative;
        }
        .tpl-web-minimal .wm-section-head h2 {
          font-family: "Jost", sans-serif; font-weight: 700; text-transform: uppercase;
          font-size: 13px; letter-spacing: 0.14em; padding-bottom: 8px; border-bottom: 3px solid var(--wm-yellow);
        }
        .tpl-web-minimal .wm-nav-arrows { position: absolute; right: 0; display: flex; gap: 8px; }
        .tpl-web-minimal .wm-nav-arrows button {
          width: 36px; height: 36px; border-radius: 50%; border: 1px solid #ddd3bd; background: #fff;
          display: flex; align-items: center; justify-content: center; color: var(--wm-ink);
          cursor: pointer; transition: background 0.2s ease, border-color 0.2s ease;
        }
        .tpl-web-minimal .wm-nav-arrows button:hover { background: var(--wm-yellow); border-color: var(--wm-yellow); }
        .tpl-web-minimal .wm-nav-arrows button:disabled { cursor: default; opacity: 0.4; }
        .tpl-web-minimal .wm-nav-arrows button:disabled:hover { background: #fff; border-color: #ddd3bd; }
        .tpl-web-minimal .wm-carousel { overflow: hidden; margin: 0 -9px; }
        .tpl-web-minimal .wm-carousel-track { display: flex; }
        .tpl-web-minimal .wm-carousel-item { flex: 0 0 25%; padding: 0 9px; box-sizing: border-box; }
        .tpl-web-minimal .wm-carousel-item img {
          width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 14px; display: block;
        }
        .tpl-web-minimal .wm-albums { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 26px; }
        .tpl-web-minimal .wm-album-card { text-decoration: none; color: inherit; display: block; }
        .tpl-web-minimal .wm-album-card .thumb {
          width: 100%; aspect-ratio: 4/3; border-radius: 14px; margin-bottom: 14px; display: block;
          background: #ece7dc; overflow: hidden;
        }
        .tpl-web-minimal .wm-album-card img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s ease; }
        .tpl-web-minimal .wm-album-card:hover img { transform: scale(1.05); }
        .tpl-web-minimal .wm-album-card h3 { font-family: "Jost", sans-serif; font-size: 17px; margin: 0 0 4px; font-weight: 700; }
        .tpl-web-minimal .wm-album-card p { font-size: 13px; color: #8a7f68; margin: 0; }

        .tpl-web-minimal .wm-about-wrap { padding: 0 48px 90px; max-width: 1280px; margin: 0 auto; }
        .tpl-web-minimal .wm-about {
          background: #f7e6bf; border-radius: 28px; padding: 48px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
          position: relative; overflow: visible;
        }
        .tpl-web-minimal .wm-about h2 { font-family: "Jost", sans-serif; font-weight: 700; font-size: 28px; margin: 0 0 14px; text-transform: uppercase; }
        .tpl-web-minimal .wm-about p { font-size: 15px; line-height: 1.8; color: #4a4638; margin: 0 0 22px; }
        .tpl-web-minimal .wm-about-img { position: relative; }
        .tpl-web-minimal .wm-about-img img { width: 100%; aspect-ratio: 4/3; object-fit: cover; border-radius: 18px; display: block; }
        .tpl-web-minimal .wm-about-img .dot.blue {
          position: absolute; width: 90px; height: 90px; border-radius: 50%; background: var(--wm-blue);
          right: -24px; bottom: -24px; z-index: -1;
        }

        .tpl-web-minimal .wm-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tpl-web-minimal .wm-plan-card { border: 1px solid #ece3ce; border-radius: 12px; padding: 28px 24px; background: #fff; display: flex; flex-direction: column; }
        .tpl-web-minimal .wm-plan-card h3 { font-family: "Jost", sans-serif; font-size: 15px; font-weight: 700; margin: 0 0 10px; }
        .tpl-web-minimal .wm-plan-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .tpl-web-minimal .wm-plan-card-price strong { font-family: "Jost", sans-serif; font-size: 24px; color: #b8891f; }
        .tpl-web-minimal .wm-plan-card-price span { font-size: 12px; color: #8a7f68; }
        .tpl-web-minimal .wm-plan-tagline { font-style: italic; font-size: 13px; color: #6b6355; margin: 0 0 14px; }
        .tpl-web-minimal .wm-plan-desc { margin: 0 0 14px; }
        .tpl-web-minimal .wm-plan-desc-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #b8891f; margin-bottom: 6px; }
        .tpl-web-minimal .wm-plan-desc p { font-size: 13px; color: #6b6355; line-height: 1.7; margin: 0; }
        .tpl-web-minimal .wm-plan-toggle { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 12px 0 0; margin-top: auto; font-size: 12.5px; font-weight: 600; color: #b8891f; cursor: pointer; font-family: inherit; }
        .tpl-web-minimal .wm-plan-details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #ece3ce; display: flex; flex-direction: column; gap: 16px; }
        .tpl-web-minimal .wm-plan-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tpl-web-minimal .wm-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #4a4638; line-height: 1.5; }
        .tpl-web-minimal .wm-plan-features svg { color: var(--wm-yellow); flex-shrink: 0; margin-top: 2px; }
        .tpl-web-minimal .wm-plan-sub-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #b8891f; margin-bottom: 8px; }
        .tpl-web-minimal .wm-plan-sub ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .tpl-web-minimal .wm-plan-sub ul li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #4a4638; line-height: 1.5; }
        .tpl-web-minimal .wm-plan-sub ul li svg { flex-shrink: 0; margin-top: 2px; color: #8a7f68; }

        .tpl-web-minimal .wm-contact {
          background: var(--wm-ink); color: #fdfcfa; padding: 56px 48px 28px;
        }
        .tpl-web-minimal .wm-contact-grid {
          max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 32px; padding-bottom: 32px;
        }
        .tpl-web-minimal .wm-contact-grid h3 { font-family: "Jost", sans-serif; font-weight: 700; font-size: 16px; margin: 0 0 10px; text-transform: uppercase; }
        .tpl-web-minimal .wm-contact-grid p { font-size: 13px; color: #b8b2a3; margin: 0 0 14px; line-height: 1.6; }
        .tpl-web-minimal .wm-contact-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #ddd8ca; margin-bottom: 8px; }
        .tpl-web-minimal .wm-contact-row svg { color: var(--wm-yellow); flex-shrink: 0; }
        .tpl-web-minimal .wm-footer-bottom {
          max-width: 1280px; margin: 0 auto; border-top: 1px solid #3a3730; padding-top: 20px;
          text-align: center; font-size: 12px; color: #8a8478;
        }

        @media (max-width: 900px) {
          .tpl-web-minimal .wm-hero { grid-template-columns: 1fr; padding-bottom: 60px; }
          .tpl-web-minimal .wm-nav { display: none; }
          .tpl-web-minimal .wm-about { grid-template-columns: 1fr; }
          .tpl-web-minimal .wm-contact-grid { grid-template-columns: 1fr; }
          .tpl-web-minimal .wm-header, .tpl-web-minimal .wm-section, .tpl-web-minimal .wm-about-wrap, .tpl-web-minimal .wm-contact { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      <header className="wm-header">
        <div className="wm-brand">
          {studio.logoUrl && <img src={studio.logoUrl} alt={studio.name} />}
          <span>{studio.name}</span>
        </div>
        <nav className="wm-nav">
          {showPortfolio && <a href="#portfolio">Portfolio</a>}
          {showAlbums && <a href="#albums">Album</a>}
          {showAbout && <a href="#about">Giới thiệu</a>}
          {showContact && <a href="#contact">Liên hệ</a>}
        </nav>
        {showContact && (
          <a className="wm-cta" href="#contact">
            Tư vấn ngay
          </a>
        )}
      </header>

      <section className="wm-hero">
        <div>
          <span className="wm-hero-sub">Wedding &amp; Portrait Photography</span>
          <h1>{studio.name}</h1>
          {studio.description && <p>{studio.description}</p>}
          {showPortfolio && (
            <a className="wm-cta" href="#portfolio">
              Xem Portfolio <ArrowRight size={15} />
            </a>
          )}
        </div>
        <div className="wm-hero-art">
          <div className="frame" style={studio.cover ? { backgroundImage: `url("${studio.cover}")` } : undefined} />
          <div className="dot yellow" />
          <div className="dot blue" />
        </div>
      </section>

      {showPortfolio && (
        <section className="wm-section" id="portfolio">
          <div className="wm-section-head">
            <h2>Portfolio nổi bật</h2>
            <div className="wm-nav-arrows">
              <button type="button" onClick={stepBackward} disabled={!canLoop} aria-label="Ảnh trước">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={stepForward} disabled={!canLoop} aria-label="Ảnh tiếp theo">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="wm-carousel">
            <div
              className="wm-carousel-track"
              style={{
                transform: `translateX(-${carouselOffset * (100 / visibleCount)}%)`,
                transition: carouselTransition ? "transform 0.6s ease" : "none",
              }}
            >
              {carouselPhotos.map((url, i) => (
                <div className="wm-carousel-item" key={`${url}-${i}`}>
                  <img src={url} alt="" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showAlbums && (
        <section className="wm-section" id="albums">
          <div className="wm-section-head">
            <h2>Album</h2>
          </div>
          <div className="wm-albums">
            {albums.map((a) => (
              <Link key={a.id} href={`/album/${a.linkToken}`} className="wm-album-card">
                <div className="thumb">{a.coverUrl && <img src={a.coverUrl} alt={a.name} />}</div>
                <h3>{a.name}</h3>
                <p>{a.photoCount} ảnh</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {showAbout && (
        <div className="wm-about-wrap" id="about">
          <div className="wm-about">
            <div>
              <h2>Về {studio.name}</h2>
              <p>{studio.description}</p>
              {showContact && (
                <a className="wm-cta outline" href="#contact">
                  Tìm hiểu thêm
                </a>
              )}
            </div>
            {featuredPhotos[0] && (
              <div className="wm-about-img">
                <img src={featuredPhotos[0]} alt="" />
                <div className="dot blue" />
              </div>
            )}
          </div>
        </div>
      )}

      {showPricing && (
        <section className="wm-section" id="pricing">
          <div className="wm-section-head">
            <h2>Bảng giá</h2>
          </div>
          <div className="wm-pricing">
            {pricingPlans.map((plan) => (
              <WmPricingCard key={plan.id} plan={plan} showCta={showContact} />
            ))}
          </div>
        </section>
      )}

      {showContact && (
        <footer className="wm-contact" id="contact">
          <div className="wm-contact-grid">
            <div>
              <h3>{studio.name}</h3>
              <p>Wedding &amp; Portrait Photography</p>
            </div>
            <div>
              <h3>Thông tin liên hệ</h3>
              {studio.address && (
                <div className="wm-contact-row">
                  <MapPin size={15} />
                  {studio.address}
                </div>
              )}
              {studio.phone && (
                <div className="wm-contact-row">
                  <Phone size={15} />
                  {studio.phone}
                </div>
              )}
              <div className="wm-contact-row">
                <Mail size={15} />
                {studio.email}
              </div>
            </div>
            <div>
              <h3>Album</h3>
              {albums.slice(0, 4).map((a) => (
                <p key={a.id} style={{ marginBottom: 4 }}>
                  {a.name}
                </p>
              ))}
            </div>
          </div>
          <div className="wm-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </footer>
      )}
    </div>
  );
}
