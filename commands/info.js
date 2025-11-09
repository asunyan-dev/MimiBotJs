const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Get info on the bot"),


    async execute(interaction) {
        const client = interaction.client;


        const embed = new EmbedBuilder()
            .setTitle(`${client.user.tag} - Info`)
            .setThumbnail(client.user.avatarURL({size: 512}))
            .setColor(0xe410d3)
            .setDescription("[Bot TOS](https://github.com/asunyan-dev/MimiBotJs/blob/main/TERMS.md)\n[Privacy Policy](https://github.com/asunyan-dev/MimiBotJs/blob/main/PRIVACY.md)\n[Github](https://github.com/asunyan-dev/MimiBotJs)\nSupport server: https://mimicord.com/")
            .setTimestamp();

        return interaction.reply({embeds: [embed]});
    }
}