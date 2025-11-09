const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("coffee")
        .setDescription("Get a random coffee pic"),

    async execute(interaction) {

        try {

            const res = await fetch("https://coffee.alexflipnote.dev/random.json").catch(() => null);

            if(!res || !res.ok) {
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };


            const data = await res.json().catch(() => null);

            if(!data || data.file) return interaction.reply({content: "❌ Failed to get image, please try again later.", flags: MessageFlags.Ephemeral});

            const embed = new EmbedBuilder()
                .setTitle("It's coffee time!")
                .setColor(0xe410d3)
                .setImage(data.file)
                .setFooter({text: "Provided by AlexFlipNote API"})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});

        } catch (err) {
            console.error(err);
            return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
        };
    }
}