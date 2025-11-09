const { SlashCommandBuilder, ModalBuilder, ComponentType, TextInputStyle, InteractionContextType, MessageFlags } = require('discord.js');

const { getSuggest } = require('../modules/suggestions');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Make a new suggestion for the server")
        .setContexts(InteractionContextType.Guild),

    async execute(interaction) {
        if(!interaction.guild) return;
        const status = getSuggest(interaction.guild.id);

        if(!status.enabled) return interaction.reply({content: "❌ Suggestions are disabled.", flags: MessageFlags.Ephemeral});


        const modal = new ModalBuilder()
            .setCustomId("suggestion")
            .setTitle("New suggestion")
            .addLabelComponents(
                {
                    type: ComponentType.Label,
                    label: "Your suggestion",
                    description: "Fill in all details below.",
                    component: {
                        type: ComponentType.TextInput,
                        custom_id: "text",
                        style: TextInputStyle.Paragraph,
                        placeholder: "Type your suggestion here...",
                        required: true
                    }
                }
            ).toJSON();

        await interaction.showModal(modal);
    }
}