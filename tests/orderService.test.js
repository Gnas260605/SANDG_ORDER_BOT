/**
 * Unit Test - Order Service & Pricing & State Machine
 */

const test = require("node:test");
const assert = require("node:assert");
const { calculateTotal } = require("../src/config/services");
const { ORDER_STATUS } = require("../src/config/constants");
const { isValidStateTransition } = require("../src/services/orderService");

test("Pricing Calculation - Kiểm tra tính đúng tiền của tất cả các gói dịch vụ", () => {
  // FULL STORY — 25K
  assert.strictEqual(calculateTotal("FULL_STORY", 1), 25000);
  assert.strictEqual(calculateTotal("FULL_STORY", 2), 50000);

  // MEGUMI — 60K
  assert.strictEqual(calculateTotal("MEGUMI", 1), 60000);

  // ITACHI — 50K
  assert.strictEqual(calculateTotal("ITACHI", 1), 50000);

  // KENPACHI — 20K
  assert.strictEqual(calculateTotal("KENPACHI", 1), 20000);

  // ICHIGO — 15K
  assert.strictEqual(calculateTotal("ICHIGO", 1), 15000);

  // UNIT MYTHIC EVO — 10K / 1 CON
  assert.strictEqual(calculateTotal("UNIT_MYTHIC_EVO", 3), 30000);

  // REROLL — 10K / 50 REROLL
  assert.strictEqual(calculateTotal("REROLL", 2), 20000);

  // TOKEN EVENT ITACHI — 10K / 80K TOKEN
  assert.strictEqual(calculateTotal("TOKEN_EVENT_ITACHI", 5), 50000);

  // RAID — 1K / 1 VÁN
  assert.strictEqual(calculateTotal("RAID", 10), 10000);
});

test("State Machine - Thứ tự chuyển trạng thái chuẩn hợp lệ", () => {
  const staffMember = {
    permissions: { has: () => false },
    roles: { cache: new Map([["staff", {}]]) },
  };
  process.env.STAFF_ROLE_ID = "staff";

  // PENDING -> ACCEPTED
  assert.strictEqual(isValidStateTransition(ORDER_STATUS.PENDING, ORDER_STATUS.ACCEPTED, staffMember).valid, true);

  // ACCEPTED -> PAID
  assert.strictEqual(isValidStateTransition(ORDER_STATUS.ACCEPTED, ORDER_STATUS.PAID, staffMember).valid, true);

  // PAID -> PROCESSING
  assert.strictEqual(isValidStateTransition(ORDER_STATUS.PAID, ORDER_STATUS.PROCESSING, staffMember).valid, true);

  // PROCESSING -> COMPLETED
  assert.strictEqual(isValidStateTransition(ORDER_STATUS.PROCESSING, ORDER_STATUS.COMPLETED, staffMember).valid, true);
});

test("State Machine - Từ chối nhảy cót trạng thái sai thứ tự", () => {
  const staffMember = {
    permissions: { has: () => false },
    roles: { cache: new Map([["staff", {}]]) },
  };
  process.env.STAFF_ROLE_ID = "staff";

  // PENDING -> COMPLETED (Sai quy trình)
  const check = isValidStateTransition(ORDER_STATUS.PENDING, ORDER_STATUS.COMPLETED, staffMember);
  assert.strictEqual(check.valid, false);
});

test("State Machine - Staff có thể Hủy đơn (CANCELLED)", () => {
  const staffMember = {
    permissions: { has: () => false },
    roles: { cache: new Map([["staff", {}]]) },
  };
  process.env.STAFF_ROLE_ID = "staff";

  const check = isValidStateTransition(ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED, staffMember);
  assert.strictEqual(check.valid, true);
});
