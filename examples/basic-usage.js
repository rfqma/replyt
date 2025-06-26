// Example: Basic usage of replyt as a library
const { Replyt, config, validateConfig } = require("replyt");

async function main() {
  try {
    // Validate configuration first
    validateConfig();

    // Create bot instance
    const bot = new Replyt(config);

    // Initialize the bot
    await bot.initialize();

    // Get initial statistics
    const stats = await bot.getStats();
    console.log("Bot stats:", stats);

    // Process new comments once
    console.log("Processing new comments...");
    await bot.processNewComments();

    // Start the bot with auto-scheduling (every 5 minutes)
    console.log("Starting bot with auto-scheduling...");
    await bot.start("*/5 * * * *");

    // The bot will now run automatically
    console.log("Bot is running! Press Ctrl+C to stop.");

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("Shutting down...");
      bot.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
