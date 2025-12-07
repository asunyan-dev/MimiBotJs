const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/exp.json");

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
    data[userId] = {
      exp: 0,
      rep: 0,
    };
    save(data);
  }
}

function addExp(userId, amount) {
  const data = load();
  ensureUser(data, userId);
  data[userId].exp += Number(amount);
  save(data);
}

function addRep(userId) {
  const data = load();
  ensureUser(data, userId);
  data[userId].rep += 1;
  save(data);
}

function getExp(userId) {
  const data = load();
  ensureUser(data, userId);
  return data[userId].exp;
}

function getRep(userId) {
  const data = load();
  ensureUser(data, userId);
  return data[userId].rep;
}

function resetExp(userId) {
  const data = load();
  ensureUser(data, userId);
  data[userId].exp = 0;
  save(data);
}

function resetRep(userId) {
  const data = load();
  ensureUser(data, userId);
  data[userId].rep = 0;
  save(data);
}

function getAllExp() {
  const data = load();
  return data;
}

module.exports = {
  addExp,
  addRep,
  getExp,
  getRep,
  resetExp,
  resetRep,
  getAllExp,
};
