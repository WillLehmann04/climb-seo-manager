import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Dynamically loads all command files from the commands directory
 * @param {Client} client - The Discord client instance
 */
export async function loadCommands(client) {
    const commandsPath = join(__dirname, '..', 'commands');
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    console.log('🔄 Loading commands...');

    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        
        try {
            const command = await import(`file://${filePath}`);
            
            // Set a new item in the Collection with the key as the command name and the value as the exported module
            if ('data' in command.default && 'execute' in command.default) {
                client.commands.set(command.default.data.name, command.default);
                console.log(`  ✅ Loaded command: ${command.default.data.name}`);
            } else {
                console.log(`  ⚠️  Warning: ${file} is missing required "data" or "execute" property.`);
            }
        } catch (error) {
            console.error(`  ❌ Error loading ${file}:`, error);
        }
    }

    console.log(`✅ Successfully loaded ${client.commands.size} command(s)\n`);
}

