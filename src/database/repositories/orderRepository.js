/**
 * Order Repository - Xử lý thao tác với bảng orders trong SQLite bằng Prepared Statements
 */

const { getDatabase } = require("../database");
const logger = require("../../utils/logger");

/**
 * Sinh mã đơn hàng tăng dần theo dạng SANDG-0001 an toàn không bị trùng
 */
function generateNextOrderCode() {
  const db = getDatabase();

  db.exec("BEGIN TRANSACTION;");
  try {
    const row = db.prepare("SELECT last_number FROM order_counter WHERE id = 1").get();
    const nextNum = (row ? row.last_number : 0) + 1;

    db.prepare("UPDATE order_counter SET last_number = ? WHERE id = 1").run(nextNum);
    db.exec("COMMIT;");

    const paddedNum = String(nextNum).padStart(4, "0");
    return `SANDG-${paddedNum}`;
  } catch (err) {
    db.exec("ROLLBACK;");
    logger.error("Lỗi khi sinh mã đơn hàng:", err);
    throw err;
  }
}

/**
 * Tạo một đơn hàng mới
 */
function createOrder(data) {
  const db = getDatabase();
  const orderCode = generateNextOrderCode();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO orders (
      order_code, customer_id, customer_username, service_code, service_name,
      unit_price, quantity, total_display, expected_time, note,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
  `);

  stmt.run(
    orderCode,
    data.customerId,
    data.customerUsername,
    data.serviceCode,
    data.serviceName,
    data.unitPrice,
    data.quantity,
    data.totalDisplay,
    data.expectedTime,
    data.note || "Không có",
    createdAt
  );

  return getOrderByCode(orderCode);
}

/**
 * Lấy đơn hàng theo mã đơn
 */
function getOrderByCode(orderCode) {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM orders WHERE order_code = ?");
  return stmt.get(orderCode) || null;
}

/**
 * Lấy đơn hàng theo ID
 */
function getOrderById(id) {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM orders WHERE id = ?");
  return stmt.get(id) || null;
}

/**
 * Lấy đơn hàng theo Ticket Channel ID
 */
function getOrderByChannelId(channelId) {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM orders WHERE ticket_channel_id = ?");
  return stmt.get(channelId) || null;
}

/**
 * Lấy danh sách tối đa N đơn hàng gần nhất của người dùng
 */
function getUserRecentOrders(customerId, limit = 10) {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC LIMIT ?");
  return stmt.all(customerId, limit) || [];
}

/**
 * Cập nhật thông tin kênh Ticket (Channel ID & Main Message ID)
 */
function updateTicketInfo(orderId, channelId, messageId) {
  const db = getDatabase();
  const stmt = db.prepare("UPDATE orders SET ticket_channel_id = ?, main_message_id = ? WHERE id = ?");
  return stmt.run(channelId, messageId, orderId);
}

/**
 * Cập nhật trạng thái đơn hàng
 */
function updateOrderStatus(orderId, status, staffId = null, timestampField = null) {
  const db = getDatabase();
  const now = new Date().toISOString();

  let sql = "UPDATE orders SET status = ?";
  const params = [status];

  if (staffId) {
    sql += ", staff_id = ?";
    params.push(staffId);
  }

  if (timestampField) {
    const validTimeFields = ["accepted_at", "paid_at", "started_at", "completed_at", "cancelled_at"];
    if (validTimeFields.includes(timestampField)) {
      sql += `, ${timestampField} = ?`;
      params.push(now);
    }
  }

  sql += " WHERE id = ?";
  params.push(orderId);

  const stmt = db.prepare(sql);
  stmt.run(...params);

  return getOrderById(orderId);
}

module.exports = {
  generateNextOrderCode,
  createOrder,
  getOrderByCode,
  getOrderById,
  getOrderByChannelId,
  getUserRecentOrders,
  updateTicketInfo,
  updateOrderStatus,
};
