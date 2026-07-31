# 🌐 HƯỚNG DẪN DEPLOY FREE 100% LÊN RENDER.COM (GÓI WEB SERVICE $0/MONTH)

Khi chọn loại "Background Worker" trên Render, hệ thống sẽ báo giá $7/tháng. Tuy nhiên, trên Render có gói **Web Service** hoàn toàn **MIỄN PHÍ ($0/month)**!

Dự án đã được tích hợp sẵn một **Web Healthcheck Server** phụ trợ, giúp bạn chọn gói **Web Service Free** chạy mượt mà 24/7 mà **KHÔNG TỐN MỘT XU NÀO**.

---

## 🌟 CÁC BƯỚC CHỌN GÓI MIỄN PHÍ TRÊN RENDER.COM

1. Trên giao diện Render.com, bấm nút **New +** ở góc trên bên phải ➔ Chọn **Web Service** (thay vì chọn Background Worker).
2. Chọn Repository của bạn: **`Gnas260605/SANDG_ORDER_BOT`**.
3. Điền các thông tin:
   - **Name**: `sandg-order-bot`
   - **Region**: Singapore (hoặc Oregon/Frankfurt)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node scripts/deploy-commands.js && node src/index.js` (hoặc `npm start`)
4. Tại mục **Instance Type**: Cuộn xuống chọn **Free** (**$0 / month**).
5. Kéo xuống mục **Environment Variables** ➔ Bấm **Add Environment Variable** để nhập các biến:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID`
   - `STAFF_ROLE_ID`
   - `ADMIN_ROLE_ID`
   - `ORDER_CATEGORY_ID`
   - `LOG_CHANNEL_ID`
   - `SANDG_LOGO_URL`
6. Bấm **Create Web Service**. Bot sẽ được khởi chạy hoàn toàn **MIỄN PHÍ**!

---

## 🚀 CÁC PHƯƠNG ÁN MIỄN PHÍ KHÁC

### 1. Koyeb.com (Free Tier 24/7)
- Chọn **Free Nano** ($0/tháng).
- Đăng nhập với GitHub ➔ Chọn repo `Gnas260605/SANDG_ORDER_BOT` ➔ Điền Environment Variables ➔ Deploy.

### 2. Treo ngầm trên máy PC local với PM2
- Không tốn tiền hosting cloud.
- Mở PowerShell: `npm install -g pm2`
- Chạy: `pm2 start src/index.js --name "sandg-bot"`
