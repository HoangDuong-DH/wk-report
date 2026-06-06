# CTRC — Bộ quy tắc (Rules / "skill" cho AI)

Đây là **nguồn chân lý** về cách hệ thống CTRC hoạt động. Mọi tính năng — do người hay AI triển khai — **phải bám theo các file trong thư mục này**. Khi bật AI, nội dung các file này được nạp thẳng vào "system prompt" của AI (xem `AI.loadRules` trong `index.html`), nên **sửa file `.md` là AI đổi hành vi ngay** (tải lại trang).

> 📌 Bạn (chủ trung tâm) được phép sửa mọi file ở đây. Một số quy tắc còn được "ghim cứng" trong code (`engine.js` / `config.js`) — xem cột *Ghim ở đâu*. Sửa `.md` đổi cách AI viết; muốn đổi **câu mẫu GV tick** hoặc **giá trị cấu hình** thì sửa code (hoặc nhờ mình sửa).

## Danh mục quy tắc

| File | Nội dung | AI có nạp? | Ghim ở đâu trong code |
|---|---|---|---|
| `giong-thuong-hieu.md` | Giọng văn, từ cấm, câu kết | ✅ luôn nạp | `engine.js` (BANNED, closing) |
| `bao-cao-per-buoi.md` | Báo cáo sau MỖI buổi (2 dòng: 👍 điểm mạnh · 🎯 cố gắng) theo 5 tiêu chí | ✅ khi viết per-buổi | `engine.js` generate() + `CRITERIA` |
| `bao-cao-tuan.md` | Báo cáo TUẦN = gom các buổi của bé | ✅ khi viết tuần | `engine.js` weeklyDigest() |
| `doc-hieu-giao-an.md` | AI đọc giáo án docx → tóm tắt cho quản lý + nội dung cho phụ huynh | ✅ khi import giáo án | `lessons.js` (manager_summary, parent_content) |
| `gui-phu-huynh.md` | Cách gửi: **KHÔNG link**, văn bản Zalo | tài liệu | `config.js` delivery |
| `an-toan-du-lieu.md` | Nhiều người dùng, audit, lưu trữ | tài liệu | `db.js` |

## Muốn sửa gì thì sửa ở đâu?

- **Đổi giọng văn / thêm từ cấm / câu kết** → sửa `giong-thuong-hieu.md` (AI tự bám). Từ cấm còn ghim trong `engine.js` mảng `BANNED`.
- **Đổi cách báo cáo per-buổi / tuần** (cấu trúc, độ dài, nhấn mạnh điều gì) → sửa `bao-cao-per-buoi.md` / `bao-cao-tuan.md`.
- **Đổi 5 TIÊU CHÍ hoặc CÂU MẪU mà giáo viên tick** (pos/neg của Tập trung, Tham gia, Tư duy, Tự lập, Hợp tác) → nằm trong `engine.js` mảng `CRITERIA` (mỗi tiêu chí có `pos:[…]`, `neg:[…]`, `tip`). Nói mình câu muốn thêm/bớt là mình sửa.
- **Bật/tắt gửi link, TTL link** → `config.js` mục `delivery`.

## Nguyên tắc tối cao (không đàm phán)

1. **Tôn trọng phụ huynh**: KHÔNG gửi link lạ. Báo cáo là văn bản đọc thẳng trong Zalo.
2. **Cụ thể, ấm áp, hướng tới trước**: không phán xét, không so sánh bé này với bé khác.
3. **Báo cáo per-buổi bám 5 tiêu chí** GV đã tick + phần "chi tiết GV" (quan sát cụ thể) là LÕI quan trọng nhất.
4. **Báo cáo tuần là TỔNG HỢP** các buổi của bé trong tuần → một bức tranh mạch lạc.
5. **An toàn dữ liệu**: nội bộ, có truy vết, tuân thủ NĐ 13/2023.
