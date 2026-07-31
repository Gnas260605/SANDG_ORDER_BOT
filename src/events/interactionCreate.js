/**
 * Discord Event Handler - Điều hướng các loại tương tác (Slash commands, Buttons, Modals, Select menus)
 */

const { Events } = require("discord.js");
const { handleServiceSelect } = require("../interactions/serviceSelect");
const { handleOrderModalSubmit } = require("../interactions/orderModal");
const { handleOrderConfirmation } = require("../interactions/orderConfirmation");
const { handleTicketActions } = require("../interactions/orderActions");
const { CUSTOM_IDS } = require("../config/constants");
const { createErrorEmbed } = require("../utils/embeds");
const logger = require("../utils/logger");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      // 1. Xử lý Slash Commands
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
          logger.warn(`Lệnh không tồn tại: ${interaction.commandName}`);
          return;
        }

        await command.execute(interaction);
        return;
      }

      // 2. Xử lý Select Menu chọn dịch vụ
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId === CUSTOM_IDS.SELECT_SERVICE) {
          await handleServiceSelect(interaction);
          return;
        }
      }

      // 3. Xử lý Submit Modal nhập thông tin đơn
      if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith(CUSTOM_IDS.MODAL_ORDER_INFO)) {
          await handleOrderModalSubmit(interaction);
          return;
        }
      }

      // 4. Xử lý Button tương tác
      if (interaction.isButton()) {
        const customId = interaction.customId;

        // Nút xác nhận/hủy từ embed preview
        if (customId.startsWith(CUSTOM_IDS.CONFIRM_ORDER) || customId === CUSTOM_IDS.CANCEL_ORDER) {
          await handleOrderConfirmation(interaction);
          return;
        }

        // Các nút trong Ticket
        if (customId.startsWith("sandg_ticket_")) {
          await handleTicketActions(interaction);
          return;
        }
      }
    } catch (err) {
      logger.error("Lỗi khi xử lý tương tác interaction:", err);
      const errorEmbed = createErrorEmbed(
        "❌ ĐÃ XẢY RA LỖI HỆ THỐNG",
        "Có lỗi không mong muốn xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau."
      );

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {});
      }
    }
  },
};
