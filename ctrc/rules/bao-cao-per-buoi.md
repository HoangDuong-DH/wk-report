# Báo cáo PER-BUỔI (sau mỗi buổi học)
<!-- CTRC · RULE NẠP VÀO AI (kind=perbuoi) · cập nhật 2026-06-09 · mô hình 5 tiêu chí -->
> Mục đích: từ đánh giá 1 buổi của 1 bé → 2 câu nhận xét ấm áp, cụ thể, gửi phụ huynh. Tuân thủ `giong-thuong-hieu.md`.

## Mô hình đánh giá: 5 TIÊU CHÍ (tick, KHÔNG chấm điểm)
Mỗi buổi GV tick **đúng 2** lựa chọn:
- **1 tiêu chí = ĐIỂM MẠNH (bé làm được)** + 1 câu mô tả tích cực
- **1 tiêu chí = CẦN HỖ TRỢ / CẦN CẢI THIỆN** + 1 câu mô tả — phải **khác** tiêu chí điểm mạnh

5 tiêu chí: 🎯 Tập trung · 🙋 Tham gia · 🧠 Tư duy · 🌱 Tự lập · 🤝 Hợp tác.
> **Nguồn chuẩn** (mô tả tiêu chí + ngân hàng câu pos/neg): `ctrc/engine.js` mảng `CRITERIA`. Sửa câu mẫu tại đó. Bảng trên chỉ để tra nhanh.

Mỗi tiêu chí đã tick có **1 ô "mô tả chi tiết" tuỳ chọn** — quan sát cụ thể của GV, là **LÕI quan trọng nhất** làm tin "đắt" hơn.

## Đầu vào (app cung cấp cho AI)
- Tên bé, hồ sơ bé (nếu có: hướng nội/ngoại).
- Nội dung học tuần (mục tiêu + hoạt động) — để câu chữ bám bài đang học.
- ĐIỂM MẠNH: tiêu chí + câu mô tả + chi tiết GV.
- CẦN CẢI THIỆN: tiêu chí + câu mô tả + chi tiết GV.

## Đầu ra — HỢP ĐỒNG (bắt buộc khớp code)
Trả về **DUY NHẤT** JSON: `{"diem_manh":"...","co_gang":"..."}`
- `diem_manh` (1–2 câu): bám tiêu chí điểm mạnh; nếu có chi tiết GV → lồng vào ("Cụ thể, …").
- `co_gang` (1–2 câu): bám tiêu chí cần cải thiện; nhẹ nhàng, hướng tới trước.
- **Không** thêm trường khác, không markdown, không lời dẫn.

## Báo cáo phụ huynh nhìn thấy (3 phần)
1. **📖 Nội dung học tuần này** — mục tiêu + hoạt động (cố định từ "Bài học tuần" của lớp, **KHÔNG do AI sinh**).
2. **✅ Điểm bé làm được** — = `diem_manh`.
3. **📌 Điểm bé cần hỗ trợ** — = `co_gang`.
> Đã bỏ mục "Gợi ý ở nhà" ở per-buổi (theo vận hành).

## Quy tắc viết
- **Chi tiết GV là vàng**: có thì dùng gần nguyên văn, chỉ khung nhẹ.
- Cá nhân hoá theo hồ sơ: hướng nội → giọng nhẹ; hướng ngoại → giọng sôi nổi.
- Chỉ 1 điểm mạnh + 1 điều cần cố gắng; không liệt kê dài; không phán xét.
- Từ cấm + giọng: theo `giong-thuong-hieu.md` (nguồn chuẩn của danh sách từ cấm).

> Ví dụ: "Hôm nay bé A tập trung tốt trong giờ học. Cụ thể, ngồi yên nghe cô kể hết câu chuyện. Bên cạnh đó, con còn ít tương tác với các bạn trong nhóm."

## Công cụ CSKH
- CSKH sửa tay 2 ô; hoặc **✨ AI viết mới**; hoặc gõ **yêu cầu chỉnh sửa** ("ngắn gọn hơn"…) rồi **✨ Sinh lại theo yêu cầu**; hoặc **↩ Trả lại GV chấm lại** (kèm lý do).

## Ghim trong code
- Sinh offline: `engine.js` → `generate()`. Sinh AI: `buildAIPrompt()` + `AI.generate()` (`_sysFor('perbuoi')`).
- Gửi đi: theo `gui-phu-huynh.md` (KHÔNG link).
