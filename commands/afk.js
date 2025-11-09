const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const { setAfk } = require('../modules/afk');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("Set your AFK status")
        .addStringOption((option) => 
            option
                .setName("message")
                .setDescription("Your AFK message")
                .setRequired(false)
        ),

    async execute(interaction) {
        let message = interaction.options.getString("message", false);
        if(!message) message = "AFK";

        setAfk(interaction.user.id, message);

        const embed = new EmbedBuilder()
            .setTitle("🐈 Meow! You're now AFK!")
            .setDescription(`Your message:\n${message}`)
            .setColor(0xe410d3)
            .setTimestamp();

        return interaction.reply({embeds: [embed]});
    }
}