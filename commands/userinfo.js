const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Get info on a server member")
        .setContexts(InteractionContextType.Guild)
        .addUserOption((option) => 
            option.setName("user").setDescription("User to check info for").setRequired(true)
        ),

    async execute(interaction) {
        if(!interaction.guild) return;

        const user = interaction.options.getUser("user", true);

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if(!member) return interaction.reply({content: "❌ Member not found.", flags: MessageFlags.Ephemeral});


        const embed = new EmbedBuilder()
            .setTitle(member.user.username)
            .setDescription(`**Display Name:** ${member.displayName}\n\n**Roles:**\n${member.roles.cache.size > 1 ? member.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `<@&${r.id}>`).join(", ") : "N/A"}`)
            .setThumbnail(member.displayAvatarURL({size: 512}))
            .setColor(member.displayColor ? member.displayColor : 0xe410d3)
            .setImage(member.banner ? member.bannerURL({size: 1024}) : null)
            .addFields(
                {name: "🆔 User ID", value: member.id, inline: false},
                {name: "📅 Account created", value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: false},
                {name: "📩 Joined server", value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>` : "Unknown", inline: false}
            );

        return interaction.reply({embeds: [embed]});  
    }
}