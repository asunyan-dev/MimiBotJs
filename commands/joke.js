const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("joke")
    .setDescription("Get a random joke")
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    ),

  async execute(interaction) {
    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    try {
      const res = await fetch("https://api.popcat.xyz/v2/joke").catch(
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

      if (!data || data.error) {
        errorEmbed.setDescription(
          "Failed to get joke, please try again later."
        );
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const embed = new EmbedBuilder()
        .setTitle("Joke")
        .setDescription(data.message.joke)
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
