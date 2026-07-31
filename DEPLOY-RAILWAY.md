# ☁️ HƯỚNG DẪN DEPLOY SANDG ORDER BOT LÊN RAILWAY.APP

Tài liệu này hướng dẫn từng bước chi tiết cách triển khai (deploy) **SANDG ORDER BOT** lên nền tảng đám mây **Railway.app** để bot chạy online **24/7 liên tục không cần bật máy tính**.

---

## 📋 MỤC LỤC
1. [Chuẩn bị Repository trên GitHub](#1-chuẩn-bị-repository-trên-github)
2. [Tạo Dự án mới trên Railway](#2-tạo-dự-án-mới-trên-railway)
3. [Cấu hình Biến môi trường (Environment Variables)](#3-cấu-hình-biến-môi-trường-environment-variables)
4. [Tạo Persistent Volume cho SQLite Database (Quan trọng)](#4-tạo-persistent-volume-cho-sqlite-database-quan-trọng)
5. [Đăng ký Slash Commands trên Railway](#5-đăng-ký-slash-commands-trên-railway)
6. [Khởi chạy & Kiểm tra Logs](#6-khởi-chạy--kiểm-tra-logs)
7. [Bảo trì & Cập nhật Code](#7-bảo-trì--cập-nhật-code)

---

## 1. CHUẨN BỊ REPOSITORY TRÊN GITHUB

1. Đảm bảo toàn bộ mã nguồn đã được lưu.
2. Tạo một repository mới trên GitHub (Private hoặc Public tùy chọn).
3. Đẩy code từ máy local lên GitHub qua **PowerShell**:

```powershell
# Di chuyển vào thư mục dự án
cd d:\Individua_Project\sandg-order-bot

# Khởi tạo git và commit (nếu chưa khởi tạo)
git init
git add .
git commit -m "Initial commit SANDG ORDER BOT"

# Liên kết và đẩy code lên GitHub
git branch -M main
git remote add origin https://github.com/USERNAME/sandg-order-bot.git
git push -u origin main
```

> ⚠️ **LƯU Ý BẢO MẬT**: Đảm bảo file `.env` chứa token thật **KHÔNG** bị push lên GitHub (file `.gitignore` đã có sẵn `.env`).

---

## 2. TẠO DỰ ÁN MỚI TRÊN RAILWAY

1. Truy cập [https://railway.app](https://railway.app) và đăng nhập bằng tài khoản **GitHub**.
2. Tại trang Dashboard, bấm nút **+ New Project**.
3. Chọn **Deploy from GitHub repo**.
4. Chọn repository `sandg-order-bot` bạn vừa tải lên.
5. Bấm **Deploy Now**.

---

## 3. CẤU HÌNH BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

1. Nhấp vào dịch vụ bot vừa tạo trên Railway Dashboard.
2. Chọn tab **Variables**.
3. Bấm nút **New Variable** (hoặc **Raw Editor**) và điền toàn bộ các biến môi trường:

| Variable Key | Mô tả |
| :--- | :--- |
| `DISCORD_TOKEN` | Bot Token lấy từ Discord Developer Portal |
| `CLIENT_ID` | Application ID của Bot |
| `GUILD_ID` | Server ID của Server Discord |
| `STAFF_ROLE_ID` | Role ID của Nhân viên Staff |
| `ADMIN_ROLE_ID` | Role ID của Quản trị viên Admin |
| `ORDER_CATEGORY_ID` | Category ID của Danh mục chứa Ticket |
| `LOG_CHANNEL_ID` | Channel ID của Kênh lưu file Transcript `.txt` |
| `SANDG_LOGO_URL` | Đường dẫn URL ảnh Logo thương hiệu |

4. Bấm **Save Changes**. Railway sẽ tự động Re-deploy ứng dụng với các biến môi trường mới.

---

## 4. TẠO PERSISTENT VOLUME CHO SQLITE DATABASE (QUAN TRỌNG)

Vì mặc định Railway sử dụng ephemeral filesystem (dữ liệu sẽ bị reset mỗi lần deploy lại code), bạn **CẦN** gắn một **Volume** cố định cho thư mục `/app/data`:

1. Trên giao diện dịch vụ trên Railway, chọn tab **Volumes** (hoặc bấm biểu tượng `+` ➔ chọn **Volume**).
2. Chọn **Add Volume**.
3. Đặt **Mount Path** là: `/app/data` (hoặc `data`).
4. Bấm **Save**.

> 💡 *Nhờ có Volume này, file cơ sở dữ liệu `sandg_orders.sqlite` và các mã đơn `SANDG-0001` sẽ được lưu vĩnh viễn không sợ mất khi nâng cấp code.*

---

## 5. ĐĂNG KÝ SLASH COMMANDS TRÊN RAILWAY

Có 2 cách để đăng ký Slash Commands (`/datdon`, `/donhang`, `/doncuatoi`, `/banggia`, `/setup`) khi deploy lên Railway:

### Cách 1: Đã đăng ký từ máy Local (Khuyên dùng)
Trước khi deploy, ở dưới máy tính cá nhân bạn chỉ cần chạy 1 lần lệnh:
```powershell
npm run deploy
```
Các lệnh slash sẽ lập tức xuất hiện trên Discord Server mà không cần làm gì thêm trên Railway.

### Cách 2: Chạy Command thủ công qua Railway CLI / One-off Command
Vào tab **Settings** trên Railway ➔ tại mục **Deploy** ➔ cài đặt **Custom Start Command**:
```bash
node scripts/deploy-commands.js && node src/index.js
```
Railway sẽ tự động chạy đăng ký command trước mỗi lần khởi động bot!

---

## 6. KHỞI CHẠY & KIỂM TRA LOGS

1. Vào tab **Logs** trên Railway Dashboard.
2. Kiểm tra log đầu ra. Nếu thấy dòng thông báo:
   ```text
   🤖 SandG Order Bot đã đăng nhập thành công với tài khoản [SANDG ORDER BOT#1234]!
   Đã kết nối cơ sở dữ liệu SQLite tại [/app/data/sandg_orders.sqlite] bằng [node:sqlite]
   ```
   thì bot đã trực tuyến 24/7 thành công!

---

## 7. BẢO TRÌ & CẬP NHẬT CODE

Mỗi khi bạn sửa code dưới máy tính cá nhân, bạn chỉ cần commit và push lên GitHub:

```powershell
git add .
git commit -m "Cập nhật tính năng mới"
git push
```

Railway sẽ tự động phát hiện code mới và **auto-deploy** phiên bản mới nhất trong vài giây mà không làm gián đoạn dữ liệu SQLite trên Volume!
