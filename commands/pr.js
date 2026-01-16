import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pr')
        .setDescription('Get a link to a GitHub pull request')
        .addIntegerOption(option =>
            option
                .setName('number')
                .setDescription('The PR number')
                .setRequired(true)
                .setMinValue(1)
        ),
    
    async execute(interaction) {
        if (!process.env.GITHUB_REPO) {
            return await interaction.reply({
                content: '❌ GitHub repository is not configured. Please set GITHUB_REPO in the .env file.',
                ephemeral: true
            });
        }

        const prNumber = interaction.options.getInteger('number');
        const repoUrl = `https://github.com/${process.env.GITHUB_REPO}`;
        const prUrl = `${repoUrl}/pull/${prNumber}`;

        const embed = {
            color: 0x6e5494,
            title: `🔗 Pull Request #${prNumber}`,
            description: `[View PR #${prNumber} on GitHub](${prUrl})`,
            fields: [
                {
                    name: '📦 Repository',
                    value: process.env.GITHUB_REPO,
                    inline: true
                },
                {
                    name: '🔢 PR Number',
                    value: `#${prNumber}`,
                    inline: true
                }
            ],
            footer: {
                text: 'GitHub Pull Request'
            }
        };

        await interaction.reply({ embeds: [embed] });
    },
};

