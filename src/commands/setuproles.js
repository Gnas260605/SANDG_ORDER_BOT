/**
 * Slash Command: /setup-roles
 * Tự động tạo và thiết lập phân quyền toàn bộ Vai Trò (Roles) cho Server
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
} = require("discord.js");
const { createErrorEmbed, createSuccessEmbed } = require("../utils/embeds");
const { isAdmin } = require("../utils/permissions");
const logger = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-roles")
    .setDescription("Tự động tạo và phân quyền bộ Vai Trò (Roles) chuyên nghiệp cho Server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Administrator mới có thể khởi tạo Vai Trò.")],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    // Dùng "colors" (không phải "color") theo discord.js v14+
    const rolesToCreate = [
      {
        name: "👑 Owner / Founder",
        color: 0xFF1744,
        hoist: true,
        permissions: [PermissionsBitField.Flags.Administrator],
      },
      {
        name: "🛡️ Admin / Quản Trị",
        color: 0xFF9100,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.ManageRoles,
          PermissionsBitField.Flags.BanMembers,
          PermissionsBitField.Flags.KickMembers,
          PermissionsBitField.Flags.ModerateMembers,
          PermissionsBitField.Flags.ManageMessages,
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        name: "👨‍💻 Staff / Cày Thuê Pro",
        color: 0x7C4DFF,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ManageMessages,
          PermissionsBitField.Flags.ModerateMembers,
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.AttachFiles,
          PermissionsBitField.Flags.EmbedLinks,
        ],
      },
      {
        name: "💎 VIP Client",
        color: 0x00E5FF,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.AttachFiles,
          PermissionsBitField.Flags.EmbedLinks,
          PermissionsBitField.Flags.UseExternalEmojis,
        ],
      },
      {
        name: "🛒 Khách Hàng SandG",
        color: 0x00E676,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.AttachFiles,
        ],
      },
      {
        name: "🔥 Dân Cày Chăm Chỉ",
        color: 0xFFEA00,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        name: "🎮 Roblox Player",
        color: 0x29B6F6,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        name: "⚡ Member / Thành Viên",
        color: 0xCFD8DC,
        hoist: false,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
    ];

    let createdCount = 0;
    let existingCount = 0;
    let createdAdminRoleId = "";
    let createdStaffRoleId = "";
    const errors = [];

    for (const roleConfig of rolesToCreate) {
      const existingRole = guild.roles.cache.find((r) => r.name === roleConfig.name);
      let role = existingRole;

      if (!existingRole) {
        try {
          role = await guild.roles.create({
            name: roleConfig.name,
            color: roleConfig.color,
            hoist: roleConfig.hoist,
            permissions: roleConfig.permissions,
            reason: "Khởi tạo hệ thống Role phân quyền chuyên nghiệp SandG",
          });
          createdCount++;
          logger.info(`Đã tạo Role: ${role.name} (${role.id})`);
        } catch (err) {
          logger.error(`Lỗi tạo role ${roleConfig.name}:`, err);
          errors.push(`• ${roleConfig.name}: ${err.message}`);
        }
      } else {
        existingCount++;
        role = existingRole;
      }

      if (role && roleConfig.name.includes("Admin")) createdAdminRoleId = role.id;
      if (role && roleConfig.name.includes("Staff")) createdStaffRoleId = role.id;
    }

    if (createdAdminRoleId) process.env.ADMIN_ROLE_ID = createdAdminRoleId;
    if (createdStaffRoleId) process.env.STAFF_ROLE_ID = createdStaffRoleId;

    if (errors.length > 0 && createdCount === 0) {
      await interaction.editReply({
        embeds: [
          createErrorEmbed(
            "❌ THIẾT LẬP THẤT BẠI",
            `Không thể tạo Role. Vui lòng:\n` +
              `**1.** Vào **Cài đặt Server** → **Vai Trò** → Tìm Role Bot và bật **"Quản Lý Vai Trò"**\n` +
              `**2.** Kéo Role của Bot lên **trên cùng** danh sách Roles\n` +
              `**3.** Chạy lại lệnh \`/setup-roles\`\n\n` +
              `Chi tiết lỗi:\n${errors.join("\n")}`
          ),
        ],
      });
      return;
    }

    await interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "🎭 HOÀN TẤT KHỞI TẠO BỘ VAI TRÒ CHUYÊN NGHIỆP!",
          `Bot đã tạo và phân quyền thành công các Vai Trò cho Server:\n\n` +
            `👑 **Owner / Founder** — Toàn quyền\n` +
            `🛡️ **Admin / Quản Trị** — Quản lý kênh & xử phạt\n` +
            `👨‍💻 **Staff / Cày Thuê Pro** — Tiếp nhận & cày đơn\n` +
            `💎 **VIP Client** — Khách hàng VIP\n` +
            `🛒 **Khách Hàng SandG** — Khách hàng thường\n` +
            `🔥 **Dân Cày Chăm Chỉ** & 🎮 **Roblox Player** & ⚡ **Member**\n\n` +
            `📌 Đã tạo mới: **${createdCount}** role | Đã có sẵn: **${existingCount}** role` +
            (errors.length > 0 ? `\n\n⚠️ Một số role lỗi:\n${errors.join("\n")}` : "")
        ),
      ],
    });
  },
};
