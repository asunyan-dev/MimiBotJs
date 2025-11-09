const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const NekoClient = require('nekos.life');


module.exports = {
    data: new SlashCommandBuilder()
        .setName("interact")
        .setDescription("Interact with others")
        .addSubcommand((sub) => 
            sub
                .setName("cuddle")
                .setDescription("Cuddle another user")
                .addUserOption((option) => 
                    option
                        .setName("user")
                        .setDescription("The user to cuddle")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) => 
            sub
                .setName("hug")
                .setDescription("Hug another user")
                .addUserOption((option) => 
                    option
                        .setName("user")
                        .setDescription("The user to hug")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) => 
            sub
                .setName("kiss")
                .setDescription("Kiss another user")
                .addUserOption((option) => 
                    option
                        .setName("user")
                        .setDescription("The user to kiss")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) => 
            sub
                .setName("pat")
                .setDescription("Pat another user")
                .addUserOption((option) => 
                    option
                        .setName("user")
                        .setDescription("The user to pat")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) => 
            sub
                .setName("smug")
                .setDescription("Smug at another user")
                .addUserOption((option) => 
                    option
                        .setName("user")
                        .setDescription("The user to smug at")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user", true);

        const neko = new NekoClient();

        let embed = new EmbedBuilder()
            .setColor(0xe410d3)
            .setFooter({text: "Provided by nekos.life"})
            .setTimestamp();

        if(sub === "cuddle") {
            try {
                const cuddle = await neko.cuddle();

                embed.setTitle(`${interaction.user.displayName} cuddles ${user.displayName}`)
                .setImage(cuddle.url);

                return interaction.reply({embeds: [embed]});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };
        };

        if(sub === "hug") {
            try {
                const hug = await neko.hug();

                embed.setTitle(`${interaction.user.displayName} hugs ${user.displayName}`)
                .setImage(hug.url);

                return interaction.reply({embeds: [embed]});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };
        };


        if(sub === "kiss") {
            try {
                const kiss = await neko.kiss();

                embed.setTitle(`${interaction.user.displayName} kisses ${user.displayName}`)
                .setImage(kiss.url);

                return interaction.reply({embeds: [embed]});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };
        };

        if(sub === "pat") {
            try {
                const pat = await neko.pat();

                embed.setTitle(`${interaction.user.displayName} pats ${user.displayName}`)
                .setImage(pat.url);

                return interaction.reply({embeds: [embed]});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };
        };


        if(sub === "smug") {
            try {
                const smug = await neko.smug();

                embed.setTitle(`${interaction.user.displayName} smugs at ${user.displayName}`)
                .setImage(smug.url);

                return interaction.reply({embeds: [embed]});
            } catch (err) {
                console.error(err);
                return interaction.reply({content: "❌ There was an error with the API, please try again later.", flags: MessageFlags.Ephemeral});
            };
        };
    }
}