import { Waitlist } from '../models/Waitlist.js';

const WAITLIST_CHANNEL_ID = '1461852210412654756';

/**
 * Set up MongoDB Change Stream to watch for new waitlist entries
 * @param {Client} client - Discord client
 */
export async function watchWaitlist(client) {
    try {
        console.log('👀 Setting up waitlist change stream...');

        const changeStream = Waitlist.watch([
            { $match: { operationType: 'insert' } }
        ]);

        changeStream.on('change', async (change) => {
            console.log('🆕 New waitlist entry detected!');
            
            const newEntry = change.fullDocument;
            
            // Get the channel to send the notification
            const channel = await client.channels.fetch(WAITLIST_CHANNEL_ID).catch(err => {
                console.error('❌ Could not fetch waitlist channel:', err);
                return null;
            });

            if (!channel) {
                console.error('❌ Waitlist channel not found!');
                return;
            }

            // Update channel name with waitlist count
            try {
                const waitlistCount = await Waitlist.countDocuments();
                const newChannelName = `${waitlistCount} users - waitlisted`;
                await channel.setName(newChannelName);
                console.log(`📝 Updated channel name to: ${newChannelName}`);
            } catch (error) {
                console.error('❌ Error updating channel name:', error);
            }

            // Create a beautiful embed with the waitlist entry info
            const embed = {
                color: 0x2AA58C,
                title: '🎉 New Waitlist Entry!',
                fields: [],
                footer: {
                    text: `Entry ID: ${newEntry._id}`
                },
                timestamp: new Date().toISOString()
            };

            // Dynamically add fields based on what data exists
            if (newEntry.name) {
                embed.fields.push({
                    name: '👤 Name',
                    value: newEntry.name,
                    inline: true
                });
            }

            if (newEntry.email) {
                embed.fields.push({
                    name: '📧 Email',
                    value: newEntry.email,
                    inline: true
                });
            }

            if (newEntry.company) {
                embed.fields.push({
                    name: '🏢 Company',
                    value: newEntry.company,
                    inline: true
                });
            }

            if (newEntry.website) {
                embed.fields.push({
                    name: '🌐 Website',
                    value: newEntry.website,
                    inline: true
                });
            }

            if (newEntry.source) {
                embed.fields.push({
                    name: '📍 Source',
                    value: newEntry.source,
                    inline: true
                });
            }

            if (newEntry.message) {
                embed.fields.push({
                    name: '💬 Message',
                    value: newEntry.message.length > 1024 
                        ? newEntry.message.substring(0, 1021) + '...' 
                        : newEntry.message,
                    inline: false
                });
            }

            // Add joined timestamp
            const joinedDate = newEntry.createdAt || newEntry.timestamp || new Date();
            embed.fields.push({
                name: '🕐 Joined',
                value: `<t:${Math.floor(new Date(joinedDate).getTime() / 1000)}:R>`,
                inline: true
            });

            // Add any custom fields that aren't in the standard list
            const standardFields = ['_id', 'name', 'email', 'company', 'website', 'message', 'source', 'createdAt', 'updatedAt', 'timestamp', 'status', '__v'];
            const customFields = Object.keys(newEntry.toObject ? newEntry.toObject() : newEntry)
                .filter(key => !standardFields.includes(key) && newEntry[key]);

            if (customFields.length > 0 && embed.fields.length < 25) {
                customFields.slice(0, 25 - embed.fields.length).forEach(key => {
                    let value = String(newEntry[key]);
                    if (value.length > 1024) value = value.substring(0, 1021) + '...';
                    
                    embed.fields.push({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value: value,
                        inline: true
                    });
                });
            }

            // If no fields were added, add a default message
            if (embed.fields.length === 0) {
                embed.description = '✨ A new user has joined the waitlist!';
            }

            try {
                await channel.send({ embeds: [embed] });
                console.log('✅ Waitlist notification sent!');
            } catch (error) {
                console.error('❌ Error sending waitlist notification:', error);
            }
        });

        changeStream.on('error', (error) => {
            console.error('❌ Change stream error:', error);
        });

        console.log('✅ Waitlist change stream active');

        return changeStream;

    } catch (error) {
        console.error('❌ Failed to set up waitlist watcher:', error);
        throw error;
    }
}


