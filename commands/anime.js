const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("anime")
    .setDescription("Get info on an anime")
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The anime you're searching for")
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString("query", true);

    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    try {
      const res = await fetch(
        `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`
      ).catch(() => null);

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
          "Failed to get anime data, please try again later."
        );
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (!data.data || data.data.length === 0) {
        errorEmbed.setDescription("No anime found with that name.");
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const anime = data.data[0];

      const embed = new EmbedBuilder()
        .setTitle(
          `${anime.title} (${
            anime.year ? anime.year.toString() : "Unknown year"
          })`
        )
        .setThumbnail(anime.images.jpg.image_url)
        .setDescription(
          anime.synopsis
            ? anime.synopsis.substring(0, 400) + "..."
            : "No synopsis available."
        )
        .setColor(0xe410d3)
        .setFooter({ text: "Provided by MyAnimeList (Jikan API)" })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
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
