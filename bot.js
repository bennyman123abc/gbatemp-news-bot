const Commando = require("discord.js-commando");
const fs = require("fs");
const sqlite = require("sqlite");
const path = require("path");

const configFile = path.join(__dirname, "config.json");
const defaultConfig = path.join(__dirname, "config.default.json");
const dbFile = path.join(__dirname, "db.sqlite");

if (!fs.existsSync(configFile)) {
    fs.copyFileSync(defaultConfig, configFile);
    console.log(`A config has been generated for you from the default settings.
                 
                 Please edit the settings in your new "config.json" and then
                 re-run the bot.`);
    process.exit();
}

const config = fs.readFileSync(configFile);
const Client = new Commando.Client({
    owner: config.owner
});

client.setProvider(
    sqlite.open(dbFile).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

client.login(config.token);