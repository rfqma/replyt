#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log("🚀 Replyt Setup\n");
  console.log("Setup basic API credentials for YouTube auto-reply bot.\n");

  // check if .env already exists
  const envPath = path.join(__dirname, "..", ".env");
  const envExamplePath = path.join(__dirname, "..", "env.example");

  let existingEnv = {};

  if (fs.existsSync(envPath)) {
    console.log("⚠️  .env file already exists!");

    // read existing .env to preserve OAuth credentials
    const envContent = fs.readFileSync(envPath, "utf8");
    const envLines = envContent.split("\n");

    envLines.forEach((line) => {
      if (line.includes("=") && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        existingEnv[key.trim()] = valueParts.join("=").trim();
      }
    });

    // check if OAuth credentials exist
    const hasOAuth =
      existingEnv.YOUTUBE_CLIENT_ID &&
      existingEnv.YOUTUBE_CLIENT_SECRET &&
      existingEnv.YOUTUBE_REFRESH_TOKEN;

    if (hasOAuth) {
      console.log("✅ OAuth credentials found - will be preserved");
    }

    const overwrite = await question("Update basic API credentials? (y/n): ");
    if (overwrite.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      rl.close();
      return;
    }
  }

  console.log("\n📋 Basic API credentials required:");
  console.log("1. YouTube Data API Key (for reading comments)");
  console.log("2. YouTube Channel ID");
  console.log("3. OpenAI API Key (for generating replies)\n");

  // collect basic information (preserve existing if available)
  const currentYtApiKey = existingEnv.YOUTUBE_API_KEY || "";
  const currentChannelId = existingEnv.YOUTUBE_CHANNEL_ID || "";
  const currentOpenAiKey = existingEnv.OPENAI_API_KEY || "";

  console.log("💡 Press Enter to keep existing values [shown in brackets]:\n");

  const youtubeApiKey =
    (await question(
      `🔑 YouTube Data API Key ${
        currentYtApiKey ? "[" + currentYtApiKey.substring(0, 20) + "...]" : ""
      }: `
    )) || currentYtApiKey;
  const channelId =
    (await question(
      `📺 YouTube Channel ID ${
        currentChannelId ? "[" + currentChannelId + "]" : ""
      }: `
    )) || currentChannelId;
  const openaiApiKey =
    (await question(
      `🧠 OpenAI API Key ${
        currentOpenAiKey ? "[" + currentOpenAiKey.substring(0, 20) + "...]" : ""
      }: `
    )) || currentOpenAiKey;

  console.log("\n⚙️  Optional configuration (press enter for default):");
  const checkInterval =
    (await question(
      `⏰ Check interval (minutes) [${
        existingEnv.CHECK_INTERVAL_MINUTES || "5"
      }]: `
    )) ||
    existingEnv.CHECK_INTERVAL_MINUTES ||
    "5";
  const maxReplies =
    (await question(
      `📊 Max replies per run [${existingEnv.MAX_REPLIES_PER_RUN || "10"}]: `
    )) ||
    existingEnv.MAX_REPLIES_PER_RUN ||
    "10";
  const replyStyle =
    (await question(
      `🎨 Reply style (friendly/professional/casual) [${
        existingEnv.REPLY_STYLE || "friendly"
      }]: `
    )) ||
    existingEnv.REPLY_STYLE ||
    "friendly";

  // preserve OAuth credentials if they exist
  const oauthSection =
    existingEnv.YOUTUBE_CLIENT_ID ||
    existingEnv.YOUTUBE_CLIENT_SECRET ||
    existingEnv.YOUTUBE_REFRESH_TOKEN ||
    existingEnv.YOUTUBE_ACCESS_TOKEN
      ? `
# YouTube OAuth2 Configuration (for posting comments)
YOUTUBE_CLIENT_ID=${
          existingEnv.YOUTUBE_CLIENT_ID || "your_oauth_client_id_here"
        }
YOUTUBE_CLIENT_SECRET=${
          existingEnv.YOUTUBE_CLIENT_SECRET || "your_oauth_client_secret_here"
        }
YOUTUBE_REFRESH_TOKEN=${
          existingEnv.YOUTUBE_REFRESH_TOKEN || "your_refresh_token_here"
        }
YOUTUBE_ACCESS_TOKEN=${
          existingEnv.YOUTUBE_ACCESS_TOKEN || "your_access_token_here"
        }`
      : `
# YouTube OAuth2 Configuration (for posting comments)
YOUTUBE_CLIENT_ID=your_oauth_client_id_here
YOUTUBE_CLIENT_SECRET=your_oauth_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
YOUTUBE_ACCESS_TOKEN=your_access_token_here`;

  // create .env content
  const envContent = `# YouTube Data API Configuration
YOUTUBE_API_KEY=${youtubeApiKey}
YOUTUBE_CHANNEL_ID=${channelId}${oauthSection}

# OpenAI Configuration
OPENAI_API_KEY=${openaiApiKey}

# Bot Configuration
CHECK_INTERVAL_MINUTES=${checkInterval}
MAX_REPLIES_PER_RUN=${maxReplies}
REPLY_STYLE=${replyStyle}

# Database
DATABASE_PATH=./data/comments.db
`;

  // write .env file
  fs.writeFileSync(envPath, envContent);
  console.log("\n✅ .env file successfully updated!");

  // show what was preserved
  if (existingEnv.YOUTUBE_CLIENT_ID) {
    console.log("🔐 OAuth credentials preserved");
  }

  // create data directory
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("📁 Data directory created");
  }

  console.log("\n🎉 Setup complete!");

  // check if OAuth is needed
  if (!existingEnv.YOUTUBE_CLIENT_ID || !existingEnv.YOUTUBE_REFRESH_TOKEN) {
    console.log("\n📝 Next steps:");
    console.log("1. npm run oauth  ← Setup OAuth for posting comments");
    console.log("2. npm run test   ← Test all credentials");
    console.log("3. npm run dev    ← Run the bot");
    console.log(
      "\n💡 OAuth is required for posting comments, without OAuth bot runs in read-only mode"
    );
  } else {
    console.log("\n📝 Next steps:");
    console.log("1. npm run test   ← Test all credentials");
    console.log("2. npm run dev    ← Run the bot");
  }

  rl.close();
}

setup().catch(console.error);
