/** The real Album cover ("bìa album") styles — single source of truth for
 * the Settings template picker and the Landing Page's template lookup.
 * Each value must match a key in ALBUM_HERO_COMPONENTS
 * (components/album-templates/index.tsx). */
export const ALBUM_TEMPLATES = [
  { value: "classic", label: "Classic" },
  { value: "romantic", label: "Romantic" },
  { value: "modern", label: "Modern" },
  { value: "luxury", label: "Luxury" },
  { value: "minimal", label: "Minimal" },
  { value: "vintage", label: "Vintage" },
  { value: "nature", label: "Nature" },
  { value: "beach", label: "Beach / Sunset" },
  { value: "editorial", label: "Editorial" },
  { value: "korean", label: "Korean / Soft" },
  { value: "kyyeu", label: "Kỷ yếu" },
] as const;

export type AlbumTemplateId = (typeof ALBUM_TEMPLATES)[number]["value"];

export const DEFAULT_ALBUM_TEMPLATE: AlbumTemplateId = "classic";

export function isAlbumTemplateId(value: string): value is AlbumTemplateId {
  return ALBUM_TEMPLATES.some((t) => t.value === value);
}
