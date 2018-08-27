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

const config = JSON.parse(fs.readFileSync(configFile)); /* The configuration file. */

const client = new Commando.CommandoClient({
    owner: config.owners,
    commandPrefix: config.defaultPrefix,
    disableEveryone: true
});

const rss = new Watcher(config.feedUrl), parser = new Parser(); /* Initalize the watcher and the parser. */

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

// Fired when the client is ready.
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag} (ID: ${client.user.id})\n`); /* Display that logging in was successful. */
    console.log(`Guilds: ${client.guilds.array().join(",\n")}`);

    client.user /* Update the presence. */
        .setPresence({
            status: "online",
            game: {
                name: `Serving news to ${client.guilds.size} guild(s)`
            }
        });
});

rss.on("new article", async (_) => { /* The _ has to stay because I'm not using the argument provided */
    console.log("New article") /* A new article was recieved. */
    var feed = parser.parseURL(config.feedUrl); /* Parse the URL.  */
    var article = feed.items[0]; /* Obtain the article. */

    var title = article.title, body = h2p(article['content:encoded']).split("\n").splice(1)[0], img = getHrefs(article['content:encoded'])[0], author = article.creator, link = article.link, emb = new Discord.RichEmbed();
    
    emb.setAuthor("Post by " + author, client.user.avatarURL)
        .setColor("GREEN")
        .setThumbnail(img)
        .addField(title, body)
        .addField("Original post:", link);

    client.guilds.forEach((guild) => {
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
