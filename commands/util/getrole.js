const Commando = require("discord.js-commando");

module.exports = class GetRoleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: "getrole",
            group: "util",
            memberName: "getrole",
            description: "Gives you the guild's notification role.",
            guildOnly: true,
            clientPermissions: ["MANAGE_ROLES"]
        });
    }

    async run(message, _) {
        try {
            var msg = await message.reply("Giving you the role...");
            var member = await message.guild.fetchMember(message.author);

            member.addRole(this.client.provider.get("role"));
            msg.edit(`You now have the role, <@${message.author.id}>!`);
        }
        catch(e) {
            console.error(e);
        }
    }
}