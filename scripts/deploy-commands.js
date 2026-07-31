/**
 * Script đăng ký các Slash Commands với Discord REST API
 * Chạy lệnh: npm run deploy
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const logger = require("../src/utils/logger");

async function deployCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || token === "your_bot_token_here") {
    logger.error("❌ LỖI: Cần cấu hình DISCORD_TOKEN hợp lệ trong file .env trước khi deploy commands.");
    return false;
  }

  if (!clientId || clientId === "your_client_id_here") {
    logger.error("❌ LỖI: Cần cấu hình CLIENT_ID hợp lệ trong file .env.");
    return false;
  }

  const commands = [];
  const commandsPath = path.join(__dirname, "../src/commands");
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
      commands.push(command.data.toJSON());
      logger.info(`Đã nạp file lệnh: ${file}`);
    } else {
      logger.warn(`File lệnh ${file} thiếu thuộc tính "data" hoặc "execute".`);
    }
  }

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    logger.info(`Đang đăng ký ${commands.length} slash commands với Discord API...`);

    let data;
    if (guildId && guildId !== "your_guild_id_here") {
      // Đăng ký tức thì cho Guild cụ thể
      data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      logger.info(`✅ Đã đăng ký thành công ${data.length} slash commands cho Guild [${guildId}]!`);
    } else {
      // Đăng ký toàn cục (Global)
      data = await rest.put(Routes.applicationCommands(clientId), { body: commands });
      logger.info(`✅ Đã đăng ký thành công ${data.length} slash commands toàn cục (Global)!`);
    }
    return true;
  } catch (err) {
    logger.error("Lỗi khi đăng ký slash commands:", err);
    return false;
  }
}

if (require.main === module) {
  deployCommands().then((success) => {
    if (!success) process.exit(1);
  });
}

module.exports = { deployCommands };
