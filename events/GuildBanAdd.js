const { Events, EmbedBuilder } = require('discord.js');
const logs = require('../modules/logs');
const logIgnore = require('../modules/logIgnore');
const { sendMessage } = require('../modules/sendMessage');


module.exports = {
    name: Events.GuildBanAdd,

    async execute(ban, client) {
        await ban.fetch();

        const status = logs.getLog(ban.guild.id, "memberEvents");

        const userStatus = logIgnore.getUser(ban.guild.id, ban.user.id);

        if(!status.enabled || userStatus) return;

        const embed = new EmbedBuilder()
            .setTitle("Member Banned")
            .setDescription(`Username: ${ban.user.username}\nID: ${ban.user.id}\n\nReason: ${ban.reason ? ban.reason : "N/A"}`)
            .setColor(0xe410d3)
            .setTimestamp();

        try {
            sendMessage(client, ban.guild.id, status.channelId, {embeds: [embed]});
        } catch (error) {
            console.log(error);
        }
    }
}