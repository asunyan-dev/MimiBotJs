const fs = require('fs');
const path = require('path');


const file = path.join(__dirname, "../data/changelog.json");

if(!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([], null, 2));
};


function load() {
    let data = JSON.parse(fs.readFileSync(file, "utf8"));
    return data;
};

function save(data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

module.exports = {
    addChange(version, details) {
        const data = load();
        data.push(
            { version: version, details: details }
        );

        save(data);
    },

    getChange() {
        const data = load();
        return data;
    }
}