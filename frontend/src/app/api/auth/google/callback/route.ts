import { NextRequest, NextResponse } from "next/server";
import { signSession, SESSION_COOKIE } from "@/lib/auth";
import { findOrCreateOAuthStudio } from "@/lib/oauth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const oauthError = req.nextUrl.searchParams.get("error");
  const loginUrl = new URL("/login", req.nextUrl.origin);

  if (oauthError || !code) {
    loginUrl.searchParams.set("oauthError", "1");
    return NextResponse.redirect(loginUrl);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    loginUrl.searchParams.set("oauthError", "1");
    return NextResponse.redirect(loginUrl);
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

    const session = signSession({ studioId: studio.id });
    const res = NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    res.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    loginUrl.searchParams.set("oauthError", "1");
    return NextResponse.redirect(loginUrl);
  }
}
