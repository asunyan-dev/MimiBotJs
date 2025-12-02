const { Events, EmbedBuilder } = require('discord.js');
const logs = require('../modules/logs');
const { sendMessage } = require('../modules/sendMessage');


module.exports = {
    name: Events.GuildEmojiCreate,


    async execute(emoji, client) {
        const status = logs.getLog(emoji.guild.id, "guildEvents");

        if(!status.enabled) return;


        const embed = new EmbedBuilder()
            .setTitle("Emoji Created")
            .setDescription(`**Created by:** <@${emoji.author.id}>\n\n**Name:** ${emoji.name}\n**ID:** ${emoji.id}`)
            .setColor(0xe410d3)
            .setImage(emoji.imageURL())
            .setTimestamp();

        try {
            sendMessage(client, emoji.guild.id, status.channelId, {embeds: [embed]});
        } catch (error) {
            console.log(error);
        };
    }
}