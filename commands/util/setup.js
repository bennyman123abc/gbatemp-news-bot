const Commando = require("discord.js-commando");

module.exports = class SetupCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: "setup",
            group: "util",
            memberName: "setup",
            description: "Sets the server up for the bot.",
            guildOnly: true,
            userPermissions: ["ADMINISTRATOR"],
            clientPermissions: ["MANAGE_CHANNELS", "MANAGE_ROLES"]
        });
    }

    async run(message, _) {
        var msg = await message.reply("setting up the server. Please wait...");
        var role = await message.guild.createRole({
            name: "GBAtemp News",
            color: "GREEN",
            mentionable: true
        }, "Setting up the server");
        var channel = await message.guild.createChannel("gbatemp-news", "text", [{
            id: message.guild.id,
            deny: ['SEND_MESSAGES'],
            allow: ['ADD_REACTIONS']
        }, {
            id: role.id,
            allow: ['SEND_MESSAGES']
        }], "Setting up the server");

        this.client.provider.set(message.guild.id, "role", role.id);
        this.client.provider.set(message.guild.id, "channel", channel.id);

        msg.edit("Finished setting up the server!");
    }
}