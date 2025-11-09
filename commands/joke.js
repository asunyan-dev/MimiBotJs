const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("joke")
        .setDescription("Get a random joke"),


    async execute(interaction) {
        try {
            const res = await fetch("https://api.popcat.xyz/v2/joke").catch(() => null);

            if(!res || !res.ok) {
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };

            const data = await res.json().catch(() => null);

            if(!data || data.error) {
                return interaction.reply({content: "❌ Failed to get joke, please try again later.", flags: MessageFlags.Ephemeral});
            };

            const embed = new EmbedBuilder()
                .setTitle("Joke")
                .setDescription(data.message.joke)
                .setColor(0xe410d3)
                .setFooter({text: "Provided by PopCat API"})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});
        } catch (err) {
            console.error(err);
            return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
        }
    }
}