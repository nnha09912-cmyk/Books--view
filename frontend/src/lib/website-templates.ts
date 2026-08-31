/** The 17 Studio Website templates (Website Templates_FINAL.md, section 26
 * "DANH SÁCH FINAL") — single source of truth for the template picker and
 * the [studioSlug] route's template lookup. Each value must match a key in
 * WEBSITE_TEMPLATE_COMPONENTS (components/website-templates/index.tsx).
 * Only "minimal-elegant" has a real component so far — the rest are listed
 * now (per the spec: "kiến trúc phải hỗ trợ toàn bộ" master library) but
 * still fall back to it until built. */
export const WEBSITE_TEMPLATES = [
  { value: "minimal-elegant", label: "01 · Minimal Elegant" },
  { value: "dark-cinematic", label: "02 · Dark Cinematic" },
  { value: "light-natural", label: "03 · Light & Natural" },
  { value: "bw-editorial", label: "04 · Black & White Editorial" },
  { value: "luxury-elegant", label: "05 · Luxury & Elegant" },
  { value: "modern-creative", label: "06 · Modern & Creative" },
  { value: "romantic-pastel", label: "07 · Romantic Pastel" },
  { value: "vintage-film", label: "08 · Vintage Film" },
  { value: "moody-dark", label: "09 · Moody Dark" },
  { value: "clean-minimal", label: "10 · Clean Minimal" },
  { value: "rustic-warm", label: "11 · Rustic & Warm" },
  { value: "editorial-magazine", label: "12 · Editorial Magazine" },
  { value: "nature-green", label: "13 · Nature Green" },
  { value: "bold-modern", label: "14 · Bold & Modern" },
  { value: "yearbook", label: "15 · Yearbook / Kỷ yếu" },
  { value: "event", label: "16 · Event / Sự kiện" },
  { value: "product", label: "17 · Product / Sản phẩm" },
] as const;

export type WebsiteTemplateId = (typeof WEBSITE_TEMPLATES)[number]["value"];

export const DEFAULT_WEBSITE_TEMPLATE: WebsiteTemplateId = "minimal-elegant";

export function isWebsiteTemplateId(value: string): value is WebsiteTemplateId {
  return WEBSITE_TEMPLATES.some((t) => t.value === value);
}

/** Which template ids have a real, distinct component (see
 * components/website-templates/index.tsx) — everything else is still
 * selectable in the Template picker (per BOOKS_VIEW_TEMPLATES/README.md's
 * own "kiến trúc phải hỗ trợ toàn bộ" master-library intent, and so a
 * Studio can already express a preference for one admin builds later) but
 * renders as Minimal Elegant until built, and gets a "Sắp có" badge in the
 * picker so that fallback isn't mistaken for the real thing. */
export const BUILT_WEBSITE_TEMPLATES = new Set<WebsiteTemplateId>([
  "minimal-elegant",
  "dark-cinematic",
  "light-natural",
  "bw-editorial",
  "luxury-elegant",
  "modern-creative",
  "romantic-pastel",
  "vintage-film",
  "moody-dark",
  "clean-minimal",
  "rustic-warm",
  "editorial-magazine",
  "nature-green",
  "bold-modern",
  "yearbook",
  "event",
  "product",
]);

export function isWebsiteTemplateBuilt(value: WebsiteTemplateId): boolean {
  return BUILT_WEBSITE_TEMPLATES.has(value);
}
