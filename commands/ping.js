const Discord = require("discord.js");

module.exports = {
  alias: ["ping", "latency"],
  description: "See the latency of the bot",
  usage: "",
  execute(message, args, latency) {
    let embed = new Discord.MessageEmbed();
    embed.setTitle("Latency");
    embed.setDescription("Discord latency is ..");
    embed.setFooter(Date.now() - latency + "ms");
    let discordLatency = Date.now();
    message.channel.send(embed).then((msg) => {
      embed.setDescription(
        "Discord latency is " + (Date.now() - discordLatency) + "ms"
      );
      msg.edit(embed);
    });
  },
};
