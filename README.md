# Replyt

[![npm version](https://badge.fury.io/js/replyt.svg)](https://badge.fury.io/js/replyt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Replyt** is a TypeScript npm package that allows you to automate YouTube comment replies using AI. Built with OpenAI GPT and YouTube Data API v3.

## 🚀 Features

- ✅ **Full Automation**: Automatically reply to YouTube comments
- 🤖 **Smart AI**: Uses OpenAI GPT to generate natural responses
- 🌍 **Multi-language**: Replies in the same language as the comment
- 📊 **Database Tracking**: Tracks processed comments
- ⚡ **Rate Limiting**: Respects YouTube API limits
- 🔧 **Configurable**: Customize reply style, intervals, and more
- 📦 **CLI & Library**: Use as command line tool or import as library

## 📦 Installation

### Global Installation (CLI)

```bash
npm install -g replyt
```

### Local Installation (Library)

```bash
npm install replyt
```

## 🔧 Setup

### 1. Environment Variables

Create a `.env` file in your project root:

```env
# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# OAuth (optional - for posting comments)
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
YOUTUBE_ACCESS_TOKEN=your_access_token_here

# Bot Configuration
CHECK_INTERVAL_MINUTES=5
MAX_REPLIES_PER_RUN=10
REPLY_STYLE="friendly and helpful"
DATABASE_PATH=./data/replyt.db
```

### 2. Setup APIs

If installed globally, run:

```bash
replyt setup
```

Or use the setup scripts:

```bash
node scripts/setup.js    # Setup YouTube API Key
node scripts/oauth.js    # Setup OAuth for posting (optional)
node scripts/test.js     # Test configuration
```

## 🎯 Usage

### CLI Usage

After setup, run the bot:

```bash
replyt
```

### Library Usage

```typescript
import { Replyt, AutoReplyBot, config } from "replyt";

// Using the Replyt wrapper class
const bot = new Replyt(config);

// Start bot with cron scheduling
await bot.start("*/5 * * * *"); // Every 5 minutes

// Or use manually
await bot.initialize();
await bot.processNewComments();
const stats = await bot.getStats();
```

#### Advanced Usage with AutoReplyBot

```typescript
import { AutoReplyBot, config, validateConfig } from "replyt";

// Validate configuration
validateConfig();

// Create bot instance
const bot = new AutoReplyBot(config);

// Initialize
await bot.initialize();

// Process comments once
await bot.processNewComments();

// View statistics
const stats = await bot.getStats();
console.log(stats);

// Shutdown
bot.shutdown();
```

## 📋 API Documentation

### Classes

#### `Replyt`

Wrapper class for easy library usage.

```typescript
class Replyt {
  constructor(config: Config);
  async initialize(): Promise<void>;
  async processNewComments(): Promise<void>;
  async getStats(): Promise<object>;
  async start(cronExpression?: string): Promise<void>;
  shutdown(): void;
}
```

#### `AutoReplyBot`

Core bot class with full control.

```typescript
class AutoReplyBot {
  constructor(config: Config);
  async initialize(): Promise<void>;
  async processNewComments(): Promise<void>;
  async getStats(): Promise<object>;
  shutdown(): void;
}
```

### Services

#### `YouTubeService`

- Fetch comments from channel
- Post replies to YouTube
- OAuth management

#### `OpenAIService`

- Generate AI responses
- Filter comments that need replies
- Multi-language support

#### `DatabaseService`

- SQLite database for tracking
- Store comment status
- Processing statistics

### Types

```typescript
interface Config {
  youtubeApiKey: string;
  youtubeChannelId: string;
  youtubeOAuth: OAuthCredentials;
  openaiApiKey: string;
  checkIntervalMinutes: number;
  maxRepliesPerRun: number;
  replyStyle: string;
  databasePath: string;
}

interface YouTubeComment {
  id: string;
  videoId: string;
  authorDisplayName: string;
  textDisplay: string;
  publishedAt: string;
  // ... other properties
}
```

## ⚙️ Configuration

### Environment Variables

| Variable                 | Required | Default                | Description                      |
| ------------------------ | -------- | ---------------------- | -------------------------------- |
| `YOUTUBE_API_KEY`        | ✅       | -                      | YouTube Data API v3 key          |
| `YOUTUBE_CHANNEL_ID`     | ✅       | -                      | Your YouTube channel ID          |
| `OPENAI_API_KEY`         | ✅       | -                      | OpenAI API key                   |
| `YOUTUBE_CLIENT_ID`      | ❌       | -                      | OAuth client ID (for posting)    |
| `YOUTUBE_CLIENT_SECRET`  | ❌       | -                      | OAuth client secret              |
| `YOUTUBE_REFRESH_TOKEN`  | ❌       | -                      | OAuth refresh token              |
| `CHECK_INTERVAL_MINUTES` | ❌       | 5                      | Comment check interval (minutes) |
| `MAX_REPLIES_PER_RUN`    | ❌       | 10                     | Max replies per cycle            |
| `REPLY_STYLE`            | ❌       | "friendly and helpful" | AI reply style                   |
| `DATABASE_PATH`          | ❌       | "./data/replyt.db"     | SQLite database path             |

### Reply Styles

You can customize AI reply style by changing `REPLY_STYLE`:

- `"friendly and helpful"`
- `"professional and formal"`
- `"casual and funny"`
- `"educational and informative"`
- Custom: `"Always reply in Indonesian with emojis"`

## 🔒 Read-Only Mode

If you don't configure OAuth, the bot will run in **read-only** mode:

- ✅ Read and analyze comments
- ✅ Generate AI responses
- ✅ Track in database
- ❌ Won't post replies to YouTube

To enable posting, setup OAuth with:

```bash
node scripts/oauth.js
```

## 📊 Monitoring

The bot provides detailed logging and statistics:

```
🤖 Bot initialized successfully - FULL MODE (can post replies)
📝 Found 25 total comments
🆕 Found 5 new comments to process
🧠 Generating reply for comment by John Doe...
📤 Posting reply: "Thank you for watching! ..."
✅ Successfully replied to comment abc123
📊 Total comments processed: 150
```

## 🛠️ Development

```bash
# Clone repository
git clone https://github.com/rfqma/replyt.git
cd replyt

# Install dependencies
npm install

# Build TypeScript
npm run build

# Development mode
npm run dev

# Test APIs
npm run test
```

## 📝 Scripts

- `npm run build` - Compile TypeScript
- `npm run start` - Start bot (CLI)
- `npm run dev` - Development mode with watch
- `npm run setup` - Setup wizard
- `npm run oauth` - OAuth setup
- `npm run test` - Test configuration
- `npm run clean` - Clean build files

## 🔧 Troubleshooting

### Common Issues

1. **API Key Invalid**

   ```
   Error: The request cannot be completed because you have exceeded your quota.
   ```

   - Check YouTube API key and quota
   - Ensure YouTube Data API v3 is enabled

2. **OAuth Issues**

   ```
   Error: invalid_grant
   ```

   - Refresh token expired, run `npm run oauth` again

3. **OpenAI Rate Limits**
   ```
   Error: Rate limit exceeded
   ```
   - Reduce `MAX_REPLIES_PER_RUN`
   - Increase `CHECK_INTERVAL_MINUTES`

### Debug Mode

Set environment variable for debugging:

```bash
DEBUG=replyt:* npm start
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

- 🐛 [Report bugs](https://github.com/rfqma/replyt/issues)
- 💡 [Request features](https://github.com/rfqma/replyt/issues)
- 📧 [info@rfqm.xyz](mailto:info@rfqm.xyz)

## 🙏 Credits

Built with ❤️ using:

- [OpenAI GPT](https://openai.com/) for AI responses
- [YouTube Data API v3](https://developers.google.com/youtube/v3) for YouTube integration
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [SQLite](https://www.sqlite.org/) for data persistence

---

⭐ **Star this repository if it's helpful!**
