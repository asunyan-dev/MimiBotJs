const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/warnings.json");

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
      enabled: false,
      users: {},
    };
    save(data);
  }
}

function ensureUser(data, guildId, userId) {
  if (!data[guildId].users[userId]) {
    data[guildId].users[userId] = [];
    save(data);
  }
}

module.exports = {
  enableWarn(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId].enabled = true;
    save(data);
  },

  getWarningStatus(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId].enabled;
  },

  disableWarn(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId] = {
      enabled: false,
      users: {},
    };
    save(data);
  },

  addWarn(guildId, userId, modId, reason) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);
    const length = data[guildId].users[userId].length;
    data[guildId].users[userId].push({
      id: length + 1,
      mod: modId,
      reason: reason,
    });
    save(data);
  },

  getWarnings(guildId, userId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);
    return data[guildId].users[userId];
  },

  clearWarnings(guildId, userId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);
    data[guildId].users[userId] = [];
    save(data);
  },
};
