# Skill: Đọc & hiểu GIÁO ÁN theo tuần

Đây là "skill" cho AI khi **đọc một tuần giáo án** (từ file import) và biến thành dữ liệu dùng được. Sửa file này để đổi cách AI hiểu/viết — cả importer lẫn app đều bám theo.

## Đầu vào
Một đoạn văn bản giáo án của **một tuần** (một cuốn + một tuần), có thể lộn xộn: mục tiêu, mô tả trang sách, trò chơi, kỹ năng… (như các file `<mã>w<tuần>.docx`).

## Nhiệm vụ
Đọc, hiểu, rồi trả về **DUY NHẤT một JSON** với các trường sau:

```json
{
  "title": "Tên bài/câu chuyện/chủ đề của tuần (ngắn gọn)",
  "objectives": ["mục tiêu kiến thức/kỹ năng chính, mỗi ý 1 dòng"],
  "thinking_skills": ["Tư duy cơ bản", "Tư duy toán học", "Tư duy logic", "..."],
  "pages": [{"range":"Trang 1-2","type":"Tư duy cơ bản","desc":"..."}],
  "manager_summary": "2-4 câu súc tích cho NGƯỜI QUẢN LÝ: tuần này dạy gì, mục tiêu trọng tâm, kỹ năng rèn, lưu ý vận hành nếu có. Dùng được thuật ngữ chuyên môn.",
  "parent_content": "1 đoạn 2-4 câu ẤM ÁP cho PHỤ HUYNH đọc trong báo cáo tuần: 'Tuần này con học…'. Dễ hiểu, không thuật ngữ khô khan, không liệt kê số trang. Theo giọng thương hiệu."
}
```

## Quy tắc nội dung
- **Bám sát giáo án, KHÔNG bịa**. Thiếu thông tin thì để trống trường đó, đừng chế.
- `manager_summary`: cho người điều hành — gọn, đủ ý, có thể dùng từ chuyên môn (tư duy logic, kiểu mẫu, số học…).
- `parent_content`: tuân thủ `giong-thuong-hieu.md` — ấm áp, cụ thể vừa đủ, hướng tới con, **không** nói "trang 1-6", **không** thuật ngữ rối. Ví dụ tốt: "Tuần này con khám phá câu chuyện 'Lâu đài người khổng lồ', học cách so sánh nhiều–ít và nhận biết trên–dưới qua trò chơi."
- Tiếng Việt tự nhiên.

## Cách dùng (2 nơi tiêu thụ)
1. **Quản lý**: app hiển thị `manager_summary` để duyệt/đọc nhanh cả chương trình.
2. **Báo cáo phụ huynh**: phần "📖 Tuần này con học" lấy từ `parent_content` (ưu tiên hơn bản tóm tắt máy).

> Ghim trong code: importer (`scraps/import_giaoan.py` hoặc nút Import trong app) gọi AI với skill này; `lessons.js` lưu thêm `manager_summary` + `parent_content`; báo cáo tuần ưu tiên `parent_content`.
