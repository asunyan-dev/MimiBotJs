const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("Get info on a role")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("Role to get info for")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild) return;

    const role = interaction.options.getRole("role", true);

    const fetched = await interaction.guild.roles
      .fetch(role.id)
      .catch(() => null);

    if (!fetched)
      return interaction.reply({
        content: "❌ Role not found.",
        flags: MessageFlags.Ephemeral,
      });

    const embed = new EmbedBuilder()
      .setTitle(fetched.name)
      .setColor(fetched.hexColor || 0xe410d3)
      .setThumbnail(fetched.icon ? fetched.iconURL({ size: 512 }) : null)
      .addFields(
        { name: "🆔 Role ID", value: fetched.id, inline: false },
        {
          name: "📅 Created",
          value: fetched.createdTimestamp
            ? `<t:${Math.floor(fetched.createdTimestamp / 1000)}:F>`
            : "Unknown",
          inline: false,
        },
        {
          name: "ℹ️ Hoisted ?",
          value: fetched.hoist ? "✅" : "❌",
          inline: false,
        }
      )
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
