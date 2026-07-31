/**
 * Slash Command: /setup-server
 * Tự động tạo và sắp xếp lại toàn bộ Kênh & Danh mục Discord Server chuẩn 5 sao chuyên nghiệp
 * Hỗ trợ tham số xoa_kenh_cu: True để dọn dẹp sạch sẽ các kênh cũ rác.
 */

const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { CUSTOM_IDS, COLORS } = require("../config/constants");
const { SERVICES } = require("../config/services");
const { createBaseEmbed, createPriceListEmbed, createErrorEmbed, createSuccessEmbed } = require("../utils/embeds");
const { isAdmin } = require("../utils/permissions");
const logger = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-server")
    .setDescription("Tự động thiết lập lại toàn bộ Kênh & Danh mục Server chuẩn chuyên nghiệp 5 sao")
    .addBooleanOption((option) =>
      option
        .setName("xoa_kenh_cu")
        .setDescription("Chọn True nếu bạn muốn Bot tự động XÓA sạch các kênh rác cũ trước khi tạo giao diện mới.")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Administrator mới có thể thực hiện thiết lập Server.")],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const guild = interaction.guild;
    const shouldDeleteOld = interaction.options.getBoolean("xoa_kenh_cu") || false;

    try {
      // 0. NẾU CHỌN XÓA KÊNH CŨ: XÓA TẤT CẢ CÁC KÊNH VÀ DANH MỤC CŨ (TRỪ KÊNH HIỆN TẠI)
      if (shouldDeleteOld) {
        const channels = await guild.channels.fetch();
        for (const [id, ch] of channels) {
          if (id !== interaction.channelId && ch.deletable) {
            await ch.delete().catch((err) => logger.warn(`Không thể xóa kênh cũ ${ch.name}: ${err.message}`));
          }
        }
      }

      // 1. DANH MỤC THÔNG BÁO
      const catNotice = await guild.channels.create({
        name: "╭━━━━━━ 📢 THÔNG BÁO ━━━━━━╮",
        type: ChannelType.GuildCategory,
      });

      await guild.channels.create({
        name: "📌・thông-báo",
        type: ChannelType.GuildText,
        parent: catNotice.id,
      });

      await guild.channels.create({
        name: "📜・nội-quy",
        type: ChannelType.GuildText,
        parent: catNotice.id,
      });

      const chBanggia = await guild.channels.create({
        name: "💰・bảng-giá-dịch-vụ",
        type: ChannelType.GuildText,
        parent: catNotice.id,
      });

      // Tự động gửi Bảng Giá vào kênh 💰・bảng-giá-dịch-vụ
      await chBanggia.send({
        embeds: [createPriceListEmbed()],
      });

      // 2. DANH MỤC CÀY THUÊ (Chính)
      const catOrder = await guild.channels.create({
        name: "╭━━━━━━ 🛒 KHU VỰC CÀY THUÊ ━━━━━━╮",
        type: ChannelType.GuildCategory,
      });

      const chDatdon = await guild.channels.create({
        name: "🛒・đặt-đơn-hàng",
        type: ChannelType.GuildText,
        parent: catOrder.id,
      });

      const chLog = await guild.channels.create({
        name: "📁・log-đơn-hàng",
        type: ChannelType.GuildText,
        parent: catOrder.id,
      });

      // Đăng Bảng Đặt Đơn cố định vào 🛒・đặt-đơn-hàng
      const panelEmbed = createBaseEmbed(
        "⚡ BẢNG GIÁ & ĐẶT ĐƠN DỊCH VỤ ANIME EXPEDITION — SANDG",
        "Chào mừng bạn đến với hệ thống cày thuê **SandG**!\n" +
          "Bấm nút **`🛒 ĐẶT ĐƠN NGAY`** bên dưới để tiến hành chọn dịch vụ và khởi tạo đơn hàng riêng ngay lập tức.",
        COLORS.CYAN
      );

      Object.values(SERVICES).forEach((svc) => {
        panelEmbed.addFields({
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

      const panelRow = new ActionRowBuilder().addComponents(btnOpenMenu, btnShowPrice);

      await chDatdon.send({
        embeds: [panelEmbed],
        components: [panelRow],
      });

      // Cập nhật runtime environment ID cho bot
      process.env.ORDER_CATEGORY_ID = catOrder.id;
      process.env.LOG_CHANNEL_ID = chLog.id;

      // 3. DANH MỤC CỘNG ĐỒNG
      const catCommunity = await guild.channels.create({
        name: "╭━━━━━━ 💬 CỘNG ĐỒNG ━━━━━━╮",
        type: ChannelType.GuildCategory,
      });

      await guild.channels.create({
        name: "💬・trò-chuyện",
        type: ChannelType.GuildText,
        parent: catCommunity.id,
      });

      await guild.channels.create({
        name: "🎉・giveaway",
        type: ChannelType.GuildText,
        parent: catCommunity.id,
      });

      await guild.channels.create({
        name: "🎥・livestream",
        type: ChannelType.GuildText,
        parent: catCommunity.id,
      });

      // 4. DANH MỤC KÊNH THOẠI
      const catVoice = await guild.channels.create({
        name: "╭━━━━━━ 🔊 KÊNH THOẠI ━━━━━━╮",
        type: ChannelType.GuildCategory,
      });

      await guild.channels.create({
        name: "🔊・Phòng Chờ 01",
        type: ChannelType.GuildVoice,
        parent: catVoice.id,
      });

      await guild.channels.create({
        name: "🔊・Giao Lưu 02",
        type: ChannelType.GuildVoice,
        parent: catVoice.id,
      });

      const successEmbed = createSuccessEmbed(
        "🎉 TỰ ĐỘNG THIẾT LẬP SERVER THÀNH CÔNG 100%!",
        `Bot đã tự động tạo giao diện Server chuyên nghiệp bao gồm:\n\n` +
          `📢 **Thông Báo**: <#${chBanggia.id}>\n` +
          `🛒 **Khu Vực Đặt Đơn**: <#${chDatdon.id}> *(Đã đăng sẵn Panel Đặt Đơn tự động)*\n` +
          `📁 **Kênh Log**: <#${chLog.id}>\n\n` +
          `📌 **Cấu hình tự động ghi nhận**:\n` +
          `• ID Danh mục cày thuê: \`${catOrder.id}\`\n` +
          `• ID Kênh Log: \`${chLog.id}\`` +
          (shouldDeleteOld ? "\n\n🧹 *Đã dọn dẹp toàn bộ các kênh cũ rác theo yêu cầu.*" : "")
      );

      await interaction.editReply({
        embeds: [successEmbed],
      });
    } catch (err) {
      logger.error("Lỗi khi tự động setup server:", err);
      await interaction.editReply({
        embeds: [createErrorEmbed("❌ THIẾT LẬP THẤT BẠI", `Đã xảy ra lỗi: ${err.message}`)],
      });
    }
  },
};
