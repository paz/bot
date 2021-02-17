module.exports = {
  alias: ["exit", "logout"],
  description: "Exit/restart bot",
  usage: "",
  permission: "botowner",
  execute (message) {
    message.channel.send("Exiting..").then(async () => {
      await message.client.destroy();
      process.exit();
    });
  }
};
