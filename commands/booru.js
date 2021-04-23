const Booru = require("booru");
const { MessageEmbed } = require("discord.js");
const { Menu } = require("discord.js-menu");
const shared = require("../shared");

module.exports = {
  alias: ["booru", "danbooru"],
  description: "Search booru",
  usage: "[site] <query>",
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
    for (let Site in Booru.sites) {
      Site = Booru.sites[Site];
      if (Site.aliases.includes(command)) {
        site = command;
      } else if (Site.aliases.includes(args[0])) {
        site = args.shift();
      }
    }
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
              description: "[View](" + post.postView + ")\n``" + post.tags.slice(0, 10).join(" ") + "``",
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
