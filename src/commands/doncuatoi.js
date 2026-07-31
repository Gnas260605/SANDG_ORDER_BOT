/**
 * Slash Command: /doncuatoi
 * Hiển thị tối đa 10 đơn hàng gần nhất của người dùng
 */

const { SlashCommandBuilder } = require("discord.js");
const { getUserRecentOrders } = require("../services/orderService");
const { createMyOrdersEmbed } = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("doncuatoi")
    .setDescription("Xem danh sách tối đa 10 đơn hàng gần nhất của bạn"),

  async execute(interaction) {
    const orders = getUserRecentOrders(interaction.user.id, 10);
    const embed = createMyOrdersEmbed(orders, interaction.user.username);

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
