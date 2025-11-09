const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');

const { getWarningStatus, addWarn } = require('../modules/warning');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a member")
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => 
            option.setName("user").setDescription("The member to warn").setRequired(true)
        )
        .addStringOption((option) => 
            option.setName("reason").setDescription("Reason for the warn").setRequired(true)
        ),

    async execute(interaction) {
        if(!interaction.guild) return;

        const status = getWarningStatus(interaction.guild.id);
        if(!status.enabled) return interaction.reply({content: "❌ Warnings are disabled.", flags: MessageFlags.Ephemeral});

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({content: "❌ I am missing permissions: `MODERATE_MEMBERS`.", flags: MessageFlags.Ephemeral});


        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const user = interaction.options.getUser("user", true);
        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if(!target) return interaction.reply({content: "❌ Member not found.", flags: MessageFlags.Ephemeral});

        const reason = interaction.options.getString("reason", true);

        addWarn(interaction.guild.id, target.id, member.id, reason);

        const embed = new EmbedBuilder()
            .setTitle(`You were warned in ${interaction.guild.name}!`)
            .setColor(0xe410d3)
            .setDescription(`**With reason:**\n${reason}`)
            .setThumbnail(interaction.guild.iconURL({size: 512}))
            .setFooter({text: "This message was sent by server staff"})
            .setTimestamp();

        try {
            await target.send({embeds: [embed]});
            return interaction.reply({content: "✅ Member warned.", flags: MessageFlags.Ephemeral});
        } catch (err) {
            console.error(err);
            return interaction.reply({content: "✅ Member warned.\n⚠️ Failed to DM member. They have DMs closed.", flags: MessageFlags.Ephemeral});
        }
    }
}