import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Generous headroom over any JSON payload this app actually sends (the
// largest is a 1000-char comment) — this is a coarse DoS guard, not a
// precise business-rule limit, so it stays well above real usage.
const JSON_BODY_LIMIT = 100 * 1024;

// Blanket floor under every API route, on top of the tighter per-endpoint
// limits (login, comment, selections, download, ...) those routes already
// enforce themselves — this only exists to stop unrestrained hammering of
// endpoints (mainly plain GETs) that don't have their own limiter at all.
// Runs in a separate Edge-runtime counter from the Node-runtime route
// handlers' own limiters, so it's a genuinely independent extra layer, not
// a shared budget with them.
const GENERAL_API_LIMIT = 120;
const GENERAL_API_WINDOW_MS = 60 * 1000;

/** Only guards `application/json` bodies. Multipart/form-data routes (local
 * photo upload via drive-import's sibling `sync` route) legitimately carry
 * much larger payloads and are left to the hosting platform's own limits. */
export function middleware(req: NextRequest) {
  if (!checkRateLimit(`api:${clientIp(req)}`, GENERAL_API_LIMIT, GENERAL_API_WINDOW_MS)) {
    return NextResponse.json(
      { error: { message: "Bạn thao tác quá nhanh, thử lại sau ít phút nhé." } },
      { status: 429 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const length = Number(req.headers.get("content-length") ?? "0");
    if (length > JSON_BODY_LIMIT) {
      return NextResponse.json(
        { error: { message: "Dữ liệu gửi lên quá lớn." } },
        { status: 413 }
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
