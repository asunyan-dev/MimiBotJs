const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("action")
    .setDescription("Action commands")
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    )
    .addSubcommand((sub) =>
      sub.setName("cry").setDescription("Returns a cry image/gif")
    )
    .addSubcommand((sub) =>
      sub.setName("blush").setDescription("Returns a blush image/gif")
    )
    .addSubcommand((sub) =>
      sub.setName("smile").setDescription("Returns a smile image/gif")
    )
    .addSubcommand((sub) =>
      sub.setName("wave").setDescription("Returns a wave image/gif")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    let title = "";

    if (sub === "cry") title = `${interaction.user.displayName} cries`;
    if (sub === "blush") title = `${interaction.user.displayName} blushes`;
    if (sub === "smile") title = `${interaction.user.displayName} smiles`;
    if (sub === "wave") title = `${interaction.user.displayName} waves`;

    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    try {
      const res = await fetch(`https://api.waifu.pics/sfw/${sub}`).catch(
        () => null
      );

      if (!res || !res.ok) {
        errorEmbed.setDescription(
          "There was an error with the API, please try again later."
        );
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const data = await res.json().catch(() => null);

      if (!data) {
        errorEmbed.setDescription(
          "Failed to get image, please try again later."
        );
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0xe410d3)
        .setImage(data.url)
        .setFooter({ text: "Provided by WaifuPics API" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      errorEmbed.setDescription(
        "There was an error with the API, please try again later."
      );
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
