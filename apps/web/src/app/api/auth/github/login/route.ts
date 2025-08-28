import { GITHUB_AUTH_STATE_COOKIE, LOCAL_MODE_HEADER } from "@open-swe/shared/constants";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
    const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_APP_REDIRECT_URI;

    // Early return 401 in local mode if GitHub creds missing
    if (process.env.OPEN_SWE_LOCAL_MODE === "true" && (!clientId || !clientSecret)) {
      return NextResponse.json({ auth: "disabled" }, { status: 401 });
    }

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: "GitHub App configuration missing" },
        { status: 500 },
      );
    }

    const state = crypto.randomUUID();

    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("allow_signup", "true");
    authUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authUrl.toString());

    response.cookies.set(GITHUB_AUTH_STATE_COOKIE, state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to initiate GitHub App authentication flow" },
      { status: 500 },
    );
  }
}
