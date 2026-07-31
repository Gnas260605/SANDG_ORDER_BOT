/**
 * Slash Command: /datdon
 * Khách hàng khởi tạo quá trình chọn dịch vụ và đặt đơn hàng
 */

const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { CUSTOM_IDS, COLORS } = require("../config/constants");
const { SERVICES } = require("../config/services");
const { createBaseEmbed } = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("datdon")
    .setDescription("Bắt đầu chọn dịch vụ và đặt đơn hàng Anime Expedition SandG"),

  async execute(interaction) {
    const embed = createBaseEmbed(
      "🛒 HỆ THỐNG ĐẶT ĐƠN ANIME EXPEDITION — SANDG",
      "Vui lòng chọn dịch vụ bạn muốn đặt từ danh sách bên dưới để tiếp tục nhập số lượng và thông tin chi tiết.",
      COLORS.CYAN
    );

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(CUSTOM_IDS.SELECT_SERVICE)
      .setPlaceholder("👇 Chọn một dịch vụ bạn muốn đặt...");

    Object.values(SERVICES).forEach((svc) => {
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(svc.name)
          .setValue(svc.code)
          .setDescription(`${svc.displayPrice} — ${svc.description.slice(0, 50)}`)
      );
    });

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true,
    });
  },
};
