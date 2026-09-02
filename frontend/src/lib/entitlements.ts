/** Plan → Entitlements — the single source of truth for what each Guikhach.com
 * billing plan unlocks. Mirrors `md new/GUIKHACH_PLAN_PRICING_FEATURES.md`
 * exactly; if pricing/features change, that doc is the place to update
 * first, then this file. Every server route that gates a paid feature must
 * call `getEntitlements(studio.plan)` and check the field itself — never
 * hide a button client-side and call that authorization (see the plan doc's
 * own explicit warning against that).
 *
 * Deliberately NOT per-feature "if plan === X" checks scattered across
 * routes — one table, one place, so a pricing change never means hunting
 * through the codebase for every `=== "PRO"` string. */

export type Plan = "FREE" | "PRO" | "VIP" | "CLOUD";

export const PLANS: Plan[] = ["FREE", "PRO", "VIP", "CLOUD"];

export const PLAN_LABELS: Record<Plan, string> = {
  FREE: "Free",
  PRO: "Pro",
  VIP: "VIP",
  CLOUD: "Cloud",
};

/** VND / year — display only; there's no payment gateway yet, System Owner
 * activates a plan manually after confirming payment out-of-band. */
export const PLAN_PRICES: Record<Plan, number> = {
  FREE: 0,
  PRO: 100_000,
  VIP: 200_000,
  CLOUD: 500_000,
};

export interface Entitlements {
  /** New Albums a Studio may create per calendar month. Infinity = unlimited. */
  albumsPerMonth: number;
  /** New Photobooks a Studio may create per calendar month. Infinity = unlimited. */
  photobooksPerMonth: number;
  /** "Cho phép tải ảnh" (Album.downloadEnabled) may be turned on at all. */
  download: boolean;
  /** Website Studio template choice. "locked" = always minimal-elegant,
   * can't be changed. "all" = any template. */
  websiteTemplate: "locked" | "all";
  /** Recommend (the guest-facing "Comment" feature). */
  recommend: boolean;
  /** Filter: "Lọc Album" tab — pick one of the Studio's own Albums and
   * filter/copy against its real Selection data, instead of a manually
   * pasted name list ("Lọc Tên", available to every plan). */
  filterAlbumMode: boolean;
  /** Filter: "Lọc JSON" export. */
  filterExportJson: boolean;
  /** Filter: exchange format consumed by the separate Filter desktop app. */
  filterExternalApp: boolean;
  /** Dashboard/Album export beyond the base Like/Star lists. */
  exportAdvanced: boolean;
  cloudStorage: boolean;
  directUpload: boolean;
}

const ENTITLEMENTS: Record<Plan, Entitlements> = {
  FREE: {
    albumsPerMonth: 20,
    photobooksPerMonth: 2,
    download: false,
    websiteTemplate: "locked",
    recommend: false,
    filterAlbumMode: false,
    filterExportJson: false,
    filterExternalApp: false,
    exportAdvanced: false,
    cloudStorage: false,
    directUpload: false,
  },
  PRO: {
    albumsPerMonth: 50,
    photobooksPerMonth: 20,
    download: true,
    websiteTemplate: "all",
    recommend: true,
    filterAlbumMode: true,
    filterExportJson: false,
    filterExternalApp: false,
    exportAdvanced: false,
    cloudStorage: false,
    directUpload: false,
  },
  VIP: {
    albumsPerMonth: Infinity,
    photobooksPerMonth: Infinity,
    download: true,
    websiteTemplate: "all",
    recommend: true,
    filterAlbumMode: true,
    filterExportJson: true,
    filterExternalApp: true,
    exportAdvanced: true,
    cloudStorage: false,
    directUpload: false,
  },
  CLOUD: {
    albumsPerMonth: Infinity,
    photobooksPerMonth: Infinity,
    download: true,
    websiteTemplate: "all",
    recommend: true,
    filterAlbumMode: true,
    filterExportJson: true,
    filterExternalApp: true,
    exportAdvanced: true,
    cloudStorage: true,
    directUpload: true,
  },
};

/** Unknown/corrupt plan values fall back to FREE — the safe default, never
 * the reverse (never fail open into a paid tier). */
export function getEntitlements(plan: string): Entitlements {
  return ENTITLEMENTS[plan as Plan] ?? ENTITLEMENTS.FREE;
}

export function isPlan(value: string): value is Plan {
  return (PLANS as string[]).includes(value);
}

export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
