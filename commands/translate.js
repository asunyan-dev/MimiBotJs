const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

const languages = [
    { "name": "English", "code": "en" },
    { "name": "Spanish", "code": "es" },
    { "name": "French", "code": "fr" },
    { "name": "German", "code": "de" },
    { "name": "Italian", "code": "it" },
    { "name": "Portuguese", "code": "pt" },
    { "name": "Russian", "code": "ru" },
    { "name": "Japanese", "code": "ja" },
    { "name": "Korean", "code": "ko" },
    { "name": "Chinese (Simplified)", "code": "zh-cn" },
    { "name": "Chinese (Traditional)", "code": "zh-tw" },
    { "name": "Arabic", "code": "ar" },
    { "name": "Hindi", "code": "hi" },
    { "name": "Turkish", "code": "tr" },
    { "name": "Dutch", "code": "nl" },
    { "name": "Greek", "code": "el" },
    { "name": "Swedish", "code": "sv" },
    { "name": "Polish", "code": "pl" },
    { "name": "Filipino", "code": "tl" }
];


module.exports = {
    data: new SlashCommandBuilder()
        .setName("translate")
        .setDescription("Translate your text to another language")
        .addStringOption((option) => 
            option.setName("text").setDescription("The text to translate").setRequired(true)
        )
        .addStringOption((option) => 
            option.setName("to").setDescription("The language to translate to").setRequired(true)
            .addChoices(
                ...languages.map((lang) => ({
                    name: lang.name,
                    value: lang.code
                }))
            )
        ),

    async execute(interaction) {
        const text = interaction.options.getString("text", true);
        const to = interaction.options.getString("to", true);

        try {

            const res = await fetch(`https://api.popcat.xyz/v2/translate?to=${to}&text=${encodeURIComponent(text)}`).catch(() => null);


            if(!res || !res.ok) {
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };

            const data = await res.json().catch(() => null);

            if(!data || data.error) {
                return interaction.reply({content: "❌ Failed to get translation, please try again later.", flags: MessageFlags.Ephemeral});
            };


            const embed = new EmbedBuilder()
                .setTitle("Translation")
                .setDescription(`**Original text:**\n${text}\n\n**Translated to** \`${to}\`**:**\n${data.message.translated}`)
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