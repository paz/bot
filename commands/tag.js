const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["tag", "t"],
  description: "View, edit, list, delete or create tags.",
  usage: "<tag name / list / delete [tag] / edit [tag]> [content ...]",
  args: true,
  async execute (
    message,
    args,
    latency,
    commands,
    client,
    prefixes,
    globalPrefix,
    Tags
  ) {
    const embed = new Discord.MessageEmbed();
    let tagName = args.shift();
    let tagDescription = args.join(" ");
    if (tagName === "list") {
      const tagList = await Tags.findAll({
        attributes: ["name"],
        where: { owner: message.author.id }
      });
      const tagString = tagList.map((t) => t.name).join(", ") || "No tags set.";
      return message.channel.send(`List of tags: ${tagString}`);
    } else if (tagName === "delete") {
      const rowCount = await Tags.destroy({
        where: { name: tagName, owner: message.author.id }
      });
      if (!rowCount) { return message.reply("That tag did not exist, or you do not own it."); }
      return message.reply("Tag deleted.");
    } else if (tagName && args.length < 1) {
      const tag = await Tags.findOne({ where: { name: tagName } });
      if (tag) {
        tag.increment("uses");
        return message.channel.send(tag.get("description"));
      }
      return message.reply(`Could not find tag: ${tagName}`);
    } else if (tagName === "edit") {
      tagName = args.shift();
      tagDescription = args.join(" ");
      const affectedRows = await Tags.update(
        {
          description: tagDescription
        },
        {
          where: { name: tagName, owner: message.author.id }
        }
      );
      if (affectedRows > 0) {
        return message.reply(`Tag ${tagName} was edited.`);
      }
      return message.reply(
        `Could not find a tag with name ${tagName}, or you do not own it.`
      );
    } else {
      try {
        const tag = await Tags.create({
          name: tagName,
          description: tagDescription,
          owner: message.author.id
        });
        return message.reply(`Tag ${tag.name} added.`);
      } catch (e) {
        if (e.name === "SequelizeUniqueConstraintError") {
          return message.reply("That tag already exists.");
        }
        return message.reply("Something went wrong with adding a tag.");
      }
    }
    /* embed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(embed); */
  }
};
