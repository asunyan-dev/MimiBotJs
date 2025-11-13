const { SlashCommandBuilder, InteractionContextType, EmbedBuilder, MessageFlags } = require('discord.js');
const { getExp, getRep } = require('../modules/exp');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("See your profile or a user's.")
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .addUserOption((option) => 
            option.setName("user").setDescription("Target user").setRequired(false)
        ),


    async execute(interaction) {
        let user = interaction.options.getUser("user", false);
        if(!user) user = interaction.user;

        const userXP = getExp(user.id);
        const userRep = getRep(user.id);

        const embed = new EmbedBuilder()
            .setTitle(user.displayName + "'s profile")
            .setThumbnail(user.avatarURL({size: 512}))
            .setColor(0xe410d3)
            .setDescription(`**EXP:** \`${userXP.toLocaleString()}\`\n\n**Reputation points:** \`${userRep.toLocaleString()}\``)
            .setTimestamp();


        return interaction.reply({embeds: [embed]});
    }
}