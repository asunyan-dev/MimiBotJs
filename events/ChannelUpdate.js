const { Events, EmbedBuilder } = require('discord.js');
const logs = require('../modules/logs');
const logIgnore = require('../modules/logIgnore');
const { sendMessage } = require('../modules/sendMessage');



module.exports = {
    name: Events.ChannelUpdate,

    async execute(oldChannel, newChannel, client) {
        if(!oldChannel.guild || newChannel.guild) return;

        const status = logs.getLog(newChannel.guild.id, "guildEvents");

        const channelStatus = logIgnore.getChannel(newChannel.guild.id, newChannel.id);

        if(!status.enabled || channelStatus) return;


        if(oldChannel.name !== newChannel.name) {
            const embed = new EmbedBuilder()
                .setTitle("Channel name Change")
                .setDescription(`**Before:** ${oldChannel.name}\n\n**After:** ${newChannel.name}`)
                .setColor(0xe410d3)
                .setFooter({text: `Channel ID: ${newChannel.id}`})
                .setTimestamp();


            try {
                sendMessage(client, newChannel.guild.id, status.channelId, {embeds: [embed]});
            } catch (error) {
                console.log(error);
            };
        };
    }
}