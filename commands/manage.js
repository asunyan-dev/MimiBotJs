const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ComponentType } = require('discord.js');

const { enableRoles, editReference, disableRoles, getRoles, getRoleStatus } = require('../modules/customRole');


const { enableWarn, disableWarn, getWarningStatus, clearWarnings, getWarnings } = require('../modules/warning');

const { enableLog, editLog, disableLog, getAllLogs, getLog } = require('../modules/logs');

const { ignoreChannel, unignoreChannel, ignoreUser, unignoreUser, getAllChannels, getAllUsers, getChannel, getUser } = require('../modules/logIgnore');


const { enableSuggestions, editChannel, getSuggest, disableSuggestions } = require('../modules/suggestions');



module.exports = {
    data: new SlashCommandBuilder()
        .setName("manage")
        .setDescription("Manage features of the bot")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup((group) => 
            group.setName("custom-role").setDescription("Manage custom roles")
            .addSubcommand((sub) => 
                sub.setName("enable").setDescription("Enable custom roles")
                .addRoleOption((option) => 
                    option.setName("reference-role").setDescription("The role that will be above custom roles.").setRequired(true)
                )
            )
            .addSubcommand((sub) => 
                sub.setName("edit-reference").setDescription("Edit the reference role")
                .addRoleOption((option) => 
                    option.setName("role").setDescription("The new reference role").setRequired(true)
                )
            )
            .addSubcommand((sub) => 
                sub.setName("disable").setDescription("Disable custom roles for the server")
            )
        )
        .addSubcommandGroup((group) => 
            group.setName("warnings").setDescription("Manage warnings")
            .addSubcommand((sub) => 
                sub.setName("enable").setDescription("Enable Warnings")
            )
            .addSubcommand((sub) => 
                sub.setName("disable").setDescription("Disable Warnings")
            )
            .addSubcommand((sub) => 
                sub.setName("clear-warnings").setDescription("Clear warnings for a user")
                .addUserOption((option) => 
                    option.setName("user").setDescription("User to clear warnings for").setRequired(true)
                )
            )
        )
        .addSubcommandGroup((group) => 
            group.setName("logs").setDescription("Manage logs in the server")
            .addSubcommand((sub) => 
                sub.setName("enable").setDescription("Enable a type of logs")
                .addStringOption((option) => 
                    option.setName("type").setDescription("Type of logs to enable").setRequired(true)
                    .addChoices(
                        { name: "Member Events", value: "memberEvents" },
                        { name: "Message Logs", value: "messageLogs" },
                        { name: "Join/Leave", value: "joinLeave" },
                        { name: "Voice Logs", value: "voiceLogs" }
                    )
                )
            )
            .addSubcommand((sub) => 
                sub.setName("edit").setDescription("Edit channel for a log")
                .addStringOption((option) => 
                    option.setName("type").setDescription("Log you want to edit channel for").setRequired(true)
                    .addChoices(
                        { name: "Member Events", value: "memberEvents" },
                        { name: "Message Logs", value: "messageLogs" },
                        { name: "Join/Leave", value: "joinLeave" },
                        { name: "Voice Logs", value: "voiceLogs" }
                    )
                )
            )
            .addSubcommand((sub) => 
                sub.setName("disable").setDescription("Disable a type of logs")
                .addStringOption((option) => 
                    option.setName("type").setDescription("Type of logs to disable").setRequired(true)
                    .addChoices(
                        { name: "Member Events", value: "memberEvents" },
                        { name: "Message Logs", value: "messageLogs" },
                        { name: "Join/Leave", value: "joinLeave" },
                        { name: "Voice Logs", value: "voiceLogs" }
                    )
                )
            )
            .addSubcommand((sub) => 
                sub.setName("get-config").setDescription("Get the logs config for this server")
            )
        )
        .addSubcommandGroup((group) => 
            group.setName("log-ignore").setDescription("Manage ignored logs")
            .addSubcommand((sub) => 
                sub.setName("user").setDescription("Ignore/Unignore logs for a user")
                .addUserOption((option) => 
                    option.setName("user").setDescription("User to ignore/unignore").setRequired(true)
                )
            )
            .addSubcommand((sub) => 
                sub.setName("channel").setDescription("Ignore/Unignore logs for a channel")
                .addChannelOption((option) => 
                    option.setName("channel").setDescription("Channel to ignore/unignore").setRequired(true)
                )
            )
            .addSubcommand((sub) => 
                sub.setName("get").setDescription("Get list of ignored channels/users")
            )
        )
        .addSubcommandGroup((group) => 
            group.setName("suggestions").setDescription("Manage suggestions")
            .addSubcommand((sub) => 
                sub.setName("enable").setDescription("Enable suggestions")
                .addChannelOption((option) => 
                    option.setName("channel").setDescription("Channel for suggestions").setRequired(true)
                )
            )
            .addSubcommand((sub) => 
                sub.setName("edit").setDescription("Edit channel for suggestions")
                .addChannelOption((option) => 
                    option.setName("channel").setDescription("New channel for suggestions").setRequired(true)
                )
            )
            .addSubcommand((sub) => 
                sub.setName("disable").setDescription("Disable suggestions")
            )
            .addSubcommand((sub) => 
                sub.setName("get").setDescription("Get current config for suggestions.")
            )
        ),

    async execute(interaction) {
        if(!interaction.guild) return;
        const group = interaction.options.getSubcommandGroup();
        const sub = interaction.options.getSubcommand();


        if(group === "custom-role") {
            const status = getRoleStatus(interaction.guild.id);

            if(sub === "enable") {
                if(status) return interaction.reply({content: "❌ Custom roles are already enabled in the server!", flags: MessageFlags.Ephemeral});

                const referenceRole = interaction.options.getRole("reference-role", true);

                if(referenceRole.position > interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({content: "❌ Failed to enable custom roles. The reference role is higher than my highest role.", flags: MessageFlags.Ephemeral});
                };

                enableRoles(interaction.guild.id, referenceRole.id);

                return interaction.reply("✅ Custom roles enabled!");
            };


            if(sub === "edit-reference") {
                if(!status) {
                    return interaction.reply({content: "❌ Custom roles are not enabled in the server! Please use /manage custom-role enable to enable them.", flags: MessageFlags.Ephemeral});
                };

                const role = interaction.options.getRole("role", true);

                if(role.position > interaction.guild.members.me.roles.highest.position) {
                    return interaction.reply({content: "❌ Failed to edit reference role, the role you selected is higher than my highest role.", flags: MessageFlags.Ephemeral});
                };

                editReference(interaction.guild.id, role.id);

                return interaction.reply("✅ Reference role edited!");
            };


            if(sub === "disable") {
                if(!status) return interaction.reply({content: "❌ Custom roles are not enabled in the server.", flags: MessageFlags.Ephemeral});

                const customRoles = getRoles(interaction.guild.id);


                const roles = Object.keys(customRoles);

                roles.forEach(async (role) => {
                    const fetched = await interaction.guild.roles.fetch(role).catch(() => null);

                    await interaction.guild.roles.delete(role).catch((error) => console.error(error));
                });

                disableRoles(interaction.guild.id);

                return interaction.reply("✅ Custom roles disabled.");
            }
        } // end of group custom role


        if(group === "warnings") {
            const status = getWarningStatus(interaction.guild.id);

            if(sub === "enable") {
                if(status.enabled) return interaction.reply({content: "❌ Warnings are already enabled for the server.", flags: MessageFlags.Ephemeral});

                enableWarn(interaction.guild.id);

                return interaction.reply("✅ Warnings enabled for the server!");
            };


            if(sub === "disable") {
                if(!status.enabled) return interaction.reply({content: "❌ Warnings were not enabled for the server.", flags: MessageFlags.Ephemeral});

                disableWarn(interaction.guild.id);

                return interaction.reply("✅ Warnings disabled for the server.");
            };


            if(sub === "clear-warnings") {
                if(!status.enabled) return interaction.reply({content: "❌ Warnings are not enabled for the server.", flags: MessageFlags.Ephemeral});

                const user = interaction.options.getUser("user", true);

                const warnings = getWarnings(interaction.guild.id, user.id);

                if(warnings.length === 0) {
                    return interaction.reply({content: "❌ This member had no warnings.", flags: MessageFlags.Ephemeral});
                };


                clearWarnings(interaction.guild.id, user.id);

                return interaction.reply(`✅ Cleared warnings for ${user.displayName}.`)
            }
        } // end of group warnings


        if(group === "logs") {

            if(sub === "enable") {
                const log = interaction.options.getString("type", true);

                const status = getLog(interaction.guild.id, log);

                if(status.enabled) return interaction.reply({content: "❌ This type of logs is already enabled.\nℹ️ Want to edit the channel for this type? Type /manage logs edit", flags: MessageFlags.Ephemeral});


                const embed = new EmbedBuilder()
                    .setTitle("Log Configuration")
                    .setDescription("Please select a channel to post logs for this type.")
                    .setColor(0xe410d3);

                const row = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("channel")
                        .setPlaceholder("Select a channel...")
                        .setRequired(true)
                ).toJSON();


                const reply = await interaction.reply({embeds: [embed], components: [row]});


                const collector = reply.createMessageComponentCollector({
                    componentType: ComponentType.ChannelSelect,
                    time: 60_000
                });

                collector.on("collect", async (i) => {
                    if(i.user.id !== interaction.user.id) return interaction.reply({content: "❌ This menu is not for you!", flags: MessageFlags.Ephemeral});

                    if(i.customId === "channel") {
                        const channel = i.channels.first();
                        if(!channel) return;

                        enableLog(interaction.guild.id, log, channel.id);

                        const embed2 = new EmbedBuilder()
                            .setTitle("✅ Log Type configured")
                            .setDescription(`Logs will be sent to <#${channel.id}>.`)
                            .setColor(0xe410d3)
                            .setTimestamp();

                        return i.update({embeds: [embed2], components: []});
                    };
                });

                collector.on("end", async () => {
                    try {
                        interaction.editReply({components: []});
                    } catch {};
                });
            };



            if(sub === "edit") {
                const log = interaction.options.getString("type", true);

                const status = getLog(interaction.guild.id, log);

                if(!status.enabled) return interaction.reply({content: "❌ This type of logs is not enabled! Please use /manage logs enable to enable it.", flags: MessageFlags.Ephemeral});

                const embed = new EmbedBuilder()
                    .setTitle("Log Editing")
                    .setDescription("Select a channel below to set it as new log channel for this type.")
                    .setColor(0xe410d3);

                const row = new ActionRowBuilder().addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId("channel")
                        .setPlaceholder("Select a channel...")
                        .setRequired(true)
                ).toJSON();

                const reply = await interaction.reply({embeds: [embed], components: [row]});

                const collector = reply.createMessageComponentCollector({
                    componentType: ComponentType.ChannelSelect,
                    time: 60_000
                });


                collector.on("collect", async (i) => {
                    if(i.user.id !== interaction.user.id) return interaction.reply({content: "❌ This menu is not for you!", flags: MessageFlags.Ephemeral});

                    if(i.customId === "channel") {
                        const channel = i.channels.first();
                        if(!channel) return;


                        editLog(interaction.guild.id, log, channel.id);

                        const embed2 = new EmbedBuilder()
                            .setTitle("✅ Log Edited!")
                            .setDescription(`Logs will now be sent to <#${channel.id}>.`)
                            .setColor(0xe410d3);

                        return i.update({embeds: [embed2], components: []});
                    };
                });

                collector.on("end", async () => {
                    try {
                        interaction.editReply({components: []});
                    } catch {};
                });
            };


            if(sub === "disable") {
                const log = interaction.options.getString("type", true);

                const status = getLog(interaction.guild.id, log);

                if(!status.enabled) return interaction.reply({content: "❌ This type of logs is not enabled, no need to use this command.", flags: MessageFlags.Ephemeral});

                disableLog(interaction.guild.id, log);

                return interaction.reply({content: "✅ Log Type disabled."});
            };


            if(sub === "get-config") {
                const all = getAllLogs(interaction.guild.id);

                const embed = new EmbedBuilder()
                    .setTitle(`Logs config for ${interaction.guild.name}`)
                    .setThumbnail(interaction.guild.iconURL({size: 512}))
                    .setColor(0xe410d3)
                    .setDescription(`**Member Events:**\nEnabled: ${all.memberEvents.enabled ? "✅" : "❌"}\nChannel: ${all.memberEvents.channelId ? `<#${all.memberEvents.channelId}>` : "N/A"}\n\n**Message Logs:**\nEnabled: ${all.messageLogs.enabled ? "✅" : "❌"}\nChannel: ${all.messageLogs.channelId ? `<#${all.messageLogs.channelId}>` : "N/A"}\n\n**Join / Leave:**\nEnabled: ${all.joinLeave.enabled ? "✅" : "❌"}\nChannel: ${all.joinLeave.channelId ? `<#${all.joinLeave.channelId}>` : "N/A"}\n\n**Voice Logs:**\nEnabled: ${all.voiceLogs.enabled ? "✅" : "❌"}\nChannel: ${all.voiceLogs.channelId ? `<#${all.voiceLogs.channelId}>` : "N/A"}`)
                    .setTimestamp();

                return interaction.reply({embeds: [embed]});
            }
        } // end of group logs

        if(group === "log-ignore") {

            if(sub === "user") {
                const user = interaction.options.getUser("user", true);

                const status = getUser(interaction.guild.id, user.id);

                if(!status) {
                    ignoreUser(interaction.guild.id, user.id);
                    return interaction.reply("✅ User ignored.");
                } else {
                    unignoreUser(interaction.guild.id, user.id);
                    return interaction.reply("✅ User unignored.");
                };
            };


            if(sub === "channel") {
                const channel = interaction.options.getChannel("channel", true);

                const status = getChannel(interaction.guild.id, channel.id);

                if(!status) {
                    ignoreChannel(interaction.guild.id, channel.id);
                    return interaction.reply("✅ Channel ignored.");
                } else {
                    unignoreChannel(interaction.guild.id, channel.id);
                    return interaction.reply("✅ Channel unignored.");
                };
            };

            if(sub === "get") {
                const allUsers = getAllUsers(interaction.guild.id);
                const allChannels = getAllChannels(interaction.guild.id);

                const users = Object.keys(allUsers);
                const channels = Object.keys(allChannels);

                const userEmbed = new EmbedBuilder()
                    .setTitle("Ignored users")
                    .setColor(0xe410d3)
                    .setDescription(`- ${users.length ? users.map(user => `<@${user}>`).join("\n- ") : "N/A"}`)
                    .setTimestamp();

                const channelEmbed = new EmbedBuilder()
                    .setTitle("Ignored channels")
                    .setColor(0xe410d3)
                    .setDescription(`- ${channels.length ? channels.map(channel => `<#${channel}>`).join("\n- ") : "N/A"}`)
                    .setTimestamp();

                return interaction.reply({embeds: [userEmbed, channelEmbed]});
            }
        } // end of group log ignore


        if(group === "suggestions") {

            if(sub === "enable") {
                const status = getSuggest(interaction.guild.id);
                if(status.enabled) return interaction.reply({content: "❌ Suggestions are already enabled.", flags: MessageFlags.Ephemeral});

                const channel = interaction.options.getChannel("channel", true);

                enableSuggestions(interaction.guild.id, channel.id);

                return interaction.reply({content: "✅ Suggestions enabled!"});
            };

            if(sub === "edit") {
                const status = getSuggest(interaction.guild.id);
                if(!status.enabled) return interaction.reply({content: "❌ Suggestions are disabled.", flags: MessageFlags.Ephemeral});

                const channel = interaction.options.getChannel("channel", true);

                editChannel(interaction.guild.id, channel.id);

                return interaction.reply("✅ Suggestion channel edited!");
            };


            if(sub === "disable") {
                const status = getSuggest(interaction.guild.id);
                if(!status.enabled) return interaction.reply({content: "❌ Suggestions are already disabled.", flags: MessageFlags.Ephemeral});

                disableSuggestions(interaction.guild.id);

                return interaction.reply("✅ Suggestions disabled.");
            };

            if(sub === "get") {
                const status = getSuggest(interaction.guild.id);

                const embed = new EmbedBuilder()
                    .setTitle("Suggestions config")
                    .setDescription(`**Status:** ${status.enabled ? "`Enabled`" : "`Disabled`"}\n\n**Suggestions channel:** ${status.channelId ? `<#${status.channelId}>` : "N/A"}`)
                    .setColor(0xe410d3)
                    .setTimestamp();

                return interaction.reply({embeds: [embed]});
            }
        } // end of group suggestions 

        
    }
}