# Báo cáo PER-BUỔI (sau mỗi buổi học)

Gửi sau mỗi buổi, **3 dòng**, ~280 ký tự (gọn 1 tin Zalo). Tuân theo `giong-thuong-hieu.md`.

## Mô hình 5 TIÊU CHÍ (lõi đánh giá)

Mỗi buổi GV **không chấm điểm 1–5** và **không đánh giá cả 5 tiêu chí cùng lúc**. Thay vào đó GV **tick đúng 2 lựa chọn**:

- **1 tiêu chí = ĐIỂM MẠNH** hôm nay (+ chọn 1 câu mô tả tích cực)
- **1 tiêu chí = CẦN CẢI THIỆN** hôm nay (+ chọn 1 câu mô tả). Phải **khác** tiêu chí điểm mạnh.

5 tiêu chí cốt lõi:

| Tiêu chí | Mô tả |
|---|---|
| 🎯 **Tập trung** | Lắng nghe, duy trì sự chú ý và theo kịp hoạt động học tập |
| 🙋 **Tham gia** | Hứng thú, chủ động tham gia trò chơi, hoạt động và thảo luận |
| 🧠 **Tư duy** | Quan sát, phân loại, nhận biết quy luật, suy luận và giải quyết vấn đề phù hợp độ tuổi |
| 🌱 **Tự lập** | Tự thực hiện nhiệm vụ, tự tìm cách giải quyết trước khi nhờ hỗ trợ |
| 🤝 **Hợp tác** | Tương tác, làm việc cùng bạn, chờ đến lượt và chia sẻ ý kiến |

> Câu mô tả mẫu (ngân hàng câu pos/neg cho từng tiêu chí) nằm trong `ctrc/engine.js` (mảng `CRITERIA`). Sửa ở đó để đổi câu GV được tick chọn.

## Cấu trúc 3 dòng (tin gửi phụ huynh)
1. **👍 Điểm mạnh hôm nay** — bám **tiêu chí điểm mạnh** đã tick, ưu tiên lồng **quan sát cụ thể của GV** (nếu có).
2. **🎯 Điều con đang cố gắng** — bám **tiêu chí cần cải thiện**, nói nhẹ nhàng, hướng tới trước.
3. **🏠 Gợi ý ở nhà** — 1 hoạt động 5–10 phút, không cần mua đồ, **gắn với tiêu chí cần cải thiện** + chủ đề tuần.

> Ví dụ giọng văn: "Hôm nay bé A tập trung tốt trong giờ học. Bên cạnh đó, con còn ít tương tác với các bạn trong nhóm…"

## Quy tắc sinh nội dung
- **Quan sát GV là vàng**: nếu có, dùng gần như nguyên văn (chỉ khung nhẹ). Nếu sơ sài → trợ lý nhắc GV bổ sung 1 chi tiết.
- **Cá nhân hoá theo hồ sơ bé** (nếu đã có): hướng nội → giọng nhẹ nhàng; hướng ngoại → giọng sôi nổi.
- Mỗi tin **chỉ 1 điểm mạnh + 1 điều cần cố gắng** — không liệt kê dài, không phán xét.
- Tuyệt đối tránh từ tiêu cực (kém, yếu, tệ, chậm, dốt, lười, hư).

## Trợ lý AI khi GV chấm
- Từ ô **quan sát**, engine gợi ý tiêu chí phù hợp (offline). GV có thể bấm **AI chọn tiêu chí + câu** để AI đọc quan sát và chọn giúp cả điểm mạnh lẫn cần cải thiện (GV vẫn duyệt lại).

## Gửi đi
- Theo `gui-phu-huynh.md`: **không kèm link**, gửi văn bản thẳng.
