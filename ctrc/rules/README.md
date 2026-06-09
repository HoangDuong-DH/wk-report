# CTRC — Bộ quy tắc (Rules / "skill" cho AI)
<!-- CTRC · tài liệu tham chiếu · cập nhật 2026-06-09 · MÔ HÌNH: 5 tiêu chí v2 -->

Đây là **nguồn chân lý** về cách hệ thống CTRC sinh nội dung. File loại **"NẠP VÀO AI"** được `fetch` và ghép thẳng vào *system prompt* lúc chạy → **sửa file là AI đổi hành vi ngay** (tải lại trang). File **"tham chiếu"** chỉ để người đọc, không vào prompt.

> Cơ chế: rules-as-prompt (1 lần gọi model), KHÔNG phải AI agent. Hàm: `AI.loadRules()` (nạp) + `AI._sysFor(kind)` (ghép theo per-buổi/tuần) trong `ctrc/index.html`.

## Danh mục

| File | Loại | Khi nào AI dùng | Nguồn chuẩn (ghim ở code) |
|---|---|---|---|
| `giong-thuong-hieu.md` | 🤖 NẠP — luôn | mọi lần sinh nội dung | từ cấm: `engine.js` `BANNED`; câu kết: `config.js`/db |
| `bao-cao-per-buoi.md` | 🤖 NẠP (perbuoi) | CSKH "AI viết / sinh lại" | `engine.js` `CRITERIA` + `generate()` |
| `bao-cao-tuan.md` | 🤖 NẠP (weekly) | "✨ AI tổng hợp" báo cáo tuần | `weeklyDigest()` / `buildWeeklyPrompt()` |
| `doc-hieu-giao-an.md` | 🤖 NẠP (giaoan) | khi import docx ở 📚 Thư viện | `lessons.js` |
| `gui-phu-huynh.md` | 📄 tham chiếu | — | `config.js` `delivery.includeLink=false` |
| `an-toan-du-lieu.md` | 📄 tham chiếu | — | `db.js` |

## Chuẩn viết file rule (giữ đồng bộ khi sửa/thêm)
1. Dòng 1: `# Tiêu đề`.
2. Dòng 2: comment metadata `<!-- CTRC · LOẠI · cập nhật YYYY-MM-DD · ghi chú -->`.
3. Dòng 3: `> Mục đích` 1 câu.
4. File NẠP-VÀO-AI **bắt buộc** có mục **"Đầu ra — HỢP ĐỒNG"**: JSON đúng y code parse (vd per-buổi `{diem_manh,co_gang}`, tuần `{tongHop,coGang}`). Sai hợp đồng = app vỡ.
5. **Không lặp dữ liệu** đã có "nguồn chuẩn" trong code (5 tiêu chí, từ cấm…) — chỉ tham chiếu + bảng tra nhanh.
6. Cập nhật ngày ở metadata + ghi vào "Lịch sử thay đổi" bên dưới.

## Nội dung (data) — KHÔNG phải .md
- `ctrc/objectives.js` — **mục tiêu tuần** 96 cuốn (UCREA/BLACKHOLE/BRIGHT IG). Sửa realtime ở màn **🎯 Mục tiêu tuần**.
- `ctrc/engine.js` `CRITERIA` — 5 tiêu chí + câu mẫu pos/neg GV tick.

## Nguyên tắc tối cao (không đàm phán)
1. KHÔNG gửi link cho phụ huynh — văn bản/ảnh đọc thẳng.
2. Cụ thể, ấm áp, hướng tới trước; không phán xét, không so sánh bé khác.
3. Báo cáo phải **nêu được điểm cần cải thiện** (chuẩn phụ huynh trung tâm tư duy).
4. Sinh nội dung từ **dữ liệu thật** của bé, không bịa.
5. An toàn dữ liệu: nội bộ, có audit, NĐ 13/2023.

## Lịch sử thay đổi (model)
- **2026-06-09 · v2**: chuẩn hoá toàn bộ rule (metadata + hợp đồng đầu ra). Per-buổi = 3 phần hiển thị (📖 nội dung học · ✅ làm được · 📌 làm chưa được), AI trả `{diem_manh,co_gang}`. Tuần bỏ "Đồng hành ở nhà", AI trả `{tongHop,coGang}`. Mục tiêu tuần chuyển sang `objectives.js` (3 chương trình). Thêm "Trả lại GV chấm lại".
- **v1**: mô hình 5 tiêu chí thay 5 chiều chấm điểm 1–5.
