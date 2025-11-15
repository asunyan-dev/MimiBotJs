const { SlashCommandBuilder, EmbedBuilder, MessageFlags, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("character")
        .setDescription("Get info on an anime character")
        .setContexts(InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .addStringOption((option) => 
            option
                .setName("query")
                .setDescription("The character to search for")
                .setRequired(true)
        ),

    async execute(interaction) {
        const query = interaction.options.getString("query", true);

        let errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setColor("Red")
            .setTimestamp();

        try {

            const res = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=1&fields=voices,anime,manga`).catch(() => null);

            if(!res || !res.ok) {
                errorEmbed.setDescription("There was an error with the API, please try again later.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };

            const data = await res.json().catch(() => null);

            if(!data) {
                errorEmbed.setDescription("Failed to get character data, please try again later.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };

            if(!data.data || data.data.length === 0) {
                errorEmbed.setDescription("No character found with that name.");
                return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
            };

            const char = data.data[0];

            let voiceActor = "N/A";

            if(char.voices && char.voices.length > 0) {
                const jpVA = char.voices.find(v => v.language === "Japanese");
                if(jpVA) {
                    voiceActor = `[${jpVA.person.name}](${jpVA.person.url}) (${jpVA.language})`;
                } else {
                    const va = char.voices[0];
                    voiceActor = `[${va.person.name}](${va.person.url}) (${va.language})`;
                };
            };


            const embed = new EmbedBuilder()
                .setTitle(char.name)
                .setURL(char.url)
                .setThumbnail(char.images.jpg.image_url)
                .setDescription(char.about ? (char.about.length > 400 ? char.about.substring(0, 400) + "..." : char.about) : "No description available.")
                .setColor(0xe410d3)
                .setFooter({text: "Data from MyAnimeList (Jikan API)"})
                .setTimestamp();

            return interaction.reply({embeds: [embed]});

        }   catch (err) {
            console.error(err);
            errorEmbed.setDescription("There was an error with the API, please try again later.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        }
    }
}