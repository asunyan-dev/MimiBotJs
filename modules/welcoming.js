const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/welcoming.json");

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
      ping: false,
      message: null,
    };
  }
}

function enableWelcome(guildId, channelId, ping, message) {
  const data = load();
  let pingValue;
  if (ping === "yes") {
    pingValue = true;
  } else {
    pingValue = false;
  }

  data[guildId] = {
    enabled: true,
    channelId: channelId,
    ping: pingValue,
    message: message,
  };
  save(data);
}

function editWelcome(guildId, channelId, ping, message) {
  const data = load();
  let pingValue;
  if (ping === "yes") {
    pingValue = true;
  } else {
    pingValue = false;
  }
  data[guildId].ping = pingValue;
  data[guildId].message = message;
  data[guildId].channelId = channelId;
  save(data);
}

function disableWelcome(guildId) {
  const data = load();
  ensureGuild(data, guildId);
  delete data[guildId];
  save(data);
}

function getWelcome(guildId) {
  const data = load();
  ensureGuild(data, guildId);
  return data[guildId];
}

module.exports = { enableWelcome, editWelcome, disableWelcome, getWelcome };
