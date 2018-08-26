const Commando = require("discord.js-commando");
const Discord = require("discord.js");
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
    var article = feed.items[0]

    var title = article.title;
    var body = h2p(article['content:encoded']).split("\n").splice(1)[0];
    var img = getHrefs(article['content:encoded'])[0];
    var author = article.creator;
    var link = article.link;

    var emb = new Discord.RichEmbed();
    emb.setAuthor(author, client.user.avatarURL);
    emb.setColor("GREEN");
    emb.setThumbnail(img);
    emb.setFooter("Powered by GBAtemp News Bot");
    emb.addField(title, body);
    emb.setURL(link);

    for (var guild of client.guilds) {
        if (client.provider.get(guild.id, "channel")) {
            var channel = guild.channels.get(client.provider.get(guild.id, "channel"));
            var role = guild.roles.get(client.provider.get(guild.id, "role"));

            channel.send(`<@&${role.id}>`, {
                embed: emb
            });
        }
    }
})

client.login(config.token);