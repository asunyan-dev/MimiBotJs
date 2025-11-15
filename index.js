const { Client, Collection, GatewayIntentBits, Partials, Events, ModalBuilder, ComponentType, TextInputStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const { enableWelcome, editWelcome, getWelcome } = require('./modules/welcoming');
const { sendMessage } = require('./modules/sendMessage');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.GuildMember,
        Partials.User
    ]
});


client.cooldowns = new Collection();
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.existsSync(commandsPath) ? fs.readdirSync(commandsPath).filter(file => file.endsWith(".js")) : [];

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(`[WARNING] The command at ${file} is missing "data" or "execute."`);
    };
};


const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));

    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    };
};





// welcome modals



client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isModalSubmit()) return;

    let successEmbed = new EmbedBuilder()
        .setTitle("✅ Success!")
        .setColor("Green")
        .setTimestamp();

    if(interaction.customId.startsWith("enable_welcome_")) {
        const guildId = interaction.customId.replace("enable_welcome_", "");
        const pingValues = interaction.fields.getStringSelectValues("ping");
        const channelValues = interaction.fields.getSelectedChannels("channel", true);
        const message = interaction.fields.getTextInputValue("message");

        const ping = pingValues[0];
        const channel = channelValues.first();


        enableWelcome(guildId, channel.id, ping, message);

        successEmbed.setDescription("Welcome messages enabled!");
        return interaction.reply({embeds: [successEmbed]});
    };

    if(interaction.customId.startsWith("edit_welcome_")) {
        const guildId = interaction.customId.replace("edit_welcome_", "");
        const pingValues = interaction.fields.getStringSelectValues("ping");
        const channelValues = interaction.fields.getSelectedChannels("channel", false);
        const message = interaction.fields.getTextInputValue("message");

        const status = getWelcome(guildId);

        let ping;
        if(!pingValues.length) {
            if(status.ping) {
                ping = "yes";
            } else {
                ping = "no";
            };
        } else {
            ping = pingValues[0];
        }

        let channel;
        if(!channelValues) {
            channel = status.channelId;
        } else {
            channel = channelValues.first().id;
        };

        let text;
        if(!message) {
            text = status.message;
        } else {
            text = message;
        };

        editWelcome(guildId, channel, ping, text);

        successEmbed.setDescription("Welcome messages edited!");
        return interaction.reply({embeds: [successEmbed]});
        
    }
});


client.on(Events.GuildMemberAdd, async (member) => {
    const status = getWelcome(member.guild.id);

    if(!status.enabled) return;

    let content = "";
    if(status.ping) content = `<@${member.id}>`;

    let msg = status.message;

    msg = msg
        .replace(/{user}/g, `${member}`)
        .replace(/{server}/g, member.guild.name)
        .replace(/{membercount}/g, member.guild.memberCount)
        .replace(/{username}/g, member.user.username)

    const embed = new EmbedBuilder()
        .setTitle(`Welcome to ${member.guild.name}, ${member.displayName}`)
        .setThumbnail(member.avatarURL({size: 512}))
        .setColor(0xe410d3)
        .setDescription(msg)
        .setTimestamp();

    try {
        await sendMessage(client, member.guild.id, status.channelId, {content: content, embeds: [embed]});
    } catch (err) {
        console.log(err);
    }
})


client.login(config.token);