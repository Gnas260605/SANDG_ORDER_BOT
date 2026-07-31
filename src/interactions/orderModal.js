/**
 * Interaction Handler - Xử lý khi khách gửi thông tin từ Modal đặt đơn
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CUSTOM_IDS } = require("../config/constants");
const { SERVICES, calculateTotal } = require("../config/services");
const { validateQuantity, validateExpectedTime, validateNote } = require("../utils/validators");
const { createOrderPreviewEmbed, createErrorEmbed } = require("../utils/embeds");

async function handleOrderModalSubmit(interaction) {
  // Extract serviceCode từ customId: sandg_modal_order_info:SERVICE_CODE
  const customId = interaction.customId;
  const parts = customId.split(":");
  const serviceCode = parts[1];

  const service = SERVICES[serviceCode];
  if (!service) {
    return interaction.reply({
      embeds: [createErrorEmbed("❌ LỖI DỊCH VỤ", "Không tìm thấy thông tin dịch vụ.")],
      ephemeral: true,
    });
  }

  const rawQty = interaction.fields.getTextInputValue(CUSTOM_IDS.MODAL_INPUT_QTY);
  const rawTime = interaction.fields.getTextInputValue(CUSTOM_IDS.MODAL_INPUT_TIME);
  const rawNote = interaction.fields.getTextInputValue(CUSTOM_IDS.MODAL_INPUT_NOTE);

  // Validate các trường nhập
  const qtyCheck = validateQuantity(rawQty, serviceCode);
  if (!qtyCheck.valid) {
    return interaction.reply({
      embeds: [createErrorEmbed("❌ SỐ LƯỢNG KHÔNG HỢP LỆ", qtyCheck.message)],
      ephemeral: true,
    });
  }

  const timeCheck = validateExpectedTime(rawTime);
  if (!timeCheck.valid) {
    return interaction.reply({
      embeds: [createErrorEmbed("❌ THỜI GIAN KHÔNG HỢP LỆ", timeCheck.message)],
      ephemeral: true,
    });
  }

  const noteCheck = validateNote(rawNote);
  if (!noteCheck.valid) {
    return interaction.reply({
      embeds: [createErrorEmbed("❌ GHI CHÚ KHÔNG HỢP LỆ", noteCheck.message)],
      ephemeral: true,
    });
  }

  const quantity = qtyCheck.value;
  const expectedTime = timeCheck.value;
  const note = noteCheck.value;
  const totalAmount = calculateTotal(serviceCode, quantity);

  // Lưu trữ dữ liệu tạm thời để xác nhận (Mã hoá nhẹ qua customId hoặc session payload)
  const orderData = {
    serviceCode,
    quantity,
    expectedTime,
    note,
    totalAmount,
  };

  const previewEmbed = createOrderPreviewEmbed(orderData);

  // Nút Xác nhận và Nút Hủy
  // Format customId payload: sandg_btn_confirm_order:SERVICE_CODE:QTY
  const btnConfirm = new ButtonBuilder()
    .setCustomId(`${CUSTOM_IDS.CONFIRM_ORDER}:${serviceCode}:${quantity}`)
    .setLabel("XÁC NHẬN ĐẶT ĐƠN")
    .setStyle(ButtonStyle.Success);

  const btnCancel = new ButtonBuilder()
    .setCustomId(CUSTOM_IDS.CANCEL_ORDER)
    .setLabel("HỦY ĐƠN HÀNG")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(btnConfirm, btnCancel);

  // Lưu thông tin expectedTime và note vào bộ nhớ tạm thời của Interaction nếu cần
  // Hoặc đính kèm payload an toàn trong interaction session
  interaction.client.tempOrderData = interaction.client.tempOrderData || new Map();
  const sessionKey = `${interaction.user.id}:${serviceCode}`;
  interaction.client.tempOrderData.set(sessionKey, orderData);

  await interaction.reply({
    embeds: [previewEmbed],
    components: [row],
    ephemeral: true,
  });
}

module.exports = {
  handleOrderModalSubmit,
};
