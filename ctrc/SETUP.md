# CTRC — Hướng dẫn cài đặt & vận hành

Hệ thống báo cáo **per-buổi** (GV chấm → sinh tin → CSKH duyệt → phụ huynh xem), điều chỉnh từ kiến trúc Cloudflare trong README gốc sang **static + offline-first** để chạy được ngay trên GitHub Pages, rồi nâng cấp lên Supabase khi cần đồng bộ nhiều máy.

## Kiến trúc thực tế

```
ctrc/
├── index.html      # App nhân sự (GV / CSKH / Manager) — 1 file SPA
├── parent.html     # Trang phụ huynh (token công khai, không đăng nhập)
├── config.js       # ⚙ Cấu hình — chỗ DUY NHẤT cần sửa khi lên thật
├── db.js           # Data-layer 2 tầng: localStorage ⟷ Supabase (cùng interface)
├── engine.js       # Engine sinh 4 lớp (offline, deterministic) + guard giọng
├── schema.sql      # Schema Supabase (dán vào SQL Editor)
└── supabase/functions/generate/index.ts   # Edge Function gọi Claude API
```

**Nguyên tắc chống lỗi**: app luôn chạy được. Không có Supabase → tự dùng `localStorage` (demo). Có Supabase nhưng Edge Function lỗi → tự lùi về engine offline. Không bao giờ "trắng trang".

---

## Mức 1 — Demo ngay (0 setup)

Mở `ctrc/index.html` (qua GitHub Pages hoặc local server). App tự seed:
- 1 trung tâm WonderKids + 1 lớp + 2 bé
- 3 nhân sự: **Cô Mai** (GV), **Chị Lan** (CSKH), **Anh Tuấn** (Manager)
- 10 điểm mạnh mẫu + 1 chủ đề tuần

> ⚠ Demo lưu trên **máy này** (localStorage). GV và CSKH ở 2 máy khác nhau **không** thấy chung dữ liệu. Để đồng bộ thật → Mức 2.

Thử luồng: đăng nhập **Cô Mai** → chấm 1 bé (nhớ ghi *Quan sát cụ thể*) → Lưu → đăng nhập **Chị Lan** → Hàng đợi → mở tin → Duyệt → Copy nội dung → mở link phụ huynh.

---

## Mức 2 — Thực chiến với Supabase (đồng bộ nhiều máy)

### 2.1 Tạo project
1. Vào [supabase.com](https://supabase.com) → New project (free tier đủ dùng).
2. Project Settings → API → copy **Project URL** + **anon public key**.

### 2.2 Chạy schema
SQL Editor → New query → dán toàn bộ `schema.sql` → **Run**. (Chạy lại nhiều lần an toàn.)
Schema tự seed 1 center demo + 10 điểm mạnh.

### 2.3 Điền config
Mở `ctrc/config.js`:
```js
supabaseUrl:    'https://xxxx.supabase.co',
supabaseAnonKey:'eyJhbGc...',
```
Mở lại app → banner đổi thành **🟢 Kết nối Supabase**. Giờ mọi máy cùng config = chung dữ liệu.

### 2.4 Bảo mật (QUAN TRỌNG — NĐ 13/2023)
Schema bật sẵn **RLS**. Có 2 lựa chọn:

- **Khuyến nghị (an toàn)**: bật **Supabase Auth** (email + mật khẩu). Tạo tài khoản cho từng nhân sự, rồi map vào bảng `staff` qua cột `auth_uid` (= `auth.users.id`). Chính sách `auth_center` tự giới hạn mỗi người chỉ thấy dữ liệu trung tâm mình. Trang phụ huynh dùng RPC `get_parent_report` token-gated nên KHÔNG lộ bảng `students`.

- **Nhanh, nội bộ tạm thời**: nếu chưa kịp làm Auth, mở comment **mục 6** cuối `schema.sql` (chính sách `anon_all`) để app chạy bằng anon key. ⚠ Chỉ dùng nội bộ sau URL khó đoán, **không** để lâu với dữ liệu thật — anon key nằm trong JS public.

---

## Mức 3 — Bật "Sinh bằng AI" (Claude API)

Engine offline đã đủ tốt (lấy quan sát GV làm lõi). Muốn chất lượng AI cao hơn:

```bash
# cài Supabase CLI rồi:
supabase functions deploy generate --no-verify-jwt
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxx
```
Copy URL `https://xxxx.supabase.co/functions/v1/generate` → dán vào `config.js`:
```js
edgeFnUrl: 'https://xxxx.supabase.co/functions/v1/generate',
```
Trong màn CSKH sẽ hiện nút **✨ Sinh bằng AI**. Key Claude nằm ở server (secret), KHÔNG lộ ra trình duyệt. Lỗi API → tự giữ nháp engine.

---

## Cơ chế cá nhân hoá 4 lớp (engine.js)

| Lớp | Nguồn | Trong code |
|---|---|---|
| L1 Chuẩn nền | giọng + 3 dòng + 10 điểm mạnh | `OPENERS`, `strength_templates`, guard `checkVoice` |
| L2 Bối cảnh | chủ đề tuần | `themeHook()` |
| L3 Hồ sơ bé | hướng nội/ngoại + kiểu học | chọn `OPENERS_*`, bank `TIPS[dim][style]` |
| L4 Hôm nay | điểm + tick + **quan sát** | lõi `diem_manh`, chiều yếu → `co_gang`/`goi_y` |

- **Chống lặp điểm mạnh**: nhớ 5 buổi gần nhất, ưu tiên điểm mạnh chưa nêu (chip có ↻ vàng).
- **Hồ sơ tự sinh sau ≥3 buổi**: trạng thái *Đang quan sát → Nháp → Active* (Manager duyệt).
- **Deterministic**: cùng input → cùng output (seed theo bé + ngày), không nhảy lung tung.

## An toàn nhiều người (đã có)

- **Optimistic lock**: 2 CSKH cùng "Duyệt" → chỉ 1 thành công, người kia báo *"Tin vừa được cập nhật bởi thành viên khác"*.
- **Chặn GV ghi đè tin đã duyệt**: *"Buổi này đã được CSKH duyệt — liên hệ CSKH"*.
- **Audit log** mọi thao tác. **Link phụ huynh hết hạn 30 ngày**. **Soft-delete** bé.

## Đưa lên GitHub Pages

Thư mục `ctrc/` deploy thẳng cùng repo. Truy cập:
`https://<user>.github.io/<repo>/ctrc/index.html`

Link phụ huynh tự suy ra cùng thư mục → `.../ctrc/parent.html#t=<token>` (đổi được qua `config.parentBaseUrl`).
