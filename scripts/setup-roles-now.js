/**
 * Script tự động khởi tạo hệ thống Vai Trò (Roles) phân quyền chuẩn 5 sao cho Discord Server
 */

require("dotenv").config();
const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", async () => {
  const guildId = process.env.DISCORD_GUILD_ID || "1240850060204445850";
  const guild = await client.guilds.fetch(guildId).catch(() => null);

  if (!guild) {
    console.error(`[ROLES ERROR] Không tìm thấy Guild [${guildId}]`);
    process.exit(1);
  }

  console.log(`[ROLES] Bắt đầu khởi tạo các Vai Trò chuyên nghiệp cho Server [${guild.name}]...`);

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

  let createdAdminRoleId = "";
  let createdStaffRoleId = "";

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
        console.log(` ✅ Đã tạo thành công Role: ${role.name} (${role.id})`);
      } catch (err) {
        console.error(` ❌ Lỗi khi tạo Role ${roleConfig.name}:`, err.message);
      }
    } else {
      console.log(` ℹ️ Role đã tồn tại: ${role.name} (${role.id})`);
    }

    if (role && roleConfig.name.includes("Admin")) createdAdminRoleId = role.id;
    if (role && roleConfig.name.includes("Staff")) createdStaffRoleId = role.id;
  }

  // Cập nhật file .env với ADMIN_ROLE_ID và STAFF_ROLE_ID mới
  if (createdAdminRoleId || createdStaffRoleId) {
    const envPath = path.join(__dirname, "..", ".env");
    let envContent = fs.readFileSync(envPath, "utf8");

    if (createdAdminRoleId) {
      envContent = envContent.replace(/ADMIN_ROLE_ID=.*/, `ADMIN_ROLE_ID=${createdAdminRoleId}`);
    }
    if (createdStaffRoleId) {
      envContent = envContent.replace(/STAFF_ROLE_ID=.*/, `STAFF_ROLE_ID=${createdStaffRoleId}`);
    }

    fs.writeFileSync(envPath, envContent);
    console.log("[ROLES] Đã tự động cập nhật ADMIN_ROLE_ID & STAFF_ROLE_ID mới vào file .env!");
  }

  console.log("\n[ROLES SUCCESS] 🎉 Hoàn tất khởi tạo hệ thống Vai Trò cho Server!");
  client.destroy();
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
