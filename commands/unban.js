const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user by ID")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption((option) => 
            option.setName("id").setDescription("ID of the user").setRequired(true)
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

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            errorEmbed.setDescription("I am missing permissions: `BAN_MEMBERS`.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        const id = interaction.options.getString("id", true);

        const ban = await interaction.guild.bans.fetch(id).catch(() => null);

        if(!ban) {
            errorEmbed.setDescription("Couldn't find banned user. Are they actually banned?");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        try {
            await interaction.guild.bans.remove(id);
            successEmbed.setDescription("User unbanned.");
            return interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
        } catch (err) {
            console.error(err);
            errorEmbed.setDescription("Failed to unban user. Do I have the right permissions?");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        }
    }
}