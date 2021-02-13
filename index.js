require("dotenv").config();
const fs = require("fs");

// discord
const Discord = require("discord.js");
const client = new Discord.Client();
const Keyv = require("keyv");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  process.env.db_name,
  process.env.db_user,
  process.env.db_pass,
  {
    host: process.env.db_host,
    dialect: "mariadb",
    logging: false
  }
);

const globalPrefix = ",";
const prefixes = new Keyv(process.env.keyv, { namespace: "prefixes" });

// commands
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
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

// tables

const Tags = sequelize.define("tags", {
  name: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true
  },
  description: Sequelize.TEXT,
  owner: Sequelize.STRING,
  uses: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
});

const Guilds = sequelize.define("guilds", {
  id: {
    type: Sequelize.STRING,
    unique: true,
    primaryKey: true
  },
  join_message: { type: Sequelize.TEXT, allowNull: true },
  leave_message: { type: Sequelize.TEXT, allowNull: true },
  ban_message: { type: Sequelize.TEXT, allowNull: true },
  kick_message: { type: Sequelize.TEXT, allowNull: true },
  admin_messages: { type: Sequelize.STRING, allowNull: true },
  user_messages: { type: Sequelize.STRING, allowNull: true }
});

const sequelize_sync_options = {
  alter: true,
  drop: false
};

// events

client.on("ready", async () => {
  Tags.sync(sequelize_sync_options);
  Guilds.sync(sequelize_sync_options);

  console.log(
    `Logged in as ${client.user.tag}!
    Serving ${client.guilds.cache.size} guilds & ${client.users.cache.size} users`
  );
  const readyEmbed = new Discord.MessageEmbed();
  readyEmbed.setTitle(process.env.instance + " is now online");
  readyEmbed.setDescription(`Logged in as <@${client.user.id}>
  Serving ${client.guilds.cache.size} guilds & ${client.users.cache.size} users`);
  shared.statusWebhook(readyEmbed);
});

client.on("message", async (message) => {
  const latency = Date.now();

  if (
    message.author.bot ||
    message.webhookID ||
    message.author.id === client.user.id
  ) {
    return;
  }

  let prefix = globalPrefix;
  if (message.guild) {
    const guildPrefix = await prefixes.get(message.guild.id);
    if (guildPrefix && guildPrefix !== undefined && guildPrefix !== null && guildPrefix.length > 0) {
      prefix = guildPrefix;
    }
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const cmd = client.commands.find((cmd) => cmd.alias.includes(command));

  if (!cmd) return;

  if (!cooldowns.has(cmd.alias[0])) {
    cooldowns.set(cmd.alias[0], new Discord.Collection());
  }

  const timestamps = cooldowns.get(cmd.alias[0]);
  const cooldownAmount = (cmd.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (latency < expirationTime) {
      const timeLeft = (expirationTime - latency) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(
          1
        )} more second(s) before reusing the \`${command}\` command.`
      );
    }
  }

  timestamps.set(message.author.id, latency);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    if (shared.hasPermission(message.guild, message.author, cmd.permission)) {
      if (cmd.guild === true && !message.guild) {
        return message.channel.send(
          "This command can only be used in a guild."
        );
      }
      if (cmd.args && !args.length) {
        return message.channel.send(
          "Syntax: ``" + prefix + command + " " + cmd.usage + "``"
        );
      }
      cmd.execute(
        message,
        args,
        latency,
        client.commands,
        client,
        prefixes,
        globalPrefix,
        Tags,
        Guilds
      );
    }
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

client.on("guildMemberAdd", async (member) => {
  const guild = member.guild;
  const user = member.user;
  const Guild = (await Guilds.findOrCreate({ where: { id: guild.id } }))[0]
    .dataValues;
  const join_message = Guild.join_message;
  const user_messages = Guild.user_messages;
  if (join_message && join_message !== "disable") {
    if (user_messages && user_messages !== "disable") {
      const user_channel = guild.channels.resolve(user_messages);
      if (!user_channel) return;
      let embed = new Discord.MessageEmbed();
      embed.setDescription(
        join_message
          .split("%name")
          .join(user.username)
          .split("%id")
          .join(user.id)
          .split("%tag")
          .join(user.username + "#" + user.discriminator)
      );
      embed.setThumbnail(shared.createAvatar(user, "user"));
      embed.setFooter(
        user.id + " • " + user.username + "#" + user.discriminator
      );
      embed.setTimestamp(user.createdTimestamp);
      user_channel.send(embed);

      if (user.createdTimestamp > Date.now() - 1.21e9) {
        embed = new Discord.MessageEmbed();
        embed.setDescription(
          shared.emoji.newDiscord +
            " Account is ``" +
            shared.timeAgo(user.createdTimestamp) +
            "`` old"
        );
        user_channel.send(embed);
      }
    }
  }
});

const auditLogDelay = 2500;

client.on("guildBanAdd", async (guild, user) => {
  const fetchedLogs = await guild.fetchAuditLogs({
    limit: 1,
    type: "MEMBER_BAN_ADD"
  });
  const banLog = fetchedLogs.entries.first();
  const { executor, target } = banLog;
  const lastBanDelay = (Date.now() - shared.snowstamp(banLog.id));

  const Guild = (await Guilds.findOrCreate({ where: { id: guild.id } }))[0]
    .dataValues;
  let ban_message = Guild.ban_message;
  const user_messages = Guild.user_messages;
  if (ban_message && ban_message !== "disable") {
    if (user_messages && user_messages !== "disable") {
      const user_channel = guild.channels.resolve(user_messages);
      if (!user_channel) return;
      const embed = new Discord.MessageEmbed();
      let banReason;
      if (banLog.reason && banLog.reason !== null) {
        banReason = banLog.reason;
      } else {
        banReason = "none";
      }
      ban_message = ban_message
        .split("%name")
        .join(user.username)
        .split("%id")
        .join(user.id)
        .split("%tag")
        .join(user.username + "#" + user.discriminator);
      if (banLog && target.id === user.id && lastBanDelay < auditLogDelay) {
        ban_message = ban_message
          .split("%executedBy")
          .join("by <@" + executor.id + ">")
          .split("%executorId")
          .join(executor.id)
          .split("%reason")
          .join(banReason);
      }
      embed.setDescription(ban_message);
      embed.setThumbnail(shared.createAvatar(user, "user"));
      embed.setFooter(
        user.id + " • " + user.username + "#" + user.discriminator
      );
      embed.setTimestamp(user.createdTimestamp);
      user_channel.send(embed);
    }
  }
});

client.on("guildMemberRemove", async (member) => {
  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: "MEMBER_KICK"
  });
  const kickLog = fetchedLogs.entries.first();
  const { executor, target } = kickLog;
  const lastKickDelay = (Date.now() - shared.snowstamp(kickLog.id));

  const guild = member.guild;
  const user = member.user;
  const Guild = (await Guilds.findOrCreate({ where: { id: guild.id } }))[0]
    .dataValues;
  const leave_message = Guild.leave_message;
  const kick_message = Guild.kick_message;
  const user_messages = Guild.user_messages;
  if (leave_message && leave_message !== "disable") {
    if (user_messages && user_messages !== "disable") {
      const user_channel = guild.channels.resolve(user_messages);
      if (!user_channel) return;
      const embed = new Discord.MessageEmbed();
      let message = leave_message;
      let kickReason;
      if (kickLog && kick_message && kick_message !== "disable" && lastKickDelay < auditLogDelay) {
        message = kick_message;
        if (kickLog.reason && kickLog.reason !== null) {
          kickReason = kickLog.reason;
        } else {
          kickReason = "none";
        }
      }
      message = message
        .split("%name")
        .join(user.username)
        .split("%id")
        .join(user.id)
        .split("%tag")
        .join(user.username + "#" + user.discriminator);
      if (kickLog && target.id === user.id) {
        message = message
          .split("%executedBy")
          .join("by <@" + executor.id + ">")
          .split("%executorId")
          .join(executor.id)
          .split("%reason")
          .join(kickReason);
      }
      embed.setDescription(message);
      embed.setThumbnail(shared.createAvatar(user, "user"));
      embed.setFooter(
        user.id + " • " + user.username + "#" + user.discriminator
      );
      embed.setTimestamp(user.createdTimestamp);
      user_channel.send(embed);
    }
  }
});

client.on("messageDelete", async (message) => {
  if (!message.guild) return;
  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: "MESSAGE_DELETE"
  });
  const deletionLog = fetchedLogs.entries.first();
  if (!deletionLog) {
    return console.log(
      `A message by ${message.author.tag} was deleted, but no relevant audit logs were found.`
    );
  }
  const { executor, target } = deletionLog;
  if (target.id === message.author.id) {
    console.log(
      `A message by ${message.author.tag} was deleted by ${executor.tag}.`
    );
  } else {
    console.log(
      `A message by ${message.author.tag} was deleted, but we don't know by who.`
    );
  }
});

// login
client.login(process.env.token);
