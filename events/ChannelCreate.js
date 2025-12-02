const { Events, EmbedBuilder } = require('discord.js');
const logs = require('../modules/logs');
const { sendMessage } = require('../modules/sendMessage');

module.exports = {
    name: Events.ChannelCreate,

    async execute(channel, client) {
        const status = logs.getLog(channel.guild.id, "guildEvents");

        if(!status.enabled) return;


        const embed = new EmbedBuilder()
            .setTitle("Channel Created")
            .setDescription(`Channel name: ${channel.name}\n\nID: ${channel.id}`)
            .setColor(0xe410d3)
            .setTimestamp();


        try {
            sendMessage(client, channel.guild.id, status.channelId, {embeds: [embed]});
        } catch (error) {
            console.log(error);
        };
    } 
}