const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["invite", "inv"],
  description: "Invite a bot to your server",
  usage: "[bot id / @mention]",
  async execute (message, args, latency, commands, client) {
    const embed = new Discord.MessageEmbed();
    let inviteUrl;
    let self = false;
    let bot;

    if (args.length > 0) {
      if (message.mentions.users.size > 0) {
        bot = message.mentions.users.first();
      } else {
        if (shared.validId(args[0])) {
          bot = await client.users.fetch(args[0]);
          if (!bot) {
            return message.channel.send("Invalid ID");
          }
        }
      }
      inviteUrl =
        "https://discord.com/api/oauth2/authorize?client_id=" +
        bot.id +
        "&permissions=";
    } else {
      self = true;
      bot = client.user;
      inviteUrl =
        "https://discord.com/api/oauth2/authorize?client_id=" +
        client.user.id +
        "&permissions=8&redirect_uri=https%3A%2F%2Fpaz.yt%2Fbot%2F&response_type=code&scope=bot%20applications.commands";
    }

    embed.setTitle("Invite ``" + bot.username + "`` to your server");
    embed.setThumbnail(shared.createAvatar(bot, "user"));

    if (self) {
      embed.setDescription("[Invite](" + inviteUrl + ")");
    } else {
      embed.setDescription(
        "[``Admin``](" +
          inviteUrl +
          "8) | [``Standard``](" +
          inviteUrl +
          "104197184) | [``No Perms``](" +
          inviteUrl +
          "0)"
      );
    }

    embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
    message.channel.send(embed);
  }
};
