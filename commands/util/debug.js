const Commando = require("discord.js-commando");
const Discord = require("discord.js");
const fs = require("fs");
const Parser = require("rss-parser");
const getHrefs = require("get-hrefs");
const h2p = require("html2plaintext");
const path = require("path");

const configFile = path.join(__dirname, "..", "..", "config.json");

const parser = new Parser();
const config = JSON.parse(fs.readFileSync(configFile));

var client;

module.exports = class DebugCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: "debug",
            group: "util",
            memberName: "debug",
            description: "Debug command.",
            guildOnly: true,
            userPermissions: ["ADMINISTRATOR"],
            clientPermissions: ["MANAGE_CHANNELS", "MANAGE_ROLES"]
        });

        client = this.client;
    }

    async run(message, _) {
        console.log("Debug");
        try {
            var client = this.client;

            var feed = await parser.parseURL(config.feedUrl);
            var article = feed.items[0];
        
            var title = article.title;
            var body = h2p(article['content:encoded']).split("\n").splice(1)[0];
            var img = getHrefs(article['content:encoded'])[0];
            var author = article.creator;
            var link = article.link;
        
            var emb = new Discord.RichEmbed();
            emb.setAuthor("Post by " + author, this.client.user.avatarURL);
            emb.setColor("GREEN");
            emb.setThumbnail(img);
            emb.addField(title, body);
            emb.addField("Original post:", link)
        
            this.client.guilds.forEach(function(guild) {
                console.log(article);
                if (client.provider.get(guild.id, "channel")) {
                    
                    var channel = guild.channels.get(client.provider.get(guild.id, "channel"));
                    var role = guild.roles.get(client.provider.get(guild.id, "role"));
        
                    channel.send(`<@&${role.id}>`, {
                        embed: emb
                    });
                }
            });
        }
        catch(e) {
            console.error(e);
        }
    }
}