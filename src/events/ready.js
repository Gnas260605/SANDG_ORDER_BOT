/**
 * Discord Event Handler - Khi Bot kết nối thành công và sẵn sàng
 */

const { Events } = require("discord.js");
const { runMigrations } = require("../database/migrations");
const logger = require("../utils/logger");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    logger.info(`🤖 SandG Order Bot đã đăng nhập thành công với tài khoản [${client.user.tag}]!`);

    // Khởi chạy Database Migrations
    try {
      runMigrations();
    } catch (err) {
      logger.error("Không thể hoàn tất Database Migrations khi khởi động:", err);
    }
  },
};
