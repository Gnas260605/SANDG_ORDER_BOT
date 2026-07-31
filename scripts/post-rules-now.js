require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const { createBaseEmbed } = require("../src/utils/embeds");
const { COLORS } = require("../src/config/constants");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const guildId = process.env.DISCORD_GUILD_ID || "1240850060204445850";
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();

  let targetChannel = null;
  for (const [id, ch] of channels) {
    if (ch.name.includes("nội-quy") && ch.type === 0) {
      targetChannel = ch;
      break;
    }
  }

  if (targetChannel) {
    const embed = createBaseEmbed(
      "📜 NỘI QUY CHÍNH THỨC SERVER — SANDG SHOP",
      "Chào mừng bạn đến với Server Discord chính thức của **SandG**!\n" +
        "Để xây dựng một môi trường giao dịch an toàn, văn minh và chuyên nghiệp, tất cả thành viên vui lòng tuân thủ các quy định sau:",
      COLORS.CYAN
    ).addFields(
      {
        name: "1. 🛡️ TÔN TRỌNG & VĂN HÓA CỘNG ĐỒNG",
        value: "• Không xúc phạm, chửi thề, lăng mạ hoặc phân biệt vùng miền/tôn giáo.\n• Tuyệt đối tôn trọng BQL Server và các thành viên khác.",
        inline: false,
      },
      {
        name: "2. 🛒 QUY ĐỊNH CÀY THUÊ & GIAO DỊCH",
        value: "• **Mọi giao dịch cày thuê PHẢI thực hiện qua Kênh Ticket chính thức** (`🛒・đặt-đơn-hàng`).\n• SandG **KHÔNG chịu trách nhiệm** cho bất kỳ giao dịch nhắn tin riêng (DM) hoặc giao dịch tự phát bên ngoài.",
        inline: false,
      },
      {
        name: "3. 🚫 CẤM SPAM & ĐĂNG LINK LỪA ĐẢO",
        value: "• Cấm tuyệt đối đăng Link mời Server Discord khác, Link quảng cáo hoặc Link độc hại/lừa đảo.\n• Cấm spam tin nhắn, spam icon hoặc tag vô lý Staff/Admin.",
        inline: false,
      },
      {
        name: "4. 🔒 BẢO MẬT TÀI KHOẢN",
        value: "• Chỉ cung cấp Tên tài khoản & Mật khẩu Roblox **TRONG KÊNH TICKET RIÊNG TƯ** với Staff sau khi thanh toán.\n• Tuyệt đối không chia sẻ thông tin cá nhân/mật khẩu ở các kênh chat chung.",
        inline: false,
      },
      {
        name: "5. ⚠️ HÌNH PHẠT VI PHẠM (AUTOMOD & ADMIN)",
        value: "• **Vi phạm lần 1**: Xóa tin nhắn & Cảnh cáo.\n• **Đăng Link mời Discord khác**: Tự động xóa tin nhắn & Cảnh cáo.\n• **Đăng Link Lừa Đảo / Scam**: **Tự động Phạt im lặng (Timeout) 24h** & **BAN VĨNH VIỄN khỏi Server**.",
        inline: false,
      }
    );

    await targetChannel.send({ embeds: [embed] });
    console.log(`[SUCCESS] Đã đăng Bảng Nội Quy vào kênh ${targetChannel.name} (${targetChannel.id})`);
  }

  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
