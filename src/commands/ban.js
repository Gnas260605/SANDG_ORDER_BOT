/**
 * Slash Command: /ban
 * Lệnh cấm/ban vĩnh viễn thành viên khỏi server khi vi phạm chính sách
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { COLORS } = require("../config/constants");
const { createBaseEmbed, createErrorEmbed, createSuccessEmbed } = require("../utils/embeds");
const { isStaff, isAdmin } = require("../utils/permissions");
const logger = require("../utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban/Cấm vĩnh viễn thành viên vi phạm khỏi Server")
    .addUserOption((option) =>
      option
        .setName("thanh_vien")
        .setDescription("Thành viên cần Ban khỏi Server")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("ly_do")
        .setDescription("Lý do Ban/Cấm thành viên")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    if (!isStaff(interaction.member) && !isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Admin/Staff mới có quyền xử phạt Ban thành viên.")],
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("thanh_vien");
    const reason = interaction.options.getString("ly_do") || "Vi phạm quy định Server SandG";

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (targetMember) {
      if (targetMember.id === interaction.user.id) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ LỖI THAO TÁC", "Bạn không thể tự Ban chính mình!")],
          ephemeral: true,
        });
      }

      if (!targetMember.bannable) {
        return interaction.reply({
          embeds: [createErrorEmbed("❌ THẤT BẠI", "Bot không thể Ban người dùng này (Do vai trò cao hơn Bot).")],
          ephemeral: true,
        });
      }
    }

    try {
      // Gửi DM cho người bị ban (nếu mở DM)
      if (targetUser) {
        const dmEmbed = createBaseEmbed(
          "🔨 BẠN ĐÃ BỊ BAN KHỎI SERVER SANDG",
          `Lý do: **${reason}**\nNgười thực hiện: Admin/Staff <@${interaction.user.id}>`,
          COLORS.DANGER
        );
        await targetUser.send({ embeds: [dmEmbed] }).catch(() => {});
      }

      // Ban thành viên khỏi Guild
      await interaction.guild.members.ban(targetUser.id, { reason });

      const successEmbed = createSuccessEmbed(
        "🔨 ĐÃ BAN THÀNH VIÊN VĨNH VIỄN",
        `• Thành viên: <@${targetUser.id}> (\`${targetUser.tag}\`)\n• Lý do xử phạt: **${reason}**\n• Người thực hiện: <@${interaction.user.id}>`
      );

      await interaction.reply({ embeds: [successEmbed] });

      // Gửi Log tới kênh LOG_CHANNEL_ID
      const logChannelId = process.env.LOG_CHANNEL_ID;
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          await logChannel.send({ embeds: [successEmbed] });
        }
      }
    } catch (err) {
      logger.error("Lỗi khi thực hiện Ban:", err);
      await interaction.reply({
        embeds: [createErrorEmbed("❌ LỖI BAN THÀNH VIÊN", `Không thể xử lý Ban: ${err.message}`)],
        ephemeral: true,
      });
    }
  },
};
