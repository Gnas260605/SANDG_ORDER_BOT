/**
 * Interaction Handler - Xử lý khi người dùng chọn dịch vụ từ Select Menu
 */

const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");
const { CUSTOM_IDS } = require("../config/constants");
const { SERVICES } = require("../config/services");
const { createErrorEmbed } = require("../utils/embeds");

async function handleServiceSelect(interaction) {
  const selectedServiceCode = interaction.values[0];
  const service = SERVICES[selectedServiceCode];

  if (!service) {
    return interaction.reply({
      embeds: [createErrorEmbed("❌ LỖI DỊCH VỤ", "Dịch vụ đã chọn không tồn tại trong hệ thống.")],
      ephemeral: true,
    });
  }

  // Khởi tạo Modal nhập thông tin chi tiết đơn hàng
  const modalCustomId = `${CUSTOM_IDS.MODAL_ORDER_INFO}:${selectedServiceCode}`;
  const modal = new ModalBuilder()
    .setCustomId(modalCustomId)
    .setTitle(`Đặt đơn: ${service.name}`);

  const qtyInput = new TextInputBuilder()
    .setCustomId(CUSTOM_IDS.MODAL_INPUT_QTY)
    .setLabel(`Số lượng (${service.unitLabel})`)
    .setPlaceholder(`Nhập số lượng (Ví dụ: 1, 5, 10). Giá: ${service.displayPrice}`)
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(6);

  const timeInput = new TextInputBuilder()
    .setCustomId(CUSTOM_IDS.MODAL_INPUT_TIME)
    .setLabel("Thời gian mong muốn hoàn thành")
    .setPlaceholder("Ví dụ: 2 tiếng, trong ngày, gấp...")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMinLength(2)
    .setMaxLength(100);

  const noteInput = new TextInputBuilder()
    .setCustomId(CUSTOM_IDS.MODAL_INPUT_NOTE)
    .setLabel("Ghi chú thêm cho đơn hàng (Không nhập pass)")
    .setPlaceholder("Ghi chú thêm nếu có (Không yêu cầu mật khẩu Roblox)...")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(500);

  modal.addComponents(
    new ActionRowBuilder().addComponents(qtyInput),
    new ActionRowBuilder().addComponents(timeInput),
    new ActionRowBuilder().addComponents(noteInput)
  );

  await interaction.showModal(modal);
}

module.exports = {
  handleServiceSelect,
};
