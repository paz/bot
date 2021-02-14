const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["xp", "exp", "rank", "level"],
  description: "See your XP & level in the server",
  usage: "[user id / @mention]",
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
    let target;
    let targetName;
    let xp;
    let targetMember;
    if (args.length > 0) {
      target = await shared.getUserArg(message, args);
      if (!target || target.bot) return message.channel.send("Invalid target");
      targetMember = (await Members.findOrCreate({ where: { user_id: target.id, guild_id: message.guild.id } }))[0].dataValues;
      targetName = "<@" + target.id + "> has";
      xp = targetMember.xp;
    } else {
      targetMember = Member;
      target = message.author;
      targetName = "You have";
      xp = targetMember.xp;
    }
    const level = shared.calculateLevel(xp);
    const embed = new Discord.MessageEmbed();
    embed.setAuthor(target.username, shared.createAvatar(target, "user"));
    embed.setDescription(targetName + " ``" + xp + "`` xp\n" +
                         targetName + " level ``" + level + "``");
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
