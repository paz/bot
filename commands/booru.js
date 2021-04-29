const Booru = require("booru");
const { MessageEmbed } = require("discord.js");
const { Menu } = require("discord.js-menu");
const shared = require("../shared");

module.exports = {
  alias: ["booru", "danbooru", "rule34", "r34"],
  description: "Search booru",
  usage: "[site] <query>",
  cooldown: 5,
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
    const pages = [];
    let site = "danbooru";
    let Site;
    for (let Sites in Booru.sites) {
      Sites = Booru.sites[Sites];
      if (Sites.aliases.includes(command)) {
        site = command;
        Site = Sites;
      } else if (Sites.aliases.includes(args[0])) {
        site = args.shift();
        Site = Sites;
      }
    }
    if (Site.nsfw && !message.channel.nsfw) return message.channel.send("channel isnt nsfw!! and the booru is!!");
    Booru.search(site, args[0], { limit: 50, random: true })
      .then(posts => {
        let i = 0;
        const footerText = shared.createFooter(message, latency);
        posts.forEach(post => {
          i++;
          pages.push({
            name: i,
            content: new MessageEmbed({
              title: post.id,
              description: "[View](" + post.postView + ")\n``" + post.tags.slice(0, 20).join(" ") + "``",
              fields: [
                {
                  name: "Score",
                  value: post.score,
                  inline: true
                },
                {
                  name: "Source",
                  value: post.source,
                  inline: true
                },
                {
                  name: "Rating",
                  value: post.rating,
                  inline: true
                },
                {
                  name: "Artist",
                  value: post.data.tag_string_artist,
                  inline: true
                }
              ],
              image: {
                url: post.fileUrl,
                height: post.height,
                width: post.width
              },
              timestamp: new Date(post.createdAt),
              footer: {
                text: (i + "/" + posts.length) + " • " + footerText
              }
            }),
            reactions: {
              "😳": "previous",
              "😀": "next"
            }
          });
        });
        const menu = new Menu(message.channel, message.author.id, pages, (60 * 1000));
        return menu.start();
      });
  }
};
