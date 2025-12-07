const { Events, EmbedBuilder } = require("discord.js");
const logs = require("../modules/logs");
const { sendMessage } = require("../modules/sendMessage");

module.exports = {
  name: Events.GuildRoleCreate,

  async execute(role, client) {
    const status = logs.getLog(role.guild.id, "guildEvents");

    if (!status.enabled) return;

    let embed = new EmbedBuilder()
      .setTitle("Role Created")
      .setDescription(`**Name:** ${role.name}\n\n**ID:** ${role.id}`)
      .setColor(role.hexColor)
      .setTimestamp();

    if (role.icon) embed.setThumbnail(role.iconURL({ size: 512 }));

    try {
      sendMessage(client, role.guild.id, status.channelId, { embeds: [embed] });
    } catch (error) {
      console.log(error);
    }
  },
};
