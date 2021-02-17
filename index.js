require("dotenv").config();
const fs = require("fs");
const shared = require("./shared");

// web server
const express = require("express");
const app = express();

app.use("/", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/user/:id", async (req, res, next) => {
  const { id } = req.params;
  if (!shared.validId(id)) return res.send({ error: "Invalid id" });
  const user = await client.users.resolve(id);
  if (!user) return res.send({ error: "Invalid user" });
  console.log(user);
  return res.send({
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: user.avatar,
    avatarURL: shared.createAvatar(user, "user")
  });
});

// discord
const Discord = require("discord.js");
const client = new Discord.Client({
  ws: {
    properties: {
      $browser: "Discord iOS",
      $device: "Discord iOS"
    }
  }
});
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

const Members = sequelize.define("members", {
  user_id: {
    type: Sequelize.STRING
  },
  guild_id: {
    type: Sequelize.STRING
  },
  last_active: { type: Sequelize.TEXT, allowNull: true },
  afk: { type: Sequelize.STRING, allowNull: true },
  afkMessage: { type: Sequelize.TEXT, allowNull: true },
  voice_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  messages_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  xp: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
});

const sequelize_sync_options = {
  alter: true,
  drop: false
};

// events

client.on("ready", async () => {
  Tags.sync(sequelize_sync_options);
  Guilds.sync(sequelize_sync_options);
  Members.sync(sequelize_sync_options);

  app.listen(process.env.web_port, "localhost", () => {
    console.log("Web server listening on " + process.env.web_port);
  });

  // Members.belongsTo(Guilds, { foreignKey: "guild_id", targetKey: "id" });

  client.user.setPresence({
    activity: {
      name: "Clash of Clans",
      type: "COMPETING"
    }
  });

  console.log(
    `Logged in as ${client.user.tag}!
    Serving ${client.guilds.cache.size} guilds & ${client.users.cache.size} users`
  );
  if (process.env.instance.split("test").length === 1) {
    const readyEmbed = new Discord.MessageEmbed();
    readyEmbed.setTitle(process.env.instance + " is now online");
    readyEmbed.setDescription(`Logged in as <@${client.user.id}>
    Serving ${client.guilds.cache.size} guilds & ${client.users.cache.size} users`);
    shared.statusWebhook(readyEmbed);
  }
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

  // Normal message events

  // Is first mention AFK
  if (message.mentions.users.size > 0) {
    const user = message.mentions.users.first();
    const member = message.guild.members.resolve(user);
    const Member = (await Members.findOrCreate({ where: { user_id: user.id, guild_id: message.guild.id } }))[0].dataValues;
    if (Member.afk) {
      const afkEmbed = new Discord.MessageEmbed();
      afkEmbed.setAuthor(member.displayName + " has been AFK for " + shared.timeAgo(Member.afk), shared.createAvatar(member.user, "user"));
      afkEmbed.setDescription((Member.afkMessage || " "));
      afkEmbed.setFooter(
        shared.createFooter(message, latency),
        shared.createAvatar(message.author, "user")
      );
      message.channel.send(afkEmbed);
    }
  }

  // Is author AFK
  const Member = (await Members.findOrCreate({ /* attributes: ["user_id", "afk", "messages_count", "xp", shared.rankQuery], */ where: { user_id: message.author.id, guild_id: message.guild.id } }))[0].dataValues;
  if (Member.afk) {
    const afkEmbed = new Discord.MessageEmbed();
    const member = message.guild.members.resolve(Member.user_id);
    afkEmbed.setAuthor(member.displayName + " is no longer AFK", shared.createAvatar(member.user, "user"));
    afkEmbed.setDescription("was AFK for " + shared.timeAgo(Member.afk));
    afkEmbed.setFooter(
      shared.createFooter(message, latency),
      shared.createAvatar(message.author, "user")
    );
    message.channel.send(afkEmbed);
  }

  if (!cooldowns.has("xpGain")) {
    cooldowns.set("xpGain", new Discord.Collection());
  }

  let xpGain = shared.getRandomInt(10, 50);
  const xpTimestamps = cooldowns.get("xpGain");

  if (xpTimestamps.has(message.author.id)) {
    const xpExpirationTime = xpTimestamps.get(message.author.id) + (60 * 1000);
    if (latency < xpExpirationTime) {
      xpGain = 0;
    }
  }

  xpTimestamps.set(message.author.id, latency);

  await Members.update(
    {
      last_active: latency,
      afk: null,
      afkMessage: null,
      messages_count: (Member.messages_count + 1),
      xp: (Member.xp + xpGain)
    },
    {
      where: { user_id: message.author.id, guild_id: message.guild.id }
    }
  );

  // Commands
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
      if (cmd.args && (!args.length || cmd.args !== args.length)) {
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
        Guilds,
        Members,
        Member
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
      } else {
        ban_message = ban_message
          .split("%executedBy")
          .join("")
          .split("%executorId")
          .join("")
          .split("%reason")
          .join("none");
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
      } else {
        message = message
          .split("%executedBy")
          .join("")
          .split("%executorId")
          .join("")
          .split("%reason")
          .join("none");
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

// clocks

async function minuteTick () {
  client.guilds.cache.forEach(async (guild) => {
    guild.channels.cache.filter(channel => (channel.type === "voice" && (channel.id !== guild.afkChannelID) && channel.members.filter(member => ((!(member.voice.deaf || member.voice.mute || member.user.bot)))).size > 1)).forEach(async (channel) => {
      channel.members.filter(member => (!(member.voice.deaf || member.voice.mute))).forEach(async (member) => {
        const Member = (await Members.findOrCreate({ where: { user_id: member.user.id, guild_id: guild.id } }))[0].dataValues;
        const xpGain = shared.getRandomInt(10, 50);
        await Members.update(
          {
            voice_count: (Member.voice_count + 1),
            xp: (Member.xp + xpGain)
          },
          { where: { user_id: member.user.id, guild_id: guild.id } }
        );
      });
    });
  });
}

setInterval(minuteTick, 60 * 1000);

// login
client.login(process.env.token);
