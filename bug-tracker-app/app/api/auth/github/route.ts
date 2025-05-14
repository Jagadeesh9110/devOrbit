import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import connectDB from "../../../../lib/db/Connect";
import User from "../../../../models/userModel";
import { generateTokens, setAuthCookies } from "../../../../lib/edge-auth";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      const redirectUrl = new URL(GITHUB_AUTH_URL);
      redirectUrl.searchParams.set(
        "client_id",
        process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID!
      );
      redirectUrl.searchParams.set(
        "redirect_uri",
        `${request.nextUrl.origin}/api/auth/github`
      );
      redirectUrl.searchParams.set("scope", "user:email");
      redirectUrl.searchParams.set("state", crypto.randomUUID());

      return NextResponse.redirect(redirectUrl.toString());
    }

    const tokenResponse = await axios.post(
      GITHUB_TOKEN_URL,
      {
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      return NextResponse.json(
        { error: "Failed to get access token" },
        { status: 400 }
      );
    }

    const [userResponse, emailsResponse] = await Promise.all([
      axios.get(GITHUB_USER_URL, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }),
      axios.get(GITHUB_EMAILS_URL, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }),
    ]);

    const userData = userResponse.data;
    const emails = emailsResponse.data;

    const primaryEmail = emails.find((email: any) => email.primary)?.email;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No primary email found" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email: primaryEmail });

    if (!user) {
      user = await User.create({
        email: primaryEmail,
        name: userData.name || userData.login,
        password: null,
        isVerified: true,
        role: "Developer",
        authProvider: "GITHUB",
        authProviderId: userData.id?.toString() || undefined,
      });
    }

    const { accessToken, refreshToken } = await generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    setAuthCookies(response, accessToken, refreshToken);

    const html = `
      <html>
        <body>
          <script>
            window.opener.postMessage(
              { type: "GITHUB_OAUTH_SUCCESS", user: ${JSON.stringify({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
              })} },
              "${request.nextUrl.origin}"
            );
            window.close();
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    const errorHtml = `
      <html>
        <body>
          <script>
            window.opener.postMessage(
              { type: "GITHUB_OAUTH_ERROR", error: "Authentication failed" },
              "${request.nextUrl.origin}"
            );
            window.close();
          </script>
        </body>
      </html>
    `;
    return new NextResponse(errorHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
}
