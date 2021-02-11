const Discord = require("discord.js");
const shared = require("../shared");

module.exports = {
  alias: ["avatar", "avi", "pfp"],
  description: "See your avatar",
  usage: "[id / @mention]",
  async execute(message, args, latency, commands, client) {
    let embed = new Discord.MessageEmbed();
    let user;
    if(args.length > 0){
        user = await shared.getUserArg(message, args, client);
    }else{
        user = message.author;
    }
    if(!user){ return message.channel.send("invalid user")};
    let avatar = shared.createAvatar(user, "user");
    embed.setTitle("``"+user.username+"``'s avatar");
    embed.setImage(avatar);
    embed.setDescription("[Full Resolution]("+avatar+"?size=2048)");
    embed.setFooter(Date.now() - latency + "ms");
    message.channel.send(embed)
  },
};
