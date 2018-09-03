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
        var msg;
        try {
            msg = await message.reply("Giving you the role...");
            var member = await message.guild.fetchMember(message.author);

            member.addRole(this.client.provider.get(message.guild, "role"));
            msg.edit(`You now have the role, <@${message.author.id}>!`);
        }
        catch(e) {
            console.error(e);
            msg.edit(`An error has occurred while running this command.\n
\`${e}\`\n
You shouldn't get this error. Please contact **bennyman123abc#1417** to resolve the issue.`);
        }
    }
}