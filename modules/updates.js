const fs = require('fs');
const path = require('path');


const file = path.join(__dirname, "../data/updates.json");

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
        }
    };
};



function enableUpdates(guildId, channelId) {
    const data = load();
    data[guildId] = {
        enabled: true,
        channelId: channelId
    };
    save(data);
};


function editUpdates(guildId, channelId) {
    const data = load();
    data[guildId].channelId = channelId;
    save(data);
};


function disableUpdates(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    delete data[guildId];
    save(data);
};

function getUpdatesStatus(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId];
};

function getAll() {
    const data = load();
    return data;
}


module.exports = { enableUpdates, editUpdates, disableUpdates, getUpdatesStatus, getAll }