const {
  Events,
  Collection,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");

const { getWarnings } = require("../modules/warning");

const { addChange } = require("../modules/botLogs");

const { getSuggest } = require("../modules/suggestions");

const config = require("../config.json");

const { sendMessage } = require("../modules/sendMessage");
const { ActionRowBuilder } = require("@discordjs/builders");
const { ButtonBuilder } = require("@discordjs/builders");

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {
    let errorEmbed = new EmbedBuilder()
      .setTitle("❌ Error")
      .setColor("Red")
      .setTimestamp();

    let successEmbed = new EmbedBuilder()
      .setTitle("✅ Success!")
      .setColor("Green")
      .setTimestamp();

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      if (!client.cooldowns.has(command.data.name)) {
        client.cooldowns.set(command.data.name, new Collection());
      }

      const now = Date.now();
      const timestamps = client.cooldowns.get(command.data.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime =
          timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          errorEmbed.setDescription(
            `🕰️ Please wait ${timeLeft.toFixed(
              1
            )} more second(s) before using /${command.data.name} again.`
          );
          return interaction.reply({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        if (interaction.replied || interaction.deferred) {
          errorEmbed.setDescription(
            "There was an error executing this command!"
          );
          await interaction.followUp({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        } else {
          errorEmbed.setDescription(
            "There was an error executing this command!"
          );
          await interaction.reply({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        }
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("warnings_")) {
        if (!interaction.guild) return;

        const userId = interaction.customId.replace("warnings_", "");

        const warnings = getWarnings(interaction.guild.id, userId);

        const warningCase = interaction.fields.getTextInputValue("case");

        const member = await interaction.guild.members
          .fetch(userId)
          .catch(() => null);
        if (!member) return;

        const id = Number(warningCase);

        const warning = warnings.find((warning) => warning.id === id);

        if (!warning) {
          errorEmbed.setDescription("Case not found.");
          return interaction.reply({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle(`${member.displayName} - Case #${id}`)
          .setDescription(
            `**Warned by:**\n<@${warning.mod}> | ID: ${warning.mod}\n\n**Reason:**\n${warning.reason}`
          )
          .setThumbnail(member.displayAvatarURL({ size: 512 }))
          .setColor(0xe410d3)
          .setFooter({ text: `Case ${id} out of ${warnings.length} cases.` })
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      if (interaction.customId === "changelog") {
        const version = interaction.fields.getTextInputValue("version");
        const details = interaction.fields.getTextInputValue("details");

        addChange(version, details);

        successEmbed.setDescription("Done!");
        return interaction.reply({
          embeds: [successEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }

      if (interaction.customId === "suggestion") {
        if (!interaction.guild) return;

        const text = interaction.fields.getTextInputValue("text");

        const status = getSuggest(interaction.guild.id);

        const channel = await interaction.guild.channels
          .fetch(status.channelId)
          .catch(() => null);

        if (!channel) {
          errorEmbed.setDescription("Couldn't find suggestion channel.");
          return interaction.reply({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("New suggestion")
          .setAuthor({
            name: interaction.user.displayName,
            iconURL: interaction.user.displayAvatarURL({ size: 128 }),
          })
          .setColor(0xe410d3)
          .setDescription(text)
          .setTimestamp();

        if (channel.isDMBased() || !channel.isSendable()) {
          errorEmbed.setDescription("Couldn't send suggestion.");
          return interaction.reply({
            embeds: [errorEmbed],
            flags: MessageFlags.Ephemeral,
          });
        }

        const reply = await channel.send({ embeds: [embed] });
        await reply.react("⬆️");
        await reply.react("⬇️");

        successEmbed.setDescription("Suggestion sent!");
        return interaction.reply({
          embeds: [successEmbed],
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
