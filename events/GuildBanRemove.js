const { Events, EmbedBuilder } = require("discord.js");
const logs = require("../modules/logs");
const { sendMessage } = require("../modules/sendMessage");

module.exports = {
  name: Events.GuildBanRemove,

  async execute(ban, client) {
    await ban.fetch();

    const status = logs.getLog(ban.guild.id, "memberEvents");

    if (!status.enabled) return;

    const embed = new EmbedBuilder()
      .setTitle("Member Unbanned")
      .setDescription(`Username: ${ban.user.username}\nID: ${ban.user.id}`)
      .setColor(0xe410d3)
      .setTimestamp();

    try {
      sendMessage(client, ban.guild.id, status.channelId, { embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
