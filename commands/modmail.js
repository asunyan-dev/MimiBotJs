const { SlashCommandBuilder, ModalBuilder, ComponentType, TextInputStyle, MessageFlags, InteractionContextType } = require('discord.js')
const { getModMail } = require('../modules/modmail');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("modmail")
        .setDescription("Send a message to server staff")
        .setContexts(InteractionContextType.Guild),

    async execute(interaction) {
        if(!interaction.guild) return;


        const status = getModMail(interaction.guild.id);

        if(!status.enabled) return interaction.reply({content: "❌ Modmail is disabled for this server.", flags: MessageFlags.Ephemeral});


        const modal = new ModalBuilder()
            .setCustomId("modmail")
            .setTitle("New Message to Staff")
            .addLabelComponents(
                {
                    type: ComponentType.Label,
                    label: "Your message",
                    component: {
                        type: ComponentType.TextInput,
                        custom_id: "message",
                        style: TextInputStyle.Paragraph,
                        placeholder: "Type your message here...",
                        required: true
                    }
                }
            ).toJSON();

        await interaction.showModal(modal);
    }
}