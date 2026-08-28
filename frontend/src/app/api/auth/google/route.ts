import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { OAUTH_STATE_COOKIE } from "@/lib/auth";

/** Kicks off Google's OAuth consent flow. redirect_uri is built from the
 * incoming request's own origin so this works unchanged on localhost and
 * on the deployed domain, as long as both are registered as Authorized
 * redirect URIs on the Google OAuth client. */
export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: { message: "GOOGLE_CLIENT_ID chưa được cấu hình trên server." } },
      { status: 500 }
    );
  }
  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;

  // CSRF protection for the OAuth flow: a random value is round-tripped
  // through Google (state param) and independently through an HttpOnly
  // cookie, then compared in the callback. Without this, an attacker could
  // craft their own /callback?code=... link and get it linked into a
  // victim's session (login CSRF).
  const state = randomBytes(24).toString("hex");

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}
