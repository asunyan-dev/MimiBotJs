const { SlashCommandBuilder, EmbedBuilder, MessageFlags, InteractionContextType } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("fact")
        .setDescription("Get a random fact")
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel),

    async execute(interaction) {

        try {

            const res = await fetch("https://api.popcat.xyz/v2/fact").catch(() => null);

            if(!res || !res.ok) {
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };

            const data = await res.json().catch(() => null);

            if(!data || data.error) return interaction.reply({content: "❌ Failed to get fact, please try again later.", flags: MessageFlags.Ephemeral});


            const embed = new EmbedBuilder()
                .setTitle("Fact")
                .setDescription(data.message.fact)
                .setColor(0xe410d3)
                .setFooter({text: "Provided by PopCat API"})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});

        } catch (error) {
            console.error(error);
            return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
        }
    }
}