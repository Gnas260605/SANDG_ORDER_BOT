/**
 * Slash Command: /banggia
 * Hiển thị bảng giá dịch vụ SandG Anime Expedition
 */

const { SlashCommandBuilder } = require("discord.js");
const { createPriceListEmbed } = require("../utils/embeds");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banggia")
    .setDescription("Xem bảng giá các dịch vụ Anime Expedition trên hệ thống SandG"),

  async execute(interaction) {
    const embed = createPriceListEmbed();

    await interaction.reply({
      embeds: [embed],
    });
  },
};
