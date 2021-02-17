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
    if (args.length > 0) {
      target = await shared.getUserArg(message, args);
      if (!target || target.bot) return message.channel.send("Invalid target");
      targetName = "<@" + target.id + "> is";
    } else {
      target = message.author;
      targetName = "You are";
    }
    const embed = new Discord.MessageEmbed();
    const targetMember = (await shared.leaderboardQuery(message.guild.id, target.id))[0];
    let level = 0;
    const roles = await shared.roleQuery(message.guild.id);
    roles.forEach(role => {
      if (targetMember.xp >= role.xp) {
        level = role.rank;
      }
    });
    embed.setAuthor(target.username + " • Rank #" + targetMember.rank, shared.createAvatar(target, "user"));
    embed.setDescription(targetName + " level ``" + level + "`` with ``" + targetMember.xp + "`` xp");
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
