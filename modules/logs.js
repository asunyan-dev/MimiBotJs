const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/logs.json");

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
      memberEvents: { enabled: false, channelId: null },
      messageLogs: { enabled: false, channelId: null },
      joinLeave: { enabled: false, channelId: null },
      voiceLogs: { enabled: false, channelId: null },
      guildEvents: { enabled: false, channelId: null },
    };
    save(data);
  }
}

function ensureLog(data, guildId, log) {
  if (!data[guildId][log]) {
    data[guildId][log] = { enabled: false, channelId: null };
    save(data);
  }
}

module.exports = {
  enableLog(guildId, log, channelId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId][log] = { enabled: true, channelId: channelId };
    save(data);
  },

  editLog(guildId, log, channelId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId][log].channelId = channelId;
    save(data);
  },

  disableLog(guildId, log) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId][log] = { enabled: false, channelId: null };
    save(data);
  },

  getLog(guildId, log) {
    const data = load();
    ensureGuild(data, guildId);
    ensureLog(data, guildId, log);
    return data[guildId][log];
  },

  getAllLogs(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId];
  },
};
