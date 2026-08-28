export interface AlbumHeroProps {
  linkId: string;
  albumName: string;
  description: string | null;
  photoCount: number;
  expiryDate: string | null;
  /** Wedding/graduation/event date — distinct from expiryDate. */
  eventDate: string | null;
  ctaHref: string;
  ctaLabel: string;
  /** The studio's chosen cover photo (via Gallery's "Change Cover"), if
   * any — null falls back to each template's own gradient/color art. */
  coverPhotoUrl: string | null;
  /** Vertical focal point, 0-100, fed into background-position. */
  coverPosY: number;
}
