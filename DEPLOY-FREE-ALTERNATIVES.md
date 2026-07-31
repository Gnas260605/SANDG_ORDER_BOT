# 🌐 HƯỚNG DẪN DEPLOY FREE 24/7 LÊN RENDER.COM & KOYEB.COM

Khi dùng thử Railway bị hết hạn (**Trial expired**), bạn có thể chuyển sang sử dụng các nền tảng đám mây **HOÀN TOÀN MIỄN PHÍ** dưới đây để treo Discord Bot 24/7 không tốn tiền.

---

## 🌟 LỰA CHỌN 1: DEPLOY LÊN RENDER.COM (KHUYÊN DÙNG)

Render cung cấp gói **Free Tier** kết nối trực tiếp với GitHub vô cùng tiện lợi.

### Các bước thực hiện trên Render:

1. Truy cập [https://render.com](https://render.com) và đăng ký/đăng nhập bằng tài khoản **GitHub**.
2. Tại trang Dashboard, bấm nút **New +** ở góc trên bên phải ➔ Chọn **Background Worker** (dành cho bot không cần cổng web) hoặc **Web Service**.
3. Chọn Repository: `Gnas260605/SANDG_ORDER_BOT`.
4. Điền các thông tin cấu hình:
   - **Name**: `sandg-order-bot`
   - **Region**: Singapore (hoặc Oregon/Frankfurt)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (hoặc `node scripts/deploy-commands.js && node src/index.js`)
   - **Instance Type**: Chọn **Free** ($0/month).
5. Kéo xuống mục **Environment Variables** ➔ Bấm **Add Environment Variable** để thêm từng biến môi trường:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
   - `STAFF_ROLE_ID`
   - `ADMIN_ROLE_ID`
   - `ORDER_CATEGORY_ID`
   - `LOG_CHANNEL_ID`
   - `SANDG_LOGO_URL`
6. Bấm **Create Background Worker**. Render sẽ tự động kéo code từ GitHub về, cài đặt và khởi chạy bot!

---

## ⚡ LỰA CHỌN 2: DEPLOY LÊN KOYEB.COM (CỰC KỲ MẠNH & MIỄN PHÍ)

Koyeb cung cấp instance Nano **Miễn phí 24/7** chạy mượt mà.

### Các bước thực hiện trên Koyeb:

1. Truy cập [https://www.koyeb.com](https://www.koyeb.com) và đăng ký bằng tài khoản **GitHub**.
2. Tại Dashboard, bấm **Create App**.
3. Chọn **GitHub** làm nguồn deployment ➔ Chọn repo `Gnas260605/SANDG_ORDER_BOT`.
4. Tại phần Builder, giữ nguyên **Buildpack** (Node.js).
5. Thêm các **Environment Variables** (Tương tự như danh sách biến ở trên).
6. Mục Instance Type: Chọn **Free Nano**.
7. Bấm **Deploy**. Bot sẽ được kích hoạt trực tuyến 24/7!

---

## 💻 LỰA CHỌN 3: TREO BOT TRÊN MÁY TÍNH LOCAL BẰNG PM2 (KHÔNG CẦN CLOUD)

Nếu bạn muốn chạy bot ngay trên máy tính của mình mà không lo văng chương trình khi đóng PowerShell:

1. Mở **PowerShell** (Run as Administrator) tại thư mục dự án và cài đặt `pm2`:
   ```powershell
   npm install -g pm2
   ```

2. Khởi chạy bot ngầm bằng `pm2`:
   ```powershell
   cd d:\Individua_Project\sandg-order-bot
   pm2 start src/index.js --name "sandg-bot"
   ```

3. Kiểm tra trạng thái và quản lý bot:
   ```powershell
   pm2 list       # Xem danh sách ứng dụng đang chạy ngầm
   pm2 logs       # Xem log trực tiếp của bot
   pm2 restart sandg-bot  # Khởi động lại bot
   ```
