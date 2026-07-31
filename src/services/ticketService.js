/**
 * Ticket Service - Quản lý tạo Kênh Ticket và Giao diện nút bấm trên Discord Server
 */

const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { CUSTOM_IDS, ORDER_STATUS } = require("../config/constants");
const { createTicketMainEmbed, createPaymentInstructionsEmbed } = require("../utils/embeds");
const logger = require("../utils/logger");

/**
 * Tạo danh sách hàng nút bấm (ActionRows) điều khiển Ticket theo Quy trình:
 * 1. Đặt đơn -> Hiện QR Admin
 * 2. User gửi ảnh hóa đơn
 * 3. Admin bấm "NHẬN ĐƠN & BẮT ĐẦU CÀY"
 * 4. Admin bấm "HOÀN THÀNH (TỰ ĐÓNG SAU 30P)"
 */
function createTicketActionRows(status) {
  const isCompleted = status === ORDER_STATUS.COMPLETED;
  const isCancelled = status === ORDER_STATUS.CANCELLED;
  const isFinished = isCompleted || isCancelled;

  // Nút 1: Admin Nhận Đơn & Bắt đầu cày (Dành cho PENDING)
  const btnAccept = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_ACCEPT)
    .setLabel("✅ NHẬN ĐƠN & BẮT ĐẦU CÀY")
    .setStyle(ButtonStyle.Success)
    .setDisabled(status !== ORDER_STATUS.PENDING || isFinished);

  // Nút 2: Admin Ấn Hoàn Thành (Dành cho PROCESSING / ACCEPTED)
  const btnComplete = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_COMPLETE)
    .setLabel("🎉 HOÀN THÀNH (TỰ ĐÓNG SAU 30P)")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(status === ORDER_STATUS.PENDING || isFinished);

  const row1 = new ActionRowBuilder().addComponents(btnAccept, btnComplete);

  // Hàng nút phụ: Hủy đơn, Đóng ticket & Lưu Log, Xóa kênh
  const btnCancel = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_CANCEL)
    .setLabel("🚫 HUỶ ĐƠN")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(isFinished);

  const btnClose = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_CLOSE_TICKET)
    .setLabel("🔒 ĐÓNG TICKET & LƯU LOG")
    .setStyle(ButtonStyle.Secondary);

  const btnDelete = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_DELETE_CHANNEL)
    .setLabel("🗑️ XÓA KÊNH (ADMIN)")
    .setStyle(ButtonStyle.Danger);

  const row2 = new ActionRowBuilder().addComponents(btnCancel, btnClose, btnDelete);

  return [row1, row2];
}

/**
 * Tạo một channel ticket riêng biệt cho đơn hàng
 */
function sanitizeChannelName(orderCode) {
  return `don-${orderCode.toLowerCase()}`;
}

async function createOrderTicketChannel(guild, orderData) {
  const categoryId = process.env.ORDER_CATEGORY_ID;
  const staffRoleId = process.env.STAFF_ROLE_ID;
  const adminRoleId = process.env.ADMIN_ROLE_ID;

  if (!guild) throw new Error("Guild không tồn tại.");

  const channelName = sanitizeChannelName(orderData.order_code || orderData.orderCode);

  // Cấu hình phân quyền riêng tư cho ticket (Khách có quyền gửi tin nhắn & ảnh chuyển khoản ngay!)
  const permissionOverwrites = [
    {
      id: guild.roles.everyone.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: orderData.customer_id || orderData.customerId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
      ],
    },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  if (staffRoleId && guild.roles.cache.has(staffRoleId)) {
    permissionOverwrites.push({
      id: staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
      ],
    });
  }

  if (adminRoleId && guild.roles.cache.has(adminRoleId)) {
    permissionOverwrites.push({
      id: adminRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.AttachFiles,
      ],
    });
  }

  const channelOptions = {
    name: channelName,
    type: ChannelType.GuildText,
    permissionOverwrites,
    topic: `Ticket đơn hàng SandG [${orderData.order_code || orderData.orderCode}] | Khách hàng: ${orderData.customer_username || orderData.customerUsername}`,
  };

  if (categoryId) {
    const category = guild.channels.cache.get(categoryId);
    if (category && category.type === ChannelType.GuildCategory) {
      channelOptions.parent = categoryId;
    } else {
      logger.warn(`CATEGORY_ID [${categoryId}] không hợp lệ hoặc không phải là danh mục.`);
    }
  }

  const ticketChannel = await guild.channels.create(channelOptions);

  // Gửi Embed thông tin đơn hàng chính + Hướng dẫn quét mã QR thanh toán
  const mainEmbed = createTicketMainEmbed(orderData);
  const paymentEmbed = createPaymentInstructionsEmbed(orderData);
  const actionRows = createTicketActionRows(orderData.status);

  const mainMessage = await ticketChannel.send({
    content: `👋 Chào <@${orderData.customer_id || orderData.customerId}>, ticket đơn hàng của bạn đã được khởi tạo thành công!`,
    embeds: [mainEmbed, paymentEmbed],
    components: actionRows,
  });

  return {
    channel: ticketChannel,
    mainMessage,
  };
}

/**
 * Cập nhật lại giao diện Embed và các nút bấm trong Ticket khi trạng thái thay đổi
 */
async function updateTicketInterface(channel, mainMessageId, orderData) {
  if (!channel) return;

  try {
    const message = await channel.messages.fetch(mainMessageId).catch(() => null);
    if (!message) return;

    const mainEmbed = createTicketMainEmbed(orderData);
    const paymentEmbed = createPaymentInstructionsEmbed(orderData);
    const actionRows = createTicketActionRows(orderData.status);

    await message.edit({
      embeds: [mainEmbed, paymentEmbed],
      components: actionRows,
    });
  } catch (err) {
    logger.error("Không thể cập nhật giao diện main message trong ticket:", err);
  }
}

/**
 * Khoá quyền gửi tin nhắn của khách hàng khi bắt đầu quá trình đóng ticket
 */
async function lockTicketChannelPermissions(channel, customerId) {
  if (!channel) return;
  try {
    await channel.permissionOverwrites.edit(customerId, {
      SendMessages: false,
    });
  } catch (err) {
    logger.error("Lỗi khi khóa quyền gửi tin nhắn của khách trong ticket:", err);
  }
}

/**
 * Mở quyền gửi tin nhắn của khách hàng
 */
async function unlockTicketChannelPermissions(channel, customerId) {
  if (!channel) return;
  try {
    await channel.permissionOverwrites.edit(customerId, {
      SendMessages: true,
    });
  } catch (err) {
    logger.error("Lỗi khi mở quyền gửi tin nhắn của khách trong ticket:", err);
  }
}

module.exports = {
  createTicketActionRows,
  createOrderTicketChannel,
  updateTicketInterface,
  lockTicketChannelPermissions,
  unlockTicketChannelPermissions,
};
