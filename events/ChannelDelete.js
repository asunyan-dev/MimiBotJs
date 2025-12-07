const { Events, EmbedBuilder } = require("discord.js");
const logs = require("../modules/logs");
const { sendMessage } = require("../modules/sendMessage");
const logIgnore = require("../modules/logIgnore");

module.exports = {
  name: Events.ChannelDelete,

  async execute(channel, client) {
    if (!channel.guild) return;

    if (channel.partial) {
      try {
        await channel.fetch();
      } catch (error) {
        console.log(error);
      }
    }

    const status = logs.getLog(channel.guild.id, "guildEvents");
    const channelStatus = logIgnore.getChannel(channel.guild.id, channel.id);

    if (!status.enabled || channelStatus) return;

    const embed = new EmbedBuilder()
      .setTitle("Channel deleted")
      .setDescription(`Channel name: ${channel.name}\n\nID: ${channel.id}`)
      .setColor(0xe410d3)
      .setTimestamp();

    try {
      sendMessage(client, channel.guild.id, status.channelId, {
        embeds: [embed],
      });
    } catch (error) {
      console.log(error);
    }
  },
};
