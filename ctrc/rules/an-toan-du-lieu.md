# An toàn dữ liệu & nhiều người dùng
<!-- CTRC · tài liệu tham chiếu (KHÔNG nạp vào AI) · cập nhật 2026-06-09 -->

## Nội bộ, đơn giản
- Đăng nhập = chọn tên nhân sự (GV/CSKH/Manager), không mật khẩu (xem SETUP.md).
- Chia URL + key chỉ cho nhân sự trung tâm.

## Nhiều người cùng lúc
- 2 CSKH cùng duyệt 1 tin → chỉ 1 thành công (optimistic lock theo `version`).
- GV không sửa được tin đã duyệt/đã gửi.
- Lock "đang sửa" tự nhả khi đóng / quá 15 phút.
> Ghim trong code: `db.js` → `updateMessageGuarded`, `healLocks`.

## Truy vết & lưu trữ (NĐ 13/2023)
- Mọi thao tác có **audit log** (ai làm, lúc nào).
- Xoá bé = **soft-delete** (ẩn, giữ dữ liệu cũ).
- Demo: dữ liệu trên máy (localStorage). Thật: Supabase (đồng bộ nhiều máy).

## Khi thêm chức năng mới (cho người & AI)
1. Có thao tác mới của GV/CSKH/Manager? → ghi `audit`.
2. Có gửi gì cho phụ huynh? → theo `gui-phu-huynh.md` (không link).
3. Có thu thập thêm dữ liệu bé? → cân nhắc NĐ 13/2023.
4. Có nội dung tự sinh? → bám `giong-thuong-hieu.md`.
