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
const logger = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-roles")
    .setDescription("Tự động tạo và phân quyền bộ Vai Trò (Roles) chuyên nghiệp cho Server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Defer trước để tránh timeout (phải làm trong 3 giây đầu tiên)
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    // Kiểm tra Bot có quyền Manage Roles không
    const botMember = guild.members.me;
    if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.editReply({
        embeds: [
          createErrorEmbed(
            "❌ BOT THIẾU QUYỀN MANAGE ROLES",
            `Bot chưa có quyền **Manage Roles (Quản Lý Vai Trò)**.\n\n` +
              `**Cách cấp quyền:**\n` +
              `1. Vào **Server Settings** → **Roles**\n` +
              `2. Tìm role **bot-cay-thue** → Bật **Manage Roles**\n` +
              `3. Kéo role Bot lên **trên cùng** danh sách Roles\n` +
              `4. Gõ lại \`/setup-roles\``
          ),
        ],
      });
    }

    const rolesToCreate = [
      {
        name: "👑 Owner / Founder",
        color: 0xff1744,
        hoist: true,
        permissions: [PermissionsBitField.Flags.Administrator],
      },
      {
        name: "🛡️ Admin / Quản Trị",
        color: 0xff9100,
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
        color: 0x7c4dff,
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
        color: 0x00e5ff,
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
        color: 0x00e676,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.AttachFiles,
        ],
      },
      {
        name: "🔥 Dân Cày Chăm Chỉ",
        color: 0xffea00,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        name: "🎮 Roblox Player",
        color: 0x29b6f6,
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        name: "⚡ Member / Thành Viên",
        color: 0xcfd8dc,
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
            reason: "Setup SandG Server Roles",
          });
          createdCount++;
          logger.info(`Đã tạo Role: ${role.name} (${role.id})`);
        } catch (err) {
          logger.error(`Lỗi tạo role ${roleConfig.name}:`, err);
          errors.push(`• ${roleConfig.name}`);
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

    await interaction.editReply({
      embeds: [
        createSuccessEmbed(
          "🎭 HOÀN TẤT KHỞI TẠO BỘ VAI TRÒ!",
          `Bot đã xử lý thành công các Vai Trò cho Server:\n\n` +
            `👑 **Owner / Founder** — Toàn quyền\n` +
            `🛡️ **Admin / Quản Trị** — Quản lý kênh & xử phạt\n` +
            `👨‍💻 **Staff / Cày Thuê Pro** — Tiếp nhận & cày đơn\n` +
            `💎 **VIP Client** — Khách hàng VIP\n` +
            `🛒 **Khách Hàng SandG** — Khách hàng thường\n` +
            `🔥 **Dân Cày Chăm Chỉ** & 🎮 **Roblox Player** & ⚡ **Member**\n\n` +
            `✅ Tạo mới: **${createdCount}** | Đã có: **${existingCount}**` +
            (errors.length > 0 ? `\n\n⚠️ Bỏ qua (đã tồn tại hoặc lỗi): ${errors.join(", ")}` : "")
        ),
      ],
    });
  },
};
