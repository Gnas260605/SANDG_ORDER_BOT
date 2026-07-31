require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const guildId = process.env.DISCORD_GUILD_ID || "1240850060204445850";
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();

  let orderCategoryId = "";
  let logChannelId = "";

  for (const [id, ch] of channels) {
    if (ch.name.includes("KHU VỰC CÀY THUÊ") && ch.type === 4) {
      orderCategoryId = id;
    }
    if (ch.name.includes("log-đơn-hàng") && ch.type === 0) {
      logChannelId = id;
    }
  }

  console.log(`ORDER_CATEGORY_ID: ${orderCategoryId}`);
  console.log(`LOG_CHANNEL_ID: ${logChannelId}`);

  if (orderCategoryId && logChannelId) {
    const envPath = path.join(__dirname, "..", ".env");
    let envContent = fs.readFileSync(envPath, "utf8");

    envContent = envContent.replace(/ORDER_CATEGORY_ID=.*/, `ORDER_CATEGORY_ID=${orderCategoryId}`);
    envContent = envContent.replace(/LOG_CHANNEL_ID=.*/, `LOG_CHANNEL_ID=${logChannelId}`);

    fs.writeFileSync(envPath, envContent);
    console.log("SUCCESS: Updated .env file!");
  }

  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
