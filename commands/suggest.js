const {
  SlashCommandBuilder,
  ModalBuilder,
  ComponentType,
  TextInputStyle,
  InteractionContextType,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");

const { getSuggest } = require("../modules/suggestions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggest")
    .setDescription("Make a new suggestion for the server"),

  async execute(interaction) {
    if (!interaction.guild) return;
    const status = getSuggest(interaction.guild.id);

    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    if (!status.enabled) {
      errorEmbed.setDescription("Suggestions are disabled.");
      return interaction.reply({
        embeds: [errorEmbed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("suggestion")
      .setTitle("New suggestion")
      .addLabelComponents({
        type: ComponentType.Label,
        label: "Your suggestion",
        description: "Fill in all details below.",
        component: {
          type: ComponentType.TextInput,
          custom_id: "text",
          style: TextInputStyle.Paragraph,
          placeholder: "Type your suggestion here...",
          required: true,
        },
      })
      .toJSON();

    await interaction.showModal(modal);
  },
};
