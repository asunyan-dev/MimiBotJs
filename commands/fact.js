const { SlashCommandBuilder, EmbedBuilder, MessageFlags, InteractionContextType } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("fact")
        .setDescription("Get a random fact")
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel),

    async execute(interaction) {

        let errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setColor("Red")
            .setTimestamp();

        try {

            const res = await fetch("https://api.popcat.xyz/v2/fact").catch(() => null);

            if(!res || !res.ok) {
                errorEmbed.setDescription("There was an error with the API, please try again later.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };

            const data = await res.json().catch(() => null);

            if(!data || data.error) {
                errorEmbed.setDescription("Failed to get fact, please try again later.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };


            const embed = new EmbedBuilder()
                .setTitle("Fact")
                .setDescription(data.message.fact)
                .setColor(0xe410d3)
                .setFooter({text: "Provided by PopCat API"})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});

        } catch (error) {
            console.error(error);
            errorEmbed.setDescription("There was an error with the API, please try again later.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        }
    }
}