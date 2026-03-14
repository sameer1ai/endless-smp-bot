const { Client, GatewayIntentBits } = require("discord.js");
const mc = require("minecraft-server-util");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

const SERVER_IP = "endless1.aternos.me";
const SERVER_PORT = 24408;

const STATUS_CHANNEL = "1474702443508928696";

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  setInterval(updateStatus, 30000);
});

async function updateStatus() {
  try {

    const status = await mc.status(SERVER_IP, SERVER_PORT);

    const channel = await client.channels.fetch(STATUS_CHANNEL);

    const onlinePlayers = status.players.online;

    const newName = `🟢┃online-${onlinePlayers}`;

    if (channel.name !== newName) {
      await channel.setName(newName);
    }

  } catch (error) {

    const channel = await client.channels.fetch(STATUS_CHANNEL);

    const newName = "
