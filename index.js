import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import express from 'express';
import dotenv from 'dotenv';
import { loadCommands } from './utils/commandHandler.js';
import { deployCommands } from './utils/deployCommands.js';
import { connectDB } from './utils/database.js';
import { watchWaitlist } from './utils/waitlistWatcher.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

console.log('📋 Environment Check:');
console.log(`  DISCORD_TOKEN: ${process.env.DISCORD_TOKEN ? `✅ (${process.env.DISCORD_TOKEN.length} chars)` : '❌ MISSING'}`);
console.log(`  CLIENT_ID: ${process.env.CLIENT_ID ? `✅ ${process.env.CLIENT_ID}` : '❌ MISSING'}`);
console.log(`  GUILD_ID: ${process.env.GUILD_ID ? `✅ ${process.env.GUILD_ID}` : '❌ MISSING'}`);
console.log(`  MONGODB_URI: ${process.env.MONGODB_URI ? '✅ SET' : '⚠️  Not set'}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let client;

// Create Express app for Render health checks
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        bot: client?.user ? client.user.tag : 'Starting...',
        guilds: client?.guilds ? client.guilds.cache.size : 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

app.listen(PORT, () => {
    console.log(`🌐 HTTP server listening on port ${PORT}`);
});


// Validate required environment variables
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
    console.error('\n❌ Missing required environment variables!');
    console.error('Please ensure DISCORD_TOKEN, CLIENT_ID, and GUILD_ID are set in your Render environment');
    process.exit(1);
}

// Create a new client instance
client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Add debug listeners to catch rate limiting (429 errors)
client
    .on("debug", console.log)
    .on("warn", console.log);

// Create a collection to store commands
client.commands = new Collection();

// Load commands dynamically
await loadCommands(client);

// Connect to MongoDB
if (process.env.MONGODB_URI) {
    try {
        await connectDB();
    } catch (error) {
        console.error('⚠️  MongoDB connection failed, continuing without database features');
    }
}

// Handle command interactions
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`❌ No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Error executing ${interaction.commandName}:`, error);
        
        const errorMessage = {
            content: '❌ There was an error while executing this command!',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// GitHub PR Auto-linking
// Detects patterns like "PR #123", "pr 456", "pull request #789", etc.
client.on(Events.MessageCreate, async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Check if GitHub repo is configured
    if (!process.env.GITHUB_REPO) return;

    // Regex patterns to detect PR mentions
    const patterns = [
        /\b(?:pr|PR)\s*#?(\d+)\b/g,           // pr #123 or PR 123
        /\bpull request\s*#?(\d+)\b/gi,        // pull request #123
        /\#(\d+)\b/g                           // #123 (generic)
    ];

    const prNumbers = new Set();

    // Extract PR numbers from message
    for (const pattern of patterns) {
        const matches = message.content.matchAll(pattern);
        for (const match of matches) {
            prNumbers.add(match[1]);
        }
    }

    if (prNumbers.size === 0) return;

    // Build response with beautiful embeds
    const repoUrl = `https://github.com/${process.env.GITHUB_REPO}`;
    const embeds = Array.from(prNumbers).map(num => {
        return {
            color: 0x2AA58C,
            title: `🔗 Pull Request #${num}`,
            url: `${repoUrl}/pull/${num}`,
            description: `[Click here to view PR #${num}](${repoUrl}/pull/${num})`,
            fields: [
                {
                    name: '📦 Repository',
                    value: `[\`${process.env.GITHUB_REPO}\`](${repoUrl})`,
                    inline: true
                },
                {
                    name: '🔢 PR Number',
                    value: `#${num}`,
                    inline: true
                }
            ],
            footer: {
                text: 'GitHub Pull Request',
                icon_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
            },
            timestamp: new Date().toISOString()
        };
    });

    if (embeds.length > 0) {
        try {
            await message.reply({
                embeds: embeds,
                allowedMentions: { repliedUser: false }
            });
        } catch (error) {
            console.error('Error sending PR link:', error);
        }
    }
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async (c) => {
    console.log(`✅ Ready! Logged in as ${c.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
    console.log(`🤖 Loaded ${client.commands.size} command(s)`);
    
    // Deploy commands after client is ready (fixes Render timeout issues)
    try {
        await deployCommands(
            process.env.DISCORD_TOKEN,
            process.env.CLIENT_ID,
            process.env.GUILD_ID
        );
    } catch (error) {
        console.warn('⚠️  Failed to deploy commands:', error.message);
    }
    
    if (process.env.GITHUB_REPO) {
        console.log(`🔗 GitHub PR linking enabled for: ${process.env.GITHUB_REPO}`);
    } else {
        console.log(`⚠️  GitHub PR linking disabled (set GITHUB_REPO in .env to enable)`);
    }

    // Start watching waitlist if MongoDB is connected
    if (process.env.MONGODB_URI) {
        try {
            await watchWaitlist(client);
        } catch (error) {
            console.error('⚠️  Failed to start waitlist watcher:', error.message);
        }
    }
});

// Handle errors
client.on(Events.Error, (error) => {
    console.error('❌ Discord client error:', error);
});

client.on('shardError', (error) => {
    console.error('❌ Discord shard error:', error);
});

client.on('shardDisconnect', (event, shardId) => {
    console.warn(`⚠️  Shard ${shardId} disconnected:`, event);
});

client.on('shardReconnecting', (shardId) => {
    console.warn(`🔄 Shard ${shardId} reconnecting...`);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Login to Discord with retry logic
console.log('🤖 Starting Discord client login...');
let loginResolved = false;
let retryCount = 0;
const maxRetries = Infinity; // Unlimited retries
let retryDelay = 5000; // Start with 5 seconds

async function loginWithRetry() {
    try {
        retryCount++;
        console.log(`🔄 Login attempt ${retryCount}...`);
        
        await client.login(process.env.DISCORD_TOKEN);
        loginResolved = true;
        console.log('🔑 Login request accepted by Discord. Waiting for ready event...');
    } catch (error) {
        console.error(`❌ Login attempt ${retryCount} failed:`, error.message || error);
        
        if (retryCount < maxRetries) {
            console.log(`⏳ Retrying in ${retryDelay / 1000}s...`);
            setTimeout(() => {
                retryDelay = Math.min(retryDelay * 1.5, 60000); // Exponential backoff, max 60s
                loginWithRetry();
            }, retryDelay);
        } else {
            console.error('❌ Max retries reached. Exiting.');
            process.exit(1);
        }
    }
}

loginWithRetry();

// Check login progress
setTimeout(() => {
    if (!loginResolved) {
        console.warn('⚠️  Login promise not resolved after 15s. Retrying in background...');
        console.warn('    This could be: Invalid token, network issue, or rate limiting (429)');
    }
}, 15000);

setTimeout(() => {
    if (!client.isReady()) {
        console.warn(`⚠️  Discord client not ready after 60s (attempt ${retryCount}). Still connecting...`);
        console.log(`    Client state: isReady=${client.isReady()}, guilds=${client.guilds.cache.size}`);
        console.warn('    If you see 429 errors above, run: kill 1');
    }
}, 60000);

