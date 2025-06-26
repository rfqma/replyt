import { DatabaseService } from "./database";
import { YouTubeService } from "./youtube";
import { OpenAIService } from "./openai";
import { Config, YouTubeComment, StoredComment } from "../types";

export class AutoReplyBot {
  private db: DatabaseService;
  private youtube: YouTubeService;
  private openai: OpenAIService;
  private config: Config;
  private isInitialized: boolean = false;

  constructor(config: Config) {
    this.config = config;
    this.db = new DatabaseService(config.databasePath);
    this.youtube = new YouTubeService(
      config.youtubeApiKey,
      config.youtubeOAuth
    );
    this.openai = new OpenAIService(config.openaiApiKey, config.replyStyle);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // initialize database first
    await this.db.initialize();
    this.isInitialized = true;

    // check posting capabilities
    if (this.youtube.canPostComments()) {
      console.log(
        "🤖 Bot initialized successfully - FULL MODE (can post replies)"
      );
    } else {
      console.log(
        "🤖 Bot initialized successfully - READ-ONLY MODE (cannot post replies)"
      );
      console.log('💡 Run "npm run setup-oauth" to enable comment posting');
    }
  }

  async processNewComments(): Promise<void> {
    await this.ensureInitialized();

    try {
      console.log("🤖 Starting comment processing cycle...");

      // get all new comments from the channel
      const comments = await this.youtube.getNewCommentsFromAllVideos(
        this.config.youtubeChannelId
      );
      console.log(`📝 Found ${comments.length} total comments`);

      // filter out already processed comments
      const newComments = await this.filterNewComments(comments);
      console.log(`🆕 Found ${newComments.length} new comments to process`);

      if (newComments.length === 0) {
        console.log("✨ No new comments to process");
        return;
      }

      // check if we can post comments
      if (!this.youtube.canPostComments()) {
        console.log("⚠️  Running in READ-ONLY mode - will simulate replies");
        console.log('💡 Run "npm run setup-oauth" to enable actual posting');
      }

      // process comments with rate limiting
      let processedCount = 0;
      const maxReplies = this.config.maxRepliesPerRun;

      for (const comment of newComments.slice(0, maxReplies)) {
        try {
          await this.processComment(comment);
          processedCount++;

          // add delay between requests to avoid rate limiting
          await this.delay(2000);
        } catch (error) {
          console.error(`❌ Error processing comment ${comment.id}:`, error);
          await this.markCommentAsError(comment);
        }
      }

      console.log(`✅ Processed ${processedCount} comments in this cycle`);

      // show stats
      const totalProcessed = await this.db.getProcessedCommentsCount();
      console.log(`📊 Total comments processed: ${totalProcessed}`);
    } catch (error) {
      console.error("💥 Error in comment processing cycle:", error);
    }
  }

  private async processComment(comment: YouTubeComment): Promise<void> {
    // store comment as being processed
    await this.storeCommentAsProcessing(comment);

    // check if we should reply to this comment
    const shouldReply = await this.openai.shouldReplyToComment(comment);

    if (!shouldReply) {
      console.log(`⏭️  Skipping comment ${comment.id} - filtered out`);
      await this.db.updateCommentStatus(comment.id, "skipped");
      return;
    }

    try {
      // generate AI reply
      console.log(
        `🧠 Generating reply for comment by ${comment.authorDisplayName}...`
      );
      const aiResponse = await this.openai.generateReply(comment);

      // post reply to YouTube
      console.log(`📤 Posting reply: "${aiResponse.content}"`);

      if (!this.youtube.canPostComments()) {
        // simulate posting in read-only mode
        console.log(
          "🎭 SIMULATED - Reply would be posted if OAuth was configured"
        );
        await this.db.updateCommentStatus(
          comment.id,
          "replied",
          aiResponse.content
        );
        console.log(`✅ Simulated reply to comment ${comment.id}`);
        return;
      }

      const success = await this.youtube.replyToComment(
        comment.id,
        aiResponse.content
      );

      if (success) {
        await this.db.updateCommentStatus(
          comment.id,
          "replied",
          aiResponse.content
        );
        console.log(`✅ Successfully replied to comment ${comment.id}`);
      } else {
        await this.db.updateCommentStatus(comment.id, "error");
        console.log(`❌ Failed to post reply to comment ${comment.id}`);
      }
    } catch (error) {
      console.error(
        `💥 Error generating/posting reply for comment ${comment.id}:`,
        error
      );
      await this.db.updateCommentStatus(comment.id, "error");
    }
  }

  private async filterNewComments(
    comments: YouTubeComment[]
  ): Promise<YouTubeComment[]> {
    const newComments: YouTubeComment[] = [];

    for (const comment of comments) {
      const isProcessed = await this.db.isCommentProcessed(comment.id);
      if (!isProcessed) {
        newComments.push(comment);
      }
    }

    return newComments;
  }

  private async storeCommentAsProcessing(
    comment: YouTubeComment
  ): Promise<void> {
    const storedComment: StoredComment = {
      id: comment.id,
      videoId: comment.videoId,
      processedAt: new Date().toISOString(),
      status: "pending",
    };

    await this.db.storeComment(storedComment);
  }

  private async markCommentAsError(comment: YouTubeComment): Promise<void> {
    try {
      await this.db.updateCommentStatus(comment.id, "error");
    } catch (error) {
      console.error(`Error marking comment ${comment.id} as error:`, error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getStats(): Promise<object> {
    await this.ensureInitialized();
    const totalProcessed = await this.db.getProcessedCommentsCount();
    return {
      totalProcessed,
      canPostComments: this.youtube.canPostComments(),
      config: {
        checkInterval: this.config.checkIntervalMinutes,
        maxRepliesPerRun: this.config.maxRepliesPerRun,
        replyStyle: this.config.replyStyle,
      },
    };
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  shutdown(): void {
    console.log("🛑 Shutting down Replyt...");
    this.db.close();
  }
}
