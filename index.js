const { Client, Collection, GatewayIntentBits, Partials, Events, ModalBuilder, ComponentType, TextInputStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');


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


client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isButton()) return;

    if(interaction.customId.startsWith("mail_")) {
        const userId = interaction.customId.replace("mail_", "");

        const message = interaction.message;
        const components = message.components.map(row => {
            const actionRow = ActionRowBuilder.from(row);
            actionRow.components = actionRow.components.map(button => {
                if(button.data.custom_id === interaction.customId) {
                    return ButtonBuilder.from(button).setDisabled(true);
                };
                return button;
            });
            return actionRow;
        });

        await interaction.update({components: components});

        const modal = new ModalBuilder()
            .setCustomId(`mail_reply_${userId}`)
            .setTitle("New reply")
            .addLabelComponents(
                {
                    type: ComponentType.Label,
                    label: "Your reply",
                    component: {
                        type: ComponentType.TextInput,
                        custom_id: "message",
                        style: TextInputStyle.Paragraph,
                        placeholder: "Type your reply here...",
                        required: true
                    }
                }
            ).toJSON();

        await interaction.showModal(modal);
    };

    if(interaction.customId.startsWith("reply_")) {
        const userId = interaction.customId.replace("reply_", "");

        const message = interaction.message;
        const components = message.components.map(row => {
            const actionRow = ActionRowBuilder.from(row);
            actionRow.components = actionRow.components.map(button => {
                if(button.data.custom_id === interaction.customId) {
                    return ButtonBuilder.from(button).setDisabled(true);
                };
                return button;
            });
            return actionRow;
        });

        await interaction.update({components: components});

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
})


client.login(config.token);