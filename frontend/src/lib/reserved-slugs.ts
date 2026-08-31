/** Studio slugs that must never be assigned — every existing top-level app
 * route (so a Studio Website at /{slug} can never shadow a real feature
 * page) plus a handful of platform words reserved for future routes. Keep
 * the first group in sync with the actual top-level segments under
 * src/app/ (including route-group children) if new ones are ever added. */
export const RESERVED_SLUGS = new Set([
  // Real routes today
  "admin",
  "dashboard",
  "albums",
  "album",
  "filter",
  "settings",
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "api",
  "system-owner",
  // Reserved for likely future routes / platform pages
  "about",
  "contact",
  "pricing",
  "help",
  "support",
  "blog",
  "www",
  "app",
  "static",
  "public",
  "assets",
  "studio",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}
