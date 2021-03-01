const Discord = require("discord.js");
const fetch = require("node-fetch");
const shared = require("../shared");
const api_key = process.env.nomics_api_key;

module.exports = {
  alias: ["crypto", "cryptocurrency"],
  description: "See cryptocurrency",
  usage: "[coin name]",
  cooldown: 5,
  execute (message, args, latency) {
    const embed = new Discord.MessageEmbed();
    let coinName;
    if (args.length > 0) {
      coinName = args[0].toUpperCase();
    } else {
      coinName = "BTC";
    }
    fetch("https://api.nomics.com/v1/currencies/ticker?key=" + encodeURIComponent(api_key) + "&ids=" + encodeURIComponent(coinName) + "&interval=7d,1d,1h&status=active").then(res => res.json()).then(res => {
      const coin = res[0];
      if (res.length === 0 || coin === undefined) {
        return message.channel.send("Invalid currency");
      }
      embed.setTitle(coinName + " (US$)");
      embed.addField("Information", "Price: ``$" + coin.price + "``\nHighest ever: ``$" + coin.high + "``", true);
      embed.addField("Stats",
        "Last 7d: `` " + coin["7d"].price_change_pct * 100 +
        "%``\nLast 24h: ``" + coin["1d"].price_change_pct * 100 +
        "%``\nLast hour: ``" + coin["1h"].price_change_pct * 100 + "%``", true);
      embed.setTimestamp(new Date(coin.price_timestamp));
      embed.setFooter(shared.createFooter(message, latency), shared.createAvatar(message.author, "user"));
      message.channel.send(embed);
    });
  }
};
