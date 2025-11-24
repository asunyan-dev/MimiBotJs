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

        const statuses = [
            { type: ActivityType.Custom, name: "Status 1", state: "ℹ️ Latest update info: /changelog get" },
            { type: ActivityType.Custom, name: "Status 2", state: "ℹ️ Info: /info" },
            { type: ActivityType.Custom, name: "Status 3", state: `🌸 In ${client.guilds.cache.size.toString()} servers` },
            { type: ActivityType.Custom, name: "Status 4", state: "🌸 Support server: mimicord.com" }
        ];


        function setRandomStatus() {
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            client.user.setPresence({
                activities: [randomStatus],
                status: "online"
            });
        };

        setRandomStatus();

        setInterval(setRandomStatus, 600_000);
    }
}