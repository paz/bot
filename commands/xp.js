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
    // const xp = shared.calculateXp(Member.voice_count, Member.messages_count);
    const xp = Member.xp;
    const level = shared.calculateLevel(xp);
    const embed = new Discord.MessageEmbed();
    embed.setAuthor(message.author.username, shared.createAvatar(message.author, "user"));
    embed.setDescription("You have ``" + xp + "`` xp\n" +
                         "You are level ``" + level + "``");
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
