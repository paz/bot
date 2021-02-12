/* eslint-disable no-eval */
const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["eval"],
  description: "Run code",
  usage: "",
  permission: "botowner",
  execute (message, args, latency, commands, client) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle("eval");
    const response = eval(args.join(" "));
    embed.setDescription("```" + response + "```");
    embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
    message.channel.send(embed);
  }
};
