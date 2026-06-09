# Báo cáo TUẦN (gom các buổi của bé → tổng hợp)

**Khác per-buổi**: báo cáo tuần KHÔNG nhập nhận xét rời. Nó **gom tất cả buổi học của một bé trong tuần** rồi **tổng hợp** thành một bức tranh mạch lạc gửi phụ huynh — 1 tuần/lần.

> Ví dụ: 1 bé thường học **2 buổi/tuần** → hệ thống tự gom 2 buổi đó thành 1 báo cáo tuần. Có **nút "✨ AI tổng hợp đầy đủ"** ở màn Báo cáo tuần: AI đọc dữ liệu cả 2 buổi + nội dung bài học rồi viết tổng hợp đầy đủ (nếu tắt AI thì engine tự tổng hợp offline).

## Nguồn dữ liệu (đầu vào)
1. **Các buổi của bé trong tuần** (từ chấm per-buổi): tiêu chí "làm được" / "làm chưa được" đã tick + **mô tả chi tiết của GV**, tâm trạng, số buổi đi/nghỉ.
2. **Nội dung bài học của tuần** (từ thư viện theo cuốn + tuần) — mục tiêu + hoạt động.
3. (Tuỳ chọn) Nhận xét thêm của cô — chung cả lớp và/hoặc riêng bé.

## Cấu trúc báo cáo tuần (đầu ra)
1. **Tiêu đề**: Tên bé · tuần (khoảng ngày) · lớp.
2. **📖 Tuần này con học gì** — mục tiêu + hoạt động của tuần.
3. **🌟 Tổng hợp tuần của con** — gom CẢ các buổi: con đi mấy buổi; con làm được gì (gắn kỹ năng tư duy); 1–2 khoảnh khắc cụ thể từ chi tiết GV.
4. **📌 Điểm con cần cải thiện** — nêu RÕ, cụ thể (không né tránh nhưng tích cực) + trung tâm sẽ hỗ trợ thế nào.
5. **Lời nhắn của cô** (nếu có) + câu kết chuẩn.

> Đã bỏ mục "Đồng hành ở nhà" trong báo cáo tuần theo yêu cầu vận hành.

## Quy tắc tổng hợp
- **Dệt từ dữ liệu thật**, không bịa: nếu tuần chỉ có 1 buổi → nói đúng 1 buổi.
- **Phải nêu được điểm cần cải thiện** — phụ huynh trung tâm tư duy cần biết con cần rèn gì, không chỉ khen.
- Ưu tiên **khoảnh khắc cụ thể** (chi tiết GV) hơn nhận định chung.
- Không liệt kê điểm số khô khan; chuyển thành lời kể ấm áp.
- Tuân thủ `giong-thuong-hieu.md` tuyệt đối.
> Ghim trong code: `engine.js` → `weeklyDigest()`/`weeklyNarrative()` (tổng hợp offline); `buildWeeklyPrompt()` + `AI.generateWeekly()` (tổng hợp AI) dùng file này làm rule.

## Gửi đi
- Theo `gui-phu-huynh.md`: **KHÔNG link**. Cho phép xuất **văn bản** (paste Zalo) và/hoặc **ảnh** báo cáo (gửi như hình).
