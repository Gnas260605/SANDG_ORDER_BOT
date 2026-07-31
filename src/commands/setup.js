/**
 * Slash Command: /setup
 * Lệnh kiểm tra cấu hình hệ thống dành riêng cho Administrator
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { createSetupEmbed, createErrorEmbed } = require("../utils/embeds");
const { isAdmin } = require("../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Kiểm tra thông số cấu hình Server, Role và Channel (Admin Only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Administrator mới có thể sử dụng lệnh `/setup`.")],
        ephemeral: true,
      });
    }

    const guild = interaction.guild;
    const items = [];
    let allValid = true;

    // 1. Kiểm tra DISCORD_TOKEN
    const token = process.env.DISCORD_TOKEN;
    const tokenValid = !!token && token !== "your_bot_token_here";
    items.push({
      name: "Discord Bot Token",
      key: "DISCORD_TOKEN",
      value: tokenValid ? "••••••••" : null,
      valid: tokenValid,
      details: tokenValid ? "Đã cấu hình hợp lệ." : "Chưa cấu hình Token thật trong .env",
    });
    if (!tokenValid) allValid = false;

    // 2. Kiểm tra GUILD_ID
    const guildId = process.env.GUILD_ID;
    const guildValid = guildId === guild.id;
    items.push({
      name: "Guild Server ID",
      key: "GUILD_ID",
      value: guildId,
      valid: guildValid,
      details: guildValid
        ? "Trùng khớp với Server hiện tại."
        : `GUILD_ID trong .env (${guildId || "Trống"}) không khớp với Server này (${guild.id})`,
    });
    if (!guildValid) allValid = false;

    // 3. Kiểm tra STAFF_ROLE_ID
    const staffRoleId = process.env.STAFF_ROLE_ID;
    const staffRole = staffRoleId ? guild.roles.cache.get(staffRoleId) : null;
    items.push({
      name: "Staff Role",
      key: "STAFF_ROLE_ID",
      value: staffRoleId,
      valid: !!staffRole,
      details: staffRole ? `Tìm thấy Role: @${staffRole.name}` : "Không tìm thấy Role với ID này trong Server",
    });
    if (!staffRole) allValid = false;

    // 4. Kiểm tra ADMIN_ROLE_ID
    const adminRoleId = process.env.ADMIN_ROLE_ID;
    const adminRole = adminRoleId ? guild.roles.cache.get(adminRoleId) : null;
    items.push({
      name: "Admin Role",
      key: "ADMIN_ROLE_ID",
      value: adminRoleId,
      valid: !!adminRole,
      details: adminRole ? `Tìm thấy Role: @${adminRole.name}` : "Không tìm thấy Role với ID này trong Server",
    });
    if (!adminRole) allValid = false;

    // 5. Kiểm tra ORDER_CATEGORY_ID
    const categoryId = process.env.ORDER_CATEGORY_ID;
    const categoryChannel = categoryId ? guild.channels.cache.get(categoryId) : null;
    items.push({
      name: "Order Category Channel",
      key: "ORDER_CATEGORY_ID",
      value: categoryId,
      valid: !!categoryChannel,
      details: categoryChannel
        ? `Tìm thấy Category: [${categoryChannel.name}]`
        : "Không tìm thấy danh mục Category với ID này",
    });
    if (!categoryChannel) allValid = false;

    // 6. Kiểm tra LOG_CHANNEL_ID
    const logChannelId = process.env.LOG_CHANNEL_ID;
    const logChannel = logChannelId ? guild.channels.cache.get(logChannelId) : null;
    items.push({
      name: "Log Channel",
      key: "LOG_CHANNEL_ID",
      value: logChannelId,
      valid: !!logChannel,
      details: logChannel ? `Tìm thấy Log Channel: #${logChannel.name}` : "Không tìm thấy Kênh Log với ID này",
    });
    if (!logChannel) allValid = false;

    const embed = createSetupEmbed({ items, allValid });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
