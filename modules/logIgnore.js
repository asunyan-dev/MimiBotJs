const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/logIgnore.json");

if (!fs.existsSync(file)) {
  fs.writeFileSync(file, JSON.stringify({}, null, 2));
}

function load() {
  let data = JSON.parse(fs.readFileSync(file, "utf8"));
  return data;
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function ensureGuild(data, guildId) {
  if (!data[guildId]) {
    data[guildId] = {
      users: {},
      channels: {},
    };
    save(data);
  }
}

function ensureUser(data, guildId, userId) {
  if (!data[guildId].users[userId]) {
    data[guildId].users[userId] = false;
  }
}

function ensureChannel(data, guildId, channelId) {
  if (!data[guildId].channels[channelId]) {
    data[guildId].channels[channelId] = false;
  }
}

module.exports = {
  ignoreUser(guildId, userId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);
    data[guildId].users[userId] = true;
    save(data);
  },

  unignoreUser(guildId, userId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);
    delete data[guildId].users[userId];
    save(data);
  },

  ignoreChannel(guildId, channelId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureChannel(data, guildId, channelId);
    data[guildId].channels[channelId] = true;
    save(data);
  },

  unignoreChannel(guildId, channelId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureChannel(data, guildId, channelId);
    delete data[guildId].channels[channelId];
    save(data);
  },

  getUser(guildId, userId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);
    return data[guildId].users[userId];
  },

  getChannel(guildId, channelId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureChannel(data, guildId, channelId);
    return data[guildId].channels[channelId];
  },

  getAllUsers(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId].users;
  },

  getAllChannels(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId].channels;
  },
};
