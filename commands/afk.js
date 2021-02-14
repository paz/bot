const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["afk"],
  description: "Take a break",
  usage: "[afk message]",
  async execute (
    message,
    args,
    latency,
    commands,
    client,
    prefixes,
    globalPrefix,
    Tags,
    Guilds,
    Members,
    Member
  ) {
    let afkMessage = null;
    if (args.length > 0) {
      afkMessage = args.join(" ");
    }
    const embed = new Discord.MessageEmbed();
    embed.setAuthor(message.author.username + " is now AFK", shared.createAvatar(message.author, "user"));
    embed.setDescription((afkMessage || " "));
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);

    await Members.update(
      {
        last_active: latency,
        afk: latency,
        afkMessage: afkMessage
      },
      {
        where: { user_id: message.author.id, guild_id: message.guild.id }
      }
    );
  }
};
