const { Events, EmbedBuilder } = require("discord.js");
const logs = require("../modules/logs");
const { sendMessage } = require("../modules/sendMessage");

module.exports = {
  name: Events.GuildUpdate,

  async execute(oldGuild, newGuild, client) {
    const status = logs.getLog(newGuild.id, "guildEvents");

    if (!status.enabled) return;

    if (oldGuild.name !== newGuild.name) {
      const embed = new EmbedBuilder()
        .setTitle("Server name Change")
        .setColor(0xe410d3)
        .setDescription(
          `**Before:** ${oldGuild.name}\n\n**After:** ${newGuild.name}`
        )
        .setFooter({ text: `Server ID: ${newGuild.id}` })
        .setThumbnail(newGuild.iconURL({ size: 512 }))
        .setTimestamp();

      try {
        sendMessage(client, newGuild.id, status.channelId, { embeds: [embed] });
      } catch (error) {
        console.log(error);
      }
    }

    if (oldGuild.icon !== newGuild.icon) {
      const embed = new EmbedBuilder()
        .setTitle("Server icon Change")
        .setColor(0xe410d3)
        .setFooter({ text: `Server ID: ${newGuild.id}` })
        .setImage(newGuild.iconURL({ size: 1024 }))
        .setTimestamp();

      try {
        sendMessage(client, newGuild.id, status.channelId, { embeds: [embed] });
      } catch (error) {
        console.log(error);
      }
    }
  },
};
