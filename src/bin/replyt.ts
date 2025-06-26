#!/usr/bin/env node

import * as cron from "node-cron";
import { config, validateConfig } from "../config";
import { AutoReplyBot } from "../services/autoReplyBot";
import * as fs from "fs";
import * as path from "path";

async function main() {
  try {
    console.log("🚀 Starting Replyt...");

    // validate configuration
    validateConfig();
    console.log("✅ Configuration validated");

    // ensure data directory exists
    const dataDir = path.dirname(config.databasePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`📁 Created data directory: ${dataDir}`);
    }

    // initialize the bot
    const bot = new AutoReplyBot(config);

    // initialize database and other services
    await bot.initialize();

    // show initial stats
    const stats = await bot.getStats();
    console.log("📊 Bot Statistics:", JSON.stringify(stats, null, 2));

    // set up cron job
    const cronExpression = `*/${config.checkIntervalMinutes} * * * *`; // Every N minutes
    console.log(
      `⏰ Setting up cron job: ${cronExpression} (every ${config.checkIntervalMinutes} minutes)`
    );

    cron.schedule(cronExpression, async () => {
      console.log("\n" + "=".repeat(50));
      console.log(
        `🕐 ${new Date().toISOString()} - Running scheduled comment check...`
      );
      console.log("=".repeat(50));

      try {
        await bot.processNewComments();
      } catch (error) {
        console.error("💥 Error in scheduled task:", error);
      }

      console.log("=".repeat(50) + "\n");
    });

    // run first check immediately
    console.log("🏃 Running initial comment check...");
    await bot.processNewComments();

    console.log(
      `\n✨ Bot is now running! It will check for new comments every ${config.checkIntervalMinutes} minutes.`
    );
    console.log("📝 Press Ctrl+C to stop the bot gracefully.\n");

    // graceful shutdown handling
    process.on("SIGINT", () => {
      console.log("\n🛑 Received SIGINT. Shutting down gracefully...");
      bot.shutdown();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Received SIGTERM. Shutting down gracefully...");
      bot.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error("💥 Failed to start bot:", error);
    process.exit(1);
  }
}

// handle unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("🚨 Uncaught Exception:", error);
  process.exit(1);
});

// start the application
main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
