/**
 * Slash Command: /donhang ma_don
 * Xem thông tin chi tiết và trạng thái của một đơn hàng cụ thể
 */

const { SlashCommandBuilder } = require("discord.js");
const { getOrderByCode } = require("../services/orderService");
const { createOrderStatusEmbed, createErrorEmbed } = require("../utils/embeds");
const { isStaff } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("donhang")
    .setDescription("Xem chi tiết trạng thái đơn hàng theo mã đơn")
    .addStringOption((option) =>
      option
        .setName("ma_don")
        .setDescription("Nhập mã đơn hàng (Ví dụ: SANDG-0001)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rawCode = interaction.options.getString("ma_don").trim().toUpperCase();
    const orderCode = rawCode.startsWith("SANDG-") ? rawCode : `SANDG-${rawCode}`;

    const order = getOrderByCode(orderCode);
    if (!order) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG TÌM THẤY ĐƠN HÀNG", `Không tìm thấy đơn hàng nào có mã \`${orderCode}\`.`)],
        ephemeral: true,
      });
    }

    // Phân quyền: Khách chỉ xem được đơn của mình, Staff/Admin xem được mọi đơn
    const isOwner = order.customer_id === interaction.user.id;
    const isStaffMember = isStaff(interaction.member);

    if (!isOwner && !isStaffMember) {
      return interaction.reply({
        embeds: [
          createErrorEmbed(
            "❌ KHÔNG CÓ QUYỀN TRUY CẬP",
            "Bạn chỉ có thể tra cứu thông tin đơn hàng do chính bạn khởi tạo."
          ),
        ],
        ephemeral: true,
      });
    }

    const embed = createOrderStatusEmbed({
      orderCode: order.order_code,
      status: order.status,
      customerId: order.customer_id,
      serviceName: order.service_name,
      quantity: order.quantity,
      totalDisplay: order.total_display,
      expectedTime: order.expected_time,
      staffId: order.staff_id,
      ticketChannelId: order.ticket_channel_id,
      createdAt: order.created_at,
    });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
