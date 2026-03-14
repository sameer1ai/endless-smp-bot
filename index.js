const { Client, GatewayIntentBits } = require("discord.js");
const mc = require("minecraft-server-util");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

const SERVER_IP = "endless1.aternos.me";
const SERVER_PORT = 24408;

const CHANNEL_ID = "1474702443508928696";

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  setInterval(updateStatus, 30000);
});

async function updateStatus() {

  try {

    const response = await mc.status(SERVER_IP, SERVER_PORT);

    const players = response.players.online;

    const channel = await client.channels.fetch(CHANNEL_ID);

    const newName = `online-${players}`;

    if (channel.name !== newName) {
      await channel.setName(newName);
    }

  } catch (error) {

    const channel = await client.channels.fetch(CHANNEL_ID);

    const newName = "offline";

    if (channel.name !== newName) {
      await channel.setName(newName);
    }

  }

}

client.login(TOKEN);
