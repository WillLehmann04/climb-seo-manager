import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { isFounder, replyNoPermission } from '../utils/permissions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server (Founder only)')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
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

        // Prevent kicking yourself
        if (target.id === interaction.user.id) {
            return await interaction.reply({
                content: '❌ You cannot kick yourself!',
                ephemeral: true
            });
        }

        // Prevent kicking the bot
        if (target.id === interaction.client.user.id) {
            return await interaction.reply({
                content: '❌ I cannot kick myself!',
                ephemeral: true
            });
        }

        // Check if target is a Founder
        if (isFounder(member)) {
            return await interaction.reply({
                content: '❌ You cannot kick another Founder!',
                ephemeral: true
            });
        }

        try {
            // Kick the user
            await member.kick(`${reason} | Kicked by ${interaction.user.tag}`);

            const embed = {
                color: 0xFFA500,
                title: '👢 User Kicked',
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
            console.error('Error kicking user:', error);
            await interaction.reply({
                content: '❌ Failed to kick the user. Make sure I have the necessary permissions and my role is higher than the target.',
                ephemeral: true
            });
        }
    },
};

