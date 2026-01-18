import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isFounder, replyNoPermission } from '../utils/permissions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete a specified number of messages (Founder only)')
        .addIntegerOption(option =>
            option
                .setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        // Check if user is a Founder
        if (!isFounder(interaction.member)) {
            return await replyNoPermission(interaction);
        }

        const amount = interaction.options.getInteger('amount');

        try {
            // Defer reply as this might take a moment
            await interaction.deferReply({ ephemeral: true });

            // Fetch and delete messages
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            const deleted = await interaction.channel.bulkDelete(messages, true);

            await interaction.editReply({
                content: `✅ Successfully deleted ${deleted.size} message(s)!`
            });

            // Auto-delete the confirmation after 5 seconds
            setTimeout(() => {
                interaction.deleteReply().catch(() => {});
            }, 5000);

        } catch (error) {
            console.error('Error purging messages:', error);
            await interaction.editReply({
                content: '❌ Failed to delete messages. Note: Messages older than 14 days cannot be bulk deleted.'
            });
        }
    },
};


