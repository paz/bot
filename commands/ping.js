const Discord = require("discord.js");
const shared = require("../shared")

module.exports = {
  alias: ["ping", "latency"],
  description: "See the latency of the bot",
  usage: "",
  execute(message, args, latency) {
    let embed = new Discord.MessageEmbed();
    embed.setTitle("Latency");
    embed.setDescription("Discord latency is ..");
    embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
    let discordLatency = Date.now();
    message.channel.send(embed).then((msg) => {
      embed.setDescription(
        "Discord latency is " + (Date.now() - discordLatency) + "ms"
      );
      msg.edit(embed);
    });
  },
};
