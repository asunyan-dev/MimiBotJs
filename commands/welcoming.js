const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, EmbedBuilder, ModalBuilder, TextInputStyle, ComponentType, TextDisplayBuilder } = require('discord.js');

const { disableWelcome, getWelcome } = require('../modules/welcoming');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcoming")
        .setDescription("Set up welcoming messages for the server")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) => 
            sub.setName("enable").setDescription("Enable welcome messages")
        )
        .addSubcommand((sub) => 
            sub.setName("edit").setDescription("Edit welcome messages")
        )
        .addSubcommand((sub) => 
            sub.setName("disable").setDescription("Disable welcome messages")
        )
        .addSubcommand((sub) => 
            sub.setName("get").setDescription("Get your server config.")
        )
        .addSubcommand((sub) => 
            sub.setName("help").setDescription("Get help for welcoming messages")
        ),

    async execute(interaction) {
        if(!interaction.guild) return;

        const sub = interaction.options.getSubcommand();

        const status = getWelcome(interaction.guild.id);

        if(sub === "enable") {
            if(status.enabled) return interaction.reply({content: "❌ Welcome messages are already enabled. Type /welcoming edit to edit them.", flags: MessageFlags.Ephemeral});


            const modal = new ModalBuilder()
                .setCustomId(`enable_welcome_${interaction.guild.id}`)
                .setTitle("Enable welcome messages")
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent("List of variables for the message:\n\n`{user}` - Mention the user\n`{username}` - Display the username\n`{server}` - Display server name\n`{membercount}` - Display the server's member count")
                )
                .addLabelComponents(
                    {
                        type: ComponentType.Label,
                        label: "Do we ping new members?",
                        component: {
                            type: ComponentType.StringSelect,
                            custom_id: "ping",
                            placeholder: "Select your choice",
                            options: [
                                {label: "Yes", value: "yes"},
                                {label: "No", value: "no"}
                            ],
                            required: true
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Channel",
                        description: "Choose the channel where to send welcome messages",
                        component: {
                            type: ComponentType.ChannelSelect,
                            placeholder: "Select a channel...",
                            max_values: 1,
                            custom_id: "channel",
                            required: true
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "Welcome message",
                        component: {
                            type: ComponentType.TextInput,
                            custom_id: "message",
                            style: TextInputStyle.Paragraph,
                            required: true,
                            placeholder: "Type the welcome message here..."
                        }
                    }
                ).toJSON();

            await interaction.showModal(modal);
        };


        if(sub === "edit") {
            if(!status.enabled) return interaction.reply({content: "❌ Welcome messages are disabled. Type /welcoming enable to enable them.", flags: MessageFlags.Ephemeral});


            const modal = new ModalBuilder()
                .setCustomId(`edit_welcome_${interaction.guild.id}`)
                .setTitle("Edit welcome messages")
                .addTextDisplayComponents(
                    new TextDisplayBuilder()
                        .setContent("List of variables for the message:\n\n`{user}` - Mention the user\n`{username}` - Display the username\n`{server}` - Display server name\n`{membercount}` - Display the server's member count")
                )
                .addLabelComponents(
                    {
                        type: ComponentType.Label,
                        label: "Do we ping new members?",
                        component: {
                            type: ComponentType.StringSelect,
                            custom_id: "ping",
                            placeholder: "Select your choice",
                            required: false,
                            options: [
                                {label: "Yes", value: "yes"},
                                {label: "No", value: "no"}
                            ]
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "New channel",
                        description: "Select the new channel below",
                        component: {
                            type: ComponentType.ChannelSelect,
                            max_values: 1,
                            required: false,
                            placeholder: "Select a channel...",
                            custom_id: "channel"
                        }
                    },
                    {
                        type: ComponentType.Label,
                        label: "New message",
                        description: "New message for welcome messages",
                        component: {
                            type: ComponentType.TextInput,
                            custom_id: "message",
                            style: TextInputStyle.Paragraph,
                            required: false,
                            placeholder: "Type new message here."
                        }
                    }
                ).toJSON();

            await interaction.showModal(modal);
        };


        if(sub === "disable") {
            if(!status.enabled) return interaction.reply({content: "❌ Welcome messages are already disabled.", flags: MessageFlags.Ephemeral});

            disableWelcome(interaction.guild.id);

            return interaction.reply("✅ Welcome messages disabled!");
        };


        if(sub === "get") {
            const embed = new EmbedBuilder()
                .setTitle(`Welcome messages for ${interaction.guild.name}`)
                .setDescription(status.message ? status.message : "N/A")
                .setColor(0xe410d3)
                .addFields(
                    {name: "Enabled?", value: status.enabled ? "✅" : "❌", inline: true},
                    {name: "Ping new members?", value: status.ping ? "✅" : "❌", inline: true},
                    {name: "Channel", value: status.channelId ? `<#${status.channelId}>` : "N/A"}
                )
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        }
    }
}