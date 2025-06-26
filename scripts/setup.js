#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { google } = require("googleapis");

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
  console.log("🚀 Replyt Complete Setup\n");
  console.log(
    "This will setup both API credentials and OAuth authentication for your YouTube auto-reply bot.\n"
  );

  // check if .env already exists
  const envPath = path.join(process.cwd(), ".env");

  let existingEnv = {};

  if (fs.existsSync(envPath)) {
    console.log("⚠️  .env file already exists!");

    // read existing .env to preserve any existing values
    const envContent = fs.readFileSync(envPath, "utf8");
    const envLines = envContent.split("\n");

    envLines.forEach((line) => {
      if (line.includes("=") && !line.startsWith("#")) {
        const [key, ...valueParts] = line.split("=");
        existingEnv[key.trim()] = valueParts.join("=").trim();
      }
    });

    const overwrite = await question("Update configuration? (y/n): ");
    if (overwrite.toLowerCase() !== "y") {
      console.log("Setup cancelled.");
      rl.close();
      return;
    }
  }

  // Step 1: Basic API Credentials
  console.log("\n📋 Step 1: Basic API Credentials");
  console.log("1. YouTube Data API Key (for reading comments)");
  console.log("2. YouTube Channel ID");
  console.log("3. OpenAI API Key (for generating replies)\n");

  // Show detailed instructions for each credential
  console.log("📖 How to get YouTube Data API Key:");
  console.log(
    "1. Go to Google Cloud Console: https://console.cloud.google.com/"
  );
  console.log("2. Create a new project or select existing project");
  console.log('3. Go to "APIs & Services" → "Library"');
  console.log('4. Search for "YouTube Data API v3" and enable it');
  console.log('5. Go to "APIs & Services" → "Credentials"');
  console.log('6. Click "+ CREATE CREDENTIALS" → "API key"');
  console.log(
    "7. Copy the API key (restrict it to YouTube Data API v3 for security)\n"
  );

  console.log("📖 How to get YouTube Channel ID:");
  console.log("1. Go to your YouTube channel");
  console.log(
    "2. Copy the URL (e.g., youtube.com/channel/UCxxxxxx or youtube.com/@username)"
  );
  console.log(
    "3. If URL has @username, go to channel → About → Share Channel → Copy channel ID"
  );
  console.log(
    "4. Channel ID format: UCxxxxxxxxxxxxxxxxxxxxxx (starts with UC)\n"
  );

  console.log("📖 How to get OpenAI API Key:");
  console.log("1. Go to OpenAI Platform: https://platform.openai.com/");
  console.log("2. Sign up or log in to your account");
  console.log('3. Go to "API keys" section');
  console.log('4. Click "Create new secret key"');
  console.log("5. Copy the API key (starts with sk-proj- or sk-)\n");

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

  console.log("\n⚙️  Optional bot configuration (press enter for default):");
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

  // Step 2: OAuth Setup
  console.log(
    "\n📋 Step 2: OAuth Authentication (Required for posting replies)"
  );

  // Check if we already have OAuth credentials
  const hasExistingOAuth =
    existingEnv.YOUTUBE_CLIENT_ID && existingEnv.YOUTUBE_CLIENT_SECRET;

  let oauthCredentials = {
    clientId: existingEnv.YOUTUBE_CLIENT_ID || "",
    clientSecret: existingEnv.YOUTUBE_CLIENT_SECRET || "",
    refreshToken: existingEnv.YOUTUBE_REFRESH_TOKEN || "",
    accessToken: existingEnv.YOUTUBE_ACCESS_TOKEN || "",
  };

  if (hasExistingOAuth) {
    console.log("✅ Existing OAuth credentials found");
    const updateOAuth = await question("Update OAuth credentials? (y/n): ");

    if (updateOAuth.toLowerCase() === "y") {
      oauthCredentials = await setupOAuthCredentials();
    }
  } else {
    console.log("🔐 OAuth setup is required for the bot to post replies");
    oauthCredentials = await setupOAuthCredentials();
  }

  // Create final .env content
  const envContent = `# YouTube Data API Configuration
YOUTUBE_API_KEY=${youtubeApiKey}
YOUTUBE_CHANNEL_ID=${channelId}

# YouTube OAuth2 Configuration (required for posting comments)
YOUTUBE_CLIENT_ID=${oauthCredentials.clientId}
YOUTUBE_CLIENT_SECRET=${oauthCredentials.clientSecret}
YOUTUBE_REFRESH_TOKEN=${oauthCredentials.refreshToken}
YOUTUBE_ACCESS_TOKEN=${oauthCredentials.accessToken}

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
  console.log("\n✅ .env file successfully created/updated!");

  // create data directory
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("📁 Data directory created");
  }

  console.log("\n🎉 Complete setup finished!");
  console.log("\n📝 Next steps:");
  console.log(
    "if you run the entire project locally (cloned repository), you can run the following commands:"
  );
  console.log("1. npm run test   ← Test all credentials");
  console.log("2. npm run dev    ← Run the bot");
  console.log(
    "if you run from the CLI (npm install -g replyt), you can run the following commands:"
  );
  console.log("1. replyt test   ← Test all credentials");
  console.log("2. replyt    ← Run the bot");
  console.log(
    "\n🚀 Your bot is ready to automatically reply to YouTube comments!"
  );

  rl.close();
}

async function setupOAuthCredentials() {
  console.log("\n🛠️  OAuth Credentials Setup\n");

  console.log("📖 Detailed OAuth setup instructions:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔗 Step 1: Google Cloud Console Setup");
  console.log("1. Go to: https://console.cloud.google.com/");
  console.log(
    "2. Make sure you're in the SAME PROJECT as your YouTube Data API"
  );
  console.log(
    "3. In the sidebar, click 'APIs & Services' → 'OAuth consent screen'\n"
  );

  console.log("🔗 Step 2: OAuth Consent Screen");
  console.log("1. If first time: Choose 'External' user type, click 'CREATE'");
  console.log("2. Fill required fields:");
  console.log("   • App name: 'Replyt' (or any name you prefer)");
  console.log("   • User support email: your email address");
  console.log("   • Developer contact information: same email");
  console.log("3. Click 'SAVE AND CONTINUE' through all steps");
  console.log("4. IMPORTANT: Add your email as test user:");
  console.log("   • In 'Test users' section → 'ADD USERS'");
  console.log("   • Enter your email → 'SAVE'\n");

  console.log("🔗 Step 3: Create OAuth Client");
  console.log("1. Go to 'APIs & Services' → 'Credentials'");
  console.log("2. Click '+ CREATE CREDENTIALS' → 'OAuth client ID'");
  console.log("3. Application type: 'Desktop application'");
  console.log("4. Name: 'Replyt YouTube Bot' (or any name)");
  console.log("5. Click 'CREATE'");
  console.log("6. Copy the 'Client ID' and 'Client secret'\n");

  console.log("⚠️  TROUBLESHOOTING: If you get 'Access blocked' error:");
  console.log("• Make sure your email is added as Test User (Step 2.4)");
  console.log(
    "• OAuth consent screen status should be 'Testing' (not 'In production')"
  );
  console.log("• Wait 5-10 minutes after adding test user");
  console.log("• Make sure you're logged into the same Google account");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const clientId = await question(
    "🔑 Enter OAuth Client ID (looks like xxx.apps.googleusercontent.com): "
  );
  const clientSecret = await question(
    "🔐 Enter OAuth Client Secret (looks like GOCSPX-xxx): "
  );

  console.log("\n✅ OAuth client credentials saved!");

  // Get refresh token
  const tokens = await getRefreshToken(clientId, clientSecret);

  return {
    clientId,
    clientSecret,
    refreshToken: tokens.refreshToken,
    accessToken: tokens.accessToken,
  };
}

async function getRefreshToken(clientId, clientSecret) {
  console.log("\n🔄 Getting Authorization Token\n");

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "http://localhost:3000" // Redirect URI
  );

  // Generate authorization URL
  const scopes = ["https://www.googleapis.com/auth/youtube.force-ssl"];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent", // Force consent screen to get refresh token
  });

  console.log("📝 Authorization steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌐 Step 1: Open Authorization URL");
  console.log("1. COPY the following URL:");
  console.log("");
  console.log("🔗 " + authUrl);
  console.log("");
  console.log("2. PASTE it in your web browser and press Enter");
  console.log(
    "3. Make sure you're logged into the Google account that owns the YouTube channel\n"
  );

  console.log("🔐 Step 2: Grant Permissions");
  console.log("1. You should see a Google authorization page");
  console.log("2. If you see 'Access blocked' or 'Error 403':");
  console.log("   • Go back to Google Cloud Console → OAuth consent screen");
  console.log("   • Check 'Test users' section → ADD USERS → enter your email");
  console.log("   • Wait 5-10 minutes, then try the URL again");
  console.log("3. Click 'Allow' to grant permissions to Replyt");
  console.log(
    "4. You'll be redirected to a localhost page (it may show an error - that's OK!)\n"
  );

  console.log("📋 Step 3: Copy Authorization Code");
  console.log("1. After clicking 'Allow', check the address bar");
  console.log("2. Copy the ENTIRE URL from the address bar");
  console.log(
    "3. It should look like: http://localhost:3000/?code=4/xxxxx&scope=..."
  );
  console.log("4. Or if you see just a code, copy that code");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const input = await question(
    "🔑 Paste the full URL or authorization code here: "
  );

  // Extract code from URL or use directly if it's a code
  let authCode;
  if (input.includes("code=")) {
    const url = new URL(input);
    authCode = url.searchParams.get("code");
  } else {
    authCode = input.trim();
  }

  if (!authCode) {
    throw new Error("Authorization code not found. Please try again.");
  }

  try {
    const { tokens } = await oauth2Client.getToken(authCode);

    if (!tokens.refresh_token) {
      console.log("❌ Didn't receive refresh token. Solutions:");
      console.log(
        "1. Revoke app access: https://myaccount.google.com/permissions"
      );
      console.log("2. Make sure email is in test users");
      console.log("3. Retry authorization process");
      console.log('4. Ensure "prompt=consent" is in URL');
      throw new Error("Refresh token not received");
    }

    console.log("\n✅ Successfully obtained OAuth tokens!");

    // Test the credentials
    await testOAuthCredentials(
      clientId,
      clientSecret,
      tokens.refresh_token,
      tokens.access_token
    );

    return {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token || "",
    };
  } catch (error) {
    console.log("❌ Error getting tokens:", error.message);
    if (error.message.includes("access_denied")) {
      console.log("\n🚫 Access Denied - Possible causes:");
      console.log("1. Email not added as Test User");
      console.log("2. OAuth consent screen not configured correctly");
      console.log("3. App still in review mode");
      console.log("\n💡 Solutions:");
      console.log("- Go to Google Cloud Console → OAuth consent screen");
      console.log("- Add your email to Test users");
      console.log("- Ensure Publishing status: Testing");
    }
    throw new Error("OAuth setup failed");
  }
}

async function testOAuthCredentials(
  clientId,
  clientSecret,
  refreshToken,
  accessToken
) {
  console.log("\n🧪 Testing OAuth credentials...");

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      "http://localhost:3000"
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      access_token: accessToken,
    });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    // Test by getting channel info
    const response = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      console.log(
        `✅ OAuth successful! Authenticated as: ${channel.snippet.title}`
      );
      console.log(`📺 Channel ID: ${channel.id}`);
      return true;
    } else {
      throw new Error("Cannot access channel with OAuth");
    }
  } catch (error) {
    console.log("❌ OAuth test failed:", error.message);
    throw error;
  }
}

setup().catch((error) => {
  console.error("❌ Setup failed:", error.message);
  process.exit(1);
});
