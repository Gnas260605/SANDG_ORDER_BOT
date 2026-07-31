/**
 * Unit Test - Validators & Sanitization
 */

const test = require("node:test");
const assert = require("node:assert");
const {
  validateQuantity,
  validateExpectedTime,
  validateNote,
  sanitizeText,
} = require("../src/utils/validators");

test("validateQuantity - Hợp lệ đối với dịch vụ FULL_STORY", () => {
  const res = validateQuantity("5", "FULL_STORY");
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.value, 5);
});

test("validateQuantity - Lỗi khi nhập số âm hoặc chữ", () => {
  const res1 = validateQuantity("-2", "FULL_STORY");
  assert.strictEqual(res1.valid, false);

  const res2 = validateQuantity("abc", "FULL_STORY");
  assert.strictEqual(res2.valid, false);
});

test("validateQuantity - Lỗi khi nhập quá giới hạn maxQuantity", () => {
  const res = validateQuantity("999999", "FULL_STORY");
  assert.strictEqual(res.valid, false);
});

test("validateExpectedTime - Hợp lệ khi nhập từ 2 đến 100 ký tự", () => {
  const res = validateExpectedTime("2 tiếng nữa");
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.value, "2 tiếng nữa");
});

test("validateExpectedTime - Lỗi khi để trống", () => {
  const res = validateExpectedTime("");
  assert.strictEqual(res.valid, false);
});

test("validateNote - Mặc định trả về 'Không có' nếu để trống", () => {
  const res = validateNote("");
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.value, "Không có");
});

test("sanitizeText - Tự động xóa ký tự đặc biệt gây vỡ markdown", () => {
  const text = "Ghi chú *đặc biệt* `test` \\code";
  const clean = sanitizeText(text);
  assert.strictEqual(clean.includes("`"), false);
  assert.strictEqual(clean.includes("*"), false);
});
