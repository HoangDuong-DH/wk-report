# Đọc & hiểu GIÁO ÁN theo tuần
<!-- CTRC · RULE NẠP VÀO AI (kind=giaoan, khi import docx) · cập nhật 2026-06-09 -->
> Mục đích: AI đọc 1 tuần giáo án (docx import) → JSON dùng được. Sửa file là đổi cách AI hiểu/viết.

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
  "parent_content": "1 đoạn 2 câu ẤM ÁP cho PHỤ HUYNH đọc trong mục 'Nội dung học tuần này'. Tổng hợp mục tiêu + hoạt động của 2 buổi/tuần nếu có. Dễ hiểu, không thuật ngữ khô khan, không liệt kê số trang. Theo giọng thương hiệu."
}
```

## Quy tắc nội dung
- **Bám sát giáo án, KHÔNG bịa**. Thiếu thông tin thì để trống trường đó, đừng chế.
- `manager_summary`: cho người điều hành — gọn, đủ ý, có thể dùng từ chuyên môn (tư duy logic, kiểu mẫu, số học…).
- `parent_content`: tuân thủ `giong-thuong-hieu.md` — ấm áp, cụ thể vừa đủ, hướng tới con, **không** nói "trang 1-6", **không** thuật ngữ rối. Luôn đặt bài học trong khung 4 kỹ năng tư duy: **cơ bản, logic, toán học, sáng tạo**; chỉ nhắc kỹ năng thật sự có trong giáo án. Mô tả hoạt động theo hướng học qua trải nghiệm, khám phá, học cụ và hoạt động đa dạng. Ví dụ tốt: "Tuần này, các con được rèn luyện tư duy cơ bản và tư duy logic thông qua câu chuyện 'Anh có phải là anh trai em' cùng các hoạt động quan sát, so sánh và tìm điểm giống - khác. Các hoạt động trải nghiệm như vẽ bằng hai tay và ghép hình theo mẫu giúp con phát triển khả năng tập trung, phối hợp và suy luận một cách hứng thú."
- Tiếng Việt tự nhiên.

## Cách dùng (2 nơi tiêu thụ)
1. **Quản lý**: app hiển thị `manager_summary` để duyệt/đọc nhanh cả chương trình.
2. **Báo cáo phụ huynh**: phần "📖 Nội dung học tuần này" lấy từ `parent_content` (ưu tiên hơn bản tóm tắt máy).

> Ghim trong code: importer (`scraps/import_giaoan.py` hoặc nút Import trong app) gọi AI với skill này; `lessons.js` lưu thêm `manager_summary` + `parent_content`; báo cáo tuần ưu tiên `parent_content`.
