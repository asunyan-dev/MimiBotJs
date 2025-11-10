const { Events, Collection, MessageFlags, ButtonStyle } = require('discord.js');

const { getWarnings } = require('../modules/warning');

const { addChange } = require('../modules/botLogs');

const { getSuggest } = require('../modules/suggestions');
const { EmbedBuilder } = require('@discordjs/builders');

const config = require('../config.json');

const { getModMail } = require('../modules/modmail');

const { sendMessage } = require('../modules/sendMessage');
const { ActionRowBuilder } = require('@discordjs/builders');
const { ButtonBuilder } = require('@discordjs/builders');

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        if(interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if(!command) return;

            if(!client.cooldowns.has(command.data.name)) {
                client.cooldowns.set(command.data.name, new Collection());
            };

            const now = Date.now();
            const timestamps = client.cooldowns.get(command.data.name);
            const cooldownAmount = (command.cooldown || 3) * 1000;


            if(timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if(now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    return interaction.reply({content: `🕰️ Please wait ${timeLeft.toFixed(1)} more second(s) before using /${command.data.name} again.`, flags: MessageFlags.Ephemeral});
                };
            };

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                await command.execute(interaction);
            } catch (err) {
                console.error(err);
                if(interaction.replied || interaction.deferred) {
                    await interaction.followUp({content: "❌ There was an error executing this command!", flags: MessageFlags.Ephemeral});
                } else {
                    await interaction.reply({content: "❌ There was an error executing this command!", flags: MessageFlags.Ephemeral});
                };
            };
        };

        if(interaction.isModalSubmit()) {
            if(interaction.customId.startsWith('warnings_')) {
                if(!interaction.guild) return;

                const userId = interaction.customId.replace("warnings_", "");

                const warnings = getWarnings(interaction.guild.id, userId);

                const warningCase = interaction.fields.getTextInputValue("case");

                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if(!member) return;

                const id = Number(warningCase);

                const warning = warnings.find(warning => warning.id === id);

                if(!warning) return interaction.reply({content: "❌ Case not found.", flags: MessageFlags.Ephemeral});

                const embed = new EmbedBuilder()
                    .setTitle(`${member.displayName} - Case #${id}`)
                    .setDescription(`**Warned by:**\n<@${warning.mod}> | ID: ${warning.mod}\n\n**Reason:**\n${warning.reason}`)
                    .setThumbnail(member.displayAvatarURL({size: 512}))
                    .setColor(0xe410d3)
                    .setFooter({text: `Case ${id} out of ${warnings.length} cases.`})
                    .setTimestamp();

                return interaction.reply({embeds: [embed]});
            };

            if(interaction.customId === "changelog") {
                const version = interaction.fields.getTextInputValue("version");
                const details = interaction.fields.getTextInputValue("details");

                addChange(version, details);

                return interaction.reply({content: "Done.", flags: MessageFlags.Ephemeral});
            };


            if(interaction.customId === "suggestion") {
                if(!interaction.guild) return;

                const text = interaction.fields.getTextInputValue("text");

                const status = getSuggest(interaction.guild.id);

                const channel = await interaction.guild.channels.fetch(status.channelId).catch(() => null);

                if(!channel) return interaction.reply({content: "❌ Couldn't find suggestion channel.", flags: MessageFlags.Ephemeral});

                const embed = new EmbedBuilder()
                    .setTitle("New suggestion")
                    .setAuthor({name: interaction.user.displayName, iconURL: interaction.user.displayAvatarURL({size: 128})})
                    .setColor(0xe410d3)
                    .setDescription(text)
                    .setTimestamp();


                if(channel.isDMBased() || !channel.isSendable()) {
                    return interaction.reply({content: "❌ Couldn't send suggestion.", flags: MessageFlags.Ephemeral});
                };

                const reply = await channel.send({embeds: [embed]});
                await reply.react("⬆️");
                await reply.react("⬇️");

                return interaction.reply({content: "✅ Suggestion sent!"});
            };


            if(interaction.customId === "request") {
                const name = interaction.fields.getTextInputValue("name");
                const text = interaction.fields.getTextInputValue("text");

                const owner = await client.users.fetch(config.owner_id).catch(() => null);

                if(!owner) return interaction.reply({content: "❌ There was an error, please try again later.", flags: MessageFlags.Ephemeral});

                await owner.send(`New request from ${name}:\n\n${text}`);

                return interaction.reply({content: "✅ Request sent.", flags: MessageFlags.Ephemeral});
            };


            if(interaction.customId === "modmail") {
                const message = interaction.fields.getTextInputValue("message");
                const modmail = getModMail(interaction.guild.id);

                const embed = new EmbedBuilder()
                    .setTitle(`New message from ${interaction.user.displayName}`)
                    .setDescription(message)
                    .setThumbnail(interaction.user.displayAvatarURL({size: 512}))
                    .setColor(0xe410d3)
                    .setFooter({text: `User ID: ${interaction.user.id}`})
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mail_${interaction.user.id}`)
                        .setLabel("Reply")
                        .setStyle(ButtonStyle.Primary)
                ).toJSON();

                try {
                    await sendMessage(client, interaction.guild.id, modmail.channelId, {embeds: [embed], components: [row]});
                } catch (err) {
                    console.error(err);
                    return interaction.reply({content: "❌ Failed to send message, try again later.", flags: MessageFlags.Ephemeral});
                };

                return interaction.reply({content: "✅ Message sent! Remember to have your DMs opened to me, otherwise staff won't be able to reply to you.", flags: MessageFlags.Ephemeral});
            };

            if(interaction.customId.startsWith("mail_reply_")) {
                const userId = interaction.customId.replace("mail_reply_", "");

                const member = await interaction.guild.members.fetch(userId);

                const message = interaction.fields.getTextInputValue("message");

                const embed = new EmbedBuilder()
                    .setTitle("Reply from staff!")
                    .setDescription(message)
                    .setColor(0xe410d3)
                    .setFooter({text: "This message was sent by server staff"})
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`reply_${userId}`)
                        .setLabel("Reply")
                        .setStyle(ButtonStyle.Primary)
                ).toJSON();

                try {
                    member.send({embeds: [embed], components: [row]});
                } catch (err) {
                    console.error(err);
                    return interaction.reply({content: "❌ Failed to DM member.", flags: MessageFlags.Ephemeral});
                };

                return interaction.reply({content: "Reply sent.", flags: MessageFlags.Ephemeral});
            }
        }
    }
}