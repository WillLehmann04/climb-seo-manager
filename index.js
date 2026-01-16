import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import dotenv from 'dotenv';
import { loadCommands } from './utils/commandHandler.js';
import { deployCommands } from './utils/deployCommands.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validate required environment variables
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
    console.error('❌ Missing required environment variables!');
    console.error('Please ensure DISCORD_TOKEN, CLIENT_ID, and GUILD_ID are set in your .env file');
    process.exit(1);
}

// Auto-deploy commands to Discord
try {
    await deployCommands(
        process.env.DISCORD_TOKEN,
        process.env.CLIENT_ID,
        process.env.GUILD_ID
    );
} catch (error) {
    console.error('❌ Failed to deploy commands. Bot will still start, but commands may not work.');
}

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Create a collection to store commands
client.commands = new Collection();

// Load commands dynamically
await loadCommands(client);

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
            color: 0x6e5494, // GitHub purple
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
client.once(Events.ClientReady, (c) => {
    console.log(`✅ Ready! Logged in as ${c.user.tag}`);
    console.log(`📊 Serving ${client.guilds.cache.size} guild(s)`);
    console.log(`🤖 Loaded ${client.commands.size} command(s)`);
    
    if (process.env.GITHUB_REPO) {
        console.log(`🔗 GitHub PR linking enabled for: ${process.env.GITHUB_REPO}`);
    } else {
        console.log(`⚠️  GitHub PR linking disabled (set GITHUB_REPO in .env to enable)`);
    }
});

// Handle errors
client.on(Events.Error, (error) => {
    console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

