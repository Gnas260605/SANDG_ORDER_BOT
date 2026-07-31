/**
 * Khởi tạo cấu trúc bảng SQLite (Migrations)
 */

const { getDatabase } = require("./database");
const logger = require("../utils/logger");

function runMigrations() {
  const db = getDatabase();

  logger.info("Đang kiểm tra và chạy SQLite Migrations...");

  // 1. Tạo bảng orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_code TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      customer_username TEXT NOT NULL,
      service_code TEXT NOT NULL,
      service_name TEXT NOT NULL,
      unit_price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total_display TEXT NOT NULL,
      expected_time TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      staff_id TEXT,
      ticket_channel_id TEXT,
      main_message_id TEXT,
      created_at TEXT NOT NULL,
      accepted_at TEXT,
      paid_at TEXT,
      started_at TEXT,
      completed_at TEXT,
      cancelled_at TEXT
    );
  `);

  // 2. Tạo bảng order_counter để sinh mã đơn tăng dần an toàn
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_counter (
      id INTEGER PRIMARY KEY DEFAULT 1,
      last_number INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Khởi tạo dòng ban đầu cho order_counter nếu chưa có
  const checkCounter = db.prepare("SELECT count(*) as count FROM order_counter").get();
  if (checkCounter.count === 0) {
    db.prepare("INSERT INTO order_counter (id, last_number) VALUES (1, 0)").run();
  }

  logger.info("Hoàn tất khởi tạo SQLite Migrations!");
}

module.exports = {
  runMigrations,
};
