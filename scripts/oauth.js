#!/usr/bin/env node

require("dotenv").config();
const { google } = require("googleapis");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupOAuth() {
  console.log("🔐 YouTube OAuth 2.0 Setup\n");
  console.log("To reply to comments, we need to setup OAuth authentication.\n");

  // Check if we already have OAuth credentials
  if (process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET) {
    console.log("✅ OAuth Client ID and Secret found in .env");
    const useExisting = await question("Use existing credentials? (y/n): ");

    if (useExisting.toLowerCase() === "n") {
      await setupNewOAuth();
    } else {
      await refreshTokenFlow();
    }
  } else {
    console.log("📋 New OAuth credentials setup required.\n");
    await setupNewOAuth();
  }

  rl.close();
}

async function setupNewOAuth() {
  console.log("\n🛠️  Setup OAuth Credentials\n");

  console.log("📋 OAuth setup steps:");
  console.log(
    "1. Go to Google Cloud Console: https://console.cloud.google.com/"
  );
  console.log("2. Select the same project as your YouTube Data API");
  console.log('3. Go to "APIs & Services" → "OAuth consent screen"');
  console.log("4. Setup OAuth consent screen if not done:");
  console.log("   - User Type: External");
  console.log('   - App name: "Replyt"');
  console.log("   - User support email: your email");
  console.log("   - Developer contact: same email");
  console.log('5. In "Test users" section → ADD USERS → enter your email');
  console.log(
    '6. Go to "Credentials" → "+ CREATE CREDENTIALS" → "OAuth client ID"'
  );
  console.log('7. Application type: "Desktop application"');
  console.log('8. Name: "Replyt YouTube Bot"');
  console.log("9. Copy Client ID and Client Secret\n");

  console.log('⚠️  IMPORTANT: If you get "Access blocked" error:');
  console.log("   - Make sure your email is added as Test User");
  console.log("   - OAuth consent screen status: Testing (not In production)");
  console.log("   - Required scopes will be automatically added\n");

  const clientId = await question("🔑 Enter OAuth Client ID: ");
  const clientSecret = await question("🔐 Enter OAuth Client Secret: ");

  // Update .env file
  await updateEnvFile({
    YOUTUBE_CLIENT_ID: clientId,
    YOUTUBE_CLIENT_SECRET: clientSecret,
  });

  console.log("\n✅ OAuth credentials saved!\n");

  // Now get refresh token
  await getRefreshToken(clientId, clientSecret);
}

async function refreshTokenFlow() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (process.env.YOUTUBE_REFRESH_TOKEN) {
    console.log("✅ Refresh token found in .env");
    const testToken = await question("Test existing token? (y/n): ");

    if (testToken.toLowerCase() === "y") {
      await testOAuthCredentials();
      return;
    }
  }

  await getRefreshToken(clientId, clientSecret);
}

async function getRefreshToken(clientId, clientSecret) {
  console.log("\n🔄 Getting Refresh Token\n");

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
  console.log("1. COPY and OPEN the following URL in your browser:");
  console.log("");
  console.log("🔗 " + authUrl);
  console.log("");
  console.log("2. Login with your YouTube channel account");
  console.log('3. If you see "Access blocked" or "Error 403":');
  console.log("   a. Go to Google Cloud Console → OAuth consent screen");
  console.log('   b. Scroll to "Test users" → ADD USERS');
  console.log("   c. Add your email as test user");
  console.log("   d. Wait 5-10 minutes, then try again");
  console.log('4. Click "Allow" to grant permissions');
  console.log("5. After redirect, copy the ENTIRE URL from address bar");
  console.log("6. Or if authorization code appears, copy that code\n");

  const input = await question("🔑 Paste full URL or authorization code: ");

  // Extract code from URL or use directly if it's a code
  let authCode;
  if (input.includes("code=")) {
    const url = new URL(input);
    authCode = url.searchParams.get("code");
  } else {
    authCode = input.trim();
  }

  if (!authCode) {
    console.log("❌ Authorization code not found. Please try again.");
    return;
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
      return;
    }

    console.log("\n✅ Successfully obtained OAuth tokens!");

    // Update .env file
    await updateEnvFile({
      YOUTUBE_REFRESH_TOKEN: tokens.refresh_token,
      YOUTUBE_ACCESS_TOKEN: tokens.access_token || "",
    });

    console.log("✅ Tokens saved to .env file");

    // Test the credentials
    await testOAuthCredentials();
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
    console.log("💡 Make sure authorization code is correct and not expired");
  }
}

async function testOAuthCredentials() {
  console.log("\n🧪 Testing OAuth credentials...\n");

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      "http://localhost:3000"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
      access_token: process.env.YOUTUBE_ACCESS_TOKEN,
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

      // Update channel ID in .env if different
      if (channel.id !== process.env.YOUTUBE_CHANNEL_ID) {
        console.log(
          "\n💡 Channel ID in .env differs from authenticated channel"
        );
        const updateChannelId = await question(
          "Update YOUTUBE_CHANNEL_ID? (y/n): "
        );

        if (updateChannelId.toLowerCase() === "y") {
          await updateEnvFile({
            YOUTUBE_CHANNEL_ID: channel.id,
          });
          console.log("✅ Channel ID updated");
        }
      }

      console.log("\n🎉 OAuth setup complete!");
      console.log("🚀 Bot can now post replies to YouTube!");
      console.log("\nRun: npm run dev");
    } else {
      console.log("❌ Cannot access channel info");
    }
  } catch (error) {
    console.log("❌ OAuth test failed:", error.message);
    console.log("💡 May need to refresh tokens or setup again");
  }
}

async function updateEnvFile(updates) {
  const envPath = path.join(__dirname, "..", ".env");
  let envContent = "";

  // Read existing .env
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  // Update each key
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");

    if (regex.test(envContent)) {
      // Update existing line
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // Add new line
      envContent += `\n${key}=${value}`;
    }
  }

  // Write back to file
  fs.writeFileSync(envPath, envContent.trim() + "\n");
}

setupOAuth().catch(console.error);
