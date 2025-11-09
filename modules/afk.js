const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, "../data/afk.json");

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

function ensureUser(data, userId) {
    if(!data[userId]) {
        data[userId] = null;
    };
};


module.exports = {
    getAfk(userId) {
        const data = load();
        ensureUser(data, userId);
        return data[userId];
    },

    setAfk(userId, message) {
        const data = load();
        ensureUser(data, userId);
        data[userId] = message;
        save(data);
    },

    removeAfk(userId) {
        const data = load();
        ensureUser(data, userId);
        delete data[userId];
        save(data);
    }
}