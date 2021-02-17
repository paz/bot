const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["xpr", "xproles"],
  description: "Set/add/remove xp roles",
  usage: "<xp/del> <role id/mention>",
  args: 2,
  permission: "admin",
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
    let value = args.shift().toLowerCase();
    if (value !== "del") value = parseInt(value);
    let target;

    if (!value || (value !== "del" && Math.sign(value) === -1)) return message.channel.send("Invalid value");

    if (message.mentions.roles.size > 0) {
      target = message.mentions.roles.first();
    } else {
      target = args.shift();
      if (!shared.validId(target)) return message.channel.send("Invalid role ID");
      target = message.guild.roles.resolve(target);
      if (!target) return message.channel.send("Invalid role");
    }

    if (value === "del") {
      await Roles.destroy({
        where: {
          role_id: target.id,
          guild_id: message.guild.id
        }
      });
    } else {
      // Role = (await Roles.findOrCreate({ where: { role_id: target.id, guild_id: message.guild.id } }))[0].dataValues;
      await Roles.findOrCreate({ where: { role_id: target.id, guild_id: message.guild.id } });
      await Roles.update({
        xp: value
      },
      {
        where: {
          role_id: target.id,
          guild_id: message.guild.id
        }
      });
    }

    const newRole = (await shared.roleQuery(message.guild.id, target.id))[0];

    const embed = new Discord.MessageEmbed();
    embed.setDescription("Set <@&" + target.id + "> as level " + newRole.rank + " with " + value + "xp");
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
