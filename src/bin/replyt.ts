#!/usr/bin/env node

import { AutoReplyBot, config, validateConfig } from "../lib";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

function showHelp(): void {
  console.log(`
🤖 Replyt - YouTube Auto-Reply Bot

Usage:
  replyt                   Start the bot
  replyt setup             Complete setup (API + OAuth)
  replyt test              Test API connections
  replyt --help            Show this help
  replyt --version         Show version

Examples:
  # First time setup
  mkdir replyt-bot && cd replyt-bot
  replyt setup             # Setup API credentials and OAuth
  replyt test              # Test all connections
  replyt                   # Start the bot

  # Development with npm
  npm run setup            # Complete setup
  npm run test             # Test connections  
  npm run dev              # Start in development mode

Documentation:
  https://github.com/rfqma/replyt
`);
}

function showVersion(): void {
  try {
    const packagePath = path.join(__dirname, "../../package.json");
    const packageJson = require(packagePath);
    console.log(`Replyt v${packageJson.version}`);
  } catch (error) {
    console.log("Replyt (version unknown)");
  }
}

function runInteractiveScript(
  scriptPath: string,
  workingDir: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [scriptPath], {
      cwd: workingDir,
      stdio: "inherit", // This allows interactive input/output
    });

    child.on("exit", (code) => {
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

async function runSetup() {
  console.log("🚀 Running complete setup...");
  try {
    // For global installations, find the script in the package directory
    let scriptPath = path.join(__dirname, "../..", "scripts", "setup.js");

    // Check if script exists, if not try alternative paths for global install
    if (
      !(await fs
        .access(scriptPath)
        .then(() => true)
        .catch(() => false))
    ) {
      // Try package root relative to binary
      const packageRoot = path.dirname(path.dirname(__dirname));
      scriptPath = path.join(packageRoot, "scripts", "setup.js");
    }

    if (
      !(await fs
        .access(scriptPath)
        .then(() => true)
        .catch(() => false))
    ) {
      throw new Error(`Setup script not found at ${scriptPath}`);
    }

    // Use spawn for interactive script to properly handle stdin/stdout
    await runInteractiveScript(scriptPath, process.cwd());
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

async function runTest() {
  console.log("🧪 Running tests...");
  try {
    // For global installations, find the script in the package directory
    let scriptPath = path.join(__dirname, "../..", "scripts", "test.js");

    // Check if script exists, if not try alternative paths for global install
    if (
      !(await fs
        .access(scriptPath)
        .then(() => true)
        .catch(() => false))
    ) {
      // Try package root relative to binary
      const packageRoot = path.dirname(path.dirname(__dirname));
      scriptPath = path.join(packageRoot, "scripts", "test.js");
    }

    if (
      !(await fs
        .access(scriptPath)
        .then(() => true)
        .catch(() => false))
    ) {
      throw new Error(`Test script not found at ${scriptPath}`);
    }

    // Use spawn for interactive script to properly handle stdin/stdout
    await runInteractiveScript(scriptPath, process.cwd());
  } catch (error) {
    console.error("❌ Tests failed:", error);
    process.exit(1);
  }
}

async function startBot(): Promise<void> {
  try {
    console.log("🤖 Starting Replyt...\n");

    // validate configuration
    validateConfig();

    // create bot instance
    const bot = new AutoReplyBot(config);

    // initialize bot
    await bot.initialize();

    // start processing comments
    console.log("🔄 Starting comment processing...");
    console.log(`⏰ Check interval: ${config.checkIntervalMinutes} minutes`);
    console.log(`📊 Max replies per run: ${config.maxRepliesPerRun}`);
    console.log(`🎨 Reply style: ${config.replyStyle}\n`);

    // Process comments once
    await bot.processNewComments();

    // Set up interval for continuous processing
    const intervalMs = config.checkIntervalMinutes * 60 * 1000;
    const interval = setInterval(async () => {
      try {
        await bot.processNewComments();
      } catch (error) {
        console.error("💥 Error in processing cycle:", error);
      }
    }, intervalMs);

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Received SIGINT, shutting down gracefully...");
      clearInterval(interval);
      bot.shutdown();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
      clearInterval(interval);
      bot.shutdown();
      process.exit(0);
    });

    console.log("✨ Replyt is running! Press Ctrl+C to stop.\n");
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ Error starting bot:", error.message);
    } else {
      console.error("❌ Unknown error:", error);
    }
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await startBot();
    return;
  }

  const command = args[0];

  switch (command) {
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

    case "setup":
      await runSetup();
      break;

    case "test":
      await runTest();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log("Run 'replyt --help' for usage information.");
      process.exit(1);
  }
}

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
