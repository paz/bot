const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["eval"],
  description: "Run code",
  usage: "",
  permission: "botowner",
  execute(message, args, latency, commands, client) {
    let embed = new Discord.MessageEmbed();
    let target = args.shift();
    let source = args.shift();
    let tr = shared.googleTranslate(args.join(' '), target, source);
    embed.setAuthor("Google Translate", "https://cdn.wccftech.com/wp-content/uploads/2018/01/Google-Logo.png")
    embed.setDescription("```"+tr+"```")
    embed.setFooter(Date.now() - latency + "ms");
    message.channel.send(embed)
  },
};
