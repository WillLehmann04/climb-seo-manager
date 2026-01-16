import dotenv from 'dotenv';
import { deployCommands } from './utils/deployCommands.js';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
    console.error('❌ Missing required environment variables!');
    console.error('Please ensure DISCORD_TOKEN, CLIENT_ID, and GUILD_ID are set in your .env file');
    process.exit(1);
}

// Deploy commands
console.log('📦 Manual Command Deployment\n');
console.log('Note: Commands are now auto-deployed when running "npm start"');
console.log('This script is only needed if you want to deploy without starting the bot.\n');

try {
    await deployCommands(
        process.env.DISCORD_TOKEN,
        process.env.CLIENT_ID,
        process.env.GUILD_ID
    );
    console.log('\n✅ Manual deployment complete!');
} catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
}

