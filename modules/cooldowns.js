const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/cooldowns.json");

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

function ensureUser(data, userId) {
  if (!data[userId]) {
    data[userId] = {};
    save(data);
  }
}

function ensureCommand(data, userId, command) {
  if (!data[userId][command]) {
    data[userId][command] = null;
  }
}

function setCooldown(userId, command, amount) {
  const data = load();
  ensureUser(data, userId);
  data[userId][command] = Date.now() + Number(amount);
  save(data);
}

function removeCooldown(userId, command) {
  const data = load();
  ensureUser(data, userId);
  ensureCommand(data, userId, command);
  delete data[userId][command];
  save(data);
}

function getCooldown(userId, command) {
  const data = load();
  ensureUser(data, userId);
  ensureCommand(data, userId, command);
  return data[userId][command];
}

module.exports = { setCooldown, removeCooldown, getCooldown };
