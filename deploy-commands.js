const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

const token = config.token;
const clientId = config.client_id;

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("🔃 Refreshing (/) commands...");

    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log("🐈 Meow! (/) commands registered!");
  } catch (error) {
    console.error(error);
  }
})();
