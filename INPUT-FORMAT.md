# Hướng dẫn Format Input cho WonderKids Report

Document này hướng dẫn GV cách điền file xlsx để hệ thống parse chính xác.

---

## 📥 Cách nhanh nhất: dùng Template có sẵn

1. Vào trang báo cáo (`mau-giao.html` hoặc `mau-giao-l4.html`)
2. Click **nút FAB** (vòng tròn cam góc dưới-phải) → mở menu
3. Click **📥 Template** → tải file `WonderKids_Template_L3_YYYY-MM-DD.xlsx`
4. Mở file Excel, có sẵn **2 sheet**:
   - **Sheet 1 "Thông tin HS"** — điền info bé
   - **Sheet 2 "Atomic L3"** (hoặc L4) — điền cột "Mức (NHẬP)" với điểm 0-5

---

## 📋 Quy ước Format

### Sheet "Thông tin HS" (optional nhưng khuyến nghị)

| Label (cột A)     | Value (cột B) — ví dụ                    |
|-------------------|------------------------------------------|
| Họ và tên         | Nguyễn Văn A                              |
| Giới tính         | Nam / Nữ                                  |
| Năm sinh          | 2021                                      |
| Lớp               | Lá 1 — Trung tâm Đống Đa                  |
| Ngày đánh giá     | 15/05/2026                                |
| Giáo viên         | Cô Nguyễn Thị Hoa                         |
| Trung tâm         | WonderKids — CS Đống Đa                   |
| Bài test          | L3 Diagnostic Assessment                  |
| Kỳ                | Đầu kỳ / Cuối kỳ                          |

**Hệ thống chấp nhận label theo nhiều cách viết**: "Tên" / "Họ và tên" / "Name" đều hiểu là tên bé. Tương tự cho các field khác (case-insensitive).

### Sheet "Atomic L3" hoặc "Atomic L4"

| Cột | Header           | Mô tả                                                                |
|-----|------------------|----------------------------------------------------------------------|
| A   | Câu              | 1-14, có thể có row "Tổng câu N"                                     |
| B   | Mã               | "1.1", "1.2", ..., "14.4" — format **N.N**                          |
| C   | Tiêu chí atomic  | Mô tả tiêu chí (text)                                                |
| D   | Trọng số         | Weight gốc (vd 2.0)                                                  |
| **E** | **Mức (NHẬP)**  | **GV điền 0-5 ở đây**                                              |
| F   | Điểm đạt         | Auto-calc trong Excel (tùy chọn)                                     |
| G   | Nhóm Năng Lực    | Tư duy cơ bản / Tư duy toán học / Tư duy logic / Tư duy sáng tạo     |
| H   | Năng lực         | Skill tiếng Việt (Quan sát, Hình học...)                             |
| I   | Mức độ hỗ trợ    | 0-4 — gắn cho mỗi atomic theo rubric                                 |
| J   | Cấp Bloom        | Nhận biết / Hiểu / Ứng dụng / Phân tích / Sáng tạo                   |
| K   | Mức độ khó       | Dễ / Trung bình / Khó                                                |

### Quy ước cột "Mức (NHẬP)"

| Giá trị | Ý nghĩa                                                |
|---------|--------------------------------------------------------|
| **5**   | Bé hoàn thành **xuất sắc** — đúng và chính xác toàn bộ |
| **4**   | Bé hoàn thành **tốt** — hầu hết đúng, vài lỗi nhỏ      |
| **3**   | Bé hoàn thành **khá** — đúng 1 phần, có nhầm lẫn      |
| **2**   | Bé **cần hỗ trợ** — chỉ làm được vài phần đơn giản    |
| **1**   | Bé **cần hướng dẫn nhiều** — gần như không tự làm     |
| **0**   | Bé **chưa thực hiện được** dù có hướng dẫn            |
| (trống) | Chưa chấm — không được tính vào điểm                  |

**Hệ thống chấp nhận format linh hoạt**:
- Số nguyên: `5`, `4`, `0`...
- String: `"5"`, `"5 "`, `"5.0"`
- Format "5/5" → tự lấy `5`
- Format "85%" → tự convert thành 4 (theo thang)

---

## 🎯 Sử dụng workflow

### Workflow 1: 1 bé / 1 file

1. Download template
2. Điền sheet "Thông tin HS" với tên + năm sinh + lớp...
3. Điền cột E "Mức (NHẬP)" cho từng atomic
4. Save file (đặt tên: `TÊN BÉ YYYY.xlsx`, vd `Phan_Tan_Dung_2021.xlsx`)
5. Vào hệ thống → click **"Nhập CSV/Excel"** → chọn file
6. Hệ thống auto-fill info bé + atomic scores → render report

### Workflow 2: Cả lớp / 1 file (multi-student)

1. Download template
2. Mở Excel → **duplicate sheet "Atomic L3"** (right-click sheet tab → Move or Copy → Create a copy)
3. Đổi tên các sheet thành tên từng bé + năm sinh:
   - Sheet 1: `Phan T. Dũng 2021`
   - Sheet 2: `Nguyễn V. An 2022`
   - Sheet 3: `Trần T. Hoa 2021`
   - ...
4. Điền cột E cho mỗi sheet
5. Sheet "Thông tin HS" giữ làm template chung (tùy chọn — info riêng từng sheet ưu tiên)
6. Save file `Lớp Lá 1 - Đầu kỳ 2026.xlsx`
7. Vào hệ thống → "Nhập CSV/Excel" → chọn file
8. Hệ thống detect **N sheet atomic** → mở panel Batch → list N bé
9. Click vào từng bé để xem report → Print PDF

### Workflow 3: Time series (Đầu kỳ vs Cuối kỳ)

Hiện tại **chưa có UI compare**, nhưng có thể tạm dùng:
1. Đầu kỳ: import file kết quả lần 1 → **💾 Backup** ra JSON
2. Cuối kỳ: import file kết quả lần 2 vào hệ thống
3. So sánh PDF in ra (manual)

→ Feature compare đầu/cuối kỳ sẽ làm trong phase tiếp.

---

## ⚠️ Lỗi thường gặp + cách fix

| Lỗi GV làm                                                | System xử lý                                              |
|-----------------------------------------------------------|-----------------------------------------------------------|
| Tên sheet không có năm sinh (vd "Báo cáo Dũng")          | Lấy tên từ sheet, năm sinh để trống → điền tay sau         |
| Điền cột Mức bằng chữ "Tốt" thay vì số                    | Skip, hiện cảnh báo "Row X: Mức 'Tốt' không hợp lệ"        |
| Điền 7/8 thay vì 0-5                                       | Skip, hiện cảnh báo per row                                |
| Cột bị xáo trộn (chèn cột "Ghi chú" giữa)                | Auto-detect header → tìm cột Mã + Mức bất kể vị trí        |
| Sheet name có ký tự lạ (vd `"Test #1"`)                  | Trim ký tự đặc biệt khi extract tên                        |
| Multiple atomic sheets không phân biệt                    | Auto-detect ≥30 atomic rows → tách thành student riêng    |
| Quên điền sheet "Thông tin HS"                            | OK — chỉ lấy info từ tên sheet (năm sinh)                  |

---

## 🔧 Tips cho GV

1. **Nên dùng template có sẵn** — KHÔNG tự tạo file from scratch
2. **Không sửa cột header** — cứ giữ nguyên các cột A-K trong sheet Atomic
3. **Cột E là duy nhất GV cần điền** — các cột khác đã có sẵn
4. **Bé chưa chấm → để trống**, không điền 0 (0 nghĩa là không làm được)
5. **Sheet name format `TÊN BÉ YYYY`** giúp auto-fill info nhanh nhất
6. **Trước khi import**, kiểm tra Validation panel xem có cảnh báo gì không

---

## 🤔 FAQ

**Q: Tôi có thể dùng Google Sheets không?**
A: Có. Export từ Google Sheets ra xlsx (File → Download → Microsoft Excel) → import bình thường.

**Q: File CSV có hỗ trợ không?**
A: Có nhưng format hạn chế (không có "Thông tin HS" sheet). Format CSV: 2 cột `Mã,Mức`. Khuyến nghị dùng xlsx.

**Q: Tôi muốn thêm column note riêng?**
A: OK — chèn cột vào BÊN PHẢI cột K. Hệ thống bỏ qua các cột không quen.

**Q: Có thể import 2 lần cho cùng bé (sửa)?**
A: Có. Import file mới sẽ ghi đè data hiện tại. Để giữ history, dùng Backup trước mỗi lần import.

**Q: Một file có thể chứa bao nhiêu bé?**
A: Không giới hạn cứng, nhưng thực tế khuyến nghị **≤30 bé/file** để không crash browser. Vẫn nên tách lớp ra file riêng.

---

## 📞 Cần trợ giúp?

- **Bug / lỗi technical**: [GitHub Issues](https://github.com/HoangDuong-DH/wonderkids-baocao/issues)
- **Câu hỏi về rubric**: liên hệ Giám đốc trung tâm hoặc xem file `Level 3/4 Hướng dẫn chấm.docx` chính thức
- **Training GV mới**: dùng "🧪 Mock data" trong console (`__MOCK_MG.excellent`) để demo

---

*Document version: 1.0 — May 2026 | WonderKids Edu*
