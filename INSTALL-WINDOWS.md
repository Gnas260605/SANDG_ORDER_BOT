# 📘 HƯỚNG DẪN CÀI ĐẶT SANDG ORDER BOT TRÊN WINDOWS

Tài liệu này hướng dẫn chi tiết từng bước cho người mới để đưa **SANDG ORDER BOT** vào hoạt động thực tế trên Discord Server của bạn. Tất cả các lệnh dưới đây được tối ưu để copy-paste chạy trực tiếp trên **PowerShell**.

---

## 📋 MỤC LỤC
1. [Cài đặt Node.js](#1-cài-đặt-nodejs)
2. [Tạo Discord Bot trên Discord Developer Portal](#2-tạo-discord-bot-trên-discord-developer-portal)
3. [Bật Developer Mode và lấy các ID cần thiết](#3-bật-developer-mode-và-lấy-các-id-cần-thiết)
4. [Tạo link mời Bot vào Server](#4-tạo-link-mời-bot-vào-server)
5. [Cấu hình biến môi trường (`.env`)](#5-cấu-hình-biến-môi-trường-env)
6. [Đăng ký Slash Commands & Khởi chạy Bot](#6-đăng-ký-slash-commands--khởi-chạy-bot)
7. [Kiểm tra hoạt động thực tế](#7-kiểm-tra-hoạt-động-thực-tế)
8. [Xử lý các lỗi phổ biến (Troubleshooting)](#8-xử-lý-các-lỗi-phổ-biến-troubleshooting)
9. [Cách chạy lại Bot sau khi tắt máy](#9-cách-chạy-lại-bot-sau-khi-tắt-máy)

---

## 1. CÀI ĐẶT NODE.JS

1. Tải bản **Node.js LTS** mới nhất từ trang chủ: [https://nodejs.org](https://nodejs.org)
2. Chạy file cài đặt `.msi` vừa tải về, bấm **Next** cho đến khi hoàn thành (giữ nguyên mặc định).
3. Mở **PowerShell** và kiểm tra phiên bản bằng lệnh:

```powershell
node -v
npm -v
```

> 💡 *Yêu cầu Node.js phiên bản 18+ hoặc 20+ LTS.*

---

## 2. TẠO DISCORD BOT TRÊN DISCORD DEVELOPER PORTAL

1. Truy cập trang quản lý ứng dụng: [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Đăng nhập tài khoản Discord của bạn.
3. Bấm vào nút **New Application** ở góc trên bên phải.
4. Nhập tên ứng dụng: `SANDG ORDER BOT` ➔ Bấm **Create**.
5. Chọn mục **Bot** ở menu bên trái:
   - Thay đổi Avatar bot nếu muốn.
   - Bấm nút **Reset Token** ➔ Chọn **Yes, do it!**.
   - **Sao chép và lưu trữ Token cẩn thận** (đây chính là `DISCORD_TOKEN`). Không chia sẻ Token này cho ai!
6. Cuộn xuống phần **Privileged Gateway Intents**:
   - Bot chỉ cần các intent mặc định (`Guilds`, `GuildMessages`).
   - **Không cần bật Message Content Intent**.
7. Chọn mục **General Information** ở menu bên trái:
   - Sao chép **APPLICATION ID** (đây chính là `CLIENT_ID`).

---

## 3. BẬT DEVELOPER MODE VÀ LẤY CÁC ID CẦN THIẾT

### Bật Developer Mode trên ứng dụng Discord:
1. Mở Discord trên máy tính.
2. Vào **User Settings** (Biểu tượng bánh răng góc dưới bên trái) ➔ **Advanced**.
3. Bật công tắc **Developer Mode**.

### Sao chép các ID từ Server của bạn:
1. **GUILD_ID** (Server ID): Chuột phải vào tên Server góc trên cùng bên trái ➔ Chọn **Copy Server ID**.
2. **STAFF_ROLE_ID**: Vào Server Settings ➔ Roles ➔ Chuột phải vào Role Nhân viên (Staff) ➔ Chọn **Copy Role ID**.
3. **ADMIN_ROLE_ID**: Chuột phải vào Role Quản trị viên (Admin) ➔ Chọn **Copy Role ID**.
4. **ORDER_CATEGORY_ID**: Chuột phải vào Danh mục (Category) dùng để chứa kênh Ticket đặt đơn ➔ Chọn **Copy Category ID**.
5. **LOG_CHANNEL_ID**: Chuột phải vào Kênh văn bản dùng để lưu log/transcript ➔ Chọn **Copy Channel ID**.

---

## 4. TẠO LINK MỜI BOT VÀO SERVER

1. Trên Discord Developer Portal, chọn mục **OAuth2** ➔ **URL Generator** ở menu bên trái.
2. Tại mục **SCOPES**, tích chọn:
   - `bot`
   - `applications.commands`
3. Tại mục **BOT PERMISSIONS**, tích chọn các quyền sau:
   - `View Channels` (Xem kênh)
   - `Send Messages` (Gửi tin nhắn)
   - `Embed Links` (Nhúng liên kết)
   - `Attach Files` (Đính kèm tệp)
   - `Read Message History` (Đọc lịch sử tin nhắn)
   - `Manage Channels` (Quản lý kênh - dùng để tạo/xóa kênh ticket)
4. Cuộn xuống cuối trang, sao chép đường link ở mục **GENERATED URL**.
5. Dán đường link này vào trình duyệt ➔ Chọn Server của bạn ➔ Bấm **Authorize** để mời bot vào Server.

---

## 5. CẤU HÌNH BIẾN MÔI TRƯỜNG (`.ENV`)

Mở **PowerShell** tại thư mục dự án `sandg-order-bot` và chạy các lệnh sau:

```powershell
# 1. Di chuyển vào thư mục dự án (nếu chưa có)
cd d:\Individua_Project\sandg-order-bot

# 2. Tạo file .env từ file mẫu .env.example
Copy-Item .env.example .env

# 3. Mở file .env bằng Notepad để chỉnh sửa
notepad .env
```

Điền đầy đủ thông tin các biến môi trường vào file `.env`:

```env
DISCORD_TOKEN=MTAyND... (Paste Bot Token của bạn)
CLIENT_ID=1234567890... (Paste Application ID)
GUILD_ID=9876543210... (Paste Server ID)

STAFF_ROLE_ID=111122223333444455 (Paste Staff Role ID)
ADMIN_ROLE_ID=555544443333222211 (Paste Admin Role ID)
ORDER_CATEGORY_ID=666677778888999900 (Paste Category ID)
LOG_CHANNEL_ID=999988887777666655 (Paste Log Channel ID)

SANDG_LOGO_URL=https://i.imgur.com/8Q898Zp.png
```

Bấm `Ctrl + S` để lưu lại và đóng Notepad.

---

## 6. ĐĂNG KÝ SLASH COMMANDS & KHỞI CHẠY BOT

Chạy các lệnh sau trong **PowerShell**:

```powershell
# 1. Cài đặt các gói phụ thuộc (Dependencies)
npm install

# 2. Đăng ký Slash Commands (/datdon, /donhang, /doncuatoi, /banggia, /setup) với Discord
npm run deploy

# 3. Khởi chạy Bot chính thức
npm start
```

Nếu thấy dòng thông báo dạng:
`🤖 SandG Order Bot đã đăng nhập thành công với tài khoản [SANDG ORDER BOT#1234]!`
thì bot đã hoạt động!

---

## 7. KIỂM TRA HOẠT ĐỘNG THỰC TẾ

1. **Kiểm tra Cấu hình**: Trong Discord Server, tài khoản Admin gõ lệnh `/setup`. Bot sẽ kiểm tra toàn bộ ID trong `.env` có hợp lệ trên server hay không.
2. **Xem Bảng giá**: Gõ `/banggia` để xem Embed menu dịch vụ.
3. **Thử Đặt đơn hàng**:
   - Gõ lệnh `/datdon`.
   - Chọn dịch vụ (Ví dụ: `FULL STORY`).
   - Điền số lượng, thời gian mong muốn và ghi chú vào Modal ➔ Bấm Submit.
   - Bấm **XÁC NHẬN ĐẶT ĐƠN** trên bản xem trước.
   - Truy cập kênh Ticket vừa tạo (dạng `don-sandg-0001`).
   - Nhân viên Staff bấm **NHẬN ĐƠN**, **ĐÃ THANH TOÁN**, **ĐANG THỰC HIỆN**, **HOÀN THÀNH** hoặc **ĐÓNG TICKET**.

---

## 8. XỬ LÝ CÁC LỖI PHỔ BIẾN (TROUBLESHOOTING)

### Lỗi 1: `An invalid token was provided`
- **Nguyên nhân**: `DISCORD_TOKEN` trong `.env` chưa chính xác hoặc chứa khoảng trắng thừa.
- **Khắc phục**: Mở `.env`, Reset Token mới trên Developer Portal và dán lại.

### Lỗi 2: `Missing Access` hoặc `Missing Permissions` khi tạo Ticket
- **Nguyên nhân**: Bot chưa có quyền `Manage Channels` hoặc Role của Bot đứng dưới Role cần quản lý.
- **Khắc phục**: Vào Server Settings ➔ Roles ➔ Kéo Role của Bot lên cao hơn trên danh sách Role.

### Lỗi 3: Không thấy các lệnh `/datdon` xuất hiện trong Server
- **Nguyên nhân**: Chưa chạy lệnh `npm run deploy` hoặc `GUILD_ID` trong `.env` sai.
- **Khắc phục**: Kiểm tra lại `GUILD_ID` trong `.env` và chạy lại `npm run deploy`.

---

## 9. CÁCH CHẠY LẠI BOT SAU KHI TẮT MÁY

Mỗi khi bật máy tính lại, bạn chỉ cần mở **PowerShell** và chạy 2 lệnh đơn giản sau:

```powershell
cd d:\Individua_Project\sandg-order-bot
npm start
```

Hoặc chạy ở chế độ tự động khôi phục khi sửa code (Development mode):

```powershell
npm run dev
```
