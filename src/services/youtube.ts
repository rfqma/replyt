import { google } from "googleapis";
import { YouTubeComment, Video, OAuthCredentials } from "../types";

export class YouTubeService {
  private youtube: any;
  private auth: any;
  private oauthCredentials: OAuthCredentials;

  constructor(apiKey: string, oauthCredentials: OAuthCredentials) {
    this.oauthCredentials = oauthCredentials;

    // For read operations - use API key
    this.youtube = google.youtube({
      version: "v3",
      auth: apiKey,
    });

    // For write operations - setup OAuth
    if (this.hasValidOAuthCredentials()) {
      this.setupOAuth();
    }
  }

  private hasValidOAuthCredentials(): boolean {
    return !!(
      this.oauthCredentials.clientId &&
      this.oauthCredentials.clientSecret &&
      this.oauthCredentials.refreshToken
    );
  }

  private setupOAuth(): void {
    this.auth = new google.auth.OAuth2(
      this.oauthCredentials.clientId,
      this.oauthCredentials.clientSecret,
      "http://localhost:3000/oauth/callback"
    );

    this.auth.setCredentials({
      refresh_token: this.oauthCredentials.refreshToken,
      access_token: this.oauthCredentials.accessToken,
    });

    // Handle token refresh
    this.auth.on("tokens", (tokens: any) => {
      if (tokens.refresh_token) {
        this.oauthCredentials.refreshToken = tokens.refresh_token;
      }
      if (tokens.access_token) {
        this.oauthCredentials.accessToken = tokens.access_token;
      }
    });
  }

  async getChannelVideos(
    channelId: string,
    maxResults: number = 50
  ): Promise<Video[]> {
    try {
      const response = await this.youtube.search.list({
        part: ["snippet"],
        channelId: channelId,
        type: "video",
        order: "date",
        maxResults: maxResults,
      });

      return response.data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      console.error("Error fetching channel videos:", error);
      throw error;
    }
  }

  async getVideoComments(
    videoId: string,
    maxResults: number = 100
  ): Promise<YouTubeComment[]> {
    try {
      const response = await this.youtube.commentThreads.list({
        part: ["snippet", "replies"],
        videoId: videoId,
        maxResults: maxResults,
        order: "time",
      });

      const comments: YouTubeComment[] = [];

      for (const thread of response.data.items) {
        const topComment = thread.snippet.topLevelComment.snippet;

        // Add top-level comment
        comments.push({
          id: thread.snippet.topLevelComment.id,
          videoId: videoId,
          authorDisplayName: topComment.authorDisplayName,
          authorChannelId: topComment.authorChannelId?.value,
          textDisplay: topComment.textDisplay,
          textOriginal: topComment.textOriginal,
          publishedAt: topComment.publishedAt,
          updatedAt: topComment.updatedAt,
          likeCount: topComment.likeCount,
          replyCount: thread.snippet.totalReplyCount,
        });

        // Add replies if any
        if (thread.replies) {
          for (const reply of thread.replies.comments) {
            const replySnippet = reply.snippet;
            comments.push({
              id: reply.id,
              videoId: videoId,
              authorDisplayName: replySnippet.authorDisplayName,
              authorChannelId: replySnippet.authorChannelId?.value,
              textDisplay: replySnippet.textDisplay,
              textOriginal: replySnippet.textOriginal,
              publishedAt: replySnippet.publishedAt,
              updatedAt: replySnippet.updatedAt,
              likeCount: replySnippet.likeCount,
              replyCount: 0,
              parentId: replySnippet.parentId,
            });
          }
        }
      }

      return comments;
    } catch (error) {
      console.error(`Error fetching comments for video ${videoId}:`, error);
      throw error;
    }
  }

  async replyToComment(commentId: string, text: string): Promise<boolean> {
    if (!this.hasValidOAuthCredentials()) {
      console.error(
        "❌ OAuth credentials not configured. Cannot post comments."
      );
      console.error(
        '💡 Run "npm run setup-oauth" to configure OAuth authentication.'
      );
      return false;
    }

    try {
      // Create authenticated YouTube client
      const authenticatedYouTube = google.youtube({
        version: "v3",
        auth: this.auth,
      });

      await authenticatedYouTube.comments.insert({
        part: ["snippet"],
        requestBody: {
          snippet: {
            parentId: commentId,
            textOriginal: text,
          },
        },
      });

      console.log(`Successfully replied to comment ${commentId}`);
      return true;
    } catch (error) {
      console.error(`Error replying to comment ${commentId}:`, error);

      // Check if it's an auth error
      if (error instanceof Error && error.message.includes("Login Required")) {
        console.error(
          "🔐 Authentication failed. OAuth token might be expired."
        );
        console.error(
          '💡 Run "npm run setup-oauth" to refresh authentication.'
        );
      }

      return false;
    }
  }

  async getNewCommentsFromAllVideos(
    channelId: string
  ): Promise<YouTubeComment[]> {
    try {
      // Get recent videos from the channel
      const videos = await this.getChannelVideos(channelId, 20);
      const allComments: YouTubeComment[] = [];

      // Get comments from each video
      for (const video of videos) {
        try {
          const comments = await this.getVideoComments(video.id, 50);
          allComments.push(...comments);
        } catch (error) {
          // Some videos might have comments disabled
          console.warn(
            `Could not fetch comments for video ${video.id}: ${error}`
          );
          continue;
        }
      }

      // Sort by published date (newest first)
      return allComments.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    } catch (error) {
      console.error("Error fetching new comments:", error);
      throw error;
    }
  }

  canPostComments(): boolean {
    return this.hasValidOAuthCredentials();
  }
}
