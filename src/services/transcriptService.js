/**
 * Transcript Service - Xuất lịch sử tin nhắn ticket ra file text & gửi log channel
 */

const fs = require("fs");
const path = require("path");
const { AttachmentBuilder } = require("discord.js");
const { createBaseEmbed } = require("../utils/embeds");
const { COLORS } = require("../config/constants");
const { sanitizeForTranscript } = require("../utils/validators");
const logger = require("../utils/logger");

const TRANSCRIPT_DIR = path.join(__dirname, "../../transcripts");

if (!fs.existsSync(TRANSCRIPT_DIR)) {
  fs.mkdirSync(TRANSCRIPT_DIR, { recursive: true });
}

/**
 * Thu thập toàn bộ tin nhắn từ kênh Ticket (fetch tối đa 100 tin nhắn)
 */
async function fetchChannelMessages(channel) {
  try {
    const messages = await channel.messages.fetch({ limit: 100 });
    return Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
  } catch (err) {
    logger.error("Lỗi khi fetch tin nhắn channel để làm transcript:", err);
    return [];
  }
}

/**
 * Tạo file log transcript .txt từ dữ liệu tin nhắn
 */
async function generateTranscriptFile(channel, orderData) {
  const messages = await fetchChannelMessages(channel);
  const orderCode = orderData ? orderData.order_code : "SANDG-UNKNOWN";
  const filePath = path.join(TRANSCRIPT_DIR, `transcript-${orderCode}.txt`);

  const nowStr = new Date().toISOString().replace("T", " ").replace(/\..+/, "") + " UTC";

  let content = "================================================================================\n";
  content += "                     SANDG ORDER BOT - TICKET TRANSCRIPT\n";
  content += "================================================================================\n";
  content += `Order Code     : ${orderCode}\n`;
  content += `Channel Name   : ${channel.name}\n`;
  content += `Channel ID     : ${channel.id}\n`;
  content += `Customer ID    : ${orderData ? orderData.customer_id : "N/A"}\n`;
  content += `Customer User  : ${orderData ? orderData.customer_username : "N/A"}\n`;
  content += `Generated At   : ${nowStr}\n`;
  content += "================================================================================\n\n";

  messages.forEach((msg) => {
    const timeStr = new Date(msg.createdTimestamp).toISOString().replace("T", " ").replace(/\..+/, "");
    const authorTag = `${msg.author.tag} (${msg.author.id})`;
    const cleanText = sanitizeForTranscript(msg.content) || "[Nội dung dạng Embed/Component]";

    content += `[${timeStr}] ${authorTag}:\n${cleanText}\n`;

    if (msg.attachments && msg.attachments.size > 0) {
      msg.attachments.forEach((att) => {
        content += `    [Đính kèm: ${att.url}]\n`;
      });
    }

    if (msg.embeds && msg.embeds.length > 0) {
      msg.embeds.forEach((emb) => {
        if (emb.title) content += `    [Embed Title: ${sanitizeForTranscript(emb.title)}]\n`;
        if (emb.description) content += `    [Embed Description: ${sanitizeForTranscript(emb.description)}]\n`;
      });
    }

    content += "\n";
  });

  content += "================================================================================\n";
  content += "                      END OF TRANSCRIPT - SANDG TEAM\n";
  content += "================================================================================\n";

  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

/**
 * Gửi file transcript đến kênh LOG_CHANNEL_ID
 */
async function sendTranscriptToLogChannel(guild, channel, orderData) {
  const logChannelId = process.env.LOG_CHANNEL_ID;
  if (!logChannelId) {
    logger.warn("LOG_CHANNEL_ID chưa được cấu hình trong biến môi trường.");
    return false;
  }

  const logChannel = guild.channels.cache.get(logChannelId);
  if (!logChannel) {
    logger.warn(`Không tìm thấy kênh log với LOG_CHANNEL_ID [${logChannelId}].`);
    return false;
  }

  try {
    const filePath = await generateTranscriptFile(channel, orderData);
    const attachment = new AttachmentBuilder(filePath);

    const embed = createBaseEmbed(
      `📁 LOG TRANSCRIPT TICKET [${orderData.order_code}]`,
      `Ticket cho đơn hàng \`${orderData.order_code}\` đã được lưu log transcript thành công.`,
      COLORS.CYAN
    ).addFields(
      { name: "🔖 Mã đơn hàng", value: `\`${orderData.order_code}\``, inline: true },
      { name: "👤 Khách hàng", value: `<@${orderData.customer_id}> (${orderData.customer_username})`, inline: true },
      { name: "👨‍💻 Nhân viên", value: orderData.staff_id ? `<@${orderData.staff_id}>` : "Chưa có", inline: true },
      { name: "📦 Dịch vụ", value: orderData.service_name, inline: true },
      { name: "💰 Tổng tiền", value: orderData.total_display, inline: true },
      { name: "📌 Trạng thái", value: orderData.status, inline: true }
    );

    await logChannel.send({
      embeds: [embed],
      files: [attachment],
    });

    logger.info(`Đã gửi file transcript đơn [${orderData.order_code}] vào log channel [${logChannelId}]`);
    return true;
  } catch (err) {
    logger.error("Lỗi khi gửi file transcript đến log channel:", err);
    return false;
  }
}

module.exports = {
  generateTranscriptFile,
  sendTranscriptToLogChannel,
};
