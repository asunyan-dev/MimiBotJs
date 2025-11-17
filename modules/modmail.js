const fs = require('fs');
const path = require('path');


const file = path.join(__dirname, "../data/modmail.json");


if(!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
};


function load() {
    let data = JSON.parse(fs.readFileSync(file, "utf8"));
    return data;
};


function save(data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};


function ensureGuild(data, guildId) {
    if(!data[guildId]) {
        data[guildId] = {
            enabled: false,
            channelId: null
        };
    };
};



function enableModmail(guildId, channelId) {
    const data = load();
    data[guildId] = {
        enabled: true,
        channelId: channelId
    };
    save(data);
};


function editModmailChannel(guildId, channelId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId].channelId = channelId;
    save(data);
};


function disableModmail(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    delete data[guildId];
    save(data);
};


function getModmail(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId];
};


module.exports = { enableModmail, editModmailChannel, disableModmail, getModmail };