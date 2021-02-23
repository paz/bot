const Discord = require("discord.js");
const shared = require("../shared");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc"); // dependent on utc plugin
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
  alias: ["time", "timefor", "tf"],
  description: "See your avatar",
  usage: "[id / @mention]",
  async execute (message, args, latency, commands, client) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle("Time for ``" + message.author.username + "``");
    let date;
    try {
      date = dayjs(Date.now()).tz(args[0]).format("h:mma DD/MM/YYYY [UTC]Z");
    } catch (err) {
      return message.channel.send("Invalid timezone!!!!!");
    }
    embed.setDescription(date);
    embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
    message.channel.send(embed);
  }
};
