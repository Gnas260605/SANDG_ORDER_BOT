/**
 * Slash Command: /kick
 * Lệnh Kick/Đẩy thành viên khỏi server khi vi phạm chính sách
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
    .setName("kick")
    .setDescription("Kick/Đẩy thành viên khỏi Server")
    .addUserOption((option) =>
      option
        .setName("thanh_vien")
        .setDescription("Thành viên cần Kick khỏi Server")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("ly_do")
        .setDescription("Lý do Kick thành viên")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    if (!isStaff(interaction.member) && !isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Admin/Staff mới có quyền Kick thành viên.")],
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("thanh_vien");
    const reason = interaction.options.getString("ly_do") || "Vi phạm quy định Server SandG";

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

    if (!targetMember) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG TÌM THẤY", "Thành viên này không còn trong Server.")],
        ephemeral: true,
      });
    }

    if (targetMember.id === interaction.user.id) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ LỖI THAO TÁC", "Bạn không thể Kick chính mình!")],
        ephemeral: true,
      });
    }

    if (!targetMember.kickable) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ THẤT BẠI", "Bot không thể Kick người dùng này (Do vai trò cao hơn Bot).")],
        ephemeral: true,
      });
    }

    try {
      const dmEmbed = createBaseEmbed(
        "👢 BẠN ĐÃ BỊ KICK KHỎI SERVER SANDG",
        `Lý do: **${reason}**\nNgười thực hiện: Admin/Staff <@${interaction.user.id}>`,
        COLORS.WARNING
      );
      await targetUser.send({ embeds: [dmEmbed] }).catch(() => {});

      await targetMember.kick(reason);

      const successEmbed = createSuccessEmbed(
        "👢 ĐÃ KICK THÀNH VIÊN KHỎI SERVER",
        `• Thành viên: <@${targetUser.id}> (\`${targetUser.tag}\`)\n• Lý do: **${reason}**\n• Người thực hiện: <@${interaction.user.id}>`
      );

      await interaction.reply({ embeds: [successEmbed] });

      const logChannelId = process.env.LOG_CHANNEL_ID;
      if (logChannelId) {
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (logChannel) {
          await logChannel.send({ embeds: [successEmbed] });
        }
      }
    } catch (err) {
      logger.error("Lỗi khi thực hiện Kick:", err);
      await interaction.reply({
        embeds: [createErrorEmbed("❌ LỖI KICK THÀNH VIÊN", `Không thể xử lý Kick: ${err.message}`)],
        ephemeral: true,
      });
    }
  },
};
