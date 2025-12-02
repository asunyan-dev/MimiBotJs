const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');

const logs = require('../modules/logs');
const { sendMessage } = require('../modules/sendMessage');

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

        let errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setColor("Red")
            .setTimestamp();

        let successEmbed = new EmbedBuilder()
            .setTitle("✅ Success!")
            .setColor("Green")
            .setTimestamp();

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            errorEmbed.setDescription("I am missing permissions: `KICK_MEMBERS`.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const user = interaction.options.getUser("user", true);
        let reason = interaction.options.getString("reason", false);
        if(!reason) reason = "No reason provided.";

        const target = await interaction.guild.members.fetch(user.id).catch(() => null);

        if(!target) {
            errorEmbed.setDescription("Member not found in the server.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };


        if(target.roles.highest.position >= member.roles.highest.position) {
            errorEmbed.setDescription("You can't kick someone with a higher role than you.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        if(target.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            errorEmbed.setDescription("I can't kick someone with a higher role than me.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };


        if(!target.kickable) {
            errorEmbed.setDescription("This member can't be kicked.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        try {
            await target.kick({reason: reason});
            successEmbed.setDescription("Member kicked.")
            interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
        } catch (err) {
            console.error(err);
            errorEmbed.setDescription("Failed to kick member. Do I have the right permissions?");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        const status = logs.getLog(interaction.guild.id, "memberEvents");

        if(!status.enabled) return;


        const logEmbed = new EmbedBuilder()
            .setTitle("Member kicked")
            .setDescription(`<@${target.id}>\n\nKicked by: <@${member.id}>\n\nReason: ${reason}`)
            .setThumbnail(target.displayAvatarURL({size: 512}))
            .setColor(0xe410d3)
            .setFooter({text: `User ID: ${target.id}`})
            .setTimestamp();

        try {
            sendMessage(interaction.client, interaction.guild.id, status.channelId, {embeds: [logEmbed]});
        } catch (error) {
            console.log(error);
        };
        
    }
}