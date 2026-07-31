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
const { createTicketMainEmbed } = require("../utils/embeds");
const logger = require("../utils/logger");

/**
 * Tạo danh sách hàng nút bấm (ActionRows) điều khiển Ticket tùy theo trạng thái đơn hàng
 */
function createTicketActionRows(status) {
  const isFinished = status === ORDER_STATUS.COMPLETED || status === ORDER_STATUS.CANCELLED;

  const btnAccept = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_ACCEPT)
    .setLabel("NHẬN ĐƠN")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(status !== ORDER_STATUS.PENDING || isFinished);

  const btnPaid = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_PAID)
    .setLabel("ĐÃ THANH TOÁN")
    .setStyle(ButtonStyle.Success)
    .setDisabled(status !== ORDER_STATUS.ACCEPTED || isFinished);

  const btnProcessing = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_PROCESSING)
    .setLabel("ĐANG THỰC HIỆN")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(status !== ORDER_STATUS.PAID || isFinished);

  const btnComplete = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_COMPLETE)
    .setLabel("HOÀN THÀNH")
    .setStyle(ButtonStyle.Success)
    .setDisabled(status !== ORDER_STATUS.PROCESSING || isFinished);

  const row1 = new ActionRowBuilder().addComponents(btnAccept, btnPaid, btnProcessing, btnComplete);

  const btnCancel = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_CANCEL)
    .setLabel("HUỶ ĐƠN")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(isFinished);

  const btnClose = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.BTN_CLOSE_TICKET)
    .setLabel("ĐÓNG TICKET")
    .setStyle(ButtonStyle.Secondary);

  const row2 = new ActionRowBuilder().addComponents(btnCancel, btnClose);

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

  // Cấu hình phân quyền riêng tư cho ticket
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

  // Gửi Embed thông tin đơn hàng chính vào ticket
  const embed = createTicketMainEmbed(orderData);
  const actionRows = createTicketActionRows(orderData.status);

  const mainMessage = await ticketChannel.send({
    content: `Chào <@${orderData.customer_id || orderData.customerId}>, ticket đơn hàng của bạn đã được khởi tạo! Nhân viên SandG sẽ phản hồi bạn sớm nhất.`,
    embeds: [embed],
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
    const message = await channel.messages.fetch(mainMessageId);
    if (!message) return;

    const embed = createTicketMainEmbed(orderData);
    const actionRows = createTicketActionRows(orderData.status);

    await message.edit({
      embeds: [embed],
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

module.exports = {
  createTicketActionRows,
  createOrderTicketChannel,
  updateTicketInterface,
  lockTicketChannelPermissions,
};
