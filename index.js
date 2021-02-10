require("dotenv").config();
const fetch = require("node-fetch");

// discord
const Discord = require("discord.js");
const client = new Discord.Client();

// random ass functions
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
  await fetch(
    process.env.error_webhook,
    {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  )
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

client.on("ready", () => {});

client.on("message", (msg) => {});

// login
client.login("token");
