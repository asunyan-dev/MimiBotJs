const { SlashCommandBuilder, MessageFlags, InteractionContextType } = require('discord.js');
const { getCooldown, setCooldown } = require('../modules/cooldowns');
const { addRep } = require('../modules/exp');
const ms = require("ms");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("reputation")
        .setDescription("Give a reputation point to a user")
        .setContexts(InteractionContextType.Guild, InteractionContextType.PrivateChannel)
        .addUserOption((option) => 
            option.setName("user").setDescription("Target user").setRequired(true)
        ),


    async execute(interaction) {
        const user = interaction.options.getUser("user", true);

        const cooldown = getCooldown(interaction.user.id, "reputation");

        if(Date.now() < cooldown) {
            return interaction.reply({content: `❌ You're on cooldown! You can use /reputation <t:${Math.floor(cooldown / 1000)}:R>.`, flags: MessageFlags.Ephemeral});
        };

        if(user.id === interaction.user.id) {
            return interaction.reply({content: "❌ You can't give a reputation point to yourself!", flags: MessageFlags.Ephemeral});
        };

        addRep(user.id);

        setCooldown(interaction.user.id, "reputation", ms("24 hours"));

        return interaction.reply({content: `✅ Successfully given a reputation point to ${user.displayName}!`});
    }
}