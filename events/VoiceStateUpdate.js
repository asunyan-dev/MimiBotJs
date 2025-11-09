const { Events, EmbedBuilder } = require('discord.js');

const { getLog } = require('../modules/logs');

const { sendMessage } = require('../modules/sendMessage');

const { getUser, getChannel } = require('../modules/logIgnore');


module.exports = {
    name: Events.VoiceStateUpdate,


    async execute(oldState, newState, client) {

        const guildId = newState.guild.id;

        const status = getLog(guildId, "voiceLogs");
        if(!status.enabled) return;

        const channelId = status.channelId;

        if(!newState.member) return;


        const userStatus = getUser(guildId, newState.member.id);
        if(userStatus) return;

        if(!oldState.channel && newState.channel) {
            const channelStatus = getChannel(guildId, newState.channel.id);
            if(channelStatus) return;

            const embed = new EmbedBuilder()
                .setTitle("Voice joined")
                .setDescription(`<@${newState.member.id}> joined voice channel <#${newState.channel.id}>`)
                .setColor(0xe410d3)
                .setFooter({text: `User ID: ${newState.member.id}`})
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            };
        };


        if(oldState.channel && !newState.channel) {
            const channelStatus = getChannel(oldState.channel.id);
            if(channelStatus) return;

            const embed = new EmbedBuilder()
                .setTitle("Voice left")
                .setDescription(`<@${newState.member.id}> left voice channel <#${oldState.channel.id}>`)
                .setColor(0xe410d3)
                .setFooter({text: `User ID: ${newState.member.id}`})
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            };
        };


        if(oldState.channel !== newState.channel) {
            const oldStatus = getChannel(guildId, oldState.channel.id);
            const newStatus = getChannel(guildId, newState.channel.id);

            if(oldStatus || newStatus) return;

            const embed = new EmbedBuilder()
                .setTitle("Moved voice")
                .setDescription(`<@${newState.member.id}> moved from voice channel <#${oldState.channel.id}> to voice channel <#${newState.channel.id}>`)
                .setColor(0xe410d3)
                .setFooter({text: `User ID: ${newState.member.id}`})
                .setTimestamp();

            try {
                await sendMessage(client, guildId, channelId, {embeds: [embed]});
            } catch (err) {
                console.log(err);
            }
        }
    }
}