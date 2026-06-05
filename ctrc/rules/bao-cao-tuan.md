# Báo cáo TUẦN (gom các buổi của bé → tổng hợp)

**Khác per-buổi**: báo cáo tuần KHÔNG nhập nhận xét rời. Nó **gom tất cả buổi học của một bé trong tuần** rồi **tổng hợp** thành một bức tranh mạch lạc gửi phụ huynh — 1 tuần/lần.

## Nguồn dữ liệu (đầu vào)
1. **Các buổi của bé trong tuần** (từ phần chấm per-buổi): điểm 5 chiều, điểm mạnh đã tick, **quan sát của GV**, tâm trạng, số buổi đi/nghỉ.
2. **Nội dung bài học của tuần** (từ thư viện theo cuốn + tuần) — "tuần này lớp học gì".
3. (Tuỳ chọn) Nhận xét thêm của cô — chung cả lớp và/hoặc riêng bé.

## Cấu trúc báo cáo tuần (đầu ra)
1. **Tiêu đề**: Tên bé · tuần (khoảng ngày) · lớp.
2. **📖 Tuần này con học gì** — tóm tắt nội dung bài học (bài/câu chuyện + kỹ năng chính).
3. **🌟 Tổng hợp tuần của con** — TỪ các buổi: con đi mấy buổi; điểm nổi bật lặp lại (điểm mạnh hay thể hiện); 1–2 khoảnh khắc cụ thể từ quan sát GV; xu hướng tiến bộ nếu có.
4. **🎯 Điều con đang cố gắng** — chiều/kỹ năng con đang luyện trong tuần.
5. **🏠 Đồng hành ở nhà** — 1–2 gợi ý 5–10 phút cho tuần tới.
6. **Lời nhắn của cô** (nếu có) + câu kết chuẩn.

## Quy tắc tổng hợp
- **Dệt từ dữ liệu thật**, không bịa: nếu tuần chỉ có 1 buổi → nói đúng 1 buổi.
- Ưu tiên **khoảnh khắc cụ thể** (quan sát GV) hơn nhận định chung.
- Nêu **xu hướng** nhẹ nhàng ("càng cuối tuần con càng tự tin hơn") chỉ khi dữ liệu cho thấy.
- Không liệt kê điểm số khô khan cho phụ huynh; chuyển thành lời kể.
- Tuân thủ `giong-thuong-hieu.md` tuyệt đối.
> Ghim trong code: `engine.js` → `weeklyDigest()` (tổng hợp offline) + prompt AI dùng file này.

## Gửi đi
- Theo `gui-phu-huynh.md`: **KHÔNG link**. Cho phép xuất **văn bản** (paste Zalo) và/hoặc **ảnh** báo cáo (gửi như hình).
