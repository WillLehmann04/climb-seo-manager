import { SlashCommandBuilder } from 'discord.js';
import { Waitlist } from '../models/Waitlist.js';

export default {
    data: new SlashCommandBuilder()
        .setName('waitlist')
        .setDescription('View waitlist statistics'),
    
    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Check if MongoDB is connected
            if (!Waitlist.db || Waitlist.db.readyState !== 1) {
                return await interaction.editReply({
                    content: '❌ MongoDB is not connected. Waitlist stats are unavailable.'
                });
            }

            // Get total count
            const totalCount = await Waitlist.countDocuments();

            // Get count by status (if you have status field)
            const statusCounts = await Waitlist.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Get recent entries (last 24 hours)
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentCount = await Waitlist.countDocuments({
                createdAt: { $gte: oneDayAgo }
            });

            // Get count by source (if available)
            const sourceCounts = await Waitlist.aggregate([
                {
                    $group: {
                        _id: '$source',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            // Get latest entry
            const latestEntry = await Waitlist.findOne().sort({ createdAt: -1 });

            // Build embed
            const embed = {
                color: 0x5865F2,
                title: '📊 Waitlist Statistics',
                fields: [
                    {
                        name: '👥 Total Entries',
                        value: totalCount.toString(),
                        inline: true
                    },
                    {
                        name: '🆕 Last 24 Hours',
                        value: recentCount.toString(),
                        inline: true
                    },
                    {
                        name: '📈 Growth Rate',
                        value: totalCount > 0 
                            ? `${((recentCount / totalCount) * 100).toFixed(1)}%`
                            : '0%',
                        inline: true
                    }
                ],
                timestamp: new Date().toISOString()
            };

            // Add status breakdown if available
            if (statusCounts.length > 0) {
                const statusText = statusCounts
                    .map(s => `${s._id || 'Unknown'}: ${s.count}`)
                    .join('\n');
                
                embed.fields.push({
                    name: '📋 By Status',
                    value: statusText || 'No status data',
                    inline: false
                });
            }

            // Add source breakdown if available
            if (sourceCounts.length > 0) {
                const sourceText = sourceCounts
                    .filter(s => s._id) // Filter out null sources
                    .map(s => `${s._id}: ${s.count}`)
                    .join('\n');
                
                if (sourceText) {
                    embed.fields.push({
                        name: '📍 Top Sources',
                        value: sourceText,
                        inline: false
                    });
                }
            }

            // Add latest entry info
            if (latestEntry) {
                const latestName = latestEntry.name || latestEntry.email || 'Unknown';
                const latestTime = latestEntry.createdAt 
                    ? `<t:${Math.floor(new Date(latestEntry.createdAt).getTime() / 1000)}:R>`
                    : 'Unknown';
                
                embed.fields.push({
                    name: '🕐 Latest Entry',
                    value: `${latestName}\n${latestTime}`,
                    inline: false
                });
            }

            embed.footer = {
                text: `Database: ${Waitlist.db.name} | Collection: waitlist`
            };

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching waitlist stats:', error);
            await interaction.editReply({
                content: '❌ Failed to fetch waitlist statistics. Error: ' + error.message
            });
        }
    },
};

