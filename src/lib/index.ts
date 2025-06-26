// Main library exports for replyt npm package
export { AutoReplyBot } from "../services/autoReplyBot";
export { DatabaseService } from "../services/database";
export { YouTubeService } from "../services/youtube";
export { OpenAIService } from "../services/openai";
export { config, validateConfig } from "../config";

// Export types
export type {
  YouTubeComment,
  StoredComment,
  AIResponse,
  Config,
  OAuthCredentials,
} from "../types";

import { AutoReplyBot } from "../services/autoReplyBot";

// Export utility functions for library users
export class Replyt {
  private bot: AutoReplyBot;

  constructor(config: any) {
    this.bot = new AutoReplyBot(config);
  }

  /**
   * Initialize the bot with database and services
   */
  async initialize(): Promise<void> {
    await this.bot.initialize();
  }

  /**
   * Process new comments once
   */
  async processNewComments(): Promise<void> {
    await this.bot.processNewComments();
  }

  /**
   * Get bot statistics
   */
  async getStats(): Promise<any> {
    return await this.bot.getStats();
  }

  /**
   * Start the bot with cron scheduling
   */
  async start(cronExpression?: string): Promise<void> {
    const cron = require("node-cron");
    const defaultCron = `*/5 * * * *`; // Every 5 minutes by default

    const schedule = cronExpression || defaultCron;

    console.log(`⏰ Starting bot with schedule: ${schedule}`);

    // Initialize first
    await this.initialize();

    // Set up cron job
    cron.schedule(schedule, async () => {
      try {
        await this.processNewComments();
      } catch (error) {
        console.error("Error in scheduled task:", error);
      }
    });

    // Run first check immediately
    await this.processNewComments();
  }

  /**
   * Shutdown the bot gracefully
   */
  shutdown(): void {
    this.bot.shutdown();
  }
}
