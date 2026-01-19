import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Deploys all commands to Discord
 * @param {string} token - Discord bot token
 * @param {string} clientId - Discord application/client ID
 * @param {string} guildId - Discord guild/server ID
 */
export async function deployCommands(token, clientId, guildId) {
    const commands = [];

    // Load all command files
    const commandsPath = join(__dirname, '..', 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    console.log('🔄 Deploying commands to Discord...');

    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await import(`file://${filePath}`);
        
        if ('data' in command.default && 'execute' in command.default) {
            commands.push(command.default.data.toJSON());
            console.log(`  ✅ Prepared: ${command.default.data.name}`);
        } else {
            console.log(`  ⚠️  Warning: ${file} is missing required "data" or "execute" property.`);
        }
    }

    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(token);

    try {
        console.log(`\n🚀 Syncing ${commands.length} slash command(s) with Discord...`);

        // Add timeout to prevent hanging (increased for Render's slower environment)
        const deployPromise = rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Command deployment timeout (120s)')), 120000)
        );

        const data = await Promise.race([deployPromise, timeoutPromise]);

        console.log(`✅ Successfully synced ${data.length} command(s) to guild ${guildId}\n`);
        
        return data;
    } catch (error) {
        console.error('❌ Error deploying commands:', error.message || error);
        throw error;
    }
}


