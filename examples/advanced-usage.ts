// Example: Advanced usage with AutoReplyBot directly
import { AutoReplyBot, config, validateConfig, Config } from "replyt";

// Custom configuration
const customConfig: Config = {
  ...config,
  maxRepliesPerRun: 5,
  replyStyle: "professional and informative with emojis",
  checkIntervalMinutes: 10,
};

async function main() {
  try {
    // Validate configuration
    validateConfig();

    // Create bot instance with custom config
    const bot = new AutoReplyBot(customConfig);

    // Initialize
    await bot.initialize();

    // Manual processing loop
    while (true) {
      console.log(`\n${"=".repeat(50)}`);
      console.log(`🕐 ${new Date().toISOString()} - Manual comment check`);
      console.log(`${"=".repeat(50)}`);

      try {
        // Process comments
        await bot.processNewComments();

        // Show stats
        const stats = await bot.getStats();
        console.log("📊 Current stats:", JSON.stringify(stats, null, 2));

        // Wait for next iteration (10 minutes)
        console.log("💤 Waiting 10 minutes for next check...");
        await new Promise((resolve) => setTimeout(resolve, 10 * 60 * 1000));
      } catch (error) {
        console.error("❌ Error in processing cycle:", error);
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
      }
    }
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down gracefully...");
  process.exit(0);
});

main();
