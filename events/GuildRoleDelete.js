const { Events, EmbedBuilder } = require("discord.js");
const logs = require("../modules/logs");
const { sendMessage } = require("../modules/sendMessage");

module.exports = {
  name: Events.GuildRoleDelete,

  async execute(role, client) {
    const status = logs.getLog(role.guild.id, "guildEvents");

    if (!status.enabled) return;

    const embed = new EmbedBuilder()
      .setTitle("Role deleted")
      .setDescription(`**Role name:** ${role.name}\n\n**Role ID:** ${role.id}`)
      .setColor(role.hexColor)
      .setTimestamp();

    try {
      sendMessage(client, role.guild.id, status.channelId, { embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
