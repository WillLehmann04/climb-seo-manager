import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isFounder, replyNoPermission } from '../utils/permissions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server (Founder only)')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option
                .setName('delete_messages')
                .setDescription('Delete messages from the last X days (0-7)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(7)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
    async execute(interaction) {
        // Check if user is a Founder
        if (!isFounder(interaction.member)) {
            return await replyNoPermission(interaction);
        }

        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteMessageDays = interaction.options.getInteger('delete_messages') || 0;

        // Check if target is in the guild
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        // Prevent banning yourself
        if (target.id === interaction.user.id) {
            return await interaction.reply({
                content: '❌ You cannot ban yourself!',
                ephemeral: true
            });
        }

        // Prevent banning the bot
        if (target.id === interaction.client.user.id) {
            return await interaction.reply({
                content: '❌ I cannot ban myself!',
                ephemeral: true
            });
        }

        // Check if target is a Founder
        if (member && isFounder(member)) {
            return await interaction.reply({
                content: '❌ You cannot ban another Founder!',
                ephemeral: true
            });
        }

        try {
            // Ban the user
            await interaction.guild.members.ban(target, {
                reason: `${reason} | Banned by ${interaction.user.tag}`,
                deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
            });

            const embed = {
                color: 0x2AA58C,
                title: '🔨 User Banned',
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
            console.error('Error banning user:', error);
            await interaction.reply({
                content: '❌ Failed to ban the user. Make sure I have the necessary permissions and the user is bannable.',
                ephemeral: true
            });
        }
    },
};


