const { Events, EmbedBuilder } = require('discord.js');
const { getLog } = require('../modules/logs');
const { sendMessage } = require('../modules/sendMessage');
const { getWelcome } = require('../modules/welcoming');


module.exports = {
    name: Events.GuildMemberAdd,


    async execute(member, client) {
        const status = getLog(member.guild.id, "joinLeave");

        if(!status.enabled) return;

        const guildId = member.guild.id;
        const channelId = status.channelId;

        const embed = new EmbedBuilder()
            .setTitle("Member joined")
            .setThumbnail(member.displayAvatarURL({size: 512}))
            .setColor(0xe410d3)
            .setDescription(`<@${member.id}>\n\nAccount created: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`)
            .setFooter({text: `User ID: ${member.id}`})
            .setTimestamp();

        try {
            await sendMessage(client, guildId, channelId, {embeds: [embed]});
        } catch (error) {
            console.log(error);
        };

        const welcomeStatus = getWelcome(member.guild.id);
        if(!status.enabled) return;

        let content = "";

        if(status.ping) content = `<@${member.id}>`

        const welcomeEmbed = new EmbedBuilder()
            .setTitle(member.displayName)
            .setThumbnail(member.displayAvatarURL({size: 512}))
            .setDescription(status.message)
            .setColor(0xe410d3)
            .setTimestamp();

        try {
            await sendMessage(client, member.guild.id, status.channelId, {embeds: [welcomeEmbed]});
        } catch (err) {
            console.log(err);
        }
    }
}