const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a member")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption((option) => 
            option
                .setName("user")
                .setDescription("The user to ban")
                .setRequired(true)
        )
        .addStringOption((option) => 
            option
                .setName("reason")
                .setDescription("Reason for the ban")
                .setRequired(false)
        ),


    async execute(interaction) {
        if(!interaction.guild) return;

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) return interaction.reply({content: "❌ I am missing permissions: `BAN_MEMBERS`.", flags: MessageFlags.Ephemeral});

        const user = interaction.options.getUser("user", true);

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

        if(!member) return;

        const target = await interaction.guild.members.fetch(user.id).catch(() => null);

        if(!target) return interaction.reply({content: "❌ Member not found.", flags: MessageFlags.Ephemeral});

        if(member.roles.highest.position <= target.roles.highest.position) {
            return interaction.reply({content: "❌ You can't ban someone with a higher or equal role with you.", flags: MessageFlags.Ephemeral});
        };

        if(target.roles.highest.position >= interaction.guild.members.me.highest.position) {
            return interaction.reply({content: "❌ I can't ban someone with a higer or equal role with me.", flags: MessageFlags.Ephemeral});
        };

        if(!target.bannable) {
            return interaction.reply({content: "❌ This member can't be banned", flags: MessageFlags.Ephemeral});
        };


        const reason = interaction.options.getString("reason", false) || "No reason provided.";

        try {
            await target.ban({reason: reason});
            return interaction.reply({content: "✅ Member banned.", flags: MessageFlags.Ephemeral});
        } catch (error) {
            console.error(error);
            return interaction.reply({content: "❌ Failed to ban member. Do I have the right permissions?", flags: MessageFlags.Ephemeral});
        }
    }
}