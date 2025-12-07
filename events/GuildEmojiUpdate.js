const { Events, EmbedBuilder } = require("discord.js");
const logs = require("../modules/logs");
const { sendMessage } = require("../modules/sendMessage");

module.exports = {
  name: Events.GuildEmojiUpdate,

  async execute(oldEmoji, newEmoji, client) {
    const status = logs.getLog(newEmoji.guild.id, "guildEvents");

    if (!status.enabled) return;

    if (oldEmoji.name !== newEmoji.name) {
      const embed = new EmbedBuilder()
        .setTitle("Emoji name Change")
        .setColor(0xe410d3)
        .setDescription(
          `**Before:** ${oldEmoji.name}\n\n**After:** ${newEmoji.name}`
        )
        .setThumbnail(newEmoji.imageURL())
        .setFooter({ text: `Emoji ID: ${newEmoji.id}` })
        .setTimestamp();

      try {
        sendMessage(client, newEmoji.guild.id, status.channelId, {
          embeds: [embed],
        });
      } catch (error) {
        console.log(error);
      }
    }
  },
};
