const { Events, EmbedBuilder } = require("discord.js");
const logs = require("../modules/logs");
const { sendMessage } = require("../modules/sendMessage");

module.exports = {
  name: Events.GuildRoleUpdate,

  async execute(oldRole, newRole, client) {
    const status = logs.getLog(newRole.guild.id, "guildEvents");

    if (!status.enabled) return;

    if (oldRole.name !== newRole.name) {
      const embed = new EmbedBuilder()
        .setTitle("Role name Change")
        .setDescription(
          `**Before:** ${oldRole.name}\n\n**After:** ${newRole.name}`
        )
        .setColor(newRole.hexColor)
        .setFooter({ text: `Role ID: ${newRole.id}` })
        .setTimestamp();

      try {
        sendMessage(client, newRole.guild.id, status.channelId, {
          embeds: [embed],
        });
      } catch (error) {
        console.log(error);
      }
    }

    if (oldRole.hexColor !== newRole.hexColor) {
      const embed = new EmbedBuilder()
        .setTitle("Role color Change")
        .setDescription(
          `**Before:** ${oldRole.hexColor}\n\n**After:** ${newRole.hexColor}`
        )
        .setColor(newRole.hexColor)
        .setFooter({ text: `Role ID: ${newRole.id}` })
        .setTimestamp();

      try {
        sendMessage(client, newRole.guild.id, status.channelId, {
          embeds: [embed],
        });
      } catch (error) {
        console.log(error);
      }
    }

    if (!oldRole.icon && newRole.icon) {
      const embed = new EmbedBuilder()
        .setTitle("Role Icon added")
        .setDescription(`**Role:** <@&${newRole.id}>`)
        .setThumbnail(newRole.iconURL({ size: 512 }))
        .setColor(newRole.hexColor)
        .setFooter({ text: `Role ID: ${newRole.id}` })
        .setTimestamp();

      try {
        sendMessage(client, newRole.guild.id, status.channelId, {
          embeds: [embed],
        });
      } catch (error) {
        console.log(error);
      }
    }

    if (oldRole.icon !== newRole.icon) {
      if (!oldRole.icon || !newRole.icon) return;

      const embed = new EmbedBuilder()
        .setTitle("Role icon Change")
        .setColor(newRole.hexColor)
        .setDescription(`**Role:** <@&${newRole.id}>`)
        .setThumbnail(newRole.iconURL({ size: 512 }))
        .setFooter({ text: `Role ID: ${newRole.id}` })
        .setTimestamp();

      try {
        sendMessage(client, newRole.guild.id, status.channelId, {
          embeds: [embed],
        });
      } catch (error) {
        console.log(error);
      }
    }
  },
};
