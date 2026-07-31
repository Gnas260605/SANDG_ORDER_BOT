Bạn là một Senior Node.js Developer chuyên xây dựng Discord bot.

Hãy tạo hoàn chỉnh dự án Discord bot đặt đơn có tên:

SANDG ORDER BOT

MỤC TIÊU

Xây dựng bot Discord giúp khách hàng đặt dịch vụ Anime Expedition trong server SandG.

Khách sử dụng lệnh `/datdon`, chọn dịch vụ, điền thông tin, xác nhận đơn và nhận một ticket riêng. Nhân viên có thể nhận đơn và cập nhật trạng thái bằng nút bấm.

Đây là phiên bản V1. Ưu tiên dự án nhỏ, rõ ràng, bảo mật và chạy được thực tế. Không tự ý thêm dashboard web, AI chatbot, hệ thống thanh toán tự động hoặc microservice.

CÔNG NGHỆ

- Node.js phiên bản LTS hiện hành.
- JavaScript CommonJS.
- discord.js v14 bản ổn định mới nhất tương thích.
- SQLite để lưu dữ liệu.
- dotenv để quản lý biến môi trường.
- ESLint để kiểm tra mã nguồn.
- Không sử dụng TypeScript.
- Không sử dụng framework web.
- Không hard-code Bot Token, Server ID, Channel ID hoặc Role ID.

Trước khi cài thư viện, hãy kiểm tra phiên bản Node.js và phiên bản package hiện hành. Không dùng API discord.js đã deprecated.

LUỒNG ĐẶT ĐƠN

1. Khách sử dụng `/datdon`.
2. Bot gửi menu chọn một trong các dịch vụ:

- FULL STORY — 25K
- MEGUMI — 60K
- ITACHI — 50K
- KENPACHI — 20K
- ICHIGO — 15K
- UNIT MYTHIC EVO — 10K / 1 CON
- REROLL — 10K / 50
- TOKEN EVENT ITACHI — 10K / 80K TOKEN
- RAID — 1K / 1 VÁN

3. Sau khi chọn dịch vụ, bot mở modal để khách nhập:

- Số lượng.
- Thời gian mong muốn.
- Ghi chú cho đơn hàng.

Không được yêu cầu khách nhập mật khẩu, cookie, token, mã xác thực hoặc thông tin đăng nhập Roblox vào Discord bot.

4. Bot hiển thị bản xem trước đơn hàng bằng embed với hai nút:

- Xác nhận đặt đơn.
- Huỷ.

5. Khi khách xác nhận:

- Tạo mã đơn tăng dần theo dạng `SANDG-0001`.
- Lưu đơn vào SQLite.
- Tạo một text channel riêng trong category được cấu hình bằng `ORDER_CATEGORY_ID`.
- Tên channel theo dạng `don-sandg-0001`.
- Chỉ khách đặt đơn, Staff Role và bot được xem.
- Gửi embed thông tin đơn vào ticket.
- Gửi phản hồi riêng tư cho khách chứa mã đơn và đường dẫn ticket.

6. Trong ticket có các nút dành cho nhân viên:

- NHẬN ĐƠN
- ĐÃ THANH TOÁN
- ĐANG THỰC HIỆN
- HOÀN THÀNH
- HUỶ ĐƠN
- ĐÓNG TICKET

7. Quy tắc trạng thái:

`PENDING → ACCEPTED → PAID → PROCESSING → COMPLETED`

Ngoài ra có trạng thái `CANCELLED`.

Không cho phép chuyển trạng thái sai thứ tự, ngoại trừ quản trị viên có thể huỷ đơn.

8. Khi nhân viên bấm “NHẬN ĐƠN”:

- Kiểm tra người bấm có Staff Role.
- Lưu Discord ID của nhân viên nhận đơn.
- Không cho nhân viên khác nhận lại đơn đã có người nhận.
- Cập nhật embed chính thay vì liên tục gửi embed mới.

9. Khi hoàn thành hoặc huỷ:

- Cập nhật cơ sở dữ liệu.
- Ghi thời gian hoàn thành hoặc huỷ.
- Thông báo cho khách trong ticket.
- Vô hiệu hoá các nút không còn sử dụng.

10. Khi bấm “ĐÓNG TICKET”:

- Chỉ Staff hoặc Admin được phép sử dụng.
- Yêu cầu xác nhận lần thứ hai.
- Khoá quyền gửi tin nhắn trước.
- Không xoá channel ngay lập tức.
- Gửi transcript dạng `.txt` vào kênh log được cấu hình.
- Sau đó cho phép quản trị viên xoá channel thủ công.

SLASH COMMANDS

Tạo các lệnh sau:

1. `/datdon`
   Khách bắt đầu đặt đơn.

2. `/donhang ma_don`
   Xem trạng thái đơn của chính người dùng.
   Staff có thể xem mọi đơn.

3. `/doncuatoi`
   Hiển thị tối đa 10 đơn gần nhất của người dùng.

4. `/banggia`
   Hiển thị bảng dịch vụ và giá bằng embed SandG.

5. `/setup`
   Chỉ Administrator được dùng.
   Kiểm tra các Channel ID, Category ID và Role ID đã cấu hình.

CƠ SỞ DỮ LIỆU

Tạo bảng `orders` với các trường phù hợp, tối thiểu gồm:

- id
- order_code
- customer_id
- customer_username
- service_code
- service_name
- unit_price
- quantity
- total_display
- expected_time
- note
- status
- staff_id
- ticket_channel_id
- main_message_id
- created_at
- accepted_at
- paid_at
- started_at
- completed_at
- cancelled_at

Tạo thêm bảng hoặc cơ chế an toàn để sinh mã đơn liên tục, không bị trùng khi bot nhận nhiều yêu cầu gần như đồng thời.

Không ghép trực tiếp dữ liệu người dùng vào câu SQL. Luôn dùng prepared statements.

GIAO DIỆN BOT

Phong cách embed SandG:

- Màu chủ đạo: xanh cyan và xanh navy.
- Tiêu đề rõ ràng.
- Logo/thumbnail lấy từ biến `SANDG_LOGO_URL`.
- Footer: `SandG • Uy tín – Nhanh chóng – Hỗ trợ 24/7`.
- Không lạm dụng emoji.
- Tất cả nội dung giao diện bằng tiếng Việt.
- Dấu tiếng Việt phải chính xác.
- Tin nhắn xác nhận và lỗi riêng tư sử dụng ephemeral response nếu Discord API hỗ trợ tại vị trí đó.

PHÂN QUYỀN

Các biến cấu hình:

- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`
- `STAFF_ROLE_ID`
- `ADMIN_ROLE_ID`
- `ORDER_CATEGORY_ID`
- `LOG_CHANNEL_ID`
- `SANDG_LOGO_URL`

Bot chỉ yêu cầu các quyền thực sự cần thiết:

- View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Manage Channels

Không yêu cầu Administrator cho bot nếu không bắt buộc.

Không bật Message Content Intent nếu dự án không dùng nội dung tin nhắn thông thường.

BẢO MẬT

- Tạo `.env.example`, không tạo `.env` chứa token thật.
- Thêm `.env`, database runtime, log và transcript tạm vào `.gitignore`.
- Không ghi token hoặc dữ liệu nhạy cảm vào console.
- Chặn người không có quyền sử dụng nút quản trị.
- Kiểm tra ticket thuộc đúng đơn trước khi cập nhật.
- Chống xử lý hai lần khi người dùng bấm nút liên tục.
- Xử lý an toàn khi channel, message, role hoặc category đã bị xoá.
- Không yêu cầu hay lưu thông tin đăng nhập Roblox.
- Escape hoặc làm sạch dữ liệu người dùng trước khi đưa vào transcript và embed.
- Tuân thủ giới hạn độ dài của modal, embed và field Discord.

CẤU TRÚC MONG MUỐN

sandg-order-bot/
├── src/
│ ├── commands/
│ │ ├── datdon.js
│ │ ├── donhang.js
│ │ ├── doncuatoi.js
│ │ ├── banggia.js
│ │ └── setup.js
│ ├── interactions/
│ │ ├── serviceSelect.js
│ │ ├── orderModal.js
│ │ ├── orderConfirmation.js
│ │ └── orderActions.js
│ ├── services/
│ │ ├── orderService.js
│ │ ├── ticketService.js
│ │ └── transcriptService.js
│ ├── database/
│ │ ├── database.js
│ │ ├── migrations.js
│ │ └── repositories/
│ │ └── orderRepository.js
│ ├── config/
│ │ ├── services.js
│ │ └── constants.js
│ ├── utils/
│ │ ├── embeds.js
│ │ ├── permissions.js
│ │ ├── validators.js
│ │ └── logger.js
│ ├── events/
│ │ ├── ready.js
│ │ └── interactionCreate.js
│ └── index.js
├── scripts/
│ └── deploy-commands.js
├── data/
│ └── .gitkeep
├── transcripts/
│ └── .gitkeep
├── tests/
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── README.md
└── INSTALL-WINDOWS.md

YÊU CẦU TRIỂN KHAI

Thực hiện theo đúng thứ tự:

GIAI ĐOẠN 1 — PHÂN TÍCH

- Kiểm tra thư mục hiện tại.
- Lập kế hoạch triển khai ngắn gọn.
- Xác định package cần cài và lý do sử dụng.
- Không viết code trước khi hoàn thành kế hoạch.

GIAI ĐOẠN 2 — TẠO DỰ ÁN

- Khởi tạo package.json.
- Cài dependency và devDependency.
- Tạo toàn bộ cấu trúc thư mục.
- Viết code đầy đủ, không để placeholder hoặc TODO trong chức năng chính.
- Mỗi file có trách nhiệm rõ ràng.
- Không dồn toàn bộ bot vào một file.

GIAI ĐOẠN 3 — HƯỚNG DẪN CÀI ĐẶT

Tạo `INSTALL-WINDOWS.md` bằng tiếng Việt, hướng dẫn từng bước cho người mới:

1. Cài Node.js.
2. Mở Discord Developer Portal.
3. Tạo Application.
4. Tạo Bot.
5. Sao chép Bot Token an toàn.
6. Lấy Application ID.
7. Bật hoặc tắt Gateway Intents phù hợp.
8. Tạo link mời bot bằng OAuth2 URL Generator.
9. Chọn scope `bot` và `applications.commands`.
10. Chọn đúng quyền cho bot.
11. Bật Developer Mode trong Discord.
12. Sao chép Server ID, Category ID, Channel ID và Role ID.
13. Sao chép `.env.example` thành `.env`.
14. Điền từng biến môi trường.
15. Chạy lệnh đăng ký slash command.
16. Khởi động bot.
17. Kiểm tra `/setup`.
18. Thử tạo một đơn bằng `/datdon`.
19. Cách xử lý những lỗi phổ biến.
20. Cách chạy bot lại sau khi tắt máy.

Mọi lệnh Windows phải có thể copy và chạy trong PowerShell.

GIAI ĐOẠN 4 — KIỂM TRA

Tự chạy:

- `npm install`
- `npm run lint`
- `npm test`
- Kiểm tra syntax toàn bộ file JavaScript.
- Kiểm tra bot có thể khởi động đến bước xác thực cấu hình.
- Nếu chưa có token thật, tạo chế độ kiểm tra cấu hình không cần kết nối Discord.
- Kiểm tra migration SQLite chạy được.
- Kiểm tra tính giá và chuyển trạng thái đơn.
- Kiểm tra mã đơn không bị trùng.

Nếu xảy ra lỗi, phải sửa rồi chạy kiểm tra lại. Không được chỉ mô tả lỗi.

GIAI ĐOẠN 5 — BÁO CÁO

Sau khi hoàn thành, trả lại:

1. Cây thư mục thực tế.
2. Danh sách chức năng đã làm.
3. Danh sách package và phiên bản.
4. Kết quả từng lệnh kiểm tra.
5. Những phần cần người dùng tự cấu hình.
6. Các lệnh chính để chạy dự án:

- `npm install`
- `npm run deploy`
- `npm start`
- `npm run dev`
- `npm test`
- `npm run lint`

TIÊU CHÍ HOÀN THÀNH

Chỉ được báo hoàn thành khi:

- Bot khởi động không có lỗi syntax.
- Slash commands được định nghĩa hợp lệ.
- SQLite tạo database và migration thành công.
- `/datdon` có đầy đủ menu, modal và xác nhận.
- Ticket có quyền riêng tư chính xác.
- Staff buttons có kiểm tra phân quyền.
- Có thể cập nhật trạng thái theo đúng thứ tự.
- Không tồn tại mục GEM.
- Không có phần “Chủ sở hữu”.
- Không thu thập tài khoản hoặc mật khẩu Roblox.
- README và INSTALL-WINDOWS.md đủ để người mới cài đặt.
- Lint và test đều vượt qua.

Nếu có yêu cầu chưa rõ, hãy chọn giải pháp đơn giản, an toàn và dễ bảo trì nhất. Không thay đổi danh sách dịch vụ hoặc giá nếu chưa được yêu cầu.
