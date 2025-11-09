module.exports = {
    async sendMessage(client, guildId, channelId, data) {
        const guild = await client.guilds.fetch(guildId);

        if(!guild) throw new Error("Guild not found");

        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if(!channel) throw new Error("Channel not found");

        if(!channel.isSendable()) throw new Error("Can't send message in this channel");

        return await channel.send(data);
    }
}