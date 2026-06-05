# CTRC — Bộ quy tắc (Rules)

Đây là **nguồn chân lý** về cách hệ thống CTRC hoạt động. Mọi tính năng — do người hay AI triển khai — **phải bám theo các file trong thư mục này**.

> 📌 Bạn (chủ trung tâm) được phép sửa các file này. Khi sửa, hãy báo người/AI triển khai cập nhật code cho khớp. Một số quy tắc đã được "ghim cứng" trong code qua `config.js` (xem cột *Ghim ở đâu* bên dưới) — sửa file `.md` thôi chưa đủ, cần sửa cả `config.js`.

## Danh mục quy tắc

| File | Nội dung | Ghim ở đâu trong code |
|---|---|---|
| `giong-thuong-hieu.md` | Giọng văn, từ cấm, câu kết | `engine.js` (BANNED, closing) |
| `bao-cao-per-buoi.md` | Báo cáo sau MỖI buổi (3 dòng) | `engine.js` generate() |
| `bao-cao-tuan.md` | Báo cáo TUẦN = gom các buổi của bé | `engine.js` weeklyDigest() |
| `gui-phu-huynh.md` | Cách gửi: **KHÔNG link**, văn bản Zalo | `config.js` delivery |
| `an-toan-du-lieu.md` | Nhiều người dùng, audit, lưu trữ | `db.js` |

## Nguyên tắc tối cao (không đàm phán)

1. **Tôn trọng phụ huynh**: KHÔNG gửi link lạ. Báo cáo là văn bản đọc thẳng trong Zalo.
2. **Cụ thể, ấm áp, hướng tới trước**: không phán xét, không so sánh bé này với bé khác.
3. **Báo cáo tuần là TỔNG HỢP**, không phải bản ghi rời: gom dữ liệu các buổi của bé trong tuần → một bức tranh mạch lạc.
4. **Cá nhân hoá thật**: mỗi bé một nội dung dựa trên dữ liệu thật của bé.
5. **An toàn dữ liệu**: nội bộ, có truy vết, tuân thủ NĐ 13/2023.

## Cách "ghim" một quy tắc vào code

- Quy tắc về **giá trị cấu hình** (vd có gửi link hay không, TTL link) → đặt trong `ctrc/config.js`.
- Quy tắc về **giọng/định dạng** → đặt trong `ctrc/engine.js` (bank câu, từ cấm, hàm tổng hợp).
- File `.md` này là tài liệu giải thích "vì sao" + cho người không-code đọc và yêu cầu thay đổi.
