/**
 * Quản lý kết nối SQLite Database
 * Hỗ trợ native node:sqlite (Node.js >= 22) hoặc better-sqlite3
 */

const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

const DB_DIR = path.join(__dirname, "../../data");
const DB_PATH = path.join(DB_DIR, "sandg_orders.sqlite");

// Đảm bảo thư mục data/ tồn tại
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance = null;
let dbDriverType = "none";

function getDatabase() {
  if (dbInstance) return dbInstance;

  // Thử sử dụng node:sqlite tích hợp sẵn trong Node.js 22+
  try {
    const { DatabaseSync } = require("node:sqlite");
    dbInstance = new DatabaseSync(DB_PATH);
    dbDriverType = "node:sqlite";
    logger.info(`Đã kết nối cơ sở dữ liệu SQLite tại [${DB_PATH}] bằng [node:sqlite]`);
    return dbInstance;
  } catch {
    // Fallback sang better-sqlite3 nếu có
    try {
      const Database = require("better-sqlite3");
      dbInstance = new Database(DB_PATH);
      dbDriverType = "better-sqlite3";
      logger.info(`Đã kết nối cơ sở dữ liệu SQLite tại [${DB_PATH}] bằng [better-sqlite3]`);
      return dbInstance;
    } catch (err2) {
      logger.error("Không thể khởi tạo driver SQLite (node:sqlite hoặc better-sqlite3):", err2);
      throw err2;
    }
  }
}

/**
 * Đóng kết nối database khi tắt app
 */
function closeDatabase() {
  if (dbInstance) {
    try {
      dbInstance.close();
      logger.info("Đã đóng kết nối SQLite Database.");
    } catch (err) {
      logger.error("Lỗi khi đóng database:", err);
    }
    dbInstance = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase,
  getDriverType: () => dbDriverType,
  DB_PATH,
};
