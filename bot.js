const Commando = require("discord.js-commando");
const fs = require("fs");
const sqlite = require("sqlite");
const path = require("path");
const Watcher = require("rss-watcher");
const Parser = require("rss-parser");
const getHrefs = require("get-hrefs");
const h2p = require("html2plaintext");

const configFile = path.join(__dirname, "config.json");
const defaultConfig = path.join(__dirname, "config.default.json");
const dbFile = path.join(__dirname, "db.sqlite");
const commandDir = path.join(__dirname, "commands");

if (!fs.existsSync(configFile)) {
    fs.copyFileSync(defaultConfig, configFile);
    console.log(`A config has been generated for you from the default settings.
                 
                 Please edit the settings in your new "config.json" and then
                 re-run the bot.`);
    process.exit();
}

const config = fs.readFileSync(configFile);
const client = new Commando.CommandoClient({
    owner: config.owners,
    commandPrefix: config.defaultPrefix,
    disableEveryone: true
});
const rss = new Watcher(config.feedUrl);
const parser = new Parser();

client.setProvider(
    sqlite.open(dbFile).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

client.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({
        eval: false
    })
    .registerCommandsIn(commandDir);

client.on("ready", function() {
    client.log(`Logged in as ${client.user.username} (ID: ${client.user.id})\n`);
    client.log("Guilds:");

    for (var guild of client.guilds) {
        console.log(`${guild.name}: ${guild.memberCount} users`);
    }
});

rss.on("new article", async function(_) { /* The _ has to stay because I'm not using the argument provided */
    var feed = parser.parseURL(config.feedUrl);

    // Parse the newest feed item here
})

client.login(config.token);