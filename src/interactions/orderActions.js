/**
 * Interaction Handler - Xử lý các nút điều khiển trong Ticket của Staff & Admin
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { CUSTOM_IDS, ORDER_STATUS } = require("../config/constants");
const {
  acceptOrder,
  updateStatus,
  getOrderByChannelId,
} = require("../services/orderService");
const {
  updateTicketInterface,
  lockTicketChannelPermissions,
  unlockTicketChannelPermissions,
} = require("../services/ticketService");
const { sendTranscriptToLogChannel } = require("../services/transcriptService");
const { isStaff, isAdmin } = require("../utils/permissions");
const { createBaseEmbed, createErrorEmbed, createSuccessEmbed } = require("../utils/embeds");
const logger = require("../utils/logger");

async function handleTicketActions(interaction) {
  const customId = interaction.customId;
  const channel = interaction.channel;

  // Tìm đơn hàng tương ứng với channel ticket này
  const order = getOrderByChannelId(channel.id);
  if (!order) {
    return interaction.reply({
      embeds: [createErrorEmbed("❌ LỖI TICKET", "Không tìm thấy dữ liệu đơn hàng liên kết với kênh này.")],
      ephemeral: true,
    });
  }

  // 1. NÚT NHẬN ĐƠN (ACCEPTED)
  if (customId === CUSTOM_IDS.BTN_ACCEPT) {
    const result = acceptOrder(order.id, interaction.member);
    if (!result.success) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ LỖI NHẬN ĐƠN", result.message)],
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();
    await updateTicketInterface(channel, order.main_message_id, result.order);
    await channel.send({
      content: `🔔 Nhân viên <@${interaction.user.id}> đã tiếp nhận đơn hàng **${result.order.order_code}**! Quý khách vui lòng thanh toán theo hướng dẫn của Staff để mở kênh chat riêng.`,
    });
    return;
  }

  // 2. NÚT ĐÃ THANH TOÁN (PAID)
  if (customId === CUSTOM_IDS.BTN_PAID) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Nhân viên Staff mới có thể cập nhật trạng thái thanh toán.")],
        ephemeral: true,
      });
    }

    const result = updateStatus(order.id, ORDER_STATUS.PAID, interaction.member);
    if (!result.success) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ CHUYỂN TRẠNG THÁI THẤT BẠI", result.message)],
        ephemeral: true,
      });
    }

    // Mở quyền gửi tin nhắn cho khách hàng
    await unlockTicketChannelPermissions(channel, order.customer_id);

    await interaction.deferUpdate();
    await updateTicketInterface(channel, order.main_message_id, result.order);
    await channel.send({
      content: `💳 **ĐÃ XÁC NHẬN THANH TOÁN!**\nKênh chat riêng đã được mở cho <@${order.customer_id}>. Quý khách vui lòng gửi **Tên tài khoản & Mật khẩu Roblox** tại đây để Nhân viên bắt đầu cày!`,
    });
    return;
  }

  // 3. NÚT ĐANG THỰC HIỆN (PROCESSING)
  if (customId === CUSTOM_IDS.BTN_PROCESSING) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Nhân viên Staff mới có thể cập nhật trạng thái xử lý.")],
        ephemeral: true,
      });
    }

    const result = updateStatus(order.id, ORDER_STATUS.PROCESSING, interaction.member);
    if (!result.success) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ CHUYỂN TRẠNG THÁI THẤT BẠI", result.message)],
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();
    await updateTicketInterface(channel, order.main_message_id, result.order);
    await channel.send({
      content: `⚙️ Dịch vụ của đơn hàng **${result.order.order_code}** đang được nhân viên cày!`,
    });
    return;
  }

  // 4. NÚT HOÀN THÀNH (COMPLETED)
  if (customId === CUSTOM_IDS.BTN_COMPLETE) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Nhân viên Staff mới có thể xác nhận hoàn thành.")],
        ephemeral: true,
      });
    }

    const result = updateStatus(order.id, ORDER_STATUS.COMPLETED, interaction.member);
    if (!result.success) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ CHUYỂN TRẠNG THÁI THẤT BẠI", result.message)],
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();
    await updateTicketInterface(channel, order.main_message_id, result.order);
    await channel.send({
      content: `🎉 Đơn hàng **${result.order.order_code}** đã **HOÀN THÀNH**! Cảm ơn khách hàng <@${order.customer_id}> đã tin tưởng dịch vụ SandG!`,
    });
    return;
  }

  // 5. NÚT HỦY ĐƠN (CANCELLED)
  if (customId === CUSTOM_IDS.BTN_CANCEL) {
    if (!isStaff(interaction.member) && !isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Staff hoặc Administrator mới có quyền hủy đơn hàng.")],
        ephemeral: true,
      });
    }

    const result = updateStatus(order.id, ORDER_STATUS.CANCELLED, interaction.member);
    if (!result.success) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ CHUYỂN TRẠNG THÁI THẤT BẠI", result.message)],
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();
    await updateTicketInterface(channel, order.main_message_id, result.order);
    await channel.send({
      content: `🔴 Đơn hàng **${result.order.order_code}** đã bị **HỦY** bởi <@${interaction.user.id}>.`,
    });
    return;
  }

  // 6. NÚT ĐÓNG TICKET (Yêu cầu xác nhận lần 2 & khóa chat)
  if (customId === CUSTOM_IDS.BTN_CLOSE_TICKET) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Staff hoặc Admin mới được phép đóng Ticket.")],
        ephemeral: true,
      });
    }

    // Khóa quyền gửi tin nhắn của khách trước
    await lockTicketChannelPermissions(channel, order.customer_id);

    const confirmEmbed = createBaseEmbed(
      "⚠️ XÁC NHẬN ĐÓNG TICKET",
      `Bạn có chắc chắn muốn đóng ticket đơn hàng **${order.order_code}** không?\n` +
        `• Kênh sẽ bị khóa chat.\n` +
        `• File Transcript sẽ được tạo và gửi về Kênh Log.\n` +
        `• Quản trị viên sau đó có thể xóa kênh thủ công.`,
      require("../config/constants").COLORS.WARNING
    );

    const btnConfirmClose = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.BTN_CONFIRM_CLOSE)
      .setLabel("XÁC NHẬN ĐÓNG TICKET")
      .setStyle(ButtonStyle.Danger);

    const btnCancelClose = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.BTN_CANCEL_CLOSE)
      .setLabel("HỦY THAO TÁC")
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(btnConfirmClose, btnCancelClose);

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [row],
    });
    return;
  }

  // 7. XÁC NHẬN ĐÓNG TICKET LẦN 2
  if (customId === CUSTOM_IDS.BTN_CONFIRM_CLOSE) {
    if (!isStaff(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Staff mới được xác nhận đóng ticket.")],
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();

    // Gửi transcript tới LOG_CHANNEL_ID
    await sendTranscriptToLogChannel(interaction.guild, channel, order);

    const closedEmbed = createSuccessEmbed(
      "🔒 TICKET ĐÃ ĐƯỢC ĐÓNG THÀNH CÔNG",
      `File transcript đã được gửi vào kênh log hệ thống.\nQuản trị viên có thể bấm nút bên dưới để xóa kênh thủ công.`
    );

    const btnDelete = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.BTN_DELETE_CHANNEL)
      .setLabel("XÓA KÊNH THỦ CÔNG")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(btnDelete);

    await interaction.editReply({
      embeds: [closedEmbed],
      components: [row],
    });
    return;
  }

  // 8. HỦY THAO TÁC ĐÓNG TICKET
  if (customId === CUSTOM_IDS.BTN_CANCEL_CLOSE) {
    await interaction.message.delete().catch(() => {});
    return;
  }

  // 9. NÚT XÓA KÊNH THỦ CÔNG (ADMIN & STAFF)
  if (customId === CUSTOM_IDS.BTN_DELETE_CHANNEL) {
    if (!isAdmin(interaction.member) && !isStaff(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Administrator hoặc Staff mới có quyền xóa kênh ticket.")],
        ephemeral: true,
      });
    }

    await interaction.reply({ content: "🗑️ Kênh Ticket sẽ bị xóa vĩnh viễn sau 5 giây..." });
    setTimeout(async () => {
      try {
        await channel.delete();
      } catch (err) {
        logger.error("Lỗi khi xóa kênh ticket:", err);
      }
    }, 5000);
  }
}

module.exports = {
  handleTicketActions,
};
