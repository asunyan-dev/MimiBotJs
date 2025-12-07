const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "../data/customRole.json");

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
      referenceRole: null,
      users: {},
    };
    save(data);
  }
}

function ensureUser(data, guildId, userId) {
  if (!data[guildId].users[userId]) {
    data[guildId].users[userId] = null;
  }
}

module.exports = {
  enableRoles(guildId, referenceRoleId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId].enabled = true;
    data[guildId].referenceRole = referenceRoleId;
    save(data);
  },

  editReference(guildId, referenceRoleId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId].referenceRole = referenceRoleId;
    save(data);
  },

  disableRoles(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    data[guildId] = {
      enabled: false,
      referenceRole: null,
      users: {},
    };
    save(data);
  },

  getRoleStatus(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId].enabled;
  },

  getRoles(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId].users;
  },

  getReference(guildId) {
    const data = load();
    ensureGuild(data, guildId);
    return data[guildId].referenceRole;
  },

  mkRole(guildId, userId, roleId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);

    data[guildId].users[userId] = roleId;
    save(data);
  },

  removeRole(guildId, userId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);

    delete data[guildId].users[userId];
    save(data);
  },

  getRole(guildId, userId) {
    const data = load();
    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);

    return data[guildId].users[userId];
  },
};
