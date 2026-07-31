/**
 * Unit Test - Permissions Helper Logic
 */

const test = require("node:test");
const assert = require("node:assert");
const { PermissionsBitField } = require("discord.js");
const { isStaff, isAdmin } = require("../src/utils/permissions");

test("isStaff - Trả về true nếu member có quyền Administrator", () => {
  const mockAdminMember = {
    permissions: new PermissionsBitField(PermissionsBitField.Flags.Administrator),
    roles: { cache: new Map() },
  };
  assert.strictEqual(isStaff(mockAdminMember), true);
});

test("isStaff - Trả về true nếu member có STAFF_ROLE_ID", () => {
  process.env.STAFF_ROLE_ID = "role_staff_123";
  const mockStaffMember = {
    permissions: new PermissionsBitField(),
    roles: {
      cache: new Map([["role_staff_123", { id: "role_staff_123" }]]),
    },
  };
  assert.strictEqual(isStaff(mockStaffMember), true);
});

test("isStaff - Trả về false nếu member không có role phù hợp", () => {
  process.env.STAFF_ROLE_ID = "role_staff_123";
  process.env.ADMIN_ROLE_ID = "role_admin_456";
  const mockNormalMember = {
    permissions: new PermissionsBitField(),
    roles: { cache: new Map() },
  };
  assert.strictEqual(isStaff(mockNormalMember), false);
});

test("isAdmin - Trả về true nếu member có ADMIN_ROLE_ID", () => {
  process.env.ADMIN_ROLE_ID = "role_admin_456";
  const mockAdminMember = {
    permissions: new PermissionsBitField(),
    roles: {
      cache: new Map([["role_admin_456", { id: "role_admin_456" }]]),
    },
  };
  assert.strictEqual(isAdmin(mockAdminMember), true);
});
