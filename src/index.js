/**
 * Entry Point chính của SANDG ORDER BOT
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const { runMigrations } = require("./database/migrations");
const logger = require("./utils/logger");

// 1. Kiểm tra tham số dòng lệnh --verify-config
const isVerifyOnly = process.argv.includes("--verify-config");

// 2. Khởi tạo Discord Client với chỉ các Intent tối thiểu thực sự cần thiết
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

// 3. Nạp động các lệnh Slash Commands từ src/commands/
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    logger.info(`Đã nạp lệnh Slash: /${command.data.name}`);
  }
}

// 4. Nạp động các Event Handlers từ src/events/
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// 5. Kiểm tra môi trường & Đăng nhập
const token = process.env.DISCORD_TOKEN;
const isDummyToken = !token || token === "your_bot_token_here";

if (isVerifyOnly || isDummyToken) {
  logger.warn("========================================================================");
  logger.warn("⚠️ ĐANG CHẠY Ở CHẾ ĐỘ THỬ NGHIỆM KÍCH HOẠT (CONFIG VERIFICATION MODE)");
  logger.warn("Chưa cấu hình DISCORD_TOKEN thật trong file .env hoặc đang chạy test.");
  logger.warn("Thực hiện kiểm tra SQLite Database, migrations và module loaders...");
  logger.warn("========================================================================");

  try {
    runMigrations();
    logger.info(`✅ [CONFIG CHECK SUCCESS] Đã khởi tạo SQLite DB, ${client.commands.size} commands và event handlers thành công!`);
    if (isVerifyOnly) {
      process.exit(0);
    }
  } catch (err) {
    logger.error("❌ [CONFIG CHECK FAILED] Lỗi khi nạp hệ thống:", err);
    process.exit(1);
  }
} else {
  // Đăng nhập kết nối với Discord Gateway
  client.login(token).catch((err) => {
    logger.error("❌ Lỗi khi đăng nhập bot Discord:", err.message);
    process.exit(1);
  });
}
