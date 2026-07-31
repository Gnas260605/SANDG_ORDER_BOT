/**
 * Utility khởi tạo các Discord Embed chuẩn phong cách SandG
 */

const { EmbedBuilder } = require("discord.js");
const { COLORS, BRANDING, STATUS_LABELS, STATUS_COLORS } = require("../config/constants");
const { SERVICES, formatCurrency } = require("../config/services");

/**
 * Lấy logo URL từ biến môi trường hoặc fallback logo mặc định
 */
function getLogoUrl() {
  return process.env.SANDG_LOGO_URL || BRANDING.DEFAULT_LOGO;
}

/**
 * Tạo Embed cơ bản phong cách SandG
 */
function createBaseEmbed(title, description, color = COLORS.PRIMARY) {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTimestamp()
    .setFooter({
      text: BRANDING.FOOTER_TEXT,
      iconURL: getLogoUrl(),
    });

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (getLogoUrl()) embed.setThumbnail(getLogoUrl());

  return embed;
}

/**
 * Embed bản xem trước đơn hàng dành cho người dùng xác nhận
 */
function createOrderPreviewEmbed(orderData) {
  const service = SERVICES[orderData.serviceCode];
  const unitPriceFormatted = formatCurrency(service.unitPrice);
  const totalFormatted = formatCurrency(orderData.totalAmount);

  return createBaseEmbed(
    "🛒 XÁC NHẬN ĐẶT ĐƠN HÀNG — SANDG",
    "Vui lòng kiểm tra lại thông tin đơn hàng của bạn trước khi bấm xác nhận.",
    COLORS.CYAN
  ).addFields(
    { name: "📦 Dịch vụ", value: `**${service.name}**`, inline: true },
    { name: "🏷️ Đơn giá", value: unitPriceFormatted, inline: true },
    { name: "🔢 Số lượng", value: `${orderData.quantity} ${service.unitLabel}`, inline: true },
    { name: "💰 Tổng thanh toán", value: `**${totalFormatted}**`, inline: true },
    { name: "⏰ Thời gian mong muốn", value: String(orderData.expectedTime || "Càng sớm càng tốt"), inline: true },
    { name: "📝 Ghi chú", value: String(orderData.note || "Không có"), inline: false }
  );
}

/**
 * Embed thông tin đơn hàng chính hiển thị trong Ticket Channel (Hỗ trợ cả snake_case và camelCase)
 */
function createTicketMainEmbed(orderData) {
  const orderCode = orderData.order_code || orderData.orderCode || "SANDG-0000";
  const customerId = orderData.customer_id || orderData.customerId || "0";
  const customerUsername = orderData.customer_username || orderData.customerUsername || "Khách hàng";
  const serviceCode = orderData.service_code || orderData.serviceCode;
  const serviceName = orderData.service_name || orderData.serviceName || serviceCode;
  const quantity = orderData.quantity || 1;
  const totalDisplay = orderData.total_display || orderData.totalDisplay || "0 VNĐ";
  const expectedTime = orderData.expected_time || orderData.expectedTime || "Chưa xác định";
  const note = orderData.note || "Không có";
  const status = orderData.status || "PENDING";
  const staffId = orderData.staff_id || orderData.staffId;

  const service = SERVICES[serviceCode] || { name: serviceName, unitLabel: "Đơn vị" };
  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || COLORS.PRIMARY;

  const embed = createBaseEmbed(
    `📋 BẢNG CHI TIẾT ĐƠN HÀNG [${orderCode}]`,
    "Thông tin đơn hàng cày thuê dành cho Admin và Staff quản lý ở đầu trang ticket:",
    statusColor
  ).addFields(
    { name: "🔖 Mã đơn hàng", value: `\`${orderCode}\``, inline: true },
    { name: "📌 Trạng thái đơn", value: `**${statusLabel}**`, inline: true },
    { name: "👤 Khách hàng đặt", value: `<@${customerId}>\n\`${customerUsername}\` (ID: ${customerId})`, inline: true },
    { name: "📦 Dịch vụ cày thuê", value: `**${service.name}**`, inline: true },
    { name: "🔢 Số lượng", value: `**${quantity}** (${service.unitLabel})`, inline: true },
    { name: "💰 Tổng tiền thanh toán", value: `**${totalDisplay}**`, inline: true },
    { name: "⏰ Thời gian mong muốn", value: String(expectedTime), inline: true },
    { name: "📝 Ghi chú từ khách", value: String(note), inline: true },
    { name: "👨‍💻 Staff tiếp nhận", value: staffId ? `<@${staffId}>` : "*Chưa có nhân viên nhận đơn*", inline: true }
  );

  return embed;
}

/**
 * Embed hướng dẫn thanh toán & hiển thị Mã QR VietQR của Admin
 */
function createPaymentInstructionsEmbed(orderData) {
  const orderCode = orderData.order_code || orderData.orderCode || "SANDG-0000";
  const totalAmount = orderData.total_amount || orderData.totalAmount || 0;
  const totalDisplay = orderData.total_display || orderData.totalDisplay || formatCurrency(totalAmount);

  const bankId = process.env.BANK_ID || "TCB";
  const bankNo = process.env.BANK_ACCOUNT_NO || "Chưa cấu hình STK";
  const bankName = process.env.BANK_ACCOUNT_NAME || "SANDG SHOP";

  // VietQR Dynamic URL (chuẩn VietQR Techcombank)
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${bankNo}-compact2.png?amount=${totalAmount}&addInfo=${orderCode}&accountName=${encodeURIComponent(bankName)}`;

  const embed = createBaseEmbed(
    `💳 HƯỚNG DẪN THANH TOÁN QUÉT MÃ QR — ${orderCode}`,
    `Quý khách vui lòng chuyển khoản theo thông tin **Techcombank** bên dưới hoặc **QUÉT MÃ QR** để thanh toán tự động:\n\n` +
      `🏛️ **Ngân hàng**: \`Techcombank (${bankId})\`\n` +
      `💳 **Số tài khoản**: \`${bankNo}\`\n` +
      `👤 **Chủ tài khoản**: \`${bankName}\`\n` +
      `📌 **Nội dung chuyển khoản (bắt buộc)**: \`${orderCode}\`\n` +
      `💰 **Số tiền**: **${totalDisplay}**\n\n` +
      `📸 **BƯỚC TIẾP THEO**: Sau khi chuyển khoản thành công, quý khách vui lòng **CHỤP HÌNH HÓA ĐƠN & GỬI VÀO KÊNH NÀY**. Admin sẽ kiểm tra hóa đơn và bấm nhận đơn ngay!`,
    COLORS.WARNING
  );

  if (process.env.BANK_ACCOUNT_NO) {
    embed.setImage(qrUrl);
  }

  return embed;
}

/**
 * Embed xem chi tiết trạng thái đơn (/donhang)
 */
function createOrderStatusEmbed(orderData) {
  const orderCode = orderData.order_code || orderData.orderCode || "SANDG-0000";
  const customerId = orderData.customer_id || orderData.customerId || "0";
  const serviceName = orderData.service_name || orderData.serviceName || "Dịch vụ";
  const quantity = orderData.quantity || 1;
  const totalDisplay = orderData.total_display || orderData.totalDisplay || "0 VNĐ";
  const expectedTime = orderData.expected_time || orderData.expectedTime || "Không";
  const status = orderData.status || "PENDING";
  const staffId = orderData.staff_id || orderData.staffId;
  const ticketChannelId = orderData.ticket_channel_id || orderData.ticketChannelId;
  const createdAt = orderData.created_at || orderData.createdAt || new Date().toISOString();

  const statusLabel = STATUS_LABELS[status] || status;
  const statusColor = STATUS_COLORS[status] || COLORS.PRIMARY;

  const embed = createBaseEmbed(
    `🔍 CHI TIẾT ĐƠN HÀNG [${orderCode}]`,
    null,
    statusColor
  ).addFields(
    { name: "🔖 Mã đơn", value: `\`${orderCode}\``, inline: true },
    { name: "📌 Trạng thái", value: `**${statusLabel}**`, inline: true },
    { name: "👤 Khách hàng", value: `<@${customerId}>`, inline: true },
    { name: "📦 Dịch vụ", value: String(serviceName), inline: true },
    { name: "🔢 Số lượng", value: `${quantity}`, inline: true },
    { name: "💰 Tổng tiền", value: `**${totalDisplay}**`, inline: true },
    { name: "⏰ Thời gian mong muốn", value: String(expectedTime), inline: true },
    { name: "👨‍💻 Nhân viên", value: staffId ? `<@${staffId}>` : "Chưa nhận", inline: true },
    { name: "📅 Ngày tạo", value: `<t:${Math.floor(new Date(createdAt).getTime() / 1000)}:F>`, inline: false }
  );

  if (ticketChannelId) {
    embed.addFields({ name: "💬 Kênh Ticket", value: `<#${ticketChannelId}>`, inline: true });
  }

  return embed;
}

/**
 * Embed danh sách đơn hàng gần đây (/doncuatoi)
 */
function createMyOrdersEmbed(orders, username) {
  const embed = createBaseEmbed(
    `📜 DẠNH SÁCH ĐƠN HÀNG GẦN ĐÂY — ${username}`,
    orders.length === 0 ? "Bạn chưa có đơn hàng nào trên hệ thống." : `Hiển thị ${orders.length} đơn hàng gần nhất của bạn:`,
    COLORS.CYAN
  );

  orders.forEach((ord) => {
    const statusLabel = STATUS_LABELS[ord.status] || ord.status;
    embed.addFields({
      name: `Mã đơn: ${ord.order_code} (${statusLabel})`,
      value: `• Dịch vụ: **${ord.service_name}** | Số lượng: **${ord.quantity}**\n• Giá: **${ord.total_display}** | Kênh: ${ord.ticket_channel_id ? `<#${ord.ticket_channel_id}>` : "Đã đóng"}`,
      inline: false,
    });
  });

  return embed;
}

/**
 * Embed bảng giá dịch vụ (/banggia)
 */
function createPriceListEmbed() {
  const embed = createBaseEmbed(
    "⚡ BẢNG GIÁ DỊCH VỤ ANIME EXPEDITION — SANDG",
    "Sử dụng lệnh `/datdon` để tiến hành tạo đơn hàng mới ngay lập tức!",
    COLORS.CYAN
  );

  Object.values(SERVICES).forEach((svc) => {
    embed.addFields({
      name: `✨ ${svc.name}`,
      value: `• Giá: **${svc.displayPrice}**\n• Mô tả: *${svc.description}*`,
      inline: true,
    });
  });

  return embed;
}

/**
 * Embed kết quả kiểm tra hệ thống (/setup)
 */
function createSetupEmbed(results) {
  const embed = createBaseEmbed(
    "⚙️ HỆ THỐNG KIỂM TRA CẤU HÌNH SANDG BOT",
    "Kết quả kiểm tra các ID đã cấu hình trong môi trường (`.env`):",
    results.allValid ? COLORS.SUCCESS : COLORS.DANGER
  );

  results.items.forEach((item) => {
    const statusIcon = item.valid ? "✅" : "❌";
    embed.addFields({
      name: `${statusIcon} ${item.name}`,
      value: `• Key: \`${item.key}\`\n• Value: ${item.value ? `\`${item.value}\`` : "*Chưa cấu hình*"}\n• Chi tiết: ${item.details}`,
      inline: false,
    });
  });

  return embed;
}

/**
 * Embed báo lỗi
 */
function createErrorEmbed(title, description) {
  return createBaseEmbed(title || "❌ ĐÃ XẢY RA LỖI", description, COLORS.DANGER);
}

/**
 * Embed báo thành công
 */
function createSuccessEmbed(title, description) {
  return createBaseEmbed(title || "✅ THÀNH CÔNG", description, COLORS.SUCCESS);
}

module.exports = {
  createBaseEmbed,
  createOrderPreviewEmbed,
  createTicketMainEmbed,
  createPaymentInstructionsEmbed,
  createOrderStatusEmbed,
  createMyOrdersEmbed,
  createPriceListEmbed,
  createSetupEmbed,
  createErrorEmbed,
  createSuccessEmbed,
};
