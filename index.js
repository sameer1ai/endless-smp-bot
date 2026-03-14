const {
Client,
GatewayIntentBits,
SlashCommandBuilder,
REST,
Routes,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle
} = require("discord.js");

const mc = require("minecraft-server-util");

const client = new Client({
intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

/* SERVER INFO */

const SERVER_IP = "endless1.aternos.me";
const SERVER_PORT = 24408;

/* CHANNELS */

const STATUS_CHANNEL = "1474702443508928696";
const TRAINING_CHANNEL = "1474704854290268171";
const SCHEDULE_CHANNEL = "1474702443508928696";

/* ROLE */

const STAFF_ROLE = "1474704662803513475";

/* SCHEDULE TIMES */

const OPEN_TIMES = [
"16:00",
"17:00",
"18:00",
"19:00",
"20:00",
"21:00",
"22:00"
];

/* SLASH COMMANDS */

const CLIENT_ID = "1474979749926277253";
const GUILD_ID = "1474670652798537788";

const commands = [

new SlashCommandBuilder()
.setName("status")
.setDescription("Check server status"),

new SlashCommandBuilder()
.setName("schedule")
.setDescription("Show server schedule"),

new SlashCommandBuilder()
.setName("training")
.setDescription("Request training")
.addUserOption(option =>
option.setName("host")
.setDescription("Training host")
.setRequired(true))
.addUserOption(option =>
option.setName("staff")
.setDescription("Supervising staff")
.setRequired(true))

].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
{ body: commands }
);
console.log("Commands registered");
})();

/* BOT READY */

client.once("ready", () => {

console.log(`Bot online: ${client.user.tag}`);

setInterval(updateStatus, 30000);
setInterval(checkSchedule, 60000);

});

/* SERVER STATUS */

async function updateStatus() {

try {

const res = await mc.status(SERVER_IP, SERVER_PORT);

const players = res.players.online;

const channel = await client.channels.fetch(STATUS_CHANNEL);

const newName = `online-${players}`;

if (channel.name !== newName) {
await channel.setName(newName);
}

} catch {

const channel = await client.channels.fetch(STATUS_CHANNEL);

const newName = "offline";

if (channel.name !== newName) {
await channel.setName(newName);
}

}

}

/* SCHEDULE SYSTEM */

async function checkSchedule() {

const now = new Date();

const hours = now.getHours();
const minutes = now.getMinutes();

const current = `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}`;

for (let time of OPEN_TIMES) {

const [h, m] = time.split(":");

const openDate = new Date();
openDate.setHours(h);
openDate.setMinutes(m);
openDate.setSeconds(0);

const warnDate = new Date(openDate.getTime() - 15 * 60000);

const warnTime =
`${String(warnDate.getHours()).padStart(2,"0")}:${String(warnDate.getMinutes()).padStart(2,"0")}`;

if (current === warnTime) {

const channel = await client.channels.fetch(SCHEDULE_CHANNEL);

channel.send(`@everyone ⏰ Server opening at ${time} IST in 15 minutes!\nIP: endless1.aternos.me`);

}

}

}

/* COMMAND HANDLER */

client.on("interactionCreate", async interaction => {

if (interaction.isChatInputCommand()) {

if (interaction.commandName === "status") {

try {

const res = await mc.status(SERVER_IP, SERVER_PORT);

interaction.reply(`🟢 Server Online\nPlayers: ${res.players.online}`);

} catch {

interaction.reply("🔴 Server Offline");

}

}

if (interaction.commandName === "schedule") {

interaction.reply(`📅 Server Schedule (IST)

4:00 PM
5:00 PM
6:00 PM
7:00 PM
8:00 PM
9:00 PM
10:00 PM

Bot pings 15 minutes before.`);

}

if (interaction.commandName === "training") {

const hostUser = interaction.options.getUser("host");
const staffUser = interaction.options.getUser("staff");

const channel = await client.channels.fetch(TRAINING_CHANNEL);

const row = new ActionRowBuilder().addComponents(

new ButtonBuilder()
.setCustomId("accept_training")
.setLabel("Accept")
.setStyle(ButtonStyle.Success),

new ButtonBuilder()
.setCustomId("deny_training")
.setLabel("Deny")
.setStyle(ButtonStyle.Danger)

);

await channel.send({

content:
`<@&${STAFF_ROLE}>

📢 Training Request

Member: ${interaction.user}
Host: ${hostUser}
Supervisor: ${staffUser}`,

components: [row]

});

interaction.reply({
content: "Training request sent!",
ephemeral: true
});

}

}

/* BUTTON SYSTEM */

if (interaction.isButton()) {

if (!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({
content: "Only staff can use this",
ephemeral: true
});

if (interaction.customId === "accept_training")
interaction.reply("Training accepted.");

if (interaction.customId === "deny_training")
interaction.reply("Training denied.");

}

});

client.login(TOKEN);
