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

var guildCountCache;

if (!fs.existsSync(configFile)) {
    fs.copyFileSync(defaultConfig, configFile);
    console.log(`A config has been generated for you from the default settings.

Please edit the settings in your new "config.json" and then
re-run the bot.`);
    process.exit();
}

const config = JSON.parse(fs.readFileSync(configFile));
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
    console.log(`Logged in as ${client.user.username} (ID: ${client.user.id})\n`);
    // console.log(`Guilds:`);

    // for (var guild of client.guilds) {
    //     console.log(`${guild.name}`);
    // }

    guildCountCache = client.guilds.size;

    client.user.setPresence({
        status: "online",
        game: {
            name: `Serving news to ${client.guilds.size} guild(s)`
        }
    });

    checkRSS();

    setInterval(function() {
        checkRSS();
        if (guildCountCache != client.guilds.size) {
            client.user.setPresence({
                status: "online",
                game: {
                    name: `Serving news to ${guildCountCache} guild(s)`
                }
            });
        }

    }, 1000 * 10 /* 10 seconds */)
});

async function checkRSS() {
    var feed = await parser.parseURL(config.feedUrl);
    var article = feed.items[0];

    var title = article.title;

    if (title == config.lastTitle) {
        console.log("No new articles");
    }

    else {
        console.log("New article")
        postArticle();
        config.lastTitle = title;
        fs.writeFileSync(configFile, JSON.stringify(config, null, 4));
    }
}

async function postArticle() {
    var feed = await parser.parseURL(config.feedUrl);
    var article = feed.items[0];

    var title = article.title;
    var body = h2p(article['content:encoded']).split("\n").splice(1)[0];
    var img = getHrefs(article['content:encoded'])[0];
    var author = article.creator;
    var link = article.link;

    var emb = new Discord.RichEmbed();
    emb.setAuthor("Post by " + author, client.user.avatarURL);
    emb.setColor("GREEN");
    emb.setThumbnail(img);
    emb.addField(title, body);
    emb.addField("Original post:", link)

    client.guilds.forEach(function(guild) {
        if (client.provider.get(guild.id, "channel")) {
            var channel = guild.channels.get(client.provider.get(guild.id, "channel"));
            var role = guild.roles.get(client.provider.get(guild.id, "role"));

            channel.send(`<@&${role.id}>`, {
                embed: emb
            });
        }
    });
};

rss.run(function(err, _) {
    if (err) {
        console.error(err);
    }
})

client.login(config.token);
