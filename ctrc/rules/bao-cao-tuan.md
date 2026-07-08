# Báo cáo TUẦN (gom các buổi của bé → tổng hợp)
<!-- CTRC · RULE NẠP VÀO AI (kind=weekly) · cập nhật 2026-06-09 -->
> Mục đích: gom TẤT CẢ buổi của 1 bé trong tuần → 1 báo cáo mạch lạc cho phụ huynh (1 tuần/lần). Tuân thủ `giong-thuong-hieu.md`.

> Ví dụ: bé học 2 buổi/tuần → tự gom 2 buổi thành 1 báo cáo. Nút **✨ AI tổng hợp đầy đủ** ở màn Báo cáo tuần (tắt AI thì engine tự gom offline). Tạo cho **cả lớp** một lượt; **sửa tay được** trước khi gửi.

## Đầu vào (app cung cấp cho AI)
1. Các buổi trong tuần: tiêu chí "làm được"/"cần hỗ trợ" + **chi tiết GV**, tâm trạng, số buổi đi/nghỉ.
2. Nội dung học tuần (mục tiêu + hoạt động) — từ giáo án/thư viện mục tiêu. Đây là raw input hoặc bản đã biên tập cho phụ huynh.
3. (Tuỳ chọn) lời nhắn riêng của cô.

## Đầu ra — HỢP ĐỒNG (bắt buộc khớp code)
Trả về **DUY NHẤT** JSON: `{"tongHop":"...","coGang":"..."}`
- `tongHop` (2–3 câu): **ĐIỂM BÉ LÀM ĐƯỢC** — con thể hiện tốt ở đâu, hành vi cụ thể nào, liên hệ nhẹ với hoạt động/kỹ năng tư duy nếu phù hợp. Không lặp lại toàn bộ nội dung học tuần.
- `coGang` (2–3 câu): **ĐIỂM BÉ CẦN HỖ TRỢ** — nêu rõ điểm cần rèn thêm (cụ thể, tích cực) + cô/trung tâm sẽ hỗ trợ thế nào.
- **Không** thêm trường khác (đã bỏ "Đồng hành ở nhà"), không markdown, không lời dẫn.

## Báo cáo phụ huynh nhìn thấy
1. Tiêu đề: Tên bé · khoảng ngày.
2. **📖 NỘI DUNG HỌC TUẦN NÀY** — AI/engine biên tập từ giáo án raw: mục tiêu + hoạt động, viết cho phụ huynh dễ hiểu.
3. **✅ ĐIỂM BÉ LÀM ĐƯỢC** — = `tongHop`.
4. **📌 ĐIỂM BÉ CẦN HỖ TRỢ** — = `coGang`.
5. **💬 Lời nhắn của cô** (nếu có) + câu kết chuẩn.

## Quy tắc tổng hợp
- **Dệt từ dữ liệu thật**, không bịa: tuần 1 buổi → nói đúng 1 buổi.
- **Bắt buộc nêu điểm cần cải thiện** — phụ huynh trung tâm tư duy cần biết con rèn gì, không chỉ khen.
- Ưu tiên khoảnh khắc cụ thể hơn nhận định chung; không liệt kê điểm số khô khan.
- Nội dung học luôn được diễn giải trong khung 4 kỹ năng tư duy: **cơ bản, logic, toán học, sáng tạo**. Chỉ nhắc kỹ năng thật sự xuất hiện trong giáo án/dữ liệu.
- Hoạt động học phải được viết theo hướng **học qua trải nghiệm, khám phá, học cụ, hoạt động đa dạng**. Tránh ngôn ngữ nội bộ như slide, flashfile, số trang, file powerpoint.
- Phần làm được/cần hỗ trợ vẫn follow các mục GV đã chấm; nội dung bài học chỉ là bối cảnh để văn liền mạch hơn, không được đổi ý GV.

## Ghim trong code
- Offline: `engine.js` → `weeklyDigest()` / `weeklyNarrative()`. AI: `buildWeeklyPrompt()` + `AI.generateWeekly()` (`_sysFor('weekly')`).
- Gửi đi: theo `gui-phu-huynh.md` (KHÔNG link); xuất văn bản hoặc ảnh.
