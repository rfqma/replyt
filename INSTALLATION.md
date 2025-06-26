# 📦 Replyt Installation Guide

## Choose Your Installation Method

### 🎯 Method 1: CLI Tool (Recommended for Most Users)

**Best for:** Quick setup, production use, non-developers

```bash
# 1. Install globally
npm install -g replyt

# 2. Setup configuration
replyt setup

# 3. (Optional) Setup OAuth for posting
replyt oauth

# 4. Start the bot
replyt
```

**CLI Commands:**

- `replyt` - Start the bot
- `replyt setup` - Interactive setup wizard
- `replyt oauth` - Setup OAuth for comment posting
- `replyt test` - Test API connections
- `replyt --help` - Show help
- `replyt --version` - Show version

---

### 🛠️ Method 2: Local Development (For Developers)

**Best for:** Developers, customization, contributing, learning

```bash
# 1. Clone repository
git clone https://github.com/rfqma/replyt.git
cd replyt

# 2. Install dependencies
npm install

# 3. Setup configuration
npm run setup

# 4. (Optional) Setup OAuth for posting
npm run oauth

# 5. Start in development mode
npm run dev
```

**Development Commands:**

- `npm run dev` - Development mode with auto-restart
- `npm run start` - Production mode (requires build)
- `npm run build` - Compile TypeScript
- `npm run watch` - Development with file watching
- `npm run setup` - Setup wizard
- `npm run oauth` - OAuth setup
- `npm run test` - Test configuration
- `npm run clean` - Clean build files

---

## 📋 Requirements

**System Requirements:**

- Node.js 16.0.0 or higher
- npm (comes with Node.js)

**API Requirements:**

- YouTube Data API v3 key
- YouTube Channel ID
- OpenAI API key
- (Optional) YouTube OAuth credentials for posting

---

## 🔧 Configuration

Both methods require the same `.env` configuration:

```env
# Required
YOUTUBE_API_KEY=your_youtube_api_key_here
YOUTUBE_CHANNEL_ID=your_channel_id_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional (for posting comments)
YOUTUBE_CLIENT_ID=your_client_id_here
YOUTUBE_CLIENT_SECRET=your_client_secret_here
YOUTUBE_REFRESH_TOKEN=your_refresh_token_here

# Bot Settings (optional)
CHECK_INTERVAL_MINUTES=5
MAX_REPLIES_PER_RUN=10
REPLY_STYLE="friendly and helpful"
DATABASE_PATH=./data/replyt.db
```

---

## 🚀 Quick Comparison

| Feature           | CLI Install               | Local Development     |
| ----------------- | ------------------------- | --------------------- |
| **Setup Time**    | ⚡ Fast (2 minutes)       | 🔧 Medium (5 minutes) |
| **Customization** | ❌ Limited                | ✅ Full access        |
| **Updates**       | ✅ `npm update -g replyt` | 🔄 `git pull`         |
| **Debugging**     | ❌ Limited                | ✅ Full debugging     |
| **Contributing**  | ❌ No                     | ✅ Yes                |
| **Storage**       | ⚡ Minimal                | 💾 Full source code   |

---

## 🔍 Next Steps

After installation:

1. **Get API Keys** - Follow the setup wizard
2. **Test Configuration** - Run test command
3. **Start Bot** - Begin auto-replying
4. **Monitor** - Check logs and statistics

**Need Help?**

- 📖 Read the [full README](README.md)
- 🐛 [Report issues](https://github.com/rfqma/replyt/issues)
- 💬 [Get support](mailto:info@rfqm.xyz)
