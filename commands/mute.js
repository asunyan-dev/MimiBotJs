const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags } = require('discord.js');

const ms = require('ms');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Mute a member")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => 
            option.setName("user").setDescription("The member to mute").setRequired(true)
        )
        .addStringOption((option) => 
            option.setName("duration").setDescription("Duration of the mute, example: 1 day, 2 hours").setRequired(true)
        )
        .addStringOption((option) => 
            option.setName("reason").setDescription("Reason for the mute").setRequired(false)
        ),


    async execute(interaction) {

        if(!interaction.guild) return;

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({content: "❌ I am missing permissions: `MODERATE_MEMBERS`.", flags: MessageFlags.Ephemeral});

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason", false) || "No reason provided";
        const durationRaw = interaction.options.getString("duration", true);


        const duration = ms(durationRaw);

        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if(!target) return interaction.reply({content: "❌ Member not found.", flags: MessageFlags.Ephemeral});

        if(member.roles.highest.position <= target.roles.highest.position) {
            return interaction.reply({content: "❌ You can't mute someone with a higher role than you.", flags: MessageFlags.Ephemeral});
        };

        if(target.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.reply({content: "❌ I can't mute someone with a higher role than me.", flags: MessageFlags.Ephemeral});
        };

        if(!target.moderatable) {
            return interaction.reply({content: "❌ This member can't be muted.", flags: MessageFlags.Ephemeral});
        };

        try {
            await target.timeout(duration, reason);
            return interaction.reply({content: "✅ Member muted.", flags: MessageFlags.Ephemeral});
        } catch (error) {
            console.error(error);
            return interaction.reply({content: "❌ Failed to mute member. Did you give a valid duration?", flags: MessageFlags.Ephemeral});
        }
    }
}