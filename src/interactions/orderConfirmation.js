/**
 * Interaction Handler - Xử lý khi khách bấm nút "Xác nhận đặt đơn" hoặc "Hủy" từ Embed xem trước
 */

const { createNewOrder, updateTicketInfo, getActiveOrderByCustomerId } = require("../services/orderService");
const { createOrderTicketChannel } = require("../services/ticketService");
const { createSuccessEmbed, createErrorEmbed } = require("../utils/embeds");
const logger = require("../utils/logger");

async function handleOrderConfirmation(interaction) {
  const customId = interaction.customId;

  // 1. NẾU CHỌN HỦY ĐƠN HÀNG
  if (customId === require("../config/constants").CUSTOM_IDS.CANCEL_ORDER) {
    return interaction.update({
      embeds: [createErrorEmbed("🔴 ĐÃ HỦY THAO TÁC", "Bạn đã hủy thao tác đặt đơn hàng.")],
      components: [],
    });
  }

  // Chống bấm liên tục tạo đơn trùng lặp (Race Condition Mutex)
  if (!interaction.client.activeConfirmations) {
    interaction.client.activeConfirmations = new Set();
  }

  if (interaction.client.activeConfirmations.has(interaction.user.id)) {
    return interaction.reply({
      embeds: [createErrorEmbed("⏳ ĐANG XỬ LÝ", "Đơn hàng của bạn đang được khởi tạo, vui lòng không bấm liên tục!")],
      ephemeral: true,
    });
  }

  // 2. KHÁCH XÁC NHẬN ĐẶT ĐƠN: customId dạng sandg_btn_confirm_order:SERVICE_CODE:QTY
  const parts = customId.split(":");
  const serviceCode = parts[1];

  const sessionKey = `${interaction.user.id}:${serviceCode}`;
  const tempOrderData = interaction.client.tempOrderData ? interaction.client.tempOrderData.get(sessionKey) : null;

  if (!tempOrderData) {
    return interaction.update({
      embeds: [
        createErrorEmbed(
          "❌ HẾT HẠN PHIÊN GIAO DỊCH",
          "Phiên làm việc đặt đơn đã hết hạn. Vui lòng gõ lệnh `/datdon` hoặc bấm nút Đặt Đơn lại."
        ),
      ],
      components: [],
    });
  }

  // 3. KIỂM TRA XEM KHÁCH ĐÃ CÓ ĐƠN HÀNG ĐANG XỬ LÝ CHƯA (CHỐNG TẠO 2 ĐƠN CÙNG LÚC)
  const activeOrder = getActiveOrderByCustomerId(interaction.user.id);
  if (activeOrder && activeOrder.ticket_channel_id) {
    const existingChannel = interaction.guild.channels.cache.get(activeOrder.ticket_channel_id);
    if (existingChannel) {
      return interaction.update({
        embeds: [
          createErrorEmbed(
            "⚠️ BẠN ĐÃ CÓ 1 ĐƠN HÀNG ĐANG XỬ LÝ",
            `Bạn hiện đang có đơn hàng mã \`${activeOrder.order_code}\` chưa hoàn thành tại kênh <#${activeOrder.ticket_channel_id}>.\n` +
              `Vui lòng hoàn tất hoặc hoàn thành đơn hàng hiện tại trước khi tạo đơn hàng mới!`
          ),
        ],
        components: [],
      });
    }
  }

  interaction.client.activeConfirmations.add(interaction.user.id);
  interaction.client.tempOrderData.delete(sessionKey);

  await interaction.deferUpdate();

  try {
    // 4. Lưu đơn vào SQLite Database
    const orderData = createNewOrder(
      interaction.user.id,
      interaction.user.tag || interaction.user.username,
      tempOrderData.serviceCode,
      tempOrderData.quantity,
      tempOrderData.expectedTime,
      tempOrderData.note
    );

    // 5. Tạo Ticket Channel riêng cho đơn hàng trên Guild
    const ticketResult = await createOrderTicketChannel(interaction.guild, orderData);

    // 6. Cập nhật channel ID & message ID vào SQLite DB
    updateTicketInfo(orderData.id, ticketResult.channel.id, ticketResult.mainMessage.id);

    // 7. Phản hồi riêng tư (ephemeral) gửi thông tin mã đơn & đường dẫn ticket
    const successEmbed = createSuccessEmbed(
      "🎉 ĐẶT ĐƠN HÀNG THÀNH CÔNG!",
      `Đơn hàng của bạn đã được khởi tạo thành công trên hệ thống SandG.\n\n` +
        `• **Mã đơn hàng**: \`${orderData.order_code}\`\n` +
        `• **Kênh Ticket riêng**: <#${ticketResult.channel.id}>\n\n` +
        `Vui lòng truy cập kênh Ticket ở trên để quét mã QR và trao đổi trực tiếp với Admin SandG.`
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
  } finally {
    interaction.client.activeConfirmations.delete(interaction.user.id);
  }
}

module.exports = {
  handleOrderConfirmation,
};
