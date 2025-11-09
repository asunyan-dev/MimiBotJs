const { Events, EmbedBuilder } = require('discord.js');

const { getLog } = require('../modules/logs');

const { sendMessage } = require('../modules/sendMessage');

const { getUser, getChannel } = require('../modules/logIgnore');


module.exports = {
    name: Events.MessageDelete,


    async execute(message, client) {

        if(message.partial) {
            try {
                await message.fetch()
            } catch (err) {
                console.log(err);
                return;
            };
        };


        if(!message.guild) return;
        if(message.author.bot) return;

        const guildId = message.guild.id;

        const status = getLog(guildId, "messageLogs");
        if(!status.enabled) return;

        const channelId = status.channelId;

        const userStatus = getUser(guildId, message.author.id);
        const channelStatus = getChannel(guildId, message.channel.id);

        if(userStatus || channelStatus) return;

        let description = [];


        if(message.content) desctiption.push(`**Content:**\n${message.content.substring(0, 400)}`);
        if(message.stickers.size > 0) {
            description.push(`**Stickers:**\n${message.stickers.map(sticker => sticker.name).join("\n")}`);
        };
        if(message.attachments.size > 0) {
            description.push(`**Attachments:**\n${message.attachments.map(a => a.name).join("\n")}`);
        };

        const embed = new EmbedBuilder()
            .setTitle("Message deleted")
            .setThumbnail(message.author.displayAvatarURL({size: 512}))
            .setColor(0xe410d3)
            .setDescription(`**Channel:** <#${message.channel.id}>\n\n${description.length ? description.join("\n\n") : "No content found."}`)
            .setFooter({text: `User ID: ${message.author.id}`})
            .setTimestamp();

        try {
            await sendMessage(client, guildId, channelId, {embeds: [embed]});
        } catch (err) {
            console.log(err);
        }
    }
}