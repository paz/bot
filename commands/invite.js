const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["invite", "inv"],
  description: "Invite a bot to your server",
  usage: "[bot id / @mention]",
  async execute(message, args, latency, commands, client) {
    let embed = new Discord.MessageEmbed();
    let inviteUrl;
    let self = false;
    let bot;

    if (args.length > 0) {
      if (message.mentions.users.size > 0) {
        bot = message.mentions.users.first();
        botId = bot.id;
      } else {
        if (shared.validId(args[0])) {
          bot = await client.fetchUser(args[0]);
          if (!bot) {
            return message.channel.send('Invalid ID');
          } else {
            botId = bot.id;
          }
        }
      }
      inviteUrl =
        "https://discord.com/api/oauth2/authorize?client_id=" +
        botId +
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

    embed.setFooter(Date.now() - latency + "ms");
    message.channel.send(embed);
  },
};
