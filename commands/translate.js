const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["translate", "tr"],
  description: "Translate",
  usage: "<target> [source] <text to translate>",
  permission: "botowner",
  execute(message, args, latency, commands, client) {
    let embed = new Discord.MessageEmbed();
    let source = args.shift();
    let target = args.shift();
    embed.setAuthor("Google Translate", "https://cdn.wccftech.com/wp-content/uploads/2018/01/Google-Logo.png")
    shared.googleTranslate(args.join(' '), target, source).then(tr => {
        embed.setDescription("```"+tr.text+"```")
        embed.setTitle(tr.source+" -> "+tr.target);
        embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
        message.channel.send(embed)
    })
  },
};
