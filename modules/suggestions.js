const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/suggestions.json");

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
      channelId: null,
    };
  }
}

module.exports = {
  enableSuggestions(guildId, channelId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId] = {
      enabled: true,
      channelId: channelId,
    };
    save(data);
  },

  editChannel(guildId, channelId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId].channelId = channelId;
    save(data);
  },

  disableSuggestions(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    delete data[guildId];
    save(data);
  },

  getSuggest(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId];
  },
};
