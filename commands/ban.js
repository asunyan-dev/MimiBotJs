const {
  SlashCommandBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option.setName("user").setDescription("The user to ban").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for the ban")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) return;

    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    let successEmbed = new EmbedBuilder()
      .setTitle("✅ Success")
      .setColor("Green")
      .setTimestamp();

    if (
      !interaction.guild.members.me.permissions.has(
        PermissionFlagsBits.BanMembers
      )
    ) {
      errorEmbed.setDescription("I am missing permissions: `BAN_MEMBERS`.");
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const user = interaction.options.getUser("user", true);

    const member = await interaction.guild.members
      .fetch(interaction.user.id)
      .catch(() => null);

    if (!member) return;

    const target = await interaction.guild.members
      .fetch(user.id)
      .catch(() => null);

    if (!target) {
      errorEmbed.setDescription("Member not found.");
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (member.roles.highest.position <= target.roles.highest.position) {
      errorEmbed.setDescription(
        "You can't ban someone with a higher role than you."
      );
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (
      target.roles.highest.position >=
      interaction.guild.members.me.roles.highest.position
    ) {
      errorEmbed.setDescription(
        "I can't ban someone with a higher role than me."
      );
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!target.bannable) {
      errorEmbed.setDescription("This member cannot be banned.");
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const reason =
      interaction.options.getString("reason", false) || "No reason provided.";

    try {
      await target.ban({ reason: reason });
      successEmbed.setDescription("Member banned.");
      return interaction.reply({
        embeds: [successEmbed],
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      errorEmbed.setDescription(
        "Failed to ban member. Do I have the right permissions?"
      );
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
