const { SlashCommandBuilder, InteractionContextType, MessageFlags } = require('discord.js');

const { mkRole, getRole, getRoleStatus, removeRole, getReference } = require('../modules/customRole');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("custom-role")
        .setDescription("Custom role commands")
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((sub) => 
            sub
                .setName("make")
                .setDescription("Make your custom role")
                .addStringOption((option) => 
                    option
                        .setName("name")
                        .setDescription("Name for the role")
                        .setRequired(true)
                )
                .addStringOption((option) => 
                    option
                        .setName("color")
                        .setDescription("Color for the role, hex code. Must start with #")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) => 
            sub
                .setName("edit")
                .setDescription("Edit your custom role")
                .addStringOption((option) => 
                    option
                        .setName("name")
                        .setDescription("New name for the role")
                        .setRequired(true)
                )
                .addStringOption((option) => 
                    option
                        .setName("color")
                        .setDescription("New color for the role, hex code must start with #")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) => 
            sub
                .setName("remove")
                .setDescription("Remove your custom role")
        ),

    async execute(interaction) {
        if(!interaction.guild) return;

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const sub = interaction.options.getSubcommand();

        const guildStatus = getRoleStatus(interaction.guild.id);

        if(!guildStatus) return interaction.reply({content: "❌ Custom roles are disabled!", flags: MessageFlags.Ephemeral});


        const status = getRole(interaction.guild.id, interaction.user.id);


        if(sub === "make") {
            if(status) {
                return interaction.reply({content: "❌ You already have a custom role! Use /custom-role edit to edit it!", flags: MessageFlags.Ephemeral});
            };

            const name = interaction.options.getString("name", true);
            const color = interaction.options.getString("color", true);

            if(!color.startsWith("#")) {
                return interaction.reply({content: "❌ Invalid color format! Must start with #. Example: #e410d3", flags: MessageFlags.Ephemeral});
            };


            const guildRef = getReference(interaction.guild.id);

            const reference = await interaction.guild.roles.fetch(guildRef).catch(() => null);

            if(!reference) return interaction.reply({content: "❌ There was an error, please try again later.", flags: MessageFlags.Ephemeral});

            try {
                const role = await interaction.guild.roles.create({
                    name: name,
                    colors: {
                        primaryColor: color
                    },
                    position: reference.position - 1
                });

                await member.roles.add(role);

                mkRole(interaction.guild.id, interaction.user.id, role.id);

                return interaction.reply({content: "✅ Role created."});
            } catch (error) {
                console.error(error);
                return interaction.reply({content: "❌ Failed to make role. Please try again later.", flags: MessageFlags.Ephemeral});
            }
        };

        if(sub === "edit") {
            if(!status) {
                return interaction.reply({content: "❌ You don't have a custom role yet! Use /custom-role make to create one!", flags: MessageFlags.Ephemeral});
            };


            const name = interaction.options.getString("name", true);
            const color = interaction.options.getString("color", true);

            if(!color.startsWith("#")) {
                return interaction.reply({content: "❌ Invalid color format, must start with #. Example: #e410d3", flags: MessageFlags.Ephemeral});
            };


            const role = await interaction.guild.roles.fetch(status).catch(() => null);

            if(!role) {
                removeRole(interaction.guild.id, interaction.user.id);
                return interaction.reply({content: "❌ Your role couldn't be found in the server. Please make another one using /custom-role make.", flags: MessageFlags.Ephemeral});
            };


            try {
                await role.edit({
                    name: name,
                    colors: {
                        primaryColor: color
                    }
                });

                return interaction.reply("✅ Role edited.");
            } catch (error) {
                console.error(error);
                return interaction.reply({content: "❌ Failed to edit role, please try again later.", flags: MessageFlags.Ephemeral});
            };
        };


        if(sub === "remove") {
            if(!status) {
                return interaction.reply({content: "❌ You don't have a custom role, no need to use this command!", flags: MessageFlags.Ephemeral});
            };


            const role = await interaction.guild.roles.fetch(status).catch(() => null);

            if(!role) {
                removeRole(interaction.guild.id, interaction.user.id);
                return interaction.reply({content: "✅ Role removed!"});
            };

            try {
                await interaction.guild.roles.delete(role);
                removeRole(interaction.guild.id, interaction.user.id);
                return interaction.reply({content: "✅ Role removed!"});
            } catch (error) {
                console.error(error);
                return interaction.reply({content: "❌ Failed to remove role, please try again later.", flags: MessageFlags.Ephemeral});
            }
        }
    }
}