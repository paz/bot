const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["xptop", "top", "leaderboard"],
  description: "See the top users in the server",
  usage: "",
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
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
