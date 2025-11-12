const { SlashCommandBuilder, MessageFlags, InteractionContextType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const { enableUpdates, editUpdates, disableUpdates, getUpdatesStatus } = require('../modules/updates');



module.exports = {
    data: new SlashCommandBuilder()
        .setName("updates")
        .setDescription("Configure bot updates in your server.")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((sub) => 
            sub.setName("enable").setDescription("Enable bot updates in your server")
            .addChannelOption((option) => 
                option.setName("channel").setDescription("Channel where updates will be sent").setRequired(true)
            )
        )
        .addSubcommand((sub) => 
            sub.setName("edit").setDescription("Edit the channel for bot updates")
            .addChannelOption((option) => 
                option.setName("channel").setDescription("New channel for updates").setRequired(true)
            )
        )
        .addSubcommand((sub) => 
            sub.setName("disable").setDescription("Disable bot updates")
        )
        .addSubcommand((sub) => 
            sub.setName("get").setDescription("Get the config for updates in your server.")
        ),


    async execute(interaction) {
        if(!interaction.guild) return;

        const sub = interaction.options.getSubcommand();

        const status = getUpdatesStatus(interaction.guild.id);

        if(sub === "enable") {
            if(status.enabled) return interaction.reply({content: "❌ Updates are already enabled! Type /updates edit to edit the channel.", flags: MessageFlags.Ephemeral});

            const channel = interaction.options.getChannel("channel", true);

            enableUpdates(interaction.guild.id, channel.id);

            return interaction.reply({content: "✅ Updates enabled!"});
        };

        if(sub === "edit") {
            if(!status.enabled) return interaction.reply({content: "❌ Updates are not enabled! Type /updates enable to enable them.", flags: MessageFlags.Ephemeral});

            const channel = interaction.options.getChannel("channel", true);

            editUpdates(interaction.guild.id, channel.id);

            return interaction.reply("✅ Channel for updates edited!");
        };

        if(sub === "disable") {
            if(!status.enabled) return interaction.reply({content: "❌ Updates are already disabled.", flags: MessageFlags.Ephemeral});

            disableUpdates(interaction.guild.id);

            return interaction.reply("✅ Updates disabled!");
        };


        if(sub === "get") {
            const embed = new EmbedBuilder()
                .setTitle(`Updates status for ${interaction.guild.name}`)
                .setThumbnail(interaction.guild.iconURL({size: 512}))
                .setColor(0xe410d3)
                .setDescription(`**Enabled?** ${status.enabled ? "✅" : "❌"}\n\n**Channel:** ${status.channelId ? `<#${status.channelId}>` : "N/A"}`)
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        }
    }
}