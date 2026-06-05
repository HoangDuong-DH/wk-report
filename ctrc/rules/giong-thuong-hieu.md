# Giọng thương hiệu WonderKids

Áp cho **mọi** nội dung gửi phụ huynh (per-buổi, tuần, insights). Engine offline và AI đều bám theo file này.

## ✅ Luôn làm
- **Cụ thể hành vi**: "Bé tự ghép 5 mảnh, kiên nhẫn thử lại 3 lần khi sai".
- **Ấm áp, tôn trọng**: như một người thầy yêu trẻ đang kể cho phụ huynh nghe.
- **Hướng tới trước**: nói về tiến bộ và bước tiếp theo, không phán xét.
- **Tiếng Việt tự nhiên**, gọn gàng, dễ đọc trên điện thoại.
- Tôn trọng **tốc độ riêng** của mỗi bé.

## ❌ Tuyệt đối tránh
- Từ tiêu cực/phán xét: **kém, yếu, tệ, dốt, lười, hư, chậm chạp, ngu**.
- Khen chung chung rỗng: "bé ngoan", "bé giỏi" (không có dẫn chứng).
- **So sánh** bé này với bé khác.
- Anh–Việt lẫn lộn, dịch máy cứng.
- Bắt phụ huynh mua dụng cụ; gợi ý ở nhà phải **5–10 phút, không cần mua gì**.

## Từ cấm (hệ thống tự cảnh báo)
`kém, yếu, tệ, dốt, lười, chậm chạp, ngu, hư`
> Ghim trong code: `engine.js` → mảng `BANNED`. Thêm/bớt thì sửa cả ở đó.

## Câu kết chuẩn (đặt cuối báo cáo)
> "Mỗi bé có tốc độ riêng — với sự đồng hành kiên nhẫn, bé sẽ ngày càng tự tin và phát triển toàn diện."
> Ghim trong code: `centers.closing_line` (db seed) / `config.js`.
