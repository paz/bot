const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["prefix"],
  description: "View/set prefix for guild",
  usage: "[prefix]",
  guild: true,
  async execute (message, args, latency, commands, client, prefixes, globalPrefix) {
    const embed = new Discord.MessageEmbed();
    embed.setTitle("Prefix for " + message.guild.name);
    if (args.length > 0 && shared.hasPermission(message.guild, message.author, "guildowner")) {
      if (args[0] === globalPrefix || args[0] === "reset") {
        await prefixes.delete(message.guild.id);
        embed.setDescription("Successfully reset prefix");
      } else {
        await prefixes.set(message.guild.id, args[0]);
        embed.setDescription(`Successfully set prefix to \`\`${args[0]}\`\``);
      }
    } else {
      embed.setDescription(`Prefix is \`\`${await prefixes.get(message.guild.id) || globalPrefix}\`\``);
    }
    embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
    message.channel.send(embed);
  }
};
