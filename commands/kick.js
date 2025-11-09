const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("kick a member")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption((option) => 
            option
                .setName("user")
                .setDescription("The member to kick")
                .setRequired(true)
        )
        .addStringOption((option) => 
            option
                .setName("reason")
                .setDescription("Reason for the kick")
                .setRequired(false)
        ),

    async execute(interaction) {
        if(!interaction.guild) return;

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) return interaction.reply({content: "❌ I am missing permissions: `KICK_MEMBERS`.", flags: MessageFlags.Ephemeral});

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const user = interaction.options.getUser("user", true);
        let reason = interaction.options.getString("reason", false);
        if(!reason) reason = "No reason provided.";

        const target = await interaction.guild.members.fetch(user.id).catch(() => null);

        if(!target) return interaction.reply({content: "❌ Failed to find member.", flags: MessageFlags.Ephemeral});


        if(target.roles.highest.position >= member.roles.highest.position) {
            return interaction.reply({content: "❌ You can't kick someone with a higher role than you.", flags: MessageFlags.Ephemeral});
        };

        if(target.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({content: "❌ I can't kick someone with a higher role than me.", flags: MessageFlags.Ephemeral});
        };


        if(!target.kickable) {
            return interaction.reply({content: "❌ This member is not kickable.", flags: MessageFlags.Ephemeral});
        };


        await target.kick({reason: reason});

        return interaction.reply({content: "✅ Member kicked."});
    }
}