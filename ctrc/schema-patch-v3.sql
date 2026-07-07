-- ═══════════════════════════════════════════════════════════════════════════
--  CTRC — SCHEMA PATCH V3 (07/07/2026)
--  Bật TÙY CHỈNH 5 TIÊU CHÍ trong app (Manager → Cấu hình → 🎯 5 tiêu chí).
--  Bản tùy chỉnh lưu ở centers.criteria (jsonb) → đồng bộ MỌI máy.
--  Dán vào Supabase → SQL Editor → Run. Chạy lại nhiều lần an toàn.
-- ═══════════════════════════════════════════════════════════════════════════

alter table centers add column if not exists criteria jsonb;   -- null = dùng bản gốc trong engine.js

notify pgrst, 'reload schema';
