const { Events, EmbedBuilder } = require("discord.js");
const logs = require("../modules/logs");
const { sendMessage } = require("../modules/sendMessage");

module.exports = {
  name: Events.GuildEmojiDelete,

  async execute(emoji, client) {
    const status = logs.getLog(emoji.guild.id, "guildEvents");

    if (!status.enabled) return;

    const embed = new EmbedBuilder()
      .setTitle("Emoji Deleted")
      .setDescription(
        `**Emoji created by:**\n<@${emoji.author.id}>\n\n**Emoji name:**\n${emoji.name}\n\n**Emoji ID:**\n ${emoji.id}`
      )
      .setThumbnail(emoji.imageURL())
      .setColor(0xe410d3)
      .setTimestamp();

    try {
      sendMessage(client, emoji.guild.id, status.channelId, {
        embeds: [embed],
      });
    } catch (error) {
      console.log(error);
    }
  },
};
