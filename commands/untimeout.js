import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isFounder, replyNoPermission } from '../utils/permissions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a user (Founder only)')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user to remove timeout from')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for removing timeout')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        // Check if user is a Founder
        if (!isFounder(interaction.member)) {
            return await replyNoPermission(interaction);
        }

        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Fetch the member
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return await interaction.reply({
                content: '❌ User is not in this server!',
                ephemeral: true
            });
        }

        // Check if user is timed out
        if (!member.communicationDisabledUntil || member.communicationDisabledUntil < Date.now()) {
            return await interaction.reply({
                content: '❌ This user is not timed out!',
                ephemeral: true
            });
        }

        try {
            // Remove timeout
            await member.timeout(null, `${reason} | Timeout removed by ${interaction.user.tag}`);

            const embed = {
                color: 0x00FF00,
                title: '✅ Timeout Removed',
                fields: [
                    {
                        name: '👤 User',
                        value: `${target.tag} (${target.id})`,
                        inline: true
                    },
                    {
                        name: '👮 Moderator',
                        value: interaction.user.tag,
                        inline: true
                    },
                    {
                        name: '📝 Reason',
                        value: reason,
                        inline: false
                    }
                ],
                timestamp: new Date().toISOString()
            };

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error removing timeout:', error);
            await interaction.reply({
                content: '❌ Failed to remove timeout. Make sure I have the necessary permissions.',
                ephemeral: true
            });
        }
    },
};

