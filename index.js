require("dotenv").config();
const fs = require("fs");

// discord
const Discord = require("discord.js");
const client = new Discord.Client();

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
  const prefix = ",";
  if (
    !message.content.startsWith(prefix) ||
    message.author.bot ||
    message.author.id === client.user.id
  ) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.find((cmd) => cmd.alias.includes(command));

  if (!cmd) return;

  try {
    cmd.execute(message, args, latency, client.commands, client);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

// login
client.login(process.env.token);
