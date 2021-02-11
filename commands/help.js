const Discord = require("discord.js");

module.exports = {
  alias: ["help", "commands"],
  description: "List of all commands",
  usage: "[command]",
  execute(message, args, latency, commands) {
    let embed = new Discord.MessageEmbed();
    embed.setAuthor("Help");
    embed.setFooter(Date.now() - latency + "ms");
    message.channel.send(embed);
  },
};
