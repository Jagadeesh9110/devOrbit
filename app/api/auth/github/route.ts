import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import connectDB from "../../../../lib/db/Connect";
import User from "../../../../models/userModel";
import { generateTokens, setAuthCookies } from "../../../../lib/auth";

const GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
const GITHUB_USER_URL = "https://api.github.com/user";
const GITHUB_EMAILS_URL = "https://api.github.com/user/emails";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const isPopup = searchParams.get("popup") === "true";

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

      if (isPopup) {
        redirectUrl.searchParams.set("popup", "true");
      }

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
      throw new Error("Failed to get access token");
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
      throw new Error("No primary email found");
    }

    let user = await User.findOne({ email: primaryEmail });

    if (!user) {
      user = await User.create({
        email: primaryEmail,
        name: userData.name || userData.login,
        image: userData.avatar_url,
        isVerified: true,
        role: "Developer",
        authProvider: "GITHUB",
        authProviderId: userData.id?.toString(),
        verificationToken: null,
        verificationTokenExpiry: null,
        resetToken: null,
        resetTokenExpiry: null,
        teamIds: [],
        badges: [],
      });
    } else {
      if (!user.authProvider) {
        user.authProvider = "GITHUB";
        user.authProviderId = userData.id?.toString();
        user.image = userData.avatar_url;
        await user.save();
      }
    }

    const { accessToken, refreshToken } = generateTokens({
      userId: user._id.toString(),
      role: user.role,
    });

    if (isPopup) {
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      };

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>GitHub Authentication</title>
          </head>
          <body>
            <script>
              try {
                const userData = ${JSON.stringify(userData)};
                if (window.opener) {
                  window.opener.postMessage(
                    { 
                      type: "GITHUB_OAUTH_SUCCESS", 
                      user: userData,
                      accessToken: "${accessToken}",
                      refreshToken: "${refreshToken}"
                    },
                    "${request.nextUrl.origin}"
                  );
                  window.close();
                }
              } catch (error) {
                if (window.opener) {
                  window.opener.postMessage(
                    { 
                      type: "GITHUB_OAUTH_ERROR", 
                      error: "Authentication failed" 
                    },
                    "${request.nextUrl.origin}"
                  );
                  window.close();
                }
              }
            </script>
            <p>Authentication successful. This window will close automatically...</p>
          </body>
        </html>
      `;

      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } else {
      const response = NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
      return setAuthCookies(response, accessToken, refreshToken);
    }
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Authentication failed";

    if (request.nextUrl.searchParams.get("popup") === "true") {
      const errorHtml = `
        <!DOCTYPE html>
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage(
                  { 
                    type: "GITHUB_OAUTH_ERROR", 
                    error: "${errorMessage}" 
                  },
                  "${request.nextUrl.origin}"
                );
                window.close();
              }
            </script>
          </body>
        </html>
      `;
      return new NextResponse(errorHtml, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } else {
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent(errorMessage)}`,
          request.url
        )
      );
    }
  }
}