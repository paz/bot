const Discord = require("discord.js");
const { calculateLevel } = require("../shared");
const shared = require("../shared");

module.exports = {
  alias: ["xptop", "top", "leaderboard"],
  description: "See the top users in the server",
  usage: "[page]",
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
    const embed = new Discord.MessageEmbed();
    const topMembers = await Members.findAll({
      limit: 10,
      order: [["xp", "DESC"]],
      where: { guild_id: message.guild.id }
    });
    let i = 1;
    const fields = [];
    // const yourRank =  "\n\n**Your Rank**\n #" + Member.rank + " • " + Member.xp + "xp • Lvl. " + calculateLevel(Member.xp);
    topMembers.forEach(topMember => {
      topMember = topMember.dataValues;
      fields.push(i + "    <@" + topMember.user_id + ">     " + topMember.xp + "xp    Lvl. " + calculateLevel(topMember.xp));
      i++;
    });
    embed.setTitle("Top Members of " + message.guild.name);
    embed.setDescription(fields.join("\n"));
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
