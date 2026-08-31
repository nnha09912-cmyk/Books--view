/** Album summary a Studio Website references — read-only, no photos are
 * ever re-uploaded for the website (spec section 31: "Không upload lại
 * ảnh"). coverUrl comes from the Album's own coverPhotoId, resolved by the
 * caller. */
export interface WebsiteAlbumSummary {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  photoCount: number;
  linkToken: string;
}

export interface WebsiteSectionData {
  id: string;
  type: string;
  enabled: boolean;
  orderIndex: number;
  settings: Record<string, unknown> | null;
}

export interface WebsiteStudioProfile {
  name: string;
  slug: string;
  logoUrl: string | null;
  cover: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string;
  socialLinks: Record<string, string> | null;
}

/** Every template component receives the same shape — Studio profile
 * fields, its enabled sections (already sorted by orderIndex), and the
 * Albums it references. A template is presentation-only: it picks how to
 * arrange/style this data, never a new source of it (spec section 28:
 * "Template = Presentation ... Không trộn các lớp"). */
export interface WebsiteTemplateProps {
  studio: WebsiteStudioProfile;
  sections: WebsiteSectionData[];
  albums: WebsiteAlbumSummary[];
  /** Portfolio images the Studio explicitly picked in Settings — distinct
   * from Album covers, since "ảnh nổi bật" is its own curated set, not
   * automatically every Album's cover photo. */
  featuredPhotos: string[];
}
