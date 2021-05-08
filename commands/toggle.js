const shared = require("../shared");

module.exports = {
  alias: ["toggle", "on", "off"],
  description: "Toggle user",
  usage: "[id / @mention]",
  args: 1,
  permission: "admin",
  async execute (message,
    args,
    latency,
    commands,
    client,
    prefixes,
    globalPrefix,
    Tags,
    Guilds,
    Members,
    Member,
    Roles,
    command) {
    let user;
    if (args.length > 0) {
      user = await shared.getUserArg(message, args, client);
    } else {
      return message.reply("Please mention a user or ID");
    }

    if (args[0] === "all") {
      await Members.update(
        {
          toggled: false
        },
        {
          where: { guild_id: message.guild.id }
        }
      );

      message.reply("All members toggled back on");
    } else {
      let toggleValue;
      if (!user) { return message.channel.send("invalid user"); };
      const targetMember = (await Members.findOrCreate({ where: { user_id: user.id, guild_id: message.guild.id } }))[0].dataValues;
      if (command === "on" || targetMember.toggled) {
        toggleValue = false;
      } else if (command === "off" || !targetMember.toggled) {
        toggleValue = true;
      }
      await Members.update(
        {
          toggled: toggleValue
        },
        {
          where: { user_id: user.id, guild_id: message.guild.id }
        }
      );

      message.reply(user.username + " has been toggled " + ["on", "off"][+toggleValue]);
    }
  }
};
