/** In-process sliding-window request counter — the first line of defense
 * against a burst of login attempts across many identifiers (including
 * nonexistent ones) from one IP, which the per-account DB lockout can't
 * catch on its own since there's no account row to attach a counter to.
 *
 * This is best-effort on Vercel: each serverless instance keeps its own
 * map, so a sustained attack spread across many cold-started instances
 * isn't fully caught. The DB-backed per-account lockout (see the login
 * route) is the reliable primary defense; this is defense-in-depth on top
 * of it, not a replacement — cheap to add now, upgradeable to a shared
 * store (Redis/Upstash) later without changing the call sites.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
