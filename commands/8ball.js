const { SlashCommandBuilder, EmbedBuilder, MessageFlags, InteractionContextType } = require('discord.js');

const NekoClient = require("nekos.life");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("8ball")
        .setDescription("Let the magic 8 ball answer your question!")
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .addStringOption((option) => 
            option
                .setName("question")
                .setDescription("Your question")
                .setRequired(true)
        ),

    async execute(interaction) {
        const neko = new NekoClient()

        const question = interaction.options.getString("question", true);

        let errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setColor("Red")
            .setTimestamp();

        const res = await neko.eightBall({text: question});
        if(!res.response) {
            errorEmbed.setDescription("There was an error with the API, please try again later.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        const embed = new EmbedBuilder()
            .setTitle("🎱 The magic 8 ball")
            .setDescription(`**Your question:**\n${question}\n\n**Answer:**\n${res.response}`)
            .setColor(0xe410d3)
            .setFooter({text: "Provided by nekos.life"})
            .setTimestamp();

        return interaction.reply({embeds: [embed]});
    }
}