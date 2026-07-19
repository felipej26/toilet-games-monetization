import { google } from "googleapis";

function getOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Missing AdMob OAuth credentials. Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and GOOGLE_OAUTH_REFRESH_TOKEN.",
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return oauth2Client;
}

export function getAdMobClient() {
  const auth = getOAuthClient();
  return google.admob({ version: "v1", auth });
}

export function getPublisherId(): string {
  const publisherId = process.env.ADMOB_PUBLISHER_ID;
  if (!publisherId) {
    throw new Error("Missing ADMOB_PUBLISHER_ID environment variable.");
  }
  return publisherId;
}
