const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["help", "commands"],
  description: "List of all commands",
  usage: "[command]",
  execute(message, args, latency, commands) {
    let embed = new Discord.MessageEmbed();
    embed.setAuthor("Help");
    commands.forEach(command => {
      embed.addField("``"+command.alias[0]+"`` "+command.usage, command.description)
    })
    embed.setFooter(Date.now() - latency + "ms");
    message.channel.send(embed);
  },
};
