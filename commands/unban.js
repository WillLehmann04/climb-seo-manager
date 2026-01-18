import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isFounder, replyNoPermission } from '../utils/permissions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server (Founder only)')
        .addStringOption(option =>
            option
                .setName('user_id')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the unban')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        // Check if user is a Founder
        if (!isFounder(interaction.member)) {
            return await replyNoPermission(interaction);
        }

        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        // Validate user ID format
        if (!/^\d{17,19}$/.test(userId)) {
            return await interaction.reply({
                content: '❌ Invalid user ID format! Please provide a valid Discord user ID.',
                ephemeral: true
            });
        }

        try {
            await interaction.deferReply();

            // Check if user is actually banned
            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.get(userId);

            if (!bannedUser) {
                return await interaction.editReply({
                    content: '❌ This user is not banned!'
                });
            }

            // Unban the user
            await interaction.guild.members.unban(userId, `${reason} | Unbanned by ${interaction.user.tag}`);

            const embed = {
                color: 0x2AA58C,
                title: '✅ User Unbanned',
                fields: [
                    {
                        name: '👤 User',
                        value: `${bannedUser.user.tag} (${userId})`,
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

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error unbanning user:', error);
            await interaction.editReply({
                content: '❌ Failed to unban the user. Make sure I have the necessary permissions and the user ID is correct.'
            });
        }
    },
};


