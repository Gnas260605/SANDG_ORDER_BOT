# 🖥️ HƯỚNG DẪN DEPLOY BOT LÊN VPS (CỰC KỲ KHUYÊN DÙNG)

Có sẵn VPS là **LỰA CHỌN TỐT NHẤT 100%**! Chạy bot trên VPS có các ưu điểm tuyệt vời:
- ✅ **Chạy online 24/7 liên tục**, không bao giờ bị ngắt kết nối hay dính giới hạn dùng thử.
- ✅ **SQLite Database được lưu vĩnh viễn** trực tiếp trên đĩa cứng VPS.
- ✅ **Hoàn toàn miễn phí** (vì bạn đã có sẵn VPS).

---

## 🐧 HƯỚNG DẪN CHO LINUX VPS (UBUNTU / DEBIAN)

### Bước 1: Kết nối SSH vào VPS
Mở **PowerShell** trên máy tính của bạn và gõ lệnh kết nối (thay IP bằng IP VPS của bạn):
```bash
ssh root@123.45.67.89
```

---

### Bước 2: Cài đặt Node.js, Git và PM2
Dán các lệnh sau vào cửa sổ SSH của VPS:

```bash
# 1. Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# 2. Cài đặt Node.js v22 LTS và Git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git

# 3. Cài đặt PM2 (Trình quản lý ứng dụng ngầm 24/7)
sudo npm install -g pm2
```

Kiểm tra cài đặt:
```bash
node -v
pm2 -v
```

---

### Bước 3: Tải mã nguồn từ GitHub về VPS

```bash
# 1. Clone repository từ GitHub
git clone https://github.com/Gnas260605/SANDG_ORDER_BOT.git

# 2. Di chuyển vào thư mục dự án
cd SANDG_ORDER_BOT

# 3. Cài đặt dependencies
npm install
```

---

### Bước 4: Cấu hình biến môi trường (`.env`)

```bash
# Tạo file .env từ file mẫu
cp .env.example .env

# Chỉnh sửa file .env bằng trình biên soạn nano
nano .env
```

Dán đầy đủ các biến môi trường của bạn (`DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, ...).
- Nhấn `Ctrl + O` ➔ Bấm `Enter` để Lưu.
- Nhấn `Ctrl + X` để Thoát.

---

### Bước 5: Đăng ký Slash Commands & Khởi chạy Bot ngầm 24/7

```bash
# 1. Đăng ký các Slash Commands với Discord
npm run deploy

# 2. Chạy bot ngầm 24/7 bằng PM2
pm2 start src/index.js --name "sandg-order-bot"

# 3. Lưu trạng thái PM2 tự khởi động cùng VPS khi VPS reboot
pm2 save
pm2 startup
```

---

### Các lệnh quản lý Bot trên VPS:
- **Xem trạng thái bot**: `pm2 status`
- **Xem log hoạt động trực tiếp**: `pm2 logs sandg-order-bot`
- **Khởi động lại bot**: `pm2 restart sandg-order-bot`
- **Dừng bot**: `pm2 stop sandg-order-bot`

---

## 🪟 HƯỚNG DẪN CHO WINDOWS VPS

1. Mở **Remote Desktop Connection** (RDP) kết nối vào Windows VPS.
2. Tải và cài đặt **Node.js LTS** từ [nodejs.org](https://nodejs.org).
3. Mở **PowerShell** trên VPS và gõ:
   ```powershell
   git clone https://github.com/Gnas260605/SANDG_ORDER_BOT.git
   cd SANDG_ORDER_BOT
   npm install
   Copy-Item .env.example .env
   notepad .env
   ```
4. Điền file `.env`, sau đó chạy:
   ```powershell
   npm run deploy
   npm install -g pm2
   pm2 start src/index.js --name "sandg-order-bot"
   pm2 save
   ```
