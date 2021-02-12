require("dotenv").config();
const fs = require("fs");

// discord
const Discord = require("discord.js");
const client = new Discord.Client();
const Keyv = require('keyv');
const globalPrefix = ",";

const prefixes = new Keyv(process.env.keyv, { namespace: 'prefixes' });

// commands
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.alias[0], command);
}

// random ass functions
const shared = require("./shared");
process.on("uncaughtException", (err) => shared.handleError(err));
process.on("unhandledRejection", (err) => shared.handleError(err));

// events

client.on("ready", async () => {
  console.log(
    `Logged in as ${client.user.tag}!
    Serving ${client.guilds.cache.size} guilds & ${client.users.cache.size} users`
  );
  let readyEmbed = new Discord.MessageEmbed();
  readyEmbed.setTitle(process.env.instance + " is now online");
  readyEmbed.setDescription(`Logged in as <@${client.user.id}>
  Serving ${client.guilds.cache.size} guilds & ${client.users.cache.size} users`);
  shared.statusWebhook(readyEmbed);
});

client.on("message", async (message) => {
  let latency = Date.now();
  let prefix;
	if (message.guild) {
		if (message.content.startsWith(globalPrefix)) {
			prefix = globalPrefix;
		} else {
			const guildPrefix = await prefixes.get(message.guild.id);
			if (message.content.startsWith(guildPrefix)) prefix = guildPrefix;
		}
		if (!prefix) return;
	} else {
		prefix = globalPrefix;
	}

  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    message.author.id === client.user.id
  )
    return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.find((cmd) => cmd.alias.includes(command));

  if (!cmd) return;

  try {
    if (shared.hasPermission(message.guild, message.author, cmd.permission)) {
      cmd.execute(message, args, latency, client.commands, client, prefixes, globalPrefix);
    }
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

client.on('guildBanAdd', async (guild, user) => {
	const fetchedLogs = await guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_BAN_ADD',
	});
	const banLog = fetchedLogs.entries.first();
	if (!banLog) return console.log(`${user.tag} was banned from ${guild.name} but no audit log could be found.`);
	const { executor, target } = banLog;
	if (target.id === user.id) {
		console.log(`${user.tag} got hit with the swift hammer of justice in the guild ${guild.name}, wielded by the mighty ${executor.tag}`);
	} else {
		console.log(`${user.tag} got hit with the swift hammer of justice in the guild ${guild.name}, audit log fetch was inconclusive.`);
	}
});

client.on('guildMemberRemove', async member => {
	const fetchedLogs = await member.guild.fetchAuditLogs({
		limit: 1,
		type: 'MEMBER_KICK',
	});
	const kickLog = fetchedLogs.entries.first();
	if (!kickLog) return console.log(`${member.user.tag} left the guild, most likely of their own will.`);
	const { executor, target } = kickLog;
	if (target.id === member.id) {
		console.log(`${member.user.tag} left the guild; kicked by ${executor.tag}?`);
	} else {
		console.log(`${member.user.tag} left the guild, audit log fetch was inconclusive.`);
	}
});

client.on('messageDelete', async message => {
	if (!message.guild) return;
	const fetchedLogs = await message.guild.fetchAuditLogs({
		limit: 1,
		type: 'MESSAGE_DELETE',
	});
	const deletionLog = fetchedLogs.entries.first();
	if (!deletionLog) return console.log(`A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`);
	const { executor, target } = deletionLog;
	if (target.id === message.author.id) {
		console.log(`A message by ${message.author.tag} was deleted by ${executor.tag}.`);
	}	else {
		console.log(`A message by ${message.author.tag} was deleted, but we don't know by who.`);
	}
});

// login
client.login(process.env.token);
