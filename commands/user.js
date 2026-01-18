import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('Provides information about a user.')
        .addUserOption(option =>
            option
                .setName('target')
                .setDescription('The user to get information about')
                .setRequired(false)
        ),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);
        
        const embed = {
            color: 0x2AA58C,
            title: `👤 User Info: ${targetUser.tag}`,
            thumbnail: {
                url: targetUser.displayAvatarURL({ dynamic: true, size: 256 }),
            },
            fields: [
                {
                    name: '🆔 Username',
                    value: targetUser.username,
                    inline: true,
                },
                {
                    name: '🏷️ Display Name',
                    value: member.displayName,
                    inline: true,
                },
                {
                    name: '🤖 Bot',
                    value: targetUser.bot ? 'Yes' : 'No',
                    inline: true,
                },
                {
                    name: '📅 Account Created',
                    value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`,
                    inline: true,
                },
                {
                    name: '📥 Joined Server',
                    value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
                    inline: true,
                },
                {
                    name: '🎨 Roles',
                    value: member.roles.cache
                        .filter(role => role.id !== interaction.guild.id)
                        .sort((a, b) => b.position - a.position)
                        .map(role => role.toString())
                        .slice(0, 10)
                        .join(', ') || 'None',
                    inline: false,
                },
            ],
            footer: {
                text: `User ID: ${targetUser.id}`,
            },
            timestamp: new Date().toISOString(),
        };

        await interaction.reply({ embeds: [embed] });
    },
};


