const { SlashCommandBuilder, InteractionContextType, PermissionFlagsBits, MessageFlags, ModalBuilder, ComponentType, TextInputStyle, EmbedBuilder } = require('discord.js');

const { getWarningStatus, getWarnings } = require('../modules/warning');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("See the warnings for a member")
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption((option) => 
            option.setName("user").setDescription("Member to see warnings for").setRequired(false)
        ),


    async execute(interaction) {
        if(!interaction.guild) return;

        let errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setColor("Red")
            .setTimestamp();

        const status = getWarningStatus(interaction.guild.id);

        if(!status.enabled) {
            errorEmbed.setDescription("Warnings are disabled for this server.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        const user = interaction.options.getUser("user", true);

        const warnings = getWarnings(interaction.guild.id, user.id);

        if(warnings.length === 0) {
            errorEmbed.setDescription("This member has no warnings.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };


        const modal = new ModalBuilder()
            .setCustomId(`warnings_${user.id}`)
            .setTitle("Case to see")
            .addTextDisplayComponents(
                {
                    type: ComponentType.TextDisplay,
                    content: `We found ${warnings.length} cases. Please type in the text input field below the number of the case you want to see. Example: \`13\` will show you case n°13.`
                }
            )
            .addLabelComponents(
                {
                    type: ComponentType.Label,
                    label: "Number of the case",
                    component: {
                        type: ComponentType.TextInput,
                        custom_id: "case",
                        style: TextInputStyle.Short,
                        placeholder: "Number. Example: 6",
                        required: true
                    }
                }
            ).toJSON();

        await interaction.showModal(modal);
    }
}