const Discord = require("discord.js");
const pidusage = require("pidusage");
const prettyBytes = require("pretty-bytes");
const dayjs = require("dayjs");
const shared = require("../shared");

module.exports = {
  alias: ["stats"],
  description: "Bot statistics",
  usage: "",
  cooldown: 10,
  permission: "botowner",
  execute (message, args, latency) {
    const embed = new Discord.MessageEmbed();
    embed.setAuthor("Statistics");
    pidusage(process.pid, function (err, stats) {
      if (err) shared.handleError(err);
      embed.addField("CPU", stats.cpu + "%", true);
      embed.addField("Memory", prettyBytes(stats.memory), true);
      embed.addField("Uptime", shared.timeAgo(shared.startTimestamp), true);
      embed.addField("Users", message.client.users.cache.size, true);
      embed.addField("Guilds", message.client.guilds.cache.size, true);
      embed.addField("Timezone", dayjs().format("[UTC]Z"), true);
      embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
      message.channel.send(embed);
    });
  }
};
