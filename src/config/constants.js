/**
 * Hằng số cấu hình hệ thống SandG Order Bot
 */

const ORDER_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const STATUS_LABELS = {
  PENDING: "Chờ nhận đơn",
  ACCEPTED: "Đã nhận đơn",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_COLORS = {
  PENDING: "#FFB300",    // Vàng cam
  ACCEPTED: "#00E5FF",   // Xanh Cyan
  PAID: "#29B6F6",       // Xanh dương sáng
  PROCESSING: "#7C4DFF", // Tím neon
  COMPLETED: "#00E676",  // Xanh lá tươi
  CANCELLED: "#FF1744",  // Đỏ rực
};

const COLORS = {
  CYAN: "#00E5FF",
  NAVY: "#0A192F",
  SUCCESS: "#00E676",
  WARNING: "#FFB300",
  DANGER: "#FF1744",
  PRIMARY: "#00E5FF",
};

const BRANDING = {
  FOOTER_TEXT: "SandG • Uy tín – Nhanh chóng – Hỗ trợ 24/7",
  DEFAULT_LOGO: "https://cdn-icons-png.flaticon.com/512/686/686589.png",
};

const CUSTOM_IDS = {
  SELECT_SERVICE: "sandg_select_service",
  MODAL_ORDER_INFO: "sandg_modal_order_info",
  MODAL_INPUT_QTY: "input_quantity",
  MODAL_INPUT_TIME: "input_expected_time",
  MODAL_INPUT_NOTE: "input_note",
  CONFIRM_ORDER: "sandg_btn_confirm_order",
  CANCEL_ORDER: "sandg_btn_cancel_order",
  
  // Panel Custom IDs
  OPEN_ORDER_MENU: "sandg_open_order_menu",
  SHOW_PRICE_LIST: "sandg_show_price_list",
  
  // Ticket Actions
  BTN_ACCEPT: "sandg_ticket_accept",
  BTN_PAID: "sandg_ticket_paid",
  BTN_PROCESSING: "sandg_ticket_processing",
  BTN_COMPLETE: "sandg_ticket_complete",
  BTN_CANCEL: "sandg_ticket_cancel",
  BTN_CLOSE_TICKET: "sandg_ticket_close",
  BTN_CONFIRM_CLOSE: "sandg_ticket_confirm_close",
  BTN_CANCEL_CLOSE: "sandg_ticket_cancel_close",
  BTN_DELETE_CHANNEL: "sandg_ticket_delete_channel",
};

module.exports = {
  ORDER_STATUS,
  STATUS_LABELS,
  STATUS_COLORS,
  COLORS,
  BRANDING,
  CUSTOM_IDS,
};
