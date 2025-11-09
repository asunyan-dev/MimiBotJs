const { Events, EmbedBuilder } = require('discord.js');
const { getLog } = require('../modules/logs');
const { sendMessage } = require('../modules/sendMessage');


module.exports = {
    name: Events.GuildMemberRemove,


    async execute(member, client) {
        if(member.partial) {
            try {
                await member.fetch();
            } catch (err) {
                console.log(err);
                return;
            };
        };

        const status = getLog(member.guild.id, "joinLeave");

        if(!status.enabled) return;


        const guildId = member.guild.id;
        const channelId = status.channelId;

        const embed = new EmbedBuilder()
            .setTitle("Member left")
            .setThumbnail(member.displayAvatarURL({size: 512}))
            .setColor(0xe410d3)
            .setDescription(`<@${member.id}>\n\nMember since: ${member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown"}`)
            .setFooter({text: `User ID: ${member.id}`})
            .setTimestamp();

        try {
            await sendMessage(client, guildId, channelId, {embeds: [embed]});
        } catch (err) {
            console.log(err);
        }
    }
}