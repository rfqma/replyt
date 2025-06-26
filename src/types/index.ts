export interface YouTubeComment {
  id: string;
  videoId: string;
  authorDisplayName: string;
  authorChannelId?: string;
  textDisplay: string;
  textOriginal: string;
  publishedAt: string;
  updatedAt: string;
  likeCount: number;
  replyCount: number;
  parentId?: string;
}

export interface StoredComment {
  id: string;
  videoId: string;
  processedAt: string;
  repliedAt?: string;
  aiResponse?: string;
  status: "pending" | "replied" | "skipped" | "error";
}

export interface AIResponse {
  content: string;
  reasoning?: string;
}

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
}

export interface Config {
  youtubeApiKey: string;
  youtubeChannelId: string;
  youtubeOAuth: OAuthCredentials;
  openaiApiKey: string;
  checkIntervalMinutes: number;
  maxRepliesPerRun: number;
  replyStyle: string;
  databasePath: string;
}

export interface Video {
  id: string;
  title: string;
  publishedAt: string;
}
