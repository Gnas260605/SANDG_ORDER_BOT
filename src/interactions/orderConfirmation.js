/**
 * Interaction Handler - Xử lý khi khách bấm nút "Xác nhận đặt đơn" hoặc "Hủy" từ Embed xem trước
 */

const { createNewOrder, updateTicketInfo } = require("../services/orderService");
const { createOrderTicketChannel } = require("../services/ticketService");
const { createSuccessEmbed, createErrorEmbed } = require("../utils/embeds");
const logger = require("../utils/logger");

async function handleOrderConfirmation(interaction) {
  const customId = interaction.customId;

  // Nếu chọn Hủy đơn hàng
  if (customId === require("../config/constants").CUSTOM_IDS.CANCEL_ORDER) {
    return interaction.update({
      embeds: [createErrorEmbed("🔴 ĐÃ HỦY THAO TÁC", "Bạn đã hủy thao tác đặt đơn hàng.")],
      components: [],
    });
  }

  // Khách xác nhận đặt đơn: customId dạng sandg_btn_confirm_order:SERVICE_CODE:QTY
  const parts = customId.split(":");
  const serviceCode = parts[1];

  const sessionKey = `${interaction.user.id}:${serviceCode}`;
  const tempOrderData = interaction.client.tempOrderData ? interaction.client.tempOrderData.get(sessionKey) : null;

  if (!tempOrderData) {
    return interaction.update({
      embeds: [
        createErrorEmbed(
          "❌ HẾT HẠN PHIÊN GIAO DỊCH",
          "Phiên làm việc đặt đơn đã hết hạn. Vui lòng gõ lệnh `/datdon` để thực hiện lại."
        ),
      ],
      components: [],
    });
  }

  // Xóa temp data để chống bấm xác nhận trùng lặp
  interaction.client.tempOrderData.delete(sessionKey);

  await interaction.deferUpdate();

  try {
    // 1. Lưu đơn vào SQLite Database
    const orderData = createNewOrder(
      interaction.user.id,
      interaction.user.tag || interaction.user.username,
      tempOrderData.serviceCode,
      tempOrderData.quantity,
      tempOrderData.expectedTime,
      tempOrderData.note
    );

    // 2. Tạo Ticket Channel riêng cho đơn hàng trên Guild
    const ticketResult = await createOrderTicketChannel(interaction.guild, orderData);

    // 3. Cập nhật channel ID & message ID vào SQLite DB
    updateTicketInfo(orderData.id, ticketResult.channel.id, ticketResult.mainMessage.id);

    // 4. Phản hồi riêng tư (ephemeral) gửi thông tin mã đơn & đường dẫn ticket
    const successEmbed = createSuccessEmbed(
      "🎉 ĐẶT ĐƠN HÀNG THÀNH CÔNG!",
      `Đơn hàng của bạn đã được khởi tạo thành công trên hệ thống SandG.\n\n` +
        `• **Mã đơn hàng**: \`${orderData.order_code}\`\n` +
        `• **Kênh Ticket riêng**: <#${ticketResult.channel.id}>\n\n` +
        `Vui lòng truy cập kênh Ticket ở trên để trao đổi trực tiếp với Nhân viên SandG.`
    );

    await interaction.editReply({
      embeds: [successEmbed],
      components: [],
    });

    logger.info(
      `Đã tạo đơn hàng thành công: Mã [${orderData.order_code}], Khách hàng [${interaction.user.tag}], Kênh [${ticketResult.channel.name}]`
    );
  } catch (err) {
    logger.error("Lỗi khi xử lý tạo đơn hàng & ticket:", err);
    await interaction.editReply({
      embeds: [
        createErrorEmbed(
          "❌ LỖI TẠO ĐƠN HÀNG",
          `Không thể tạo kênh Ticket cho đơn hàng. Vui lòng liên hệ Administrator server SandG. Chi tiết: ${err.message}`
        ),
      ],
      components: [],
    });
  }
}

module.exports = {
  handleOrderConfirmation,
};
