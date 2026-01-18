import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isFounder, replyNoPermission } from '../utils/permissions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user (Founder only)')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user to timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName('duration')
                .setDescription('Duration in minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320) // 28 days max
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction) {
        // Check if user is a Founder
        if (!isFounder(interaction.member)) {
            return await replyNoPermission(interaction);
        }

        const target = interaction.options.getUser('target');
        const duration = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Fetch the member
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return await interaction.reply({
                content: '❌ User is not in this server!',
                ephemeral: true
            });
        }

        // Prevent timing out yourself
        if (target.id === interaction.user.id) {
            return await interaction.reply({
                content: '❌ You cannot timeout yourself!',
                ephemeral: true
            });
        }

        // Prevent timing out the bot
        if (target.id === interaction.client.user.id) {
            return await interaction.reply({
                content: '❌ I cannot timeout myself!',
                ephemeral: true
            });
        }

        // Check if target is a Founder
        if (isFounder(member)) {
            return await interaction.reply({
                content: '❌ You cannot timeout another Founder!',
                ephemeral: true
            });
        }

        try {
            // Calculate timeout duration in milliseconds
            const timeoutDuration = duration * 60 * 1000;

            // Timeout the user
            await member.timeout(timeoutDuration, `${reason} | Timed out by ${interaction.user.tag}`);

            // Format duration for display
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            let durationText = '';
            if (hours > 0) durationText += `${hours}h `;
            if (minutes > 0) durationText += `${minutes}m`;

            const embed = {
                color: 0xFFFF00,
                title: '⏰ User Timed Out',
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
                        name: '⏱️ Duration',
                        value: durationText.trim(),
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
            console.error('Error timing out user:', error);
            await interaction.reply({
                content: '❌ Failed to timeout the user. Make sure I have the necessary permissions and my role is higher than the target.',
                ephemeral: true
            });
        }
    },
};


