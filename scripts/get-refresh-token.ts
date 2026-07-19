/**
 * One-time script to obtain a Google OAuth refresh token for the AdMob API.
 *
 * Usage:
 *   1. Copy .env.example to .env.local and fill GOOGLE_OAUTH_CLIENT_ID/SECRET
 *   2. Run: npx tsx scripts/get-refresh-token.ts
 *   3. Open the printed URL, authorize, and paste the code
 *   4. Save the refresh token in GOOGLE_OAUTH_REFRESH_TOKEN
 */

import { createServer } from "node:http";
import { URL } from "node:url";
import { google } from "googleapis";
import { config } from "dotenv";

config({ path: ".env.local" });

const SCOPES = [
  "https://www.googleapis.com/auth/admob.readonly",
  "https://www.googleapis.com/auth/admob.report",
];

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const redirectUri = "http://localhost:42813/oauth2callback";

if (!clientId || !clientSecret) {
  console.error(
    "Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in .env.local",
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri,
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\nOpen this URL in your browser:\n");
console.log(authUrl);
console.log("\nWaiting for authorization callback on port 42813...\n");

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url ?? "/", "http://localhost:42813");
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Missing authorization code.");
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      "<h1>Authorization successful</h1><p>You can close this tab and return to the terminal.</p>",
    );

    console.log("Access token:", tokens.access_token ?? "(none)");
    console.log("\nRefresh token (save this in GOOGLE_OAUTH_REFRESH_TOKEN):\n");
    console.log(tokens.refresh_token ?? "(no refresh token returned)");
    console.log(
      "\nIf no refresh token was returned, revoke app access and run again with prompt=consent.",
    );
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Failed to exchange authorization code.");
    console.error(error);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(42813);
