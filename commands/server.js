import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Provides information about the server.'),
    
    async execute(interaction) {
        const { guild } = interaction;
        
        const embed = {
            color: 0x5865F2,
            title: `📊 ${guild.name} Server Info`,
            thumbnail: {
                url: guild.iconURL(),
            },
            fields: [
                {
                    name: '👑 Owner',
                    value: `<@${guild.ownerId}>`,
                    inline: true,
                },
                {
                    name: '👥 Members',
                    value: guild.memberCount.toString(),
                    inline: true,
                },
                {
                    name: '📅 Created',
                    value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
                    inline: true,
                },
                {
                    name: '💬 Channels',
                    value: guild.channels.cache.size.toString(),
                    inline: true,
                },
                {
                    name: '😀 Emojis',
                    value: guild.emojis.cache.size.toString(),
                    inline: true,
                },
                {
                    name: '🔖 Roles',
                    value: guild.roles.cache.size.toString(),
                    inline: true,
                },
            ],
            footer: {
                text: `Server ID: ${guild.id}`,
            },
            timestamp: new Date().toISOString(),
        };

        await interaction.reply({ embeds: [embed] });
    },
};

