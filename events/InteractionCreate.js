const { Events, Collection, MessageFlags, ButtonStyle } = require('discord.js');

const { getWarnings } = require('../modules/warning');

const { addChange } = require('../modules/botLogs');

const { getSuggest } = require('../modules/suggestions');
const { EmbedBuilder } = require('@discordjs/builders');

const config = require('../config.json');


const { sendMessage } = require('../modules/sendMessage');
const { ActionRowBuilder } = require('@discordjs/builders');
const { ButtonBuilder } = require('@discordjs/builders');

const { getAll, getUpdatesStatus } = require('../modules/updates');

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

                const allUpdates = getAll();

                const guilds = Object.keys(allUpdates);

                const embed = new EmbedBuilder()
                    .setTitle(`${client.user.tag} - version ${version}`)
                    .setDescription(details)
                    .setColor(0xe410d3)
                    .setThumbnail(client.user.avatarURL({size: 512}))
                    .setTimestamp();

                guilds.forEach(async guild => {
                    const channel = guild.channelId;
                    try {
                        await sendMessage(client, guild, channel, {embeds: [embed]});
                    } catch (err) {
                        console.log(err);
                    }
                })

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

                await owner.send({content: `New request from ${name} (username: ${interaction.user.username}):\n\n${text}`});

                return interaction.reply({content: "✅ Request sent.", flags: MessageFlags.Ephemeral});
            };
        }
    }
}