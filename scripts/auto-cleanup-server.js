/**
 * Script tự động xóa toàn bộ kênh trùng lặp và dựng lại 1 bộ giao diện duy nhất chuẩn 5 sao
 */

require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { CUSTOM_IDS, COLORS } = require("../src/config/constants");
const { SERVICES } = require("../src/config/services");
const { createBaseEmbed, createPriceListEmbed } = require("../src/utils/embeds");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once("ready", async () => {
  console.log(`[CLEANUP] Bot logged in as ${client.user.tag}`);

  const guildId = process.env.DISCORD_GUILD_ID || "1240850060204445850";
  const guild = await client.guilds.fetch(guildId).catch(() => null);

  if (!guild) {
    console.error(`[CLEANUP ERROR] Không tìm thấy Guild [${guildId}]`);
    process.exit(1);
  }

  console.log(`[CLEANUP] Đang xử lý làm sạch Guild [${guild.name}] (${guild.id})...`);

  // 1. XÓA SẠCH TOÀN BỘ KÊNH ĐANG CÓ TRONG GUILD
  const channels = await guild.channels.fetch();
  console.log(`[CLEANUP] Đã tìm thấy ${channels.size} kênh/danh mục. Bắt đầu xóa...`);

  for (const [id, ch] of channels) {
    if (ch && ch.deletable) {
      try {
        await ch.delete();
        console.log(` - Đã xóa kênh: ${ch.name} (${id})`);
      } catch (err) {
        console.error(` - Lỗi khi xóa ${ch.name}:`, err.message);
      }
    }
  }

  console.log("[CLEANUP] Đã xóa sạch kênh cũ trùng lặp. Đang khởi tạo bộ giao diện chuẩn 5 sao mới...");

  // 2. DỰNG LẠI BỘ DANH MỤC & KÊNH CHUẨN DUY NHẤT
  // Category 1: Thông báo
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

  await chBanggia.send({
    embeds: [createPriceListEmbed()],
  });

  // Category 2: Khu vực cày thuê
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

  // Gửi Bảng Đặt Đơn cố định vào 🛒・đặt-đơn-hàng
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

  // Category 3: Cộng đồng
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

  // Category 4: Kênh thoại
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

  console.log(`\n[CLEANUP SUCCESS] ✅ Đã dọn dẹp sạch kênh trùng lặp và hoàn tất khởi tạo Server!`);
  console.log(`ORDER_CATEGORY_ID: ${catOrder.id}`);
  console.log(`LOG_CHANNEL_ID: ${chLog.id}`);

  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
