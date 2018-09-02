const Commando = require("discord.js-commando");

module.exports = class GetRoleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: "getrole",
            group: "util",
            memberName: "setup",
            description: "Gives you the guild's notification role.",
            guildOnly: true,
            clientPermissions: ["MANAGE_ROLES"]
        });
    }

    async run(message, _) {
        try {
            
        }
        catch(e) {
            console.error(e);
        }
    }
}