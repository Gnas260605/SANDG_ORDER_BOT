/**
 * Interaction Handler - Xử lý các nút điều khiển trong Ticket của Staff & Admin
 * Quy trình: Đặt đơn -> QR Admin -> User gửi ảnh thanh toán -> Admin nhận đơn -> Admin hoàn thành (tự đóng 30p)
 */

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { CUSTOM_IDS, ORDER_STATUS } = require("../config/constants");
const {
  updateStatus,
  getOrderByChannelId,
} = require("../services/orderService");
const {
  updateTicketInterface,
  lockTicketChannelPermissions,
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

  // 1. NÚT ADMIN NHẬN ĐƠN & BẮT ĐẦU CÀY
  if (customId === CUSTOM_IDS.BTN_ACCEPT) {
    if (!isStaff(interaction.member) && !isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Admin/Staff mới có thể nhận đơn hàng.")],
        ephemeral: true,
      });
    }

    const result = updateStatus(order.id, ORDER_STATUS.PROCESSING, interaction.member);
    if (!result.success) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ LỖI NHẬN ĐƠN", result.message)],
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();
    await updateTicketInterface(channel, order.main_message_id, result.order);
    await channel.send({
      content: `✅ **ADMIN / STAFF <@${interaction.user.id}> ĐÃ XÁC NHẬN CHUYỂN KHOẢN VÀ NHẬN ĐƠN!**\nQuý khách <@${order.customer_id}> vui lòng nhắn **Tên tài khoản & Mật khẩu Roblox** tại đây để Admin tiến hành cày nhé!`,
    });
    return;
  }

  // 2. NÚT ADMIN HOÀN THÀNH ĐƠN (TỰ ĐÓNG TICKET SAU 30 PHÚT)
  if (customId === CUSTOM_IDS.BTN_COMPLETE) {
    if (!isStaff(interaction.member) && !isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Admin/Staff mới có thể hoàn thành đơn hàng.")],
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

    const closeTimestamp = Math.floor((Date.now() + 30 * 60 * 1000) / 1000);

    await channel.send({
      content:
        `🎉 **ĐƠN HÀNG ĐÃ HOÀN THÀNH!**\n` +
        `Admin <@${interaction.user.id}> đã đánh dấu **HOÀN THÀNH** cho đơn **${order.order_code}**!\n` +
        `Cảm ơn quý khách <@${order.customer_id}> đã tin tưởng và sử dụng dịch vụ của SandG!\n\n` +
        `⏳ **LƯU Ý**: Ticket này sẽ **tự động lưu Log và xóa kênh sau 30 phút** (vào lúc <t:${closeTimestamp}:T>).`,
    });

    // Tự động đếm ngược 30 phút -> Tạo transcript -> Xóa kênh ticket
    setTimeout(async () => {
      try {
        if (channel && channel.deletable) {
          await sendTranscriptToLogChannel(interaction.guild, channel, result.order);
          await channel.delete();
          logger.info(`Đã tự động đóng & xóa ticket ${channel.name} sau 30 phút hoàn thành.`);
        }
      } catch (err) {
        logger.error("Lỗi khi tự động xóa kênh ticket sau 30p:", err);
      }
    }, 30 * 60 * 1000);

    return;
  }

  // 3. NÚT HỦY ĐƠN (CANCELLED)
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

  // 4. NÚT ĐÓNG TICKET & LƯU LOG THỦ CÔNG
  if (customId === CUSTOM_IDS.BTN_CLOSE_TICKET) {
    if (!isStaff(interaction.member) && !isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Staff hoặc Admin mới được phép đóng Ticket.")],
        ephemeral: true,
      });
    }

    await lockTicketChannelPermissions(channel, order.customer_id);

    const confirmEmbed = createBaseEmbed(
      "⚠️ XÁC NHẬN ĐÓNG TICKET",
      `Bạn có chắc chắn muốn đóng ticket đơn hàng **${order.order_code}** không?\n` +
        `• Kênh sẽ bị khóa chat.\n` +
        `• File Transcript sẽ được tạo và gửi về Kênh Log hệ thống.`,
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

  // 5. XÁC NHẬN ĐÓNG TICKET LẦN 2
  if (customId === CUSTOM_IDS.BTN_CONFIRM_CLOSE) {
    if (!isStaff(interaction.member) && !isAdmin(interaction.member)) {
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

  // 6. HỦY THAO TÁC ĐÓNG TICKET
  if (customId === CUSTOM_IDS.BTN_CANCEL_CLOSE) {
    await interaction.message.delete().catch(() => {});
    return;
  }

  // 7. NÚT XÓA KÊNH THỦ CÔNG (ADMIN & STAFF)
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
