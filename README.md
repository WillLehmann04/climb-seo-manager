# 🤖 ClimbSEO Discord Server Management Bot

A modern Discord.js bot with dynamic command loading and automatic command synchronization.

## ✨ Features

- 🔄 **Dynamic Command Loading** - Automatically discovers and loads commands from the `commands` folder
- 🚀 **Slash Commands** - Modern Discord slash command support
- ⚡ **Auto-Deploy on Start** - Commands are automatically synced to Discord when you start the bot
- 🔐 **Environment Variables** - Secure configuration using `.env` file
- 📦 **ES Modules** - Uses modern JavaScript module syntax
- 🎯 **Easy to Extend** - Simple command structure for adding new commands

## 📋 Prerequisites

- Node.js 16.9.0 or higher
- A Discord Bot Token and Application ID
- A Discord Server (Guild) ID where you want to deploy commands

## 🚀 Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/WillLehmann04/climb-seo-manager.git
   cd climb-seo-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and fill in your values:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   ```

   **How to get these values:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a new application (or select existing one)
   - **CLIENT_ID**: Copy the "Application ID" from the General Information page
   - **DISCORD_TOKEN**: Go to the "Bot" tab and copy/reset the token
   - **GUILD_ID**: Enable Developer Mode in Discord (Settings → Advanced → Developer Mode), then right-click your server and "Copy ID"

4. **Start the bot** (commands will auto-deploy!)
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

That's it! Commands are automatically deployed when the bot starts. 🎉

## 📁 Project Structure

```
climb-seo-manager/
├── commands/           # Slash command files
│   ├── ping.js        # Example: Ping command
│   ├── server.js      # Example: Server info command
│   └── user.js        # Example: User info command
├── utils/             # Utility functions
│   ├── commandHandler.js  # Dynamic command loader
│   └── deployCommands.js  # Command deployment utility
├── index.js           # Main bot file
├── deploy-commands.js # Manual command deployment script (optional)
├── .env.example       # Environment variables template
├── .env               # Your environment variables (git-ignored)
└── package.json       # Project dependencies
```

## 🔨 Creating New Commands

To create a new command, add a new file in the `commands` folder:

```javascript
import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Command description'),
    
    async execute(interaction) {
        await interaction.reply('Hello!');
    },
};
```

After creating a new command, just restart the bot with `npm start` - commands will be automatically synced!

## 🎮 Available Commands

- `/ping` - Check bot latency and API response time
- `/server` - Display server information and statistics
- `/user [target]` - Show user information (defaults to command user)
- `/pr number:123` - Get a link to a GitHub pull request

### 🛡️ Moderation Commands (Founder Only)
- `/purge amount:50` - Delete messages (1-100)
- `/ban target:@user reason:...` - Ban a user
- `/kick target:@user reason:...` - Kick a user
- `/timeout target:@user duration:60` - Timeout a user (minutes)
- `/unban user_id:123456` - Unban a user
- `/untimeout target:@user` - Remove timeout from a user

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Hosting

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions.

**Quick Deploy to Render (FREE):**
1. Push to GitHub
2. Create new Web Service on Render
3. Connect your repo
4. Add environment variables
5. Deploy!

The bot includes a built-in HTTP server so it works on Render's free tier.

## 🛠️ Scripts

- `npm start` - Start the bot (auto-deploys commands)
- `npm run dev` - Start the bot with auto-reload (Node.js 18+)
- `npm run deploy` - Manually deploy commands without starting the bot (optional)

## 🔗 Bot Permissions

When inviting the bot to your server, make sure it has these permissions:
- Read Messages/View Channels
- Send Messages
- Use Slash Commands
- Read Message History
- Add Reactions (optional, for future features)

**Invite URL Template:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274878221376&scope=bot%20applications.commands
```

Replace `YOUR_CLIENT_ID` with your actual Client ID.

## 📝 License

ISC

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👤 Author

GitHub: [@WillLehmann04](https://github.com/WillLehmann04)
