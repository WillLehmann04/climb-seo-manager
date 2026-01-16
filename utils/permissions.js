/**
 * Check if a member has the Founder role
 * @param {GuildMember} member - The guild member to check
 * @returns {boolean} - Whether the member has the Founder role
 */
export function isFounder(member) {
    const FOUNDER_ROLE_ID = '1461628130773962854';
    return member.roles.cache.has(FOUNDER_ROLE_ID);
}

/**
 * Reply with a permission denied message
 * @param {Interaction} interaction - The interaction to reply to
 */
export async function replyNoPermission(interaction) {
    return await interaction.reply({
        content: '❌ You do not have permission to use this command. Only Founders can use this command.',
        ephemeral: true
    });
}

