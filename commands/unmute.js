const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Unmute a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => 
            option.setName("user").setDescription("The user to unmute").setRequired(true)
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

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            errorEmbed.setDescription("I am missing permissions: `MODERATE_MEMBERS`.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;


        const user = interaction.options.getUser('user', true);
        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if(!target) {
            errorEmbed.setDescription("Member not found.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        if(!target.isCommunicationDisabled()) {
            errorEmbed.setDescription("This member is not muted.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };


        if(target.roles.highest.position >= member.roles.highest.position) {
            errorEmbed.setDescription("You can't unmute someone with a higher role than you.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        if(target.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            errorEmbed.setDescription("I can't unmute someone with a higher role than me.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };


        if(!target.moderatable) {
            errorEmbed.setDescription("This member can't be unmuted.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        try {
            await target.timeout(null);
            successEmbed.setDescription("Member unmuted.");
            return interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
        } catch (err) {
            console.error(err);
            errorEmbed.setDescription("Failed to unmute member. Do I have the right permissions?");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };
    }
}