const {
  SlashCommandBuilder,
  EmbedBuilder,
  ModalBuilder,
  ComponentType,
  TextInputStyle,
  MessageFlags,
  InteractionContextType,
} = require("discord.js");
const config = require("../config.json");
const { getChange } = require("../modules/botLogs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("changelog")
    .setDescription("Get/Add changelog for the bot")
    .setContexts(
      InteractionContextType.BotDM,
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel
    )
    .addSubcommand((sub) =>
      sub.setName("get").setDescription("Get info on latest bot version")
    )
    .addSubcommand((sub) =>
      sub.setName("add").setDescription("Add a changelog")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    if (sub === "get") {
      const data = getChange();

      if (data.length === 0) {
        errorEmbed.setDescription("There is no changelog yet.");
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const log = data[data.length - 1];

      const client = interaction.client;

      const embed = new EmbedBuilder()
        .setTitle(`${client.user.tag} - version ${log.version}`)
        .setDescription(log.details)
        .setColor(0xe410d3)
        .setTimestamp()
        .setThumbnail(client.user.avatarURL({ size: 512 }));

      return interaction.reply({ embeds: [embed] });
    }

    if (sub === "add") {
      if (interaction.user.id !== config.owner_id) {
        errorEmbed.setDescription("You can't use this command.");
        return interaction.reply({
          embeds: [errorEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("changelog")
        .setTitle("New changelog")
        .addLabelComponents(
          {
            type: ComponentType.Label,
            label: "Version",
            component: {
              type: ComponentType.TextInput,
              custom_id: "version",
              style: TextInputStyle.Short,
              required: true,
            },
          },
          {
            type: ComponentType.Label,
            label: "Details",
            component: {
              type: ComponentType.TextInput,
              custom_id: "details",
              style: TextInputStyle.Paragraph,
              required: true,
            },
          }
        )
        .toJSON();

      await interaction.showModal(modal);
    }
  },
};
