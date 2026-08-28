import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signSession, SESSION_COOKIE, OAUTH_STATE_COOKIE } from "@/lib/auth";
import { findOrCreateOAuthStudio } from "@/lib/oauth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const oauthError = req.nextUrl.searchParams.get("error");
  const state = req.nextUrl.searchParams.get("state");
  const expectedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const loginUrl = new URL("/login", req.nextUrl.origin);

  // The state must round-trip unchanged through Google and match what this
  // server itself set as an HttpOnly cookie before redirecting there — this
  // is what stops an attacker's own /callback?code=... link from being
  // accepted as if it came from a real consent flow this session started.
  const stateOk = !!state && !!expectedState && state === expectedState;

  if (oauthError || !code || !stateOk) {
    loginUrl.searchParams.set("oauthError", "1");
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(OAUTH_STATE_COOKIE);
    return res;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    loginUrl.searchParams.set("oauthError", "1");
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(OAUTH_STATE_COOKIE);
    return res;
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error("token exchange failed");
    const tokens = await tokenRes.json();

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!profileRes.ok) throw new Error("userinfo fetch failed");
    const profile = await profileRes.json();
    if (!profile.email) throw new Error("no email in Google profile");

    const studio = await findOrCreateOAuthStudio(profile.email, profile.name ?? "");
    await prisma.studio.update({ where: { id: studio.id }, data: { lastLoginAt: new Date() } });

    const session = signSession({ studioId: studio.id, sessionVersion: studio.sessionVersion });
    const landing = studio.role === "ADMIN" ? "/system-owner" : "/dashboard";
    const res = NextResponse.redirect(new URL(landing, req.nextUrl.origin));
    res.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    res.cookies.delete(OAUTH_STATE_COOKIE);
    return res;
  } catch {
    loginUrl.searchParams.set("oauthError", "1");
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(OAUTH_STATE_COOKIE);
    return res;
  }
}
