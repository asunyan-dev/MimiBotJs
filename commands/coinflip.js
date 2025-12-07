const {
  SlashCommandBuilder,
  EmbedBuilder,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin!")
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    )
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Your choice")
        .setRequired(true)
        .addChoices(
          { name: "Heads", value: "heads" },
          { name: "Tails", value: "tails" }
        )
    ),

  async execute(interaction) {
    const choice = interaction.options.getString("choice", true);

    const result = Math.random() < 0.5 ? "heads" : "tails";

    let embed = new EmbedBuilder()
      .setTitle("🐈 Coin Flip result")
      .setColor(0xe410d3)
      .setTimestamp();

    if (choice === result) {
      embed.setDescription(
        `🎉 It landed on ${
          result.charAt(0).toUppercase + result.slice(1)
        }! You won!`
      );
      return interaction.reply({ embeds: [embed] });
    } else {
      embed.setDescription(
        `😥 It landed on ${
          result.charAt(0).toUpperCase() + result.slice(1)
        }... You lost...`
      );
      return interaction.reply({ embeds: [embed] });
    }
  },
};
