-- ═══════════════════════════════════════════════════════════════════════════
--  CTRC — SCHEMA PATCH V2 (07/07/2026)
--  Đồng bộ database với app hiện tại (mô hình 5 TIÊU CHÍ + trả lại GV + báo cáo tuần).
--  Dán TOÀN BỘ file này vào Supabase → SQL Editor → Run. Chạy lại nhiều lần an toàn.
--  Sửa lỗi: "Could not find the 'improve' column of 'session_records' in the schema cache"
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1) session_records: 2 cột mô hình 5 tiêu chí (GV tick 1 mạnh + 1 cần cải thiện)
alter table session_records add column if not exists strength jsonb;   -- {crit,sentence,detail}
alter table session_records add column if not exists improve  jsonb;   -- {crit,sentence,detail}

-- ── 2) session_messages: cột luồng mới (nội dung bài học + CSKH trả lại GV)
alter table session_messages add column if not exists lesson_snapshot jsonb;
alter table session_messages add column if not exists return_reason   text default '';
alter table session_messages add column if not exists returned_by     uuid references staff(id);
alter table session_messages add column if not exists returned_at     timestamptz;

-- featured_strength: trước là int (index điểm mạnh cũ) → nay là text (key tiêu chí 'tap_trung'…)
do $$ begin
  if exists (select 1 from information_schema.columns
             where table_schema='public' and table_name='session_messages'
               and column_name='featured_strength' and data_type='integer') then
    alter table session_messages alter column featured_strength type text using featured_strength::text;
  end if;
end $$;

-- status: bổ sung 'returned' (CSKH trả lại GV chấm lại)
alter table session_messages drop constraint if exists session_messages_status_check;
alter table session_messages add constraint session_messages_status_check
  check (status in ('waiting_gv','ai_writing','waiting_cs','cs_editing','approved','sent','returned','error'));

-- ── 3) BẢNG BÁO CÁO TUẦN (bản schema cũ thiếu hoàn toàn)
create table if not exists weekly_reports (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid references centers(id) on delete cascade,
  class_id        uuid references classes(id) on delete set null,
  student_id      uuid references students(id) on delete cascade,
  token           text unique,                  -- 'w_...' — phụ huynh mở parent.html#t=<token>
  expires_at      timestamptz,
  status          text default 'sent',
  sent_date       date,
  range_from      date,
  range_to        date,
  book            text,
  week            text,
  lesson_key      text,
  lesson_snapshot jsonb,
  summary         jsonb,                        -- {hocGi,tongHop,coGang}
  class_comment   text default '',
  child_comment   text default '',
  created_by      uuid references staff(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists idx_weekly_token  on weekly_reports(token);
create index if not exists idx_weekly_center on weekly_reports(center_id, created_at desc);

alter table weekly_reports enable row level security;
drop policy if exists app_internal on weekly_reports;
create policy app_internal on weekly_reports using (true) with check (true);

-- ── 4) RPC phụ huynh: thêm 'lesson_content' (📖 Nội dung học tuần này trong parent.html)
create or replace function get_parent_report(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_msg    session_messages;
  v_tok    parent_tokens;
  v_stu    students;
  v_rec    session_records;
  v_ses    sessions;
  v_center centers;
  v_theme  weekly_themes;
begin
  select * into v_tok from parent_tokens where token = p_token limit 1;
  if v_tok.id is null then return jsonb_build_object('error','not_found'); end if;
  if v_tok.expires_at < now() then return jsonb_build_object('error','expired'); end if;

  select * into v_msg from session_messages where id = v_tok.message_id;
  if v_msg.status not in ('approved','sent') then return jsonb_build_object('error','not_ready'); end if;

  select * into v_stu from students where id = v_msg.student_id;
  select * into v_rec from session_records where id = v_msg.record_id;
  select * into v_ses from sessions where id = v_rec.session_id;
  select * into v_center from centers where id = v_stu.center_id;
  select * into v_theme from weekly_themes
    where center_id = v_stu.center_id and week_start <= v_ses.date
    order by week_start desc limit 1;

  return jsonb_build_object(
    'student_name',   v_stu.name,
    'date',           v_ses.date,
    'theme',          coalesce(v_theme.title,''),
    'lesson_content', coalesce(v_msg.lesson_snapshot->>'content',''),
    'diem_manh',      v_msg.diem_manh,
    'co_gang',        v_msg.co_gang,
    'goi_y',          v_msg.goi_y,
    'center_name',    v_center.name,
    'tagline',        v_center.tagline,
    'brand_color',    v_center.brand_color,
    'closing_line',   v_center.closing_line
  );
end;
$$;
grant execute on function get_parent_report(text) to anon;

-- ── 5) Bắt PostgREST nạp lại schema cache NGAY (không phải chờ) — hết lỗi "schema cache"
notify pgrst, 'reload schema';
