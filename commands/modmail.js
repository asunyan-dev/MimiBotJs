const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags, ModalBuilder, TextInputStyle, ComponentType } = require('discord.js');
const modmail = require('../modules/modmail');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("modmail").setDescription("Send a message to server staff")
        .setContexts(InteractionContextType.Guild),


    async execute(interaction) {
        if(!interaction.guild) return;

        let errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setColor("Red")
            .setTimestamp();

        const status = modmail.getModmail(interaction.guild.id);

        if(!status.enabled) {
            errorEmbed.setDescription("ModMail is not enabled in this server.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };


        const modal = new ModalBuilder()
            .setCustomId("modmail")
            .setTitle("Message to Staff")
            .addLabelComponents(
                {
                    type: ComponentType.Label,
                    label: "Your message",
                    component: {
                        type: ComponentType.TextInput,
                        custom_id: "message",
                        placeholder: "Type your message here...",
                        style: TextInputStyle.Paragraph,
                        required: true
                    }
                }
            ).toJSON();


        await interaction.showModal(modal);
    }
}