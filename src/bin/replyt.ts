#!/usr/bin/env node

import * as cron from "node-cron";
import { config, validateConfig } from "../config";
import { AutoReplyBot } from "../services/autoReplyBot";
import * as fs from "fs";
import * as path from "path";
import { exec, spawn } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function runInteractiveScript(scriptPath: string, cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [scriptPath], {
      cwd: cwd,
      stdio: "inherit", // This allows the script to interact with the terminal
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

function showHelp() {
  console.log(`
🤖 Replyt - YouTube Comment Auto-Reply Bot

Usage:
  replyt                    Start the bot (default)
  replyt setup             Setup API keys and configuration
  replyt oauth             Setup OAuth for comment posting
  replyt test              Test API connections
  replyt --help            Show this help
  replyt --version         Show version

Examples:
  replyt                   # Start the bot with current config
  replyt setup             # Interactive setup wizard
  replyt oauth             # Setup YouTube OAuth for posting
  replyt test              # Test all API connections

For more info: https://github.com/rfqma/replyt
`);
}

function showVersion() {
  const packageJson = require("../../package.json");
  console.log(`Replyt v${packageJson.version}`);
}

async function runSetup() {
  console.log("🔧 Running setup wizard...");
  try {
    // For global installations, find the script in the package directory
    let scriptPath = path.join(__dirname, "../..", "scripts", "setup.js");

    // Check if script exists, if not try alternative paths for global install
    if (!fs.existsSync(scriptPath)) {
      // Try package root relative to binary
      const packageRoot = path.dirname(path.dirname(__dirname));
      scriptPath = path.join(packageRoot, "scripts", "setup.js");
    }

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Setup script not found at ${scriptPath}`);
    }

    // Use spawn for interactive script to properly handle stdin/stdout
    await runInteractiveScript(scriptPath, process.cwd());
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

async function runOAuth() {
  console.log("🔐 Running OAuth setup...");
  try {
    // For global installations, find the script in the package directory
    let scriptPath = path.join(__dirname, "../..", "scripts", "oauth.js");

    // Check if script exists, if not try alternative paths for global install
    if (!fs.existsSync(scriptPath)) {
      // Try package root relative to binary
      const packageRoot = path.dirname(path.dirname(__dirname));
      scriptPath = path.join(packageRoot, "scripts", "oauth.js");
    }

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`OAuth script not found at ${scriptPath}`);
    }

    // Use spawn for interactive script to properly handle stdin/stdout
    await runInteractiveScript(scriptPath, process.cwd());
  } catch (error) {
    console.error("❌ OAuth setup failed:", error);
    process.exit(1);
  }
}

async function runTest() {
  console.log("🧪 Testing API connections...");
  try {
    // For global installations, find the script in the package directory
    let scriptPath = path.join(__dirname, "../..", "scripts", "test.js");

    // Check if script exists, if not try alternative paths for global install
    if (!fs.existsSync(scriptPath)) {
      // Try package root relative to binary
      const packageRoot = path.dirname(path.dirname(__dirname));
      scriptPath = path.join(packageRoot, "scripts", "test.js");
    }

    if (!fs.existsSync(scriptPath)) {
      throw new Error(`Test script not found at ${scriptPath}`);
    }

    // Set working directory to current directory for .env file reading
    await execAsync(`node "${scriptPath}"`, { cwd: process.cwd() });
  } catch (error) {
    console.error("❌ API test failed:", error);
    process.exit(1);
  }
}

async function startBot() {
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

    // If config error, suggest setup
    if (
      error instanceof Error &&
      error.message.includes("Missing required environment")
    ) {
      console.log("\n💡 Tip: Run 'replyt setup' to configure your API keys");
    }

    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "setup":
      await runSetup();
      break;

    case "oauth":
      await runOAuth();
      break;

    case "test":
      await runTest();
      break;

    case "--help":
    case "-h":
    case "help":
      showHelp();
      break;

    case "--version":
    case "-v":
    case "version":
      showVersion();
      break;

    case undefined:
      // No command provided, start the bot
      await startBot();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log("💡 Run 'replyt --help' for available commands");
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
