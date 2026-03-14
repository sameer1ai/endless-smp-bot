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

const CLIENT_ID = "1474979749926277253";
const GUILD_ID = "1474670652798537788";

const SERVER_IP = "endless1.aternos.me";
const PORT = 24408;

const STAFF_ROLE = "1474704662803513475";
const TRAINING_CHANNEL = "1474704854290268171";



const commands = [

new SlashCommandBuilder()
.setName("status")
.setDescription("Check Minecraft server status"),

new SlashCommandBuilder()
.setName("schedule")
.setDescription("View server schedule"),

new SlashCommandBuilder()
.setName("training")
.setDescription("Request training")
.addUserOption(option =>
option.setName("host")
.setDescription("Host for training")
.setRequired(true)
)
.addUserOption(option =>
option.setName("staff")
.setDescription("Supervising staff")
.setRequired(true)
)

].map(cmd => cmd.toJSON());



const rest = new REST({ version:"10" }).setToken(TOKEN);

(async () => {
await rest.put(
Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),
{ body:commands }
);
console.log("Commands Registered");
})();



client.once("ready", () => {
console.log(`Logged in as ${client.user.tag}`);
});



client.on("interactionCreate", async interaction => {

if(!interaction.isChatInputCommand() && !interaction.isButton()) return;



if(interaction.commandName === "status"){

try{

const status = await mc.status(SERVER_IP,PORT);

interaction.reply(
`🟢 Server Online
Players: ${status.players.online}
Ping: ${status.latency}ms`
);

}catch{

interaction.reply("🔴 Server Offline");

}

}



if(interaction.commandName === "schedule"){

interaction.reply(`

📅 Server Schedule (IST)

4:00 PM
5:00 PM
6:00 PM
7:00 PM
8:00 PM
9:00 PM
10:00 PM

Bot pings 15 minutes before.

`);

}



if(interaction.commandName === "training"){

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

components:[row]

});

interaction.reply({
content:"Training request sent!",
ephemeral:true
});

}



if(interaction.isButton()){

if(!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({content:"Only staff can use this",ephemeral:true});

if(interaction.customId === "accept_training")
interaction.reply("Training accepted.");

if(interaction.customId === "deny_training")
interaction.reply("Training denied.");

}

});



client.login(TOKEN);
