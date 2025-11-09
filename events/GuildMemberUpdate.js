const { Events, EmbedBuilder } = require('discord.js');
const { getLog } = require('../modules/logs');
const { sendMessage } = require('../modules/sendMessage');
const { getUser } = require('../modules/logIgnore');


module.exports = {
    name: Events.GuildMemberUpdate,


    async execute(oldMember, newMember, client) {
        const guildId = newMember.guild.id;

        const status = getLog(guildId, "memberEvents");
        if(!status.enabled) return;
        const channelId = status.channelId;

        if(newMember.user.bot) return;

        const userStatus = await getUser(guildId, newMember.id);
        if(userStatus) return;


        const oldRoles = new Set(oldMember.roles.cache.keys());
        const newRoles = new Set(newMember.roles.cache.keys());

        const addedRoles = [...newRoles].filter(roleId => !oldRoles.has(roleId));
        const removedRoles = [...oldRoles].filter(roleId => !newRoles.has(roleId));

        if(addedRoles.length) {
            const embed = new EmbedBuilder()
                .setTitle("Roles added")
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setColor(0xe410d3)
                .setDescription(`<@${newMember.id}>\n\n- ${addedRoles.map(id => `<@&${id}>`).join("\n- ")}`)
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            }
        };


        if(removedRoles.length) {
            const embed = new EmbedBuilder()
                .setTitle("Roles removed")
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setColor(0xe410d3)
                .setDescription(`<@${newMember.id}>\n\n- ${removedRoles.map(id => `<@&${id}>`).join("\n- ")}`)
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            }
        };

        if(oldMember.avatar !== newMember.avatar) {
            const embed = new EmbedBuilder()
                .setTitle("Avatar change")
                .setDescription(`<@${newMember.id}>`)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setFooter({text: `User ID: ${newMember.id}`})
                .setColor(0xe410d3)
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            }
        };

        if(oldMember.displayName !== newMember.displayName) {
            const embed = new EmbedBuilder()
                .setTitle("Name change")
                .setDescription(`<@${newMember.id}>\n\n**Before:** ${oldMember.displayName}\n\n**+ After:** ${newMember.displayName}`)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setColor(0xe410d3)
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            };
        };


        if(!oldMember.isCommunicationDisabled() && oldMember.isCommunicationDisabled()) {
            const disabledUntil = Math.floor(newMember.communicationDisabledTimestamp / 1000);
            const embed = new EmbedBuilder()
                .setTitle("Member timeout")
                .setDescription(`<@${newMember.id}>\n\n**Muted until:** <t:${disabledUntil}:R>`)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setColor(0xe410d3)
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            }
        };


        if(oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {
            const embed = new EmbedBuilder()
                .setTitle("End of timeout")
                .setDescription(`<@${newMember.id}>`)
                .setColor(0xe410d3)
                .setThumbnail(newMember.displayAvatarURL({size: 512}))
                .setFooter({text: `User ID: ${newMember.id}`})
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            }
        }
    }
}