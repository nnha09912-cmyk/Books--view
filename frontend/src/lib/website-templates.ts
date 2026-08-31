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

/** A standalone prototype, kept OUT of the 17-slot list above on purpose
 * (user's own instruction: don't touch/renumber the 17, keep this "riêng"
 * for demoing before it's decided whether it becomes official) — a compact
 * single-page landing layout: auto-sliding photo carousel, one primary
 * Album instead of the full list, a Services row, and a real Bảng giá
 * (pricing) accordion. Rendered/previewed through the exact same
 * `?previewTemplate=` + Settings "Xem trước" mechanism as the 17. */
export const EXPERIMENTAL_WEBSITE_TEMPLATES = [
  { value: "landing-showcase", label: "Landing Page — Demo mới" },
] as const;

export type WebsiteTemplateId =
  | (typeof WEBSITE_TEMPLATES)[number]["value"]
  | (typeof EXPERIMENTAL_WEBSITE_TEMPLATES)[number]["value"];

export const DEFAULT_WEBSITE_TEMPLATE: WebsiteTemplateId = "minimal-elegant";

export function isWebsiteTemplateId(value: string): value is WebsiteTemplateId {
  return (
    WEBSITE_TEMPLATES.some((t) => t.value === value) ||
    EXPERIMENTAL_WEBSITE_TEMPLATES.some((t) => t.value === value)
  );
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
  "landing-showcase",
]);

export function isWebsiteTemplateBuilt(value: WebsiteTemplateId): boolean {
  return BUILT_WEBSITE_TEMPLATES.has(value);
}

/** Each template's own background/accent/text colors (pulled straight from
 * its component's own CSS custom properties) — drives the small "ảnh demo"
 * swatch shown next to its name in the Settings template dropdown. Not a
 * real screenshot (no screenshot pipeline exists), but a real rendering of
 * that template's actual palette, not a placeholder. */
export const TEMPLATE_SWATCHES: Record<WebsiteTemplateId, { bg: string; accent: string; text: string }> = {
  "minimal-elegant": { bg: "#faf6ee", accent: "#f2b134", text: "#1a1a1a" },
  "dark-cinematic": { bg: "#0e0e0f", accent: "#f3f1ec", text: "#f3f1ec" },
  "light-natural": { bg: "#eef1e7", accent: "#7a8b6f", text: "#2a2a2a" },
  "bw-editorial": { bg: "#0a0a0a", accent: "#f5f5f5", text: "#f5f5f5" },
  "luxury-elegant": { bg: "#f4ede2", accent: "#a08f6b", text: "#2c241c" },
  "modern-creative": { bg: "#ffffff", accent: "#0a0a0a", text: "#0a0a0a" },
  "romantic-pastel": { bg: "#fdf5f2", accent: "#e3a89c", text: "#4a3835" },
  "vintage-film": { bg: "#f4ede1", accent: "#8a7c65", text: "#3a332a" },
  "moody-dark": { bg: "#050505", accent: "#ece8e2", text: "#ece8e2" },
  "clean-minimal": { bg: "#fafafa", accent: "#c4c4c4", text: "#2a2a2a" },
  "rustic-warm": { bg: "#f7f0e6", accent: "#c17a44", text: "#3d2f22" },
  "editorial-magazine": { bg: "#f6f4f0", accent: "#171613", text: "#171613" },
  "nature-green": { bg: "#14231a", accent: "#6b9d5e", text: "#eef2ea" },
  "bold-modern": { bg: "#0a0a0a", accent: "#e2352b", text: "#f2f2f2" },
  yearbook: { bg: "#eaf3fb", accent: "#1f4e8c", text: "#1e2b3a" },
  event: { bg: "#0c0c0c", accent: "#c9a154", text: "#f2ede0" },
  product: { bg: "#f7f1e7", accent: "#a8875a", text: "#2e2620" },
  "landing-showcase": { bg: "#faf7f2", accent: "#c9713f", text: "#241f19" },
};
