/**
 * Discord Event Handler - Auto-Moderation Tự Động Chống Spam & Link Lừa Đảo
 */

const { Events } = require("discord.js");
const { isStaff, isAdmin } = require("../utils/permissions");
const { createBaseEmbed } = require("../utils/embeds");
const { COLORS } = require("../config/constants");
const logger = require("../utils/logger");

// Regex kiểm tra Link mời Server Discord khác
const DISCORD_INVITE_REGEX = /(discord\.(gg|io|me|li|com\/invite)\/[a-zA-Z0-9]+)/i;

// Danh sách các từ khóa / tên miền lừa đảo / scam phổ biến
const SCAM_KEYWORDS = [
  "free-robux",
  "roblox.com.official",
  "get-robux",
  "discord.gift/",
  "dlscord.gg",
  "discort.gg",
  "discorcl.gg",
];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Bỏ qua tin nhắn từ Bot hoặc tin nhắn ngoài Guild
    if (message.author.bot || !message.guild || !message.member) return;

    // Bỏ qua kiểm tra đối với Staff và Administrator
    if (isStaff(message.member) || isAdmin(message.member)) return;

    const content = message.content.toLowerCase();

    // 1. KIỂM TRA PHÁT HIỆN LINK MỜI DISCORD KHÁC (ANTI DISCORD INVITE)
    if (DISCORD_INVITE_REGEX.test(content)) {
      try {
        await message.delete();

        const warnMsg = await message.channel.send({
          content: `⚠️ <@${message.author.id}>, **nghiêm cấm đăng link mời Server Discord khác** trong Server SandG!`,
        });

        setTimeout(() => warnMsg.delete().catch(() => {}), 6000);

        logger.warn(`AutoMod đã xóa tin nhắn chứa link mời Discord từ user [${message.author.tag}]`);

        // Gửi Log tới LOG_CHANNEL_ID
        const logChannelId = process.env.LOG_CHANNEL_ID;
        if (logChannelId) {
          const logChannel = message.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = createBaseEmbed(
              "🤖 AUTOMOD - PHÁT HIỆN LINK MỜI DISCORD",
              `• Thành viên: <@${message.author.id}> (\`${message.author.tag}\`)\n• Kênh: <#${message.channel.id}>\n• Nội dung vi phạm: \`${message.content}\`\n• Thao tác: **Đã tự động xóa tin nhắn**`,
              COLORS.WARNING
            );
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
      } catch (err) {
        logger.error("Lỗi khi xử lý AutoMod Invite Link:", err);
      }
      return;
    }

    // 2. KIỂM TRA PHÁT HIỆN LINK PHISHING / LỪA ĐẢO / SCAM
    const hasScamLink = SCAM_KEYWORDS.some((kw) => content.includes(kw));
    if (hasScamLink) {
      try {
        await message.delete();

        // Tự động phạt im lặng 24 giờ đối với hành vi đăng link lừa đảo
        if (message.member.moderatable) {
          await message.member.timeout(24 * 60 * 60 * 1000, "AutoMod: Đăng link lừa đảo/scam");
        }

        const warnMsg = await message.channel.send({
          content: `🚨 **CẢNH BÁO SCAM**: Hệ thống đã tự động khóa tin nhắn và phạt im lặng <@${message.author.id}> 24 giờ do đăng link lừa đảo!`,
        });

        setTimeout(() => warnMsg.delete().catch(() => {}), 10000);

        logger.warn(`AutoMod đã phát hiện & timeout user [${message.author.tag}] do đăng link scam.`);

        const logChannelId = process.env.LOG_CHANNEL_ID;
        if (logChannelId) {
          const logChannel = message.guild.channels.cache.get(logChannelId);
          if (logChannel) {
            const logEmbed = createBaseEmbed(
              "🚨 AUTOMOD - CẢNH BÁO LINK LỪA ĐẢO / SCAM",
              `• Thành viên: <@${message.author.id}> (\`${message.author.tag}\`)\n• Kênh: <#${message.channel.id}>\n• Nội dung vi phạm: \`${message.content}\`\n• Thao tác: **Xóa tin nhắn & Phạt im lặng (Timeout) 24h**`,
              COLORS.DANGER
            );
            await logChannel.send({ embeds: [logEmbed] });
          }
        }
      } catch (err) {
        logger.error("Lỗi khi xử lý AutoMod Scam Link:", err);
      }
    }
  },
};
