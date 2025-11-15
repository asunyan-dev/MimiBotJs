const { SlashCommandBuilder, InteractionContextType, MessageFlags, EmbedBuilder } = require('discord.js');

const { mkRole, getRole, getRoleStatus, removeRole, getReference } = require('../modules/customRole');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("custom-role")
        .setDescription("Custom role commands")
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

        let errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setColor("Red")
            .setTimestamp();

        let successEmbed = new EmbedBuilder()
            .setTitle("✅ Success!")
            .setColor("Green")
            .setTimestamp();

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const sub = interaction.options.getSubcommand();

        const guildStatus = getRoleStatus(interaction.guild.id);

        if(!guildStatus) {
            errorEmbed.setDescription("Custom roles are disabled in this server.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };


        const status = getRole(interaction.guild.id, interaction.user.id);


        if(sub === "make") {
            if(status) {
                errorEmbed.setDescription("You already have a custom role! Please use `/custom-role edit` to edit it!");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };

            const name = interaction.options.getString("name", true);
            const color = interaction.options.getString("color", true);

            if(!color.startsWith("#")) {
                errorEmbed.setDescription("Invalid color format! It must start with `#`.\nExample: `#e410d3`.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };


            const guildRef = getReference(interaction.guild.id);

            const reference = await interaction.guild.roles.fetch(guildRef).catch(() => null);

            if(!reference) {
                errorEmbed.setDescription("There was an error, please try again later.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };

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

                successEmbed.setDescription("Role created and given to you!");
                return interaction.reply({embeds: [successEmbed]});
            } catch (error) {
                console.error(error);
                errorEmbed.setDescription("Failed to make role. Please try again later.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            }
        };

        if(sub === "edit") {
            if(!status) {
                errorEmbed.setDescription("You don't have a custom role yet! Please use `/custom-role make` to create one!");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };


            const name = interaction.options.getString("name", true);
            const color = interaction.options.getString("color", true);

            if(!color.startsWith("#")) {
                errorEmbed.setDescription("Invalid color format! It must start with `#`.\nExample: `#e410d3`.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };


            const role = await interaction.guild.roles.fetch(status).catch(() => null);

            if(!role) {
                removeRole(interaction.guild.id, interaction.user.id);
                errorEmbed.setDescription("Your custom role couldn't be found in the server. Please make another one using `/custom-role make`.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };


            try {
                await role.edit({
                    name: name,
                    colors: {
                        primaryColor: color
                    }
                });

                successEmbed.setDescription("Role edited!");
                return interaction.reply({embeds: [successEmbed]});
            } catch (error) {
                console.error(error);
                errorEmbed.setDescription("Failed to edit role, please try again later.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };
        };


        if(sub === "remove") {
            if(!status) {
                errorEmbed.setDescription("You don't have a custom role, no need to use this command.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };


            const role = await interaction.guild.roles.fetch(status).catch(() => null);

            if(!role) {
                removeRole(interaction.guild.id, interaction.user.id);
                successEmbed.setDescription("Role deleted and removed!");
                return interaction.reply({embeds: [successEmbed]});
            };

            try {
                await interaction.guild.roles.delete(role);
                removeRole(interaction.guild.id, interaction.user.id);
                successEmbed.setDescription("Role deleted and removed!");
                return interaction.reply({embeds: [successEmbed]});
            } catch (error) {
                console.error(error);
                errorEmbed.setDescription("Failed to remove role, please try again later.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            }
        }
    }
}