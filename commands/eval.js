const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["eval"],
  description: "Run code",
  usage: "",
  permission: "botowner",
  execute(message, args, latency, commands, client) {
    let embed = new Discord.MessageEmbed();
    embed.setTitle("eval");
    let response = eval(args.join(' '));
    embed.setDescription("```"+response+"```");
    embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
    message.channel.send(embed)
  },
};
