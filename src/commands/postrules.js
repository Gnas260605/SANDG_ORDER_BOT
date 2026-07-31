/**
 * Slash Command: /postrules
 * Đăng Bảng Nội Quy Chính Thức của Server SandG
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { COLORS } = require("../config/constants");
const { createBaseEmbed, createErrorEmbed } = require("../utils/embeds");
const { isAdmin } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("postrules")
    .setDescription("Đăng Bảng Nội Quy Chính Thức của Server SandG vào Kênh (Admin Only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Administrator mới có thể đăng Nội quy server.")],
        ephemeral: true,
      });
    }

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
        name: "5. ⚠️ HÌNH PHẠT VI PHẠM",
        value: "• **Vi phạm lần 1**: Xóa tin nhắn & Cảnh cáo.\n• **Vi phạm lần 2**: Phạt im lặng (Timeout / Mute 24 giờ).\n• **Vi phạm lần 3 / Đăng Link Lừa Đảo**: **BAN VĨNH VIỄN** khỏi Server ngay lập tức.",
        inline: false,
      }
    );

    await interaction.channel.send({
      embeds: [embed],
    });

    await interaction.reply({
      content: "✅ Đã đăng Bảng Nội Quy thành công vào kênh này!",
      ephemeral: true,
    });
  },
};
