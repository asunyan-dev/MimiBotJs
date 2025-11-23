const { Client, Collection, GatewayIntentBits, Partials, Events, ModalBuilder, ComponentType, TextInputStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const { enableWelcome, editWelcome, getWelcome } = require('./modules/welcoming');
const { sendMessage } = require('./modules/sendMessage');
const modmail = require('./modules/modmail');


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

// bug report modal


client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isModalSubmit()) return;

    if(interaction.customId === "bug_report") {
        const message = interaction.fields.getTextInputValue("message");

        const embed = new EmbedBuilder()
            .setTitle("New bug reported")
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL({size: 128})})
            .setColor(0xe410d3)
            .setDescription(message)
            .setTimestamp();

        let errorEmbed = new EmbedBuilder()
            .setTitle("❌ Error")
            .setColor("Red")
            .setTimestamp();

        let successEmbed = new EmbedBuilder()
            .setTitle("✅ Success!")
            .setColor("Green")
            .setTimestamp();


        try {
            await sendMessage(client, config.mimicord, config.reports_channel, {embeds: [embed]});
            successEmbed.setDescription("Report sent!")
            return interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
        } catch (error) {
            console.log(error);
            errorEmbed.setDescription("Error while sending report.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };
    }
})



// modmail modals


client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isModalSubmit()) return;

    let errorEmbed = new EmbedBuilder()
        .setTitle("❌ Error")
        .setColor("Red")
        .setTimestamp();

    let successEmbed = new EmbedBuilder()
        .setTitle("✅ Success!")
        .setColor("Green")
        .setTimestamp();


    if(interaction.customId === "modmail") {
        const message = interaction.fields.getTextInputValue("message");
        const status = modmail.getModmail(interaction.guild.id);

        const channelId = status.channelId;

        const embed = new EmbedBuilder()
            .setTitle(`New message from ${interaction.user.username}`)
            .setThumbnail(interaction.user.displayAvatarURL({size: 512}))
            .setDescription(message)
            .setColor(0xe410d3)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`modmail_reply_${interaction.user.id}`)
                .setLabel("Reply")
                .setStyle(ButtonStyle.Primary)
        ).toJSON();

        try {
            await sendMessage(client, interaction.guild.id, channelId, {embeds: [embed], components: [row]});
            successEmbed.setDescription("Message sent.")
            return interaction.reply({embeds: [successEmbed], flags: MessageFlags.Ephemeral});
        } catch (error) {
            console.log(error);
            errorEmbed.setDescription("Failed to send message. Please try again later.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };
    };

    if(interaction.customId.startsWith("modmail_reply_")) {
        const userId = interaction.customId.replace("modmail_reply_", "");

        const message = interaction.fields.getTextInputValue("message");

        const embed = new EmbedBuilder()
            .setTitle(`Reply from ${interaction.guild.name}'s Staff`)
            .setColor(0xe410d3)
            .setThumbnail(interaction.guild.iconURL({size: 512}))
            .setDescription(message)
            .setTimestamp();

        const user = await interaction.guild.members.fetch(userId).catch(() => null);
        if(!user) {
            errorEmbed.setDescription("Member not found.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`user_reply_${interaction.guild.id}`)
                .setLabel("Reply")
                .setStyle(ButtonStyle.Primary)
        ).toJSON();

        try {
            await user.send({embeds: [embed], components: [row]});
            successEmbed.setDescription("Reply sent.")
            return interaction.reply({embeds: [successEmbed]});
        } catch (error) {
            console.log(error);
            errorEmbed.setDescription("Failed to send reply. User probably has DMs closed.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };
    };

    if(interaction.customId.startsWith("user_reply_")) {
        const guildId = interaction.customId.replace("user_reply_", "");

        const status = modmail.getModmail(guildId);

        const message = interaction.fields.getTextInputValue("message");

        const embed = new EmbedBuilder()
            .setTitle(`New reply from ${interaction.user.username}`)
            .setColor(0xe410d3)
            .setDescription(message)
            .setThumbnail(interaction.user.displayAvatarURL({size: 512}))
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`modmail_reply_${interaction.user.id}`)
                .setLabel("Reply")
                .setStyle(ButtonStyle.Primary)
        ).toJSON();

        try {
            await sendMessage(client, guildId, status.channelId, {embeds: [embed], components: [row]});
            successEmbed.setDescription("Reply sent.")
            return interaction.reply({embeds: [successEmbed]});
        } catch (error) {
            console.log(error);
            errorEmbed.setDescription("Failed to send reply, please try again later.");
            return interaction.reply({embeds: [errorEmbed]});
        }
    }
});


// modmail buttons


client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isButton()) return;

    let errorEmbed = new EmbedBuilder()
        .setTitle("❌ Error")
        .setColor("Red")
        .setTimestamp();

    let successEmbed = new EmbedBuilder()
        .setTitle("✅ Success!")
        .setColor("Green")
        .setTimestamp();

    if(interaction.customId.startsWith("modmail_reply_")) {
        const userId = interaction.customId.replace("modmail_reply_", "");
        const user = await interaction.guild.members.fetch(userId).catch(() => null);
        if(!user) {
            errorEmbed.setDescription("Member not found.");
            return interaction.reply({embeds: [errorEmbed], flags: MessageFlags.Ephemeral});
        };

        const modal = new ModalBuilder()
            .setCustomId(`modmail_reply_${userId}`)
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
            ).toJSON()

        await interaction.showModal(modal);
    };

    if(interaction.customId.startsWith("user_reply_")) {
        const guildId = interaction.customId.replace("user_reply_", "");

        const modal = new ModalBuilder()
            .setCustomId(`user_reply_${guildId}`)
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
    }
})


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


client.login(config.token_dev);