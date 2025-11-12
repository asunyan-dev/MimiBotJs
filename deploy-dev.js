const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const config = require('./config.json');


const token = config.token_dev;
const clientId = config.client_dev;
const guildId = config.guild_id_dev;

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
};


const rest = new REST({version: "10"}).setToken(token);

(async () => {
    try {
        console.log("Refreshing commands...");

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log("Refreshed dev commands")
    } catch (err) {
        console.error(err);
    }
})()