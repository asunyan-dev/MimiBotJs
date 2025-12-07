const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputStyle,
  ComponentType,
  InteractionContextType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report-a-bug")
    .setDescription("Report a bug to the dev")
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    ),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("bug_report")
      .setTitle("Bug Report")
      .addLabelComponents({
        type: ComponentType.Label,
        label: "Your message",
        description: "Describe with as much details as possible",
        component: {
          type: ComponentType.TextInput,
          custom_id: "message",
          style: TextInputStyle.Paragraph,
          placeholder: "Type your message here...",
          required: true,
        },
      })
      .toJSON();

    await interaction.showModal(modal);
  },
};
