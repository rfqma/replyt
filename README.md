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

## 📦 Installation & Usage

There are **two main ways** to use Replyt:

### 🎯 Method 1: CLI Tool (Global Installation)

**Best for:** Quick setup, production use, non-developers

```bash
# Install globally
npm install -g replyt

# Setup configuration
replyt setup

# Run the bot
replyt
```

### 🛠️ Method 2: Local Development (Clone Repository)

**Best for:** Developers, customization, contributing, learning

```bash
# Clone repository
git clone https://github.com/rfqma/replyt.git
cd replyt

# Install dependencies
npm install

# Setup configuration
npm run setup

# Run in development mode
npm run dev
```

---

## 🔧 Setup Guide

### Environment Variables

Both methods require a `.env` file with your API credentials:

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

### Setup APIs

**For CLI (Global Install):**

```bash
replyt setup    # Interactive setup wizard
```

**For Local Development:**

```bash
npm run setup   # Setup YouTube API Key
npm run oauth   # Setup OAuth for posting (optional)
npm run test    # Test configuration
```

---

## 🎯 Usage Instructions

### 🌐 CLI Usage (Global Install)

After global installation and setup:

```bash
# Start the bot
replyt

# That's it! The bot will run automatically
```

### 💻 Local Development Usage

**Running the Bot:**

```bash
npm run dev     # Development mode with auto-restart
npm run start   # Production mode (requires build)
npm run watch   # Development with file watching
```

**Development Commands:**

```bash
npm run build   # Compile TypeScript
npm run clean   # Clean build files
npm run test    # Test API connections
npm run setup   # Run setup wizard
npm run oauth   # Setup OAuth authentication
```

### 📚 Library Usage (Both Methods)

You can also use Replyt as a library in your own projects:

```bash
# Install as dependency
npm install replyt
```

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

---

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

To enable posting:

**CLI:** `replyt oauth`
**Local:** `npm run oauth`

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

## 🛠️ Development (Local Repository)

### Quick Start

```bash
git clone https://github.com/rfqma/replyt.git
cd replyt
npm install
npm run setup
npm run dev
```

### Available Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Development mode with auto-restart |
| `npm run start`    | Production mode (requires build)   |
| `npm run build`    | Compile TypeScript                 |
| `npm run watch`    | Development with file watching     |
| `npm run setup`    | Setup wizard                       |
| `npm run oauth`    | OAuth setup                        |
| `npm run test`     | Test configuration                 |
| `npm run clean`    | Clean build files                  |
| `npm run validate` | Validate package structure         |

### Project Structure

```
replyt/
├── src/
│   ├── bin/replyt.ts      # CLI executable
│   ├── lib/index.ts       # Library exports
│   ├── services/          # Core services
│   ├── config/            # Configuration
│   └── types/             # TypeScript types
├── scripts/               # Setup scripts
├── examples/              # Usage examples
└── dist/                  # Compiled output
```

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

   - Refresh token expired, run OAuth setup again:
     - **CLI:** `replyt oauth`
     - **Local:** `npm run oauth`

3. **OpenAI Rate Limits**
   ```
   Error: Rate limit exceeded
   ```
   - Reduce `MAX_REPLIES_PER_RUN`
   - Increase `CHECK_INTERVAL_MINUTES`

### Debug Mode

**CLI:** `DEBUG=replyt:* replyt`
**Local:** `DEBUG=replyt:* npm run dev`

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
