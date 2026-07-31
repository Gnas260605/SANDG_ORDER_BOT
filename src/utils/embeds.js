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
    { name: "⏰ Thời gian mong muốn", value: orderData.expectedTime || "Càng sớm càng tốt", inline: true },
    { name: "📝 Ghi chú", value: orderData.note || "Không có", inline: false }
  );
}

/**
 * Embed thông tin đơn hàng chính hiển thị trong Ticket Channel
 */
function createTicketMainEmbed(orderData) {
  const service = SERVICES[orderData.serviceCode] || { name: orderData.serviceName || orderData.serviceCode, unitLabel: "Đơn vị" };
  const statusLabel = STATUS_LABELS[orderData.status] || orderData.status;
  const statusColor = STATUS_COLORS[orderData.status] || COLORS.PRIMARY;

  const embed = createBaseEmbed(
    `📋 TICKET ĐƠN HÀNG [${orderData.orderCode}]`,
    `Đơn hàng dịch vụ **${service.name}** trên hệ thống SandG.`,
    statusColor
  ).addFields(
    { name: "🔖 Mã đơn hàng", value: `\`${orderData.orderCode}\``, inline: true },
    { name: "📌 Trạng thái", value: `**${statusLabel}**`, inline: true },
    { name: "👤 Khách hàng", value: `<@${orderData.customerId}> (${orderData.customerUsername})`, inline: true },
    { name: "📦 Dịch vụ", value: service.name, inline: true },
    { name: "🔢 Số lượng", value: `${orderData.quantity} ${service.unitLabel}`, inline: true },
    { name: "💰 Tổng tiền", value: `**${orderData.totalDisplay}**`, inline: true },
    { name: "⏰ Thời gian mong muốn", value: orderData.expectedTime || "Chưa xác định", inline: true },
    { name: "📝 Ghi chú", value: orderData.note || "Không có", inline: true },
    {
      name: "👨‍💻 Nhân viên xử lý",
      value: orderData.staffId ? `<@${orderData.staffId}>` : "*Chưa có ai nhận đơn*",
      inline: true,
    }
  );

  return embed;
}

/**
 * Embed xem chi tiết trạng thái đơn (/donhang)
 */
function createOrderStatusEmbed(orderData) {
  const statusLabel = STATUS_LABELS[orderData.status] || orderData.status;
  const statusColor = STATUS_COLORS[orderData.status] || COLORS.PRIMARY;

  const embed = createBaseEmbed(
    `🔍 CHI TIẾT ĐƠN HÀNG [${orderData.orderCode}]`,
    null,
    statusColor
  ).addFields(
    { name: "🔖 Mã đơn", value: `\`${orderData.orderCode}\``, inline: true },
    { name: "📌 Trạng thái", value: `**${statusLabel}**`, inline: true },
    { name: "👤 Khách hàng", value: `<@${orderData.customerId}>`, inline: true },
    { name: "📦 Dịch vụ", value: orderData.serviceName, inline: true },
    { name: "🔢 Số lượng", value: `${orderData.quantity}`, inline: true },
    { name: "💰 Tổng tiền", value: `**${orderData.totalDisplay}**`, inline: true },
    { name: "⏰ Thời gian mong muốn", value: orderData.expectedTime || "Không", inline: true },
    { name: "👨‍💻 Nhân viên", value: orderData.staffId ? `<@${orderData.staffId}>` : "Chưa nhận", inline: true },
    { name: "📅 Ngày tạo", value: `<t:${Math.floor(new Date(orderData.createdAt).getTime() / 1000)}:F>`, inline: false }
  );

  if (orderData.ticketChannelId) {
    embed.addFields({ name: "💬 Kênh Ticket", value: `<#${orderData.ticketChannelId}>`, inline: true });
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
  createOrderStatusEmbed,
  createMyOrdersEmbed,
  createPriceListEmbed,
  createSetupEmbed,
  createErrorEmbed,
  createSuccessEmbed,
};
