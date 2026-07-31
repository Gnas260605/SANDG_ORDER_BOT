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

    await interaction.deferReply();

    const guild = interaction.guild;

    const rolesToCreate = [
      {
        name: "👑 Owner / Founder",
        color: "#FF1744",
        hoist: true,
        permissions: [PermissionsBitField.Flags.Administrator],
      },
      {
        name: "🛡️ Admin / Quản Trị",
        color: "#FF9100",
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
        color: "#7C4DFF",
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
        color: "#00E5FF",
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
        color: "#00E676",
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.AttachFiles,
        ],
      },
      {
        name: "🔥 Dân Cày Chăm Chỉ",
        color: "#FFEA00",
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        name: "🎮 Roblox Player",
        color: "#29B6F6",
        hoist: true,
        permissions: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
        ],
      },
      {
        name: "⚡ Member / Thành Viên",
        color: "#CFD8DC",
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

    try {
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
          } catch (err) {
            logger.error(`Lỗi tạo role ${roleConfig.name}:`, err);
          }
        } else {
          existingCount++;
        }

        if (role && roleConfig.name.includes("Admin")) createdAdminRoleId = role.id;
        if (role && roleConfig.name.includes("Staff")) createdStaffRoleId = role.id;
      }

      if (createdAdminRoleId) process.env.ADMIN_ROLE_ID = createdAdminRoleId;
      if (createdStaffRoleId) process.env.STAFF_ROLE_ID = createdStaffRoleId;

      const successEmbed = createSuccessEmbed(
        "🎭 HOÀN TẤT KHỞI TẠO BỘ VAI TRÒ CHUYÊN NGHIỆP!",
        `Bot đã tạo và phân quyền thành công các Vai Trò cho Server:\n\n` +
          `👑 **Owner / Founder** (Toàn quyền)\n` +
          `🛡️ **Admin / Quản Trị** (Quản lý kênh & xử phạt)\n` +
          `👨‍💻 **Staff / Cày Thuê Pro** (Tiếp nhận & cày đơn)\n` +
          `💎 **VIP Client** (Khách hàng VIP)\n` +
          `🛒 **Khách Hàng SandG** (Khách hàng đã đặt đơn)\n` +
          `🔥 **Dân Cày Chăm Chỉ** & 🎮 **Roblox Player**\n\n` +
          `📌 *Đã tạo mới: **${createdCount}** role | Đã có sẵn: **${existingCount}** role.*`
      );

      await interaction.editReply({ embeds: [successEmbed] });
    } catch (err) {
      logger.error("Lỗi khi setup roles:", err);
      await interaction.editReply({
        embeds: [
          createErrorEmbed(
            "❌ THIẾT LẬP THẤT BẠI",
            `Không thể tạo Role. Hãy đảm bảo Bot có quyền **Quản Lý Vai Trò (Manage Roles)** và Role của Bot nằm ở trên cùng danh sách Roles!`
          ),
        ],
      });
    }
  },
};
