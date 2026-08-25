import { NextRequest, NextResponse } from "next/server";

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
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");
  return NextResponse.redirect(url.toString());
}
