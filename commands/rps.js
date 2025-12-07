const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play Rock Paper Scissors against the bot!")
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    ),

  async execute(interaction) {
    const choices = ["rock", "paper", "scissors"];

    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    const embed = new EmbedBuilder()
      .setTitle("Make your choice!")
      .setDescription("Choose between `rock`, `paper` and `scissors`.")
      .setColor(0xe410d3);

    const row = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("choice")
          .setPlaceholder("Choose...")
          .addOptions(
            { label: "Rock", value: "rock" },
            { label: "Paper", value: "paper" },
            { label: "Scissors", value: "scissors" }
          )
      )
      .toJSON();

    const reply = await interaction.reply({
      embeds: [embed],
      components: [row],
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60_000,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== interaction.user.id) {
        errorEmbed.setDescription("This menu is not for you!");
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const choice = i.values[0];

      const botChoice = choices[Math.floor(Math.random() * choices.length)];

      const resultEmbed = new EmbedBuilder()
        .setTitle("RPS - Result")
        .setColor(0xe410d3)
        .setTimestamp();

      let description = "";

      if (choice === "paper" && botChoice === "paper")
        description = "You both chose `paper`!\n\nIt's a draw!";
      if (choice === "paper" && botChoice === "rock")
        description = "You: `paper` | Bot: `rock`\n\nYou won!";
      if (choice === "paper" && botChoice === "scissors")
        description = "You: `paper` | Bot: `scissors`\n\nYou lost!";
      if (choice === "rock" && botChoice === "paper")
        description = "You: `rock` | Bot: `paper`\n\nYou lost!";
      if (choice === "rock" && botChoice === "rock")
        description = "You both chose `rock`!\n\nIt's a draw!";
      if (choice === "rock" && botChoice === "scissors")
        description = "You: `rock` | Bot: `scissors`\n\nYou won!";
      if (choice === "scissors" && botChoice === "paper")
        description = "You: `scissors` | Bot: `paper`\n\nYou won!";
      if (choice === "scissors" && botChoice === "rock")
        description = "You: `scissors` | Bot: `rock`\n\nYou lost!";
      if (choice === "scissors" && botChoice === "scissors")
        description = "You both chose `scissors`!\n\nIt's a draw!";

      resultEmbed.setDescription(description);

      return i.update({ embeds: [resultEmbed], components: [] });
    });

    collector.on("end", async () => {
      try {
        interaction.editReply({ components: [] });
      } catch {}
    });
  },
};
