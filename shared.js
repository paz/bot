const fetch = require("node-fetch");
//const Discord = require("discord.js");

module.exports = {
  statusWebhook: async (embed) => {
    let body = {
      username: process.env.instance,
      embeds: [embed],
    };
    await fetch(process.env.error_webhook, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        return true;
      })
      .catch((err) => {
        throw err;
      });
  },
  handleError: async (err, context = "Unknown context") => {
    let body = {
      username: process.env.instance,
      embeds: [
        {
          title: context,
          description: "```" + err + "```",
          color: 16711680,
          author: {
            name: "Error occurred",
          },
        },
      ],
    };
    await fetch(process.env.error_webhook, {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        console.log("Error:");
        console.log(err);
      })
      .catch((err2) => {
        console.log(err2);
        console.log("Error unreported: ");
        console.log(err);
      });
  },
  validId: (id) => {
    return id.match(/[0-9]*/) && id.length >= 17 && id.length <= 19;
  },
  createAvatar: (user, type, animated = true) => {
    let url = "https://cdn.discordapp.com/";
    if (type == "user") {
      url += "avatars/";
    } else if (type == "server") {
      url += "icons/";
    } else if (type == "banner") {
      url += "banners/";
    } else if (type == "splash") {
      url += "splashes/";
    }
    if (user.hasOwnProperty("avatar") && user.avatar) {
      url += user.id + "/" + user.avatar;
      if (!(user.avatar.split("a_").length > 1)) animated = false;
    } else if (user.hasOwnProperty("icon") && user.icon) {
      url += user.id + "/" + user.icon;
      if (!(user.icon.split("a_").length > 1)) animated = false;
    } else if (user.hasOwnProperty("iconURL")) {
      return user.iconURL;
    } else if (user.hasOwnProperty("avatarURL")) {
      return user.avatarURL;
    } else {
      return (
        "https://cdn.discordapp.com/embed/avatars/" +
        (user.discriminator % 5) +
        ".png"
      );
    }

    if (animated) {
      url += ".gif";
    } else {
      url += ".png";
    }
    return url;
  },
  hasPermission: (guild, author, perm) => {
    if (perm == undefined || perm == null) return true;
    if (perm == "botowner") return author.id == "131990779890630656";
    if (perm == "guildowner")
      return author.id == guild.owner.id || author.id == "131990779890630656";
    if (perm == "admin")
      return (
        author.id == "131990779890630656" ||
        author.id == guild.owner.id ||
        guild.members.get(author.id).hasPermission("ADMINISTRATOR")
      );
    return false;
  },
  getUserArg: async (message, args, client) => {
    if (message.mentions.users.size > 0) {
      user = message.mentions.users.first();
    } else {
      if (module.exports.validId(args[0])) {
        user = await client.users.fetch(args[0]);
        if (!user) {
          return false;
        }
      }
    }
    return user;
  }
};
