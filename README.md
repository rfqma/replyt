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

## 📦 Installation & Setup

### 📋 Requirements

**System Requirements:**

- Node.js 16.0.0 or higher
- npm (comes with Node.js)

**API Requirements:**

- YouTube Data API v3 key
- YouTube Channel ID
- OpenAI API key
- YouTube OAuth credentials for posting

### 🔑 Getting Required Credentials

Before running the setup, you'll need to obtain several API credentials. Here's how to get each one:

#### 1. YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing project
3. Go to **"APIs & Services"** → **"Library"**
4. Search for **"YouTube Data API v3"** and click **"ENABLE"**
5. Go to **"APIs & Services"** → **"Credentials"**
6. Click **"+ CREATE CREDENTIALS"** → **"API key"**
7. Copy the API key
8. (Recommended) Restrict the key to **"YouTube Data API v3"** for security

#### 2. YouTube Channel ID

**Option A: From Channel URL**

- If your URL is `youtube.com/channel/UCxxxxxx`, the part after `/channel/` is your Channel ID

**Option B: From Custom URL**

- If your URL is `youtube.com/@username` or `youtube.com/c/username`:
  1. Go to your YouTube channel
  2. Click **"About"** tab
  3. Click **"Share Channel"**
  4. Copy the Channel ID (format: `UCxxxxxxxxxxxxxxxxxxxxxx`)

#### 3. OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Go to **"API keys"** section
4. Click **"Create new secret key"**
5. Copy the API key (starts with `sk-proj-` or `sk-`)

#### 4. YouTube OAuth Credentials

**Step 1: OAuth Consent Screen**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the **same project** as your YouTube Data API
3. Go to **"APIs & Services"** → **"OAuth consent screen"**
4. Choose **"External"** user type, click **"CREATE"**
5. Fill required fields:
   - App name: `Replyt` (or any name)
   - User support email: your email
   - Developer contact: same email
6. **IMPORTANT**: In **"Test users"** section → **"ADD USERS"** → enter your email

**Step 2: Create OAuth Client**

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Desktop application"**
4. Name: `Replyt YouTube Bot`
5. Click **"CREATE"**
6. Copy the **Client ID** and **Client secret**

**Troubleshooting OAuth Setup:**

- If you get "Access blocked" error, make sure your email is added as Test User
- OAuth consent screen status should be "Testing" (not "In production")
- Wait 5-10 minutes after adding test user before trying again

### Choose Your Installation Method

There are **two main ways** to use Replyt:

#### 🎯 Method 1: CLI Tool (Recommended for Most Users)

**Best for:** Quick setup, production use, non-developers

```bash
# 1. Install globally
npm install -g replyt

# 2. Create and navigate to your bot directory
mkdir replyt-bot
cd replyt-bot

# 3. Setup configuration
replyt setup

# 4. Start the bot
replyt
```

**CLI Commands:**

- `replyt` - Start the bot
- `replyt setup` - Complete setup wizard (API + OAuth)
- `replyt test` - Test API connections
- `replyt --help` - Show help
- `replyt --version` - Show version

#### 🛠️ Method 2: Local Development (For Developers)

**Best for:** Developers, customization, contributing, learning

```bash
# 1. Clone repository
git clone https://github.com/rfqma/replyt.git
cd replyt

# 2. Install dependencies
npm install

# 3. Setup configuration
npm run setup

# 4. Start in development mode
npm run dev
```

**Development Commands:**

- `npm run dev` - Development mode with auto-restart
- `npm run start` - Production mode (requires build)
- `npm run build` - Compile TypeScript
- `npm run watch` - Development with file watching
- `npm run setup` - Complete setup wizard (API + OAuth)
- `npm run test` - Test configuration
- `npm run clean` - Clean build files

### 🚀 Quick Comparison

| Feature           | CLI Install               | Local Development     |
| ----------------- | ------------------------- | --------------------- |
| **Setup Time**    | ⚡ Fast (2 minutes)       | 🔧 Medium (5 minutes) |
| **Customization** | ❌ Limited                | ✅ Full access        |
| **Updates**       | ✅ `npm update -g replyt` | 🔄 `git pull`         |
| **Debugging**     | ❌ Limited                | ✅ Full debugging     |
| **Contributing**  | ❌ No                     | ✅ Yes                |
| **Storage**       | ⚡ Minimal                | 💾 Full source code   |

### 🔧 Configuration

Both methods require a `.env` file with your API credentials:

```env
# Required
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here
OPENAI_API_KEY=your_openai_api_key_here

# Required (for posting comments)
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here
YOUTUBE_ACCESS_TOKEN=your_access_token_here

# Bot Settings (optional)
CHECK_INTERVAL_MINUTES=5
MAX_REPLIES_PER_RUN=10
REPLY_STYLE="friendly and helpful"
DATABASE_PATH=./data/replyt.db
```

## 🎯 Usage Instructions

### 🌐 CLI Usage (Global Install)

After global installation and setup:

```bash
# Navigate to your bot directory
cd replyt-bot

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
| `YOUTUBE_CLIENT_ID`      | ✅       | -                      | OAuth client ID (for posting)    |
| `YOUTUBE_CLIENT_SECRET`  | ✅       | -                      | OAuth client secret              |
| `YOUTUBE_REFRESH_TOKEN`  | ✅       | -                      | OAuth refresh token              |
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

## 🔐 OAuth Setup Required

OAuth authentication is required for the bot to post replies to YouTube. The setup process will guide you through:

- Creating YouTube OAuth credentials
- Authorizing the application
- Generating access and refresh tokens

**Setup Commands:**

**CLI:** `replyt setup`
**Local:** `npm run setup`

## 📊 Monitoring

The bot provides detailed logging and statistics:

```
🤖 Bot initialized successfully
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

| Command            | Description                         |
| ------------------ | ----------------------------------- |
| `npm run dev`      | Development mode with auto-restart  |
| `npm run start`    | Production mode (requires build)    |
| `npm run build`    | Compile TypeScript                  |
| `npm run watch`    | Development with file watching      |
| `npm run setup`    | Complete setup wizard (API + OAuth) |
| `npm run test`     | Test configuration                  |
| `npm run clean`    | Clean build files                   |
| `npm run validate` | Validate package structure          |

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

   - Refresh token expired, run setup again:
     - **CLI:** `replyt setup`
     - **Local:** `npm run setup`

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
