# MimiBotJs - JS version of MimiBot - Multifunction User/Server Discord bot

## Installation
### Dependencies

- Make sure you have NodeJS installed. If not, install it. Get instructions from [here](https://nodejs.org/en/download).
- Having a code editor is not required but recommended. I personally use [Visual Studio Code](https://code.visualstudio.com/)

### Install the code
Two ways to do it. 

- The first is to download the code as zip and extract it. [Download here](https://github.com/asunyan-dev/MimiBotJs/archive/refs/heads/main.zip)

- Second option is to install using git.
Open a terminal and go to the path where you want the repo to be installed.
```bash
$ cd PATH/TO/FOLDER
```

Then clone the repository:
```bash
$ git clone https://github.com/asunyan-dev/MimiBotJs.git
```

Go to the repo folder:
```bash
$ cd MimiBot
```


### Install code dependencies
Now that you have the code, you need to install its dependencies to make it work.
Assuming you have a terminal opened, and in the folder of the code, run:
```bash
$ npm install
```
This will install all the dependencies needed to run the bot.


## Configure the bot.

1. Get a discord bot token / Configure bot in the dev portal.
 - If you don't have one already, create an application, and get a token. This can be done in the [Discord Developer's Portal](https://discord.com/developers/applications).
 - Make sure your bot has all intents enabled, otherwise it won't work. Here is an example:
![Screenshot of Intents enabled](https://media.discordapp.net/attachments/1436397782607855616/1436397798819106856/image.png?ex=690f7532&is=690e23b2&hm=ea416672b661aa7779aa53e54c44683e377e432f346e88a94272e5ad91558902&=&format=webp&quality=lossless&width=1089&height=504)

2. Configure the code.
 - Open your code editor in the bot's folder. In the root folder, create a file called <ins>config.json</ins>
 Inside this file type this:
 ```json
{
    "token": "YOUR TOKEN HERE",
    "client_id": "YOUR BOT ID HERE",
    "owner_id": "YOUR USER ID HERE"
}
 ```

3. Deploy the commands globally.
Now that the code is configured and that everything is ready, we need to deploy the slash commands so they work when we run the bot.

- You might want to invite your bot to your server as well now.
In the dev portal and in your application settings, go to the OAuth2 section. In the OAuth2 URL Generator, select "bot" and "application.commands". Then in "Bot Permissions", select "Administrator". Then you can copy the URL that is generated at the bottom of the page, and paste it in your browser to invite your application to your server.

- Once it's done, in your terminal (still in the bot's folder), run:
```bash
$ npm run deploy-commands
```

if you see in your terminal:
```bash
🐈 Meow! (/) commands registered!
```
Then you're all good!
You just need to wait a bit, slash commands can take up to one hour to be deployed.


## Run the bot!

Once your commands are deployed (type "/" in your server, and if the commands appear, they are deployed.), you are ready to run the bot!
In your terminal, always in the bot folder, run:
```bash
$ npm run start
```

Wait a bit, and if you see:
```bash
🐈 Meow! I am online as [YourBOT#0000]~!
```
(replace "YourBOT#0000" with your bot name and tag)
Then it's running!

Enjoy the commands!

## Requests / Questions

- If you have any requests or questions, feel free to contact me on Discord: @mimi.mrow or join my [Discord server](https://mimicord.com/).