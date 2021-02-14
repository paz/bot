const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["xpa", "xpadmin"],
  description: "Set/add/remove xp from users",
  usage: "<set/add/del> <user id / @mention> <value>",
  args: 3,
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
    Member
  ) {
    const action = args.shift().toLowerCase();
    let target = args.shift().toLowerCase();
    const value = parseInt(args.shift().toLowerCase());
    let newValue;

    target = await shared.getUserArg(message, [target]);

    if (!target) return message.channel.send("Invalid target");

    if (!value || Math.sign(value) === -1) return message.channel.send("Invalid value");

    const targetMember = (await Members.findOrCreate({ where: { user_id: target.id, guild_id: message.guild.id } }))[0].dataValues;

    if (action === "set") {
      newValue = value;
    } else if (action === "add") {
      newValue = (targetMember.xp + value);
    } else if (action === "del") {
      newValue = (targetMember.xp - value);
    } else {
      return message.channel.send("Invalid action");
    }

    if (Math.sign(newValue) === -1) newValue = 0;

    Members.update({
      xp: newValue
    }, {
      where: {
        user_id: target.id,
        guild_id: message.guild.id
      }
    });

    const embed = new Discord.MessageEmbed();
    embed.setDescription("<@" + target.id + ">'s xp has been set to ``" + newValue + "``");
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
