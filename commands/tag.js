const Discord = require("discord.js");
const { createAvatar } = require("../shared");
const shared = require("../shared");

module.exports = {
  alias: ["tag", "t"],
  description: "View, edit, list, delete or create tags.",
  usage: "<tag name / list / delete [tag] / edit [tag]> [content ...]",
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
    let tagName;
    let action;
    let tagDescription;
    const embed = new Discord.MessageEmbed();
    if (args.length === 0) {
      action = "list";
    } else {
      action = args.shift();
      if (!["list", "delete", "info"].includes(action)) {
        tagName = action;
        action = null;
      }
    }
    if (args.length > 1) {
      tagDescription = args.join(" ");
    }
    if (action === "list") {
      const tagList = await Tags.findAll({
        attributes: ["name"],
        where: { owner: message.author.id }
      });
      const tagString = tagList.map((t) => t.name).join(", ") || "No tags set.";
      embed.setDescription(`List of tags: ${tagString}`);
    } else if (action === "delete") {
      const rowCount = await Tags.destroy({
        where: { name: tagName, owner: message.author.id }
      });
      if (!rowCount) { embed.setDescription("That tag did not exist, or you do not own it."); } else {
        embed.setDescription("Tag deleted.");
      }
    } else if (tagName) {
      const tag = await Tags.findOne({ where: { name: tagName } });
      if (tag) {
        if (tagDescription && tag.owner === message.author.id) {
          const affectedRows = await Tags.update(
            {
              description: tagDescription
            },
            {
              where: { name: tagName, owner: message.author.id }
            }
          );
          if (affectedRows > 0) {
            embed.setDescription(`Tag ${tagName} was edited.`);
          } else {
            embed.setDescription(
                `Could not find a tag with name ${tagName}, or you do not own it.`
            );
          }
        } else {
          tag.increment("uses");
          const author = await client.users.fetch(tag.get("owner"));
          embed.setAuthor(author.username + "#" + author.discriminator, createAvatar(author, "user"));
          embed.setTimestamp(new Date(tag.get("createdAt")));
          embed.setTitle(tag.get("name") + " • " + tag.get("uses") + " uses");
          embed.setDescription(tag.get("description") + "\n\n*Last modified ``" + new Date(tag.get("updatedAt")) + "``*");
        }
      } else {
        if (tagDescription) {
          try {
            const tag = await Tags.create({
              name: tagName,
              description: tagDescription,
              owner: message.author.id
            });
            embed.setDescription(`Tag ${tag.name} added.`);
          } catch (e) {
            if (e.name === "SequelizeUniqueConstraintError") {
              embed.setDescription("That tag already exists.");
            }
            embed.setDescription("Something went wrong with adding a tag.");
          }
        } else {
          embed.setDescription(`Could not find tag: ${tagName}`);
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
