require("dotenv").config();
const fetch = require("node-fetch");
const fs = require('fs');

// discord
const Discord = require("discord.js");
const client = new Discord.Client();

// commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.alias[0], command);
}

// random ass functions
async function statusWebhook(embed) {
  let body = {
    username: process.env.instance,
    embeds: [embed],
  };
  await fetch(process.env.error_webhook, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      return true;
    })
    .catch((err) => {
      throw err;
    });
}

async function handleError(err, context = "Unknown context") {
  let body = {
    username: process.env.instance,
    embeds: [
      {
        title: context,
        description: "```" + err + "```",
        color: 16711680,
        author: {
          name: "Error occurred",
        },
      },
    ],
  };
  await fetch(process.env.error_webhook, {
    method: "post",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      console.log("Error:");
      console.log(err);
    })
    .catch((err2) => {
      console.log(err2);
      console.log("Error unreported: ");
      console.log(err);
    });
}
process.on("uncaughtException", (err) => handleError(err));
process.on("unhandledRejection", (err) => handleError(err));

// events

client.on("ready", async () => {
  console.log(
    `Logged in as ${client.user.tag}!
    Serving ${client.guilds.cache.size} guilds & ${client.users.cache.size} users`
  );
  let readyEmbed = new Discord.MessageEmbed();
  readyEmbed.setTitle(process.env.instance+" is now online");
  readyEmbed.setDescription(`Logged in as <@${client.user.id}>
  Serving ${client.guilds.cache.size} guilds & ${client.users.cache.size} users`);
  statusWebhook(readyEmbed);
});

client.on("message", async (message) => {
  let latency = Date.now();
  const prefix = ",";
  if(!message.content.startsWith(prefix) 
  || message.author.bot 
  || message.author.id === client.user.id) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.find(cmd => cmd.alias.includes(command));

  if(!cmd) return;

  try {
    cmd.execute(message, args, latency, client.commands);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

// login
client.login(process.env.token);
