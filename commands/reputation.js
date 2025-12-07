const {
  SlashCommandBuilder,
  MessageFlags,
  InteractionContextType,
  EmbedBuilder,
} = require("discord.js");
const { getCooldown, setCooldown } = require("../modules/cooldowns");
const { addRep } = require("../modules/exp");
const ms = require("ms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reputation")
    .setDescription("Give a reputation point to a user")
    .setContexts(
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(true)
    ),

  async execute(interaction) {
    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    let successEmbed = new EmbedBuilder()
      .setTitle("✅ Success!")
      .setColor("Green")
      .setTimestamp();

    const user = interaction.options.getUser("user", true);

    const cooldown = getCooldown(interaction.user.id, "reputation");

    if (Date.now() < cooldown) {
      errorEmbed.setDescription(
        `You're on cooldown! You can use \`/reputation\` <t:${Math.floor(
          cooldown / 1000
        )}:R>.`
      );
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (user.id === interaction.user.id) {
      errorEmbed.setDescription(
        "You can't give a reputation point to yourself!"
      );
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    addRep(user.id);

    setCooldown(interaction.user.id, "reputation", ms("24 hours"));

    successEmbed.setDescription(`Given a reputation point to <@${user.id}>!`);
    return interaction.reply({ embeds: [successEmbed] });
  },
};
