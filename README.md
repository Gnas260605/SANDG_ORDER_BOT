# 🤖 SANDG ORDER BOT — DISCORD ORDER MANAGEMENT BOT

**SANDG ORDER BOT** là Discord Bot chuyên nghiệp giúp tự động hóa quy trình đặt dịch vụ cày game Anime Expedition cho Server SandG.

Bot cung cấp giao diện tương tác hiện đại bằng **Slash Commands**, **Select Menu**, **Modal**, **Embed Cyan/Navy**, hệ thống **Ticket riêng tư** tự động phân quyền, quản lý trạng thái đơn hàng theo luồng chuẩn và xuất **Log Transcript** dạng file văn bản `.txt`.

---

## 🌟 TÍNH NĂNG NỔI BẬT

- 🛒 **Luồng đặt đơn thông minh**: Gõ `/datdon` chọn dịch vụ ➔ Mở Modal nhập thông tin ➔ Embed xem trước xác nhận ➔ Tự động sinh mã đơn `SANDG-0001` không trùng lặp.
- 🔒 **Ticket riêng tư an toàn**: Tự động tạo Text Channel dạng `don-sandg-0001` trong danh mục cấu hình, chỉ cấp quyền cho Khách hàng, Staff Role và Bot.
- ⚡ **Bảng điều khiển cho Staff**: Tích hợp các nút bấm trong Ticket (`NHẬN ĐƠN`, `ĐÃ THANH TOÁN`, `ĐANG THỰC HIỆN`, `HOÀN THÀNH`, `HUỶ ĐƠN`, `ĐÓNG TICKET`).
- 🔄 **State Machine nghiêm ngặt**: Chuyển trạng thái đơn hàng theo quy trình `PENDING` ➔ `ACCEPTED` ➔ `PAID` ➔ `PROCESSING` ➔ `COMPLETED` (và `CANCELLED`).
- 📜 **Log Transcript**: Khi đóng Ticket, tự động trích xuất toàn bộ lịch sử trò chuyện thành file `.txt` và gửi vào Kênh Log hệ thống.
- ⚙️ **Kiểm tra cấu hình nhanh**: Lệnh `/setup` dành riêng cho Administrator để kiểm tra toàn bộ ID Channel, Category, Role và Token trong Server.

---

## 📦 THƯ MỤC DỰ ÁN

```
sandg-order-bot/
├── src/
│   ├── commands/        # Slash commands (/datdon, /donhang, /doncuatoi, /banggia, /setup)
│   ├── interactions/    # Handlers cho Select menu, Modals, Buttons
│   ├── services/        # Logic nghiệp vụ đơn hàng, Ticket, Transcript
│   ├── database/        # SQLite connection, Migrations, OrderRepository
│   ├── config/          # Cấu hình dịch vụ, bảng giá, trạng thái, branding
│   ├── utils/           # Helper Embeds, Logger, Permissions, Validators
│   ├── events/          # Discord event listeners (ready, interactionCreate)
│   └── index.js         # Entry point chính
├── scripts/             # Script đăng ký slash commands (deploy-commands.js)
├── data/                # Lưu trữ file SQLite Database (sandg_orders.sqlite)
├── transcripts/         # Lưu trữ tạm thời file transcript (.txt)
├── tests/               # Bộ kiểm thử tự động (Unit Tests & Syntax Check)
├── .env.example         # Mẫu biến môi trường
├── .gitignore           # Danh sách bỏ qua git
├── eslint.config.js     # Cấu hình ESLint v9
├── package.json         # Khai báo dependencies và scripts
├── README.md            # Tài liệu tổng quan dự án
└── INSTALL-WINDOWS.md   # Hướng dẫn cài đặt chi tiết trên Windows
```

---

## 🚀 CÁC LỆNH CHÍNH

- **Khởi động Bot**: `npm start`
- **Chạy chế độ Dev (Auto Reload)**: `npm run dev`
- **Đăng ký Slash Commands**: `npm run deploy`
- **Chạy bộ kiểm thử (Tests)**: `npm test`
- **Kiểm tra ESLint (Lint)**: `npm run lint`

---

## 📘 HƯỚNG DẪN CÀI ĐẶT & DEPLOY
- **Cài đặt chạy dưới máy local (Windows)**: Xem [INSTALL-WINDOWS.md](file:///d:/Individua_Project/sandg-order-bot/INSTALL-WINDOWS.md).
- **Deploy chạy online 24/7 (Railway.app)**: Xem [DEPLOY-RAILWAY.md](file:///d:/Individua_Project/sandg-order-bot/DEPLOY-RAILWAY.md).
