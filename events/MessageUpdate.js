const { Events, EmbedBuilder } = require("discord.js");

const { getLog } = require("../modules/logs");

const { sendMessage } = require("../modules/sendMessage");

const { getUser, getChannel } = require("../modules/logIgnore");

module.exports = {
  name: Events.MessageUpdate,

  async execute(oldMessage, newMessage, client) {
    if (!newMessage.guild) return;
    if (newMessage.author.bot) return;

    const guildId = newMessage.guild.id;

    const status = getLog(guildId, "messageLogs");
    if (!status.enabled) return;

    const channelId = status.channelId;

    const userStatus = getUser(guildId, newMessage.author.id);
    const channelStatus = getChannel(guildId, newMessage.channel.id);

    if (userStatus || channelStatus) return;

    if (oldMessage.content !== newMessage.content) {
      try {
        const embed = new EmbedBuilder()
          .setTitle("Message Edited")
          .setThumbnail(newMessage.author.displayAvatarURL({ size: 512 }))
          .setColor(0xe410d3)
          .setDescription(
            `**Channel:** <#${
              newMessage.channel.id
            }>\n\n**Before:**\n${oldMessage.content.substring(
              0,
              400
            )}\n\n**After:**\n${newMessage.content.substring(0, 400)}`
          )
          .setFooter({ text: `User ID: ${newMessage.author.id}` })
          .setTimestamp();

        try {
          await sendMessage(client, guildId, channelId, { embeds: [embed] });
        } catch (err) {
          console.log(err);
        }
      } catch (err) {
        console.log(err);
      }
    }
  },
};
