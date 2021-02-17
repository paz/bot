const Discord = require("discord.js");
const { getUserArg, createAvatar } = require("../shared");
const shared = require("../shared");

module.exports = {
  alias: ["levels", "leveledroles"],
  description: "Set/add/remove xp roles",
  usage: "[user id/mention]",
  async execute (
    message,
    args,
    latency,
    commands,
    client,
    prefixes,
    globalPrefix,
    Tags,
    Guilds,
    Members,
    Member,
    Roles
  ) {
    let user;

    if (args > 0) {
      user = getUserArg(message, args);
      if (!user) return message.channel.send("Invalid user");
    } else {
      user = message.author;
    }

    const rolesText = [];
    const roleList = (await shared.roleQuery(message.guild.id));
    roleList.forEach(role => {
      rolesText.push(role.rank + " <@&" + role.role_id + "> " + role.xp + "xp");
    });

    const embed = new Discord.MessageEmbed();
    embed.setTitle("Leveled Roles");
    embed.setThumbnail(createAvatar(message.guild, "server"));
    embed.setDescription(rolesText.join("\n"));
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
