/**
 * Order Service - Quản lý quy trình xử lý đơn hàng & State Machine trạng thái
 */

const orderRepository = require("../database/repositories/orderRepository");
const { ORDER_STATUS } = require("../config/constants");
const { SERVICES, formatCurrency } = require("../config/services");
const { isStaff, isAdmin } = require("../utils/permissions");

/**
 * Thứ tự chuyển trạng thái chuẩn của đơn hàng
 */
const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.ACCEPTED, ORDER_STATUS.PROCESSING],
  [ORDER_STATUS.ACCEPTED]: [ORDER_STATUS.PAID, ORDER_STATUS.PROCESSING],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.PROCESSING],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.COMPLETED],
};

/**
 * Kiểm tra việc chuyển trạng thái có hợp lệ hay không
 */
function isValidStateTransition(currentStatus, targetStatus, member) {
  // Trạng thái đã hoàn thành hoặc hủy thì không được chuyển tiếp nữa
  if (currentStatus === ORDER_STATUS.COMPLETED || currentStatus === ORDER_STATUS.CANCELLED) {
    return { valid: false, message: `Đơn hàng đã ở trạng thái [${currentStatus}], không thể thay đổi nữa.` };
  }

  // Quản trị viên (Admin) có quyền hủy đơn bất kỳ lúc nào ngoại trừ đơn đã hoàn thành
  if (targetStatus === ORDER_STATUS.CANCELLED) {
    if (isStaff(member) || isAdmin(member)) {
      return { valid: true };
    }
    return { valid: false, message: "Chỉ Staff hoặc Administrator mới có quyền hủy đơn hàng." };
  }

  // Chuyển trạng thái theo quy trình chuẩn
  const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
  const allowedList = Array.isArray(allowedNext) ? allowedNext : [allowedNext];

  if (allowedList.includes(targetStatus)) {
    return { valid: true };
  }

  return {
    valid: false,
    message: `Không thể chuyển trạng thái từ [${currentStatus}] sang [${targetStatus}].`,
  };
}

/**
 * Tạo đơn hàng mới trong DB
 */
function createNewOrder(customerId, customerUsername, serviceCode, quantity, expectedTime, note) {
  const service = SERVICES[serviceCode];
  if (!service) throw new Error("Dịch vụ không tồn tại");

  const qty = parseInt(quantity, 10);
  const totalAmount = service.unitPrice * qty;
  const totalDisplay = formatCurrency(totalAmount);

  return orderRepository.createOrder({
    customerId,
    customerUsername,
    serviceCode,
    serviceName: service.name,
    unitPrice: service.unitPrice,
    quantity: qty,
    totalDisplay,
    expectedTime,
    note,
  });
}

/**
 * Nhân viên nhận đơn hàng
 */
function acceptOrder(orderId, member) {
  if (!isStaff(member)) {
    return { success: false, message: "Bạn không có vai trò Staff để nhận đơn hàng này." };
  }

  const order = orderRepository.getOrderById(orderId);
  if (!order) return { success: false, message: "Không tìm thấy đơn hàng." };

  if (order.status !== ORDER_STATUS.PENDING) {
    return { success: false, message: `Đơn hàng đã được xử lý hoặc ở trạng thái [${order.status}].` };
  }

  if (order.staff_id) {
    return { success: false, message: `Đơn hàng này đã được nhân viên <@${order.staff_id}> nhận trước đó!` };
  }

  const updatedOrder = orderRepository.updateOrderStatus(orderId, ORDER_STATUS.ACCEPTED, member.id, "accepted_at");
  return { success: true, order: updatedOrder };
}

/**
 * Cập nhật trạng thái đơn hàng nâng cao
 */
function updateStatus(orderId, targetStatus, member) {
  const order = orderRepository.getOrderById(orderId);
  if (!order) return { success: false, message: "Không tìm thấy đơn hàng." };

  const check = isValidStateTransition(order.status, targetStatus, member);
  if (!check.valid) return { success: false, message: check.message };

  let timeField = null;
  if (targetStatus === ORDER_STATUS.PAID) timeField = "paid_at";
  if (targetStatus === ORDER_STATUS.PROCESSING) timeField = "started_at";
  if (targetStatus === ORDER_STATUS.COMPLETED) timeField = "completed_at";
  if (targetStatus === ORDER_STATUS.CANCELLED) timeField = "cancelled_at";

  const updatedOrder = orderRepository.updateOrderStatus(orderId, targetStatus, null, timeField);
  return { success: true, order: updatedOrder };
}

module.exports = {
  createNewOrder,
  acceptOrder,
  updateStatus,
  isValidStateTransition,
  getOrderById: orderRepository.getOrderById,
  getOrderByCode: orderRepository.getOrderByCode,
  getOrderByChannelId: orderRepository.getOrderByChannelId,
  getUserRecentOrders: orderRepository.getUserRecentOrders,
  updateTicketInfo: orderRepository.updateTicketInfo,
};
