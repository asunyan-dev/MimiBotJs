const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Unban a user by ID")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption((option) => 
            option.setName("id").setDescription("ID of the user").setRequired(true)
        ),


    async execute(interaction) {
        if(!interaction.guild) return;

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({content: "❌ I am missing permissions: `BAN_MEMBERS`.", flags: MessageFlags.Ephemeral});

        const id = interaction.options.getString("id", true);

        const ban = await interaction.guild.bans.fetch(id).catch(() => null);

        if(!ban) return interaction.reply({content: "❌ Couldn't find banned user. Are they actually banned?", flags: MessageFlags.Ephemeral});

        try {
            await interaction.guild.bans.remove(id);
            return interaction.reply({content: "✅ User unbanned.", flags: MessageFlags.Ephemeral});
        } catch (err) {
            console.error(err);
            return interaction.reply({content: "❌ Failed to unban user. Do I have the right permissions?", flags: MessageFlags.Ephemeral});
        }
    }
}