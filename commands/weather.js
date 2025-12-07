const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Get the current weather for a city")
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    )
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription("Location. Format: 'City, Country/State'")
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString("location", true);

    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    try {
      const res = await fetch(
        `https://api.popcat.xyz/v2/weather?q=${encodeURIComponent(query)}`
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

      if (!data || data.error) {
        errorEmbed.setDescription(
          "Failed to get weather result, please try again later."
        );
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const weather = data.message[0];
      const location = weather.location.name;
      const current = weather.current;

      const embed = new EmbedBuilder()
        .setTitle(`Current weather for ${location}`)
        .setDescription(
          `**Weather observed on ${current.day}, ${current.date} at ${current.observationtime} (local time).**\n\n**Current weather:** ${current.skytext}\n\n**Temperature:** ${current.temperature}°C | **Feels like:** ${current.feelslike} °C\n\n**Humidity:** ${current.humidity}%\n\n**Wind:** ${current.winddisplay}`
        )
        .setColor(0xe410d3)
        .setFooter({ text: "Provided by PopCat API" })
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
