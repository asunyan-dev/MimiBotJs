const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, EmbedBuilder } = require('discord.js');

const { getWarningStatus, addWarn } = require('../modules/warning');

const logs = require('../modules/logs');

const { sendMessage } = require('../modules/sendMessage');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => 
            option.setName("user").setDescription("The member to warn").setRequired(true)
        )
        .addStringOption((option) => 
            option.setName("reason").setDescription("Reason for the warn").setRequired(true)
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

        const status = getWarningStatus(interaction.guild.id);
        if(!status.enabled) {
            errorEmbed.setDescription("Warnings are disabled.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
            errorEmbed.setDescription("I am missing permissions: `MODERATE_MEMBERS`");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        }


        const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
        if(!member) return;

        const user = interaction.options.getUser("user", true);
        const target = await interaction.guild.members.fetch(user.id).catch(() => null);
        if(!target) {
            errorEmbed.setDescription("Member not found.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        if(member.roles.highest.position <= target.roles.highest.position) {
            errorEmbed.setDescription("You can't warn someone with a higher role than you.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        if(target.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            errorEmbed.setDescription("I can't warn someone with a higher role than me.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        if(!target.moderatable) {
            errorEmbed.setDescription("This member can't be warned.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

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
            successEmbed.setDescription("Member warned.");
            interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
        } catch (err) {
            console.error(err);
            successEmbed.setDescription("Member warned!\n⚠️ Failed to DM member. They have DMs closed.");
            interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
        };


        const logStatus = logs.getLog(interaction.guild.id, "memberEvents");

        if(!logStatus.enabled) return;

        const logEmbed = new EmbedBuilder()
            .setTitle("Member Warned")
            .setDescription(`<@${user.id}>\n\nWarned by: <@${interaction.user.id}>\n\nReason: ${reason}`)
            .setThumbnail(target.displayAvatarURL({size: 512}))
            .setColor(0xe410d3)
            .setFooter({text: `User ID: ${user.id}`})
            .setTimestamp();

        
        try {
            sendMessage(interaction.client, interaction.guild.id, logStatus.channelId, {embeds: [logEmbed]});
        } catch (error) {
            console.log(error);
        }
    }
}