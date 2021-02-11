const Discord = require("discord.js");

module.exports = {
	alias: ['invite', 'inv'],
	description: 'Invite a bot to your server',
    usage: '[bot id / @mention]',
	execute(message, args, latency) {
        let embed = new Discord.MessageEmbed();

        

        embed.setFooter((Date.now()-latency)+"ms")
		message.channel.send(embed);
	}
};