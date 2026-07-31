/**
 * Utilities kiểm tra quyền hạn thành viên Discord Server
 */

const { PermissionsBitField } = require("discord.js");

/**
 * Kiểm tra xem thành viên có vai trò Staff hoặc Admin không
 */
function isStaff(member) {
  if (!member) return false;

  // Quyền Administrator mặc định là Staff/Admin
  if (member.permissions && member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }

  const staffRoleId = process.env.STAFF_ROLE_ID;
  const adminRoleId = process.env.ADMIN_ROLE_ID;

  if (member.roles && member.roles.cache) {
    if (staffRoleId && member.roles.cache.has(staffRoleId)) return true;
    if (adminRoleId && member.roles.cache.has(adminRoleId)) return true;
  }

  return false;
}

/**
 * Kiểm tra xem thành viên có vai trò Admin hay không
 */
function isAdmin(member) {
  if (!member) return false;

  if (member.permissions && member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return true;
  }

  const adminRoleId = process.env.ADMIN_ROLE_ID;
  if (adminRoleId && member.roles && member.roles.cache && member.roles.cache.has(adminRoleId)) {
    return true;
  }

  return false;
}

/**
 * Kiểm tra thành viên có thể quản lý ticket hay không
 */
function canManageTicket(member, customerId) {
  if (!member) return false;
  if (member.id === customerId) return true;
  return isStaff(member);
}

module.exports = {
  isStaff,
  isAdmin,
  canManageTicket,
};
