import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, MapPin, Phone, Mail, Camera, Users, PartyPopper, BookImage, ChevronDown, ChevronUp, Printer, Gift, ShieldAlert, CornerDownRight } from "lucide-react";
import type { WebsiteTemplateProps, WebsitePricingPlanData } from "./types";

function LsPricingCard({ plan }: { plan: WebsitePricingPlanData }) {
  const [open, setOpen] = useState(false);
  const hasDetails =
    plan.features.length > 0 || plan.printProducts.length > 0 || plan.gifts.length > 0 || plan.notes.length > 0;
  return (
    <div className="ls-plan-card">
      <h3>{plan.name}</h3>
      <div className="ls-plan-card-price">
        <strong>{plan.price}</strong>
        {plan.unit && <span>{plan.unit}</span>}
      </div>
      {plan.tagline && <p className="ls-plan-tagline">&quot;{plan.tagline}&quot;</p>}
      {plan.description && (
        <div className="ls-plan-desc">
          <span className="ls-plan-desc-label">
            <Camera size={13} /> Dịch vụ
          </span>
          <p>{plan.description}</p>
        </div>
      )}
      <a className="ls-cta" href="#contact" style={{ justifyContent: "center" }}>
        Tư vấn ngay
      </a>
      {hasDetails && (
        <>
          <button type="button" className="ls-plan-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {open && (
            <div className="ls-plan-details">
              {plan.features.length > 0 && (
                <ul className="ls-plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              {plan.printProducts.length > 0 && (
                <div className="ls-plan-sub">
                  <span className="ls-plan-sub-label">
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
                <div className="ls-plan-sub">
                  <span className="ls-plan-sub-label">
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
                <div className="ls-plan-sub">
                  <span className="ls-plan-sub-label">
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

/** EXPERIMENTAL — LANDING PAGE DEMO (not one of the 17 spec'd templates;
 * a separate, standalone concept the user asked to prototype: a compact
 * single-page landing site with an auto-sliding photo carousel, ONE
 * primary/"cửa chính" Album instead of a full list, a static Services
 * row, and a real Bảng giá (pricing) accordion backed by the Studio's own
 * WebsitePricingPlan rows. Header nav are plain #anchor links + CSS
 * `scroll-behavior: smooth` — no JS scroll handling needed. */
export function LandingShowcaseWebsite({ studio, albums, featuredPhotos, pricingPlans }: WebsiteTemplateProps) {
  const [slide, setSlide] = useState(0);
  const slides = featuredPhotos.length > 0 ? featuredPhotos : studio.cover ? [studio.cover] : [];
  const mainAlbum = albums[0] ?? null;

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setSlide((i) => (i + 1) % slides.length), 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="tpl-web-landing">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap"
      />
      <style>{`
        html { scroll-behavior: smooth; }
        .tpl-web-landing { background: #faf7f2; color: #241f19; font-family: "Manrope", sans-serif; }
        .tpl-web-landing .ls-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 48px; position: sticky; top: 0; z-index: 20;
          background: rgba(250,247,242,0.92); backdrop-filter: blur(6px);
          border-bottom: 1px solid #e9e0d2;
        }
        .tpl-web-landing .ls-brand { display: flex; align-items: center; gap: 10px; font-family: "Fraunces", serif; font-weight: 600; font-size: 18px; }
        .tpl-web-landing .ls-brand img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
        .tpl-web-landing .ls-nav { display: flex; gap: 24px; font-size: 12.5px; font-weight: 600; color: #5c5346; }
        .tpl-web-landing .ls-nav a { color: inherit; text-decoration: none; }
        .tpl-web-landing .ls-nav a:hover { color: #c9713f; }

        .tpl-web-landing .ls-carousel { position: relative; height: 68vh; min-height: 420px; overflow: hidden; background: #ece3d3; }
        .tpl-web-landing .ls-slide { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; transition: opacity 0.9s ease; }
        .tpl-web-landing .ls-slide.active { opacity: 1; }
        .tpl-web-landing .ls-carousel::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,16,10,0.05) 0%, rgba(20,16,10,0.6) 100%); }
        .tpl-web-landing .ls-hero-copy { position: absolute; left: 48px; bottom: 40px; z-index: 1; color: #fff; max-width: 560px; }
        .tpl-web-landing .ls-hero-tagline { display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #f0c19b; margin-bottom: 10px; }
        .tpl-web-landing .ls-hero-copy h1 { font-family: "Fraunces", serif; font-weight: 600; font-size: clamp(28px, 4.2vw, 44px); margin: 0 0 10px; line-height: 1.12; }
        .tpl-web-landing .ls-hero-copy p { font-size: 14px; color: #f0e9db; margin: 0; max-width: 440px; }
        .tpl-web-landing .ls-dots { position: absolute; right: 48px; bottom: 40px; z-index: 1; display: flex; gap: 7px; }
        .tpl-web-landing .ls-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.45); transition: background 0.2s ease; }
        .tpl-web-landing .ls-dot.active { background: #fff; }

        .tpl-web-landing .ls-section { padding: 68px 48px; max-width: 1200px; margin: 0 auto; scroll-margin-top: 76px; }
        .tpl-web-landing .ls-section-head { margin-bottom: 34px; }
        .tpl-web-landing .ls-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #c9713f; font-weight: 700; }
        .tpl-web-landing .ls-section-head h2 { font-family: "Fraunces", serif; font-weight: 600; font-size: 26px; margin: 8px 0 0; }

        .tpl-web-landing .ls-album { display: grid; grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: center; }
        .tpl-web-landing .ls-album .thumb { aspect-ratio: 4/3; border-radius: 16px; overflow: hidden; background: #ece3d3; }
        .tpl-web-landing .ls-album .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tpl-web-landing .ls-album h3 { font-family: "Fraunces", serif; font-size: 24px; font-weight: 600; margin: 0 0 10px; }
        .tpl-web-landing .ls-album p { font-size: 14px; color: #6b6255; line-height: 1.75; margin: 0 0 22px; }
        .tpl-web-landing .ls-cta {
          display: inline-flex; align-items: center; gap: 8px; background: #c9713f; color: #fff;
          font-size: 13px; font-weight: 700; padding: 12px 26px; border-radius: 999px; text-decoration: none;
          transition: background 0.2s ease; width: fit-content;
        }
        .tpl-web-landing .ls-cta:hover { background: #a85a2f; }

        .tpl-web-landing .ls-services { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
        .tpl-web-landing .ls-service { background: #fff; border: 1px solid #e9e0d2; border-radius: 14px; padding: 24px 18px; text-align: center; }
        .tpl-web-landing .ls-service svg { color: #c9713f; margin-bottom: 12px; }
        .tpl-web-landing .ls-service h4 { font-size: 13.5px; font-weight: 700; margin: 0 0 4px; }
        .tpl-web-landing .ls-service p { font-size: 12px; color: #8a8074; margin: 0; line-height: 1.6; }

        .tpl-web-landing .ls-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .tpl-web-landing .ls-plan-card { border: 1px solid #e9e0d2; border-radius: 14px; padding: 28px 24px; background: #fff; display: flex; flex-direction: column; }
        .tpl-web-landing .ls-plan-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 10px; }
        .tpl-web-landing .ls-plan-card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
        .tpl-web-landing .ls-plan-card-price strong { font-family: "Fraunces", serif; font-size: 25px; color: #c9713f; }
        .tpl-web-landing .ls-plan-card-price span { font-size: 12px; color: #8a8074; }
        .tpl-web-landing .ls-plan-tagline { font-family: "Fraunces", serif; font-style: italic; font-size: 14.5px; color: #6b6255; margin: 0 0 14px; }
        .tpl-web-landing .ls-plan-desc { margin: 0 0 14px; }
        .tpl-web-landing .ls-plan-desc-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #c9713f; margin-bottom: 6px; }
        .tpl-web-landing .ls-plan-desc p { font-size: 13px; color: #6b6255; line-height: 1.7; margin: 0; }
        .tpl-web-landing .ls-plan-toggle { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: none; padding: 12px 0 0; margin-top: auto; font-size: 12.5px; font-weight: 700; color: #c9713f; cursor: pointer; font-family: inherit; }
        .tpl-web-landing .ls-plan-details { margin-top: 14px; padding-top: 14px; border-top: 1px solid #e9e0d2; display: flex; flex-direction: column; gap: 16px; }
        .tpl-web-landing .ls-plan-features { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .tpl-web-landing .ls-plan-features li { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #4a4338; line-height: 1.5; }
        .tpl-web-landing .ls-plan-features svg { color: #c9713f; flex-shrink: 0; margin-top: 2px; }
        .tpl-web-landing .ls-plan-sub-label { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #c9713f; margin-bottom: 8px; }
        .tpl-web-landing .ls-plan-sub ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .tpl-web-landing .ls-plan-sub ul li { display: flex; align-items: flex-start; gap: 6px; font-size: 12.5px; color: #4a4338; line-height: 1.5; }
        .tpl-web-landing .ls-plan-sub ul li svg { flex-shrink: 0; margin-top: 2px; color: #8a8074; }
        .tpl-web-landing .ls-pricing-empty { font-size: 13.5px; color: #8a8074; }

        .tpl-web-landing .ls-contact { background: #241f19; color: #f0e9db; padding: 48px 48px 24px; }
        .tpl-web-landing .ls-contact-inner { max-width: 1200px; margin: 0 auto; }
        .tpl-web-landing .ls-contact-brand { display: flex; align-items: center; gap: 10px; font-family: "Fraunces", serif; font-weight: 600; font-size: 18px; margin-bottom: 10px; }
        .tpl-web-landing .ls-contact-brand img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
        .tpl-web-landing .ls-contact p.desc { font-size: 13.5px; color: #c9c0af; max-width: 480px; line-height: 1.7; margin: 0 0 22px; }
        .tpl-web-landing .ls-contact-row { display: flex; gap: 26px; flex-wrap: wrap; font-size: 13px; color: #d8d0c1; margin-bottom: 22px; }
        .tpl-web-landing .ls-contact-row span { display: inline-flex; align-items: center; gap: 6px; }
        .tpl-web-landing .ls-footer-bottom { font-size: 11px; color: #8a8074; border-top: 1px solid #3a342b; padding-top: 16px; }

        @media (max-width: 900px) {
          .tpl-web-landing .ls-nav { display: none; }
          .tpl-web-landing .ls-album { grid-template-columns: 1fr; }
          .tpl-web-landing .ls-services { grid-template-columns: repeat(2, 1fr); }
          .tpl-web-landing .ls-hero-copy { right: 48px; }
          .tpl-web-landing .ls-dots { display: none; }
        }
      `}</style>

      <header className="ls-header">
        <div className="ls-brand">
          {studio.logoUrl && <img src={studio.logoUrl} alt={studio.name} />}
          {studio.name}
        </div>
        <nav className="ls-nav">
          <a href="#hero">Trang chủ</a>
          {mainAlbum && <a href="#album">Album</a>}
          <a href="#services">Dịch vụ</a>
          <a href="#pricing">Bảng giá</a>
          <a href="#contact">Liên hệ</a>
        </nav>
      </header>

      <section className="ls-carousel" id="hero">
        {slides.map((url, i) => (
          <div key={url} className={`ls-slide${i === slide ? " active" : ""}`} style={{ backgroundImage: `url("${url}")` }} />
        ))}
        <div className="ls-hero-copy">
          {studio.tagline && <span className="ls-hero-tagline">{studio.tagline}</span>}
          <h1>{studio.name}</h1>
          <p>{studio.description ?? "Lưu giữ khoảnh khắc đẹp nhất của bạn."}</p>
        </div>
        {slides.length > 1 && (
          <div className="ls-dots">
            {slides.map((url, i) => (
              <span key={url} className={`ls-dot${i === slide ? " active" : ""}`} />
            ))}
          </div>
        )}
      </section>

      {mainAlbum && (
        <section className="ls-section ls-album" id="album">
          <div className="thumb">{mainAlbum.coverUrl && <img src={mainAlbum.coverUrl} alt={mainAlbum.name} />}</div>
          <div>
            <span className="ls-eyebrow">Album nổi bật</span>
            <h3>{mainAlbum.name}</h3>
            <p>{mainAlbum.description ?? `${mainAlbum.photoCount} ảnh trong album này.`}</p>
            <Link className="ls-cta" href={`/album/${mainAlbum.linkToken}`}>
              Xem album
            </Link>
          </div>
        </section>
      )}

      <section className="ls-section" id="services">
        <div className="ls-section-head">
          <span className="ls-eyebrow">Dịch vụ</span>
          <h2>Chúng tôi cung cấp</h2>
        </div>
        <div className="ls-services">
          <div className="ls-service">
            <Camera size={24} strokeWidth={1.4} />
            <h4>Chụp ảnh cưới</h4>
            <p>Ghi lại khoảnh khắc trọn vẹn ngày trọng đại</p>
          </div>
          <div className="ls-service">
            <Users size={24} strokeWidth={1.4} />
            <h4>Chụp ảnh gia đình</h4>
            <p>Lưu giữ kỷ niệm bên những người thân yêu</p>
          </div>
          <div className="ls-service">
            <PartyPopper size={24} strokeWidth={1.4} />
            <h4>Chụp sự kiện</h4>
            <p>Đồng hành cùng mọi sự kiện quan trọng của bạn</p>
          </div>
          <div className="ls-service">
            <BookImage size={24} strokeWidth={1.4} />
            <h4>Album in ấn</h4>
            <p>Album ảnh cao cấp, thiết kế riêng theo yêu cầu</p>
          </div>
        </div>
      </section>

      <section className="ls-section" id="pricing">
        <div className="ls-section-head">
          <span className="ls-eyebrow">Bảng giá</span>
          <h2>Các gói dịch vụ</h2>
        </div>
        {pricingPlans.length === 0 ? (
          <p className="ls-pricing-empty">Studio chưa cập nhật bảng giá.</p>
        ) : (
          <div className="ls-pricing">
            {pricingPlans.map((plan) => (
              <LsPricingCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </section>

      <footer className="ls-contact" id="contact">
        <div className="ls-contact-inner">
          <div className="ls-contact-brand">
            {studio.logoUrl && <img src={studio.logoUrl} alt={studio.name} />}
            {studio.name}
          </div>
          {studio.description && <p className="desc">{studio.description}</p>}
          <div className="ls-contact-row">
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
          <div className="ls-footer-bottom">
            © {new Date().getFullYear()} {studio.name} — Powered by Guikhach.com
          </div>
        </div>
      </footer>
    </div>
  );
}
