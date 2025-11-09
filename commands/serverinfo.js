const { SlashCommandBuilder, InteractionContextType, EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Get info on the current server")
        .setContexts(InteractionContextType.Guild),


    async execute(interaction) {
        if(!interaction.guild) return;


        const guild = await interaction.guild.fetch();

        const embed = new EmbedBuilder()
            .setTitle(guild.name)
            .setColor(0xe410d3)
            .setThumbnail(guild.icon ? guild.iconURL({size: 512}) : null)
            .setImage(guild.banner ? guild.bannerURL({size: 1024}) : null)
            .addFields(
                {name: "🆔 Server ID:", value: guild.id, inline: false},
                {name: "📅 Created", value: guild.createdTimestamp ? `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>` : "Unknown", inline: false},
                {name: "👑 Owner", value: `<@${guild.ownerId}>`, inline: false},
                {name: "📚 Roles", value: guild.roles.cache.size.toString(), inline: true},
                {name: "#️⃣ Channels", value: guild.channels.cache.size.toString(), inline: true},
                {name: "👱 Member Count", value: guild.memberCount.toString(), inline: true},
                {name: "😀 Emojis", value: guild.emojis.cache.size.toString(), inline: true},
                {name: "🖼️ Stickers", value: guild.stickers.cache.size.toString(), inline: true}
            )
            .setTimestamp();

        return interaction.reply({embeds: [embed]});
    }
}