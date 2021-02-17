const Discord = require("discord.js");
const dayjs = require("dayjs");
const shared = require("../shared");
const { createAvatar } = require("../shared");

module.exports = {
  alias: ["info", "user", "lookup"],
  description: "See user information",
  usage: "[id / @mention]",
  async execute (message, args, latency, commands, client) {
    const embed = new Discord.MessageEmbed();
    let user;
    const badges = [];
    if (args.length > 0) {
      user = await shared.getUserArg(message, args, client);
    } else {
      user = message.author;
    }
    if (!user) { return message.channel.send("invalid user"); };
    const member = await message.guild.members.resolve(user.id);

    const avatar = shared.createAvatar(user, "user");
    embed.setAuthor(user.username + "#" + user.discriminator, shared.statusImages[user.presence.status], "https://dscrd.co/" + user.id);
    embed.setThumbnail(avatar);

    // let onMobile = false; ;
    if (user.presence.clientStatus && user.presence.clientStatus.hasOwnProperty("mobile")) {
      // onMobile = true;
      badges.push(shared.emoji.mobile_online);
    }

    if (user.bot) badges.push(shared.emoji.bot);
    if (user.flags) {
      if (user.flags.has("DISCORD_EMPLOYEE")) badges.push(shared.emoji.discord_employee);
      if (user.flags.has("PARTNERED_SERVER_OWNER") || user.flags.has("DISCORD_PARTNER")) badges.push(shared.emoji.partner);
      if (user.flags.has("HYPESQUAD_EVENTS")) badges.push(shared.emoji.hypesquad);
      if (user.flags.has("BUGHUNTER_LEVEL_1") || user.flags.has("BUGHUNTER_LEVEL_2")) badges.push(shared.emoji.bughunter);
      if (user.flags.has("HOUSE_BRAVERY")) badges.push(shared.emoji.bravery);
      if (user.flags.has("HOUSE_BRILLIANCE")) badges.push(shared.emoji.brilliance);
      if (user.flags.has("HOUSE_BALANCE")) badges.push(shared.emoji.balance);
      if (user.flags.has("EARLY_SUPPORTER")) badges.push(shared.emoji.early_supporter);
      if (user.flags.has("VERIFIED_BOT")) badges.push(shared.emoji.verified);
      if (user.flags.has("VERIFIED_DEVELOPER")) badges.push(shared.emoji.verified);
    }

    embed.addField("🗓️ Account Created",
      dayjs(user.createdTimestamp).format("DD/MM/YYYY HH:mm") +
    "\n``" + shared.timeAgo(user.createdTimestamp) + "``", true);

    const animatedAvatar = (createAvatar(user, "user").split(".gif").length > 1);

    let nickname = "";
    if (member) {
      if (member.displayName !== user.username) nickname = " • " + member.displayName;
      embed.addField(
        shared.emoji.join + " Joined Guild",
        dayjs(member.joinedTimestamp).format("DD/MM/YYYY HH:mm") +
        "\n``" + shared.timeAgo(member.joinedTimestamp) + "``", true);
      if ((member.premiumSinceTimestamp !== null && member.premiumSinceTimestamp !== 0) || animatedAvatar) badges.push(shared.emoji.nitro);
    }

    embed.setDescription("ID: ``" + user.id + "``" + nickname + " • [Avatar](" + avatar + "?size=2048)\n" + badges.join(" ") + "\n\n");

    let spotifyImage;
    user.presence.activities.forEach(activity => {
      let value;
      let statusTitle;
      let activityText;
      if (activity.type === "CUSTOM_STATUS") {
        statusTitle = "Custom Status";
        value = activity.state;
      } else {
        if (activity.type === "LISTENING") {
          activityText = " to ";
        } else if (activity.type === "COMPETING") {
          activityText = " in ";
        } else {
          activityText = " ";
        }

        statusTitle = shared.toTitleCase(activity.type) + activityText + activity.name;

        if (activity.details && activity.state) {
          value = activity.details + "\n" + activity.state;
        } else {
          value = "** **";
        }

        if (activity.name === "Spotify") {
          value = activity.details + " by " + activity.state.split("; ").join(", ") + "\non " + activity.assets.largeText;
          spotifyImage = activity.assets.largeImage;
        }
      }

      embed.addField(shared.emoji.richPresence + " " + statusTitle, value);
    });

    if (spotifyImage) embed.setImage(spotifyImage.replace("spotify:", "https://i.scdn.co/image/"));

    embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
    message.channel.send(embed);
  }
};
