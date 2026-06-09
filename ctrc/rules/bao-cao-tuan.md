# Báo cáo TUẦN (gom các buổi của bé → tổng hợp)
<!-- CTRC · RULE NẠP VÀO AI (kind=weekly) · cập nhật 2026-06-09 -->
> Mục đích: gom TẤT CẢ buổi của 1 bé trong tuần → 1 báo cáo mạch lạc cho phụ huynh (1 tuần/lần). Tuân thủ `giong-thuong-hieu.md`.

> Ví dụ: bé học 2 buổi/tuần → tự gom 2 buổi thành 1 báo cáo. Nút **✨ AI tổng hợp đầy đủ** ở màn Báo cáo tuần (tắt AI thì engine tự gom offline). Tạo cho **cả lớp** một lượt; **sửa tay được** trước khi gửi.

## Đầu vào (app cung cấp cho AI)
1. Các buổi trong tuần: tiêu chí "làm được"/"làm chưa được" + **chi tiết GV**, tâm trạng, số buổi đi/nghỉ.
2. Nội dung học tuần (mục tiêu + hoạt động) — từ thư viện mục tiêu (`objectives.js`).
3. (Tuỳ chọn) lời nhắn riêng của cô.

## Đầu ra — HỢP ĐỒNG (bắt buộc khớp code)
Trả về **DUY NHẤT** JSON: `{"tongHop":"...","coGang":"..."}`
- `tongHop` (3–4 câu): con học/làm được gì cả tuần (gắn kỹ năng tư duy) + 1–2 khoảnh khắc cụ thể từ chi tiết GV.
- `coGang` (2–3 câu): nêu RÕ điểm cần cải thiện (cụ thể, tích cực) + trung tâm sẽ hỗ trợ thế nào.
- **Không** thêm trường khác (đã bỏ "Đồng hành ở nhà"), không markdown, không lời dẫn.

## Báo cáo phụ huynh nhìn thấy
1. Tiêu đề: Tên bé · khoảng ngày.
2. **📖 Tuần này con học** — mục tiêu/hoạt động (cố định từ thư viện, không do AI sinh).
3. **🌟 Tổng hợp tuần của con** — = `tongHop`.
4. **📌 Điểm con cần cải thiện** — = `coGang`.
5. **💬 Lời nhắn của cô** (nếu có) + câu kết chuẩn.

## Quy tắc tổng hợp
- **Dệt từ dữ liệu thật**, không bịa: tuần 1 buổi → nói đúng 1 buổi.
- **Bắt buộc nêu điểm cần cải thiện** — phụ huynh trung tâm tư duy cần biết con rèn gì, không chỉ khen.
- Ưu tiên khoảnh khắc cụ thể hơn nhận định chung; không liệt kê điểm số khô khan.

## Ghim trong code
- Offline: `engine.js` → `weeklyDigest()` / `weeklyNarrative()`. AI: `buildWeeklyPrompt()` + `AI.generateWeekly()` (`_sysFor('weekly')`).
- Gửi đi: theo `gui-phu-huynh.md` (KHÔNG link); xuất văn bản hoặc ảnh.
