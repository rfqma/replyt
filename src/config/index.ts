import dotenv from "dotenv";
import { Config, OAuthCredentials } from "../types";

dotenv.config();

const oauthCredentials: OAuthCredentials = {
  clientId: process.env.YOUTUBE_CLIENT_ID || "",
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
  refreshToken: process.env.YOUTUBE_REFRESH_TOKEN || "",
  accessToken: process.env.YOUTUBE_ACCESS_TOKEN || "",
};

export const config: Config = {
  youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
  youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || "",
  youtubeOAuth: oauthCredentials,
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  checkIntervalMinutes: parseInt(process.env.CHECK_INTERVAL_MINUTES || "5"),
  maxRepliesPerRun: parseInt(process.env.MAX_REPLIES_PER_RUN || "10"),
  replyStyle: process.env.REPLY_STYLE || "friendly",
  databasePath: process.env.DATABASE_PATH || "./data/comments.db",
};

export function validateConfig(): void {
  const required = ["youtubeApiKey", "youtubeChannelId", "openaiApiKey"];
  const missing = required.filter((key) => !config[key as keyof Config]);

  // OAuth credentials are now required
  const oauthRequired = ["clientId", "clientSecret", "refreshToken"];
  const missingOAuth = oauthRequired.filter(
    (key) => !config.youtubeOAuth[key as keyof OAuthCredentials]
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (missingOAuth.length > 0) {
    throw new Error(
      `Missing required OAuth credentials: ${missingOAuth.join(
        ", "
      )}. Run "replyt oauth" or "npm run oauth" to setup OAuth authentication.`
    );
  }
}
