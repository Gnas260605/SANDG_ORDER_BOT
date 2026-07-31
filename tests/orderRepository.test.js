/**
 * Unit Test - SQLite Repository & Sequential Order Code Generation
 */

const test = require("node:test");
const assert = require("node:assert");
const { runMigrations } = require("../src/database/migrations");
const orderRepository = require("../src/database/repositories/orderRepository");

test("SQLite Repository - Sinh mã đơn SANDG-0001 tự tăng không trùng lặp", () => {
  // Khởi tạo migrations
  runMigrations();

  const code1 = orderRepository.generateNextOrderCode();
  const code2 = orderRepository.generateNextOrderCode();

  assert.strictEqual(code1.startsWith("SANDG-"), true);
  assert.strictEqual(code2.startsWith("SANDG-"), true);

  const num1 = parseInt(code1.split("-")[1], 10);
  const num2 = parseInt(code2.split("-")[1], 10);

  assert.strictEqual(num2, num1 + 1);
});

test("SQLite Repository - Tạo và truy vấn đơn hàng thành công", () => {
  runMigrations();

  const mockData = {
    customerId: "user_12345",
    customerUsername: "CustomerTest",
    serviceCode: "FULL_STORY",
    serviceName: "FULL STORY",
    unitPrice: 25000,
    quantity: 1,
    totalDisplay: "25.000 VNĐ",
    expectedTime: "2 tiếng",
    note: "Ghi chú test unit",
  };

  const created = orderRepository.createOrder(mockData);
  assert.notStrictEqual(created, null);
  assert.strictEqual(created.customer_id, "user_12345");
  assert.strictEqual(created.service_code, "FULL_STORY");
  assert.strictEqual(created.status, "PENDING");

  // Fetch lại theo order_code
  const fetched = orderRepository.getOrderByCode(created.order_code);
  assert.strictEqual(fetched.id, created.id);
  assert.strictEqual(fetched.customer_username, "CustomerTest");
});
