const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,

    async execute(client) {
        console.log(`🐈 Meow! I am online as ${client.user.tag}~!`);

        const guilds = client.guilds.cache;

        guilds.forEach((guild) => {
            guild.fetch();
            guild.members.fetch();
        });


        client.user.setPresence({
            activities: [
                {
                    type: ActivityType.Custom,
                    name: "blblblb",
                    state: "🐈 Meow"
                }
            ],
            status: "online"
        });
    }
}