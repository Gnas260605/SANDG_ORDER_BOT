/**
 * Slash Command: /timeout
 * Lệnh Timeout (Phạt im lặng/Mute) thành viên vi phạm
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
    .setName("timeout")
    .setDescription("Phạt im lặng (Timeout/Mute) thành viên vi phạm quy định")
    .addUserOption((option) =>
      option
        .setName("thanh_vien")
        .setDescription("Thành viên cần phạt im lặng")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("so_phut")
        .setDescription("Số phút phạt im lặng (ví dụ: 10, 60, 1440)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320) // Tối đa 28 ngày theo quy định Discord
    )
    .addStringOption((option) =>
      option
        .setName("ly_do")
        .setDescription("Lý do xử phạt im lặng")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    if (!isStaff(interaction.member) && !isAdmin(interaction.member)) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ KHÔNG CÓ QUYỀN", "Chỉ Admin/Staff mới có quyền phạt im lặng thành viên.")],
        ephemeral: true,
      });
    }

    const targetUser = interaction.options.getUser("thanh_vien");
    const minutes = interaction.options.getInteger("so_phut");
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
        embeds: [createErrorEmbed("❌ LỖI THAO TÁC", "Bạn không thể tự Timeout chính mình!")],
        ephemeral: true,
      });
    }

    if (!targetMember.moderatable) {
      return interaction.reply({
        embeds: [createErrorEmbed("❌ THẤT BẠI", "Bot không thể phạt im lặng người dùng này (Do vai trò cao hơn Bot).")],
        ephemeral: true,
      });
    }

    try {
      const durationMs = minutes * 60 * 1000;
      await targetMember.timeout(durationMs, reason);

      const dmEmbed = createBaseEmbed(
        "🤐 BẠN ĐÃ BỊ PHẠT IM LẶNG (TIMEOUT)",
        `Thời gian: **${minutes} phút**\nLý do: **${reason}**\nNgười thực hiện: Admin/Staff <@${interaction.user.id}>`,
        COLORS.WARNING
      );
      await targetUser.send({ embeds: [dmEmbed] }).catch(() => {});

      const successEmbed = createSuccessEmbed(
        "🤐 ĐÃ PHẠT IM LẶNG THÀNH VIÊN",
        `• Thành viên: <@${targetUser.id}> (\`${targetUser.tag}\`)\n• Thời gian phạt: **${minutes} phút**\n• Lý do: **${reason}**\n• Người thực hiện: <@${interaction.user.id}>`
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
      logger.error("Lỗi khi thực hiện Timeout:", err);
      await interaction.reply({
        embeds: [createErrorEmbed("❌ LỖI PHẠT IM LẶNG", `Không thể xử lý Timeout: ${err.message}`)],
        ephemeral: true,
      });
    }
  },
};
