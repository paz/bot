const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["avatar", "avi", "pfp", "icon"],
  description: "See your avatar",
  usage: "[id / @mention]",
  async execute (message, args, latency, commands, client) {
    const embed = new Discord.MessageEmbed();
    let user;
    if (args.length > 0) {
      user = await shared.getUserArg(message, args, client);
    } else {
      user = message.author;
    }
    if (!user) { return message.channel.send("invalid user"); };
    const avatar = shared.createAvatar(user, "user");
    embed.setTitle("``" + user.username + "``'s avatar");
    embed.setImage(avatar + "?size=2048");
    embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
    message.channel.send(embed);
  }
};
