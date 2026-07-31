/**
 * Slash Command: /postpanel (hoặc /panel)
 * Đăng Bảng Đặt Đơn Cố Định vào Kênh với Nút Bấm Đặt Đơn Tự Động
 */

const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const { CUSTOM_IDS, COLORS } = require("../config/constants");
const { SERVICES } = require("../config/services");
const { createBaseEmbed, createErrorEmbed } = require("../utils/embeds");
const { isAdmin } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("postpanel")
    .setDescription("Đăng Bảng Đặt Đơn Hàng Cố Định vào Kênh này (Admin Only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Administrator mới có thể đăng Bảng Đặt Đơn Panel.")],
        ephemeral: true,
      });
    }

    const embed = createBaseEmbed(
      "⚡ BẢNG ĐẶT ĐƠN DỊCH VỤ ANIME EXPEDITION — SANDG",
      "Chào mừng bạn đến với hệ thống cày thuê **SandG**!\n" +
        "Bấm nút **`🛒 ĐẶT ĐƠN NGAY`** bên dưới để tiến hành chọn dịch vụ và khởi tạo đơn hàng riêng ngay lập tức.",
      COLORS.CYAN
    );

    Object.values(SERVICES).forEach((svc) => {
      embed.addFields({
        name: `✨ ${svc.name}`,
        value: `• Giá: **${svc.displayPrice}**\n• Mô tả: *${svc.description}*`,
        inline: true,
      });
    });

    const btnOpenMenu = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.OPEN_ORDER_MENU)
      .setLabel("🛒 ĐẶT ĐƠN NGAY")
      .setStyle(ButtonStyle.Success);

    const btnShowPrice = new ButtonBuilder()
      .setCustomId(CUSTOM_IDS.SHOW_PRICE_LIST)
      .setLabel("📋 XEM BẢNG GIÁ")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(btnOpenMenu, btnShowPrice);

    // Gửi tin nhắn Panel cố định vào kênh hiện tại
    await interaction.channel.send({
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: "✅ Đã đăng Bảng Đặt Đơn Panel thành công vào kênh này!",
      ephemeral: true,
    });
  },
};
