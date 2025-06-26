#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env") });
const { google } = require("googleapis");
const OpenAI = require("openai");

async function testYouTubeAPI() {
  console.log("🎯 Testing YouTube Data API...");

  try {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    // test channel access
    const response = await youtube.channels.list({
      part: ["snippet", "statistics"],
      id: process.env.YOUTUBE_CHANNEL_ID,
    });

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      console.log(`✅ YouTube API OK - Channel: ${channel.snippet.title}`);
      console.log(`📊 Subscribers: ${channel.statistics.subscriberCount}`);
      console.log(`📹 Videos: ${channel.statistics.videoCount}`);
      return true;
    } else {
      console.log("❌ Channel not found. Check YOUTUBE_CHANNEL_ID");
      return false;
    }
  } catch (error) {
    console.log("❌ YouTube API Error:", error.message);
    return false;
  }
}

async function testOpenAI() {
  console.log("\n🧠 Testing OpenAI API...");

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: 'Reply with just "API test successful!"',
        },
      ],
      max_tokens: 20,
    });

    const reply = response.choices[0]?.message?.content?.trim();
    console.log(`✅ OpenAI API OK - Response: "${reply}"`);
    return true;
  } catch (error) {
    console.log("❌ OpenAI API Error:", error.message);
    return false;
  }
}

async function testOAuthCredentials() {
  console.log("\n🔐 Testing OAuth credentials...");

  if (
    !process.env.YOUTUBE_CLIENT_ID ||
    !process.env.YOUTUBE_CLIENT_SECRET ||
    !process.env.YOUTUBE_REFRESH_TOKEN
  ) {
    console.log("❌ OAuth credentials missing - OAuth is required!");
    console.log('🔧 Run "npm run setup" to setup complete authentication');
    return false;
  }

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

    // test by getting authenticated channel info
    const response = await youtube.channels.list({
      part: ["snippet"],
      mine: true,
    });

    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      console.log(`✅ OAuth OK - Authenticated as: ${channel.snippet.title}`);
      return true;
    } else {
      console.log("❌ Cannot access channel with OAuth");
      return false;
    }
  } catch (error) {
    console.log("❌ OAuth Error:", error.message);
    console.log('💡 Run "npm run setup" to refresh credentials');
    return false;
  }
}

async function testSampleComment() {
  console.log("\n🔍 Testing sample comment fetch...");

  try {
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    // get recent videos
    const videosResponse = await youtube.search.list({
      part: ["snippet"],
      channelId: process.env.YOUTUBE_CHANNEL_ID,
      type: "video",
      order: "date",
      maxResults: 5,
    });

    if (!videosResponse.data.items || videosResponse.data.items.length === 0) {
      console.log("⚠️  No videos found in channel");
      return false;
    }

    // try to get comments from first video
    const videoId = videosResponse.data.items[0].id.videoId;
    const videoTitle = videosResponse.data.items[0].snippet.title;

    try {
      const commentsResponse = await youtube.commentThreads.list({
        part: ["snippet"],
        videoId: videoId,
        maxResults: 5,
      });

      if (
        commentsResponse.data.items &&
        commentsResponse.data.items.length > 0
      ) {
        console.log(
          `✅ Comments accessible - Found ${commentsResponse.data.items.length} comments on "${videoTitle}"`
        );
        const firstComment =
          commentsResponse.data.items[0].snippet.topLevelComment.snippet;
        console.log(
          `📝 Sample comment: "${firstComment.textDisplay.substring(
            0,
            100
          )}..."`
        );
        return true;
      } else {
        console.log(
          `⚠️  Video "${videoTitle}" has no comments or comments are disabled`
        );
        return false;
      }
    } catch (commentError) {
      console.log(
        `⚠️  Cannot access comments on video "${videoTitle}" - maybe comments are disabled`
      );
      return false;
    }
  } catch (error) {
    console.log("❌ Error testing comments:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Testing API Credentials\n");

  // check if .env exists
  if (
    !process.env.YOUTUBE_API_KEY ||
    !process.env.YOUTUBE_CHANNEL_ID ||
    !process.env.OPENAI_API_KEY
  ) {
    console.log("❌ Missing environment variables!");
    console.log("Make sure .env file exists and contains:");
    console.log("- YOUTUBE_API_KEY");
    console.log("- YOUTUBE_CHANNEL_ID");
    console.log("- OPENAI_API_KEY");
    console.log("\nRun: npm run setup");
    process.exit(1);
  }

  const youtubeOK = await testYouTubeAPI();
  const openaiOK = await testOpenAI();
  const oauthOK = await testOAuthCredentials();
  const commentsOK = await testSampleComment();

  console.log("\n" + "=".repeat(50));
  console.log("📋 Test Results:");
  console.log(`YouTube API: ${youtubeOK ? "✅" : "❌"}`);
  console.log(`OpenAI API: ${openaiOK ? "✅" : "❌"}`);
  console.log(`OAuth Credentials: ${oauthOK ? "✅" : "❌"}`);
  console.log(`Comments Access: ${commentsOK ? "✅" : "❌"}`);

  if (youtubeOK && openaiOK && oauthOK && commentsOK) {
    console.log("\n🎉 All tests passed! Bot ready to run.");
    console.log("🚀 Run: npm run dev");
  } else {
    console.log(
      "\n❌ Some tests failed. Fix the issues above before running the bot."
    );
    if (!oauthOK) {
      console.log("🔧 OAuth is required - run: npm run setup");
    }
  }
}

runTests().catch(console.error);
