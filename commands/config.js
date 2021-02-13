const Discord = require("discord.js");
const shared = require("../shared");
const validKeys = {
  join_message: "STRING",
  leave_message: "STRING",
  ban_message: "STRING",
  kick_message: "STRING",
  admin_messages: "CHANNEL",
  user_messages: "CHANNEL"
};
const validTypes = {
  STRING: async (v) => {
    return v;
  },
  CHANNEL: async (v, guild) => {
    const id = v.replace("<", "").replace("#", "").replace(">", "");
    if (shared.validId(id)) {
      const channel = await guild.channels.resolve(id);
      if (!channel) return false;
      return channel.id;
    }
  }
};

module.exports = {
  alias: ["config", "conf", "settings", "setting"],
  description: "Configure options for your guild",
  usage: "[option_name] [value]",
  permission: "admin",
  async execute (
    message,
    args,
    latency,
    commands,
    client,
    prefixes,
    globalPrefix,
    Tags,
    Guilds
  ) {
    const embed = new Discord.MessageEmbed();
    const Guild = (
      await Guilds.findOrCreate({ where: { id: message.guild.id } })
    )[0].dataValues;
    const guild = message.guild;

    if (args.length > 0) {
      const key = args.shift().toLowerCase();
      const keyName = shared.toTitleCase(key.split("_").join(" "));
      if (!validKeys.hasOwnProperty(key)) return;
      if (args.length > 0) {
        const value = args.join(" ");
        const dbValue = await validTypes[validKeys[key]](value, guild);
        embed.setTitle(keyName);
        if (!dbValue) {
          embed.setDescription(
            "Invalid value\nMust be: ``" + validKeys[key] + "``"
          );
        } else {
          const update = {};
          update[key] = dbValue;
          await Guilds.update(update, {
            where: { id: guild.id }
          });
          embed.setDescription("Value set to ``" + dbValue + "``");
        }
      } else {
        embed.setTitle(keyName);
        embed.setDescription("Must be: ``" + validKeys[key] + "``");
      }
    } else {
      embed.setTitle(guild.name + " config");
      embed.setThumbnail(shared.createAvatar(guild, "server"));
      for (const k in Guild) {
        if (!["createdAt", "updatedAt", "id"].includes(k)) {
          const v = Guild[k];
          let displayValue;
          if (v === null) {
            displayValue = "``Disabled``";
          } else {
            displayValue = "``" + v + "``";
          }
          if (validKeys[k] === "CHANNEL" && v !== null) {
            displayValue = "<#" + v + ">";
          }
          embed.addField(
            shared.toTitleCase(k.split("_").join(" ")),
            displayValue,
            true
          );
        }
      }
    }
    embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed);
  }
};
