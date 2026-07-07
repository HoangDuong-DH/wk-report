-- ═══════════════════════════════════════════════════════════════════════════
--  CTRC — Schema Supabase (Postgres)
--  Hệ thống báo cáo per-buổi WonderKids. Dán toàn bộ file này vào
--  Supabase → SQL Editor → Run. An toàn chạy lại nhiều lần (idempotent).
-- ═══════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
--  1. BẢNG (tables)
-- ──────────────────────────────────────────────────────────────────────────

create table if not exists centers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  tagline       text default '',
  brand_color   text default '#f3811f',
  closing_line  text default 'Mỗi bé có tốc độ riêng — với sự đồng hành kiên nhẫn, bé sẽ ngày càng tự tin và phát triển toàn diện.',
  created_at    timestamptz default now()
);

create table if not exists staff (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references centers(id) on delete cascade,
  auth_uid      uuid unique,                              -- map tới auth.users (khi bật Supabase Auth)
  name          text not null,
  role          text not null check (role in ('gv','cskh','manager')),
  pin           text,                                     -- PIN 4 số cho chế độ đăng nhập nhẹ
  active        boolean default true,
  created_at    timestamptz default now()
);

create table if not exists classes (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references centers(id) on delete cascade,
  name          text not null,
  age_band      text default '',
  created_at    timestamptz default now()
);

create table if not exists students (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references centers(id) on delete cascade,
  class_id      uuid references classes(id) on delete set null,
  name          text not null,
  dob           text default '',
  gender        text default 'Nam' check (gender in ('Nam','Nữ')),
  parent_phone  text default '',
  status        text default 'active' check (status in ('active','deleted')),
  session_count int default 0,                            -- đếm số buổi đã đi (để kích hoạt hồ sơ sau 3 buổi)
  created_at    timestamptz default now(),
  deleted_at    timestamptz
);

create table if not exists weekly_themes (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references centers(id) on delete cascade,
  week_start    date not null,                            -- thứ 2 của tuần
  title         text not null,
  description   text default '',
  created_at    timestamptz default now(),
  unique (center_id, week_start)
);

-- 10 điểm mạnh mẫu (SO_TAY mục 6.3)
create table if not exists strength_templates (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references centers(id) on delete cascade,
  idx           int not null,                             -- 1..10
  label         text not null,
  phrase        text not null,                            -- câu đầy đủ engine ghép vào tin
  unique (center_id, idx)
);

-- Hồ sơ tính cách bé (Lớp 3 — SO_TAY mục 6.2)
create table if not exists child_profiles (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  status        text default 'observing' check (status in ('observing','draft','active')),
  introversion  text default 'balanced' check (introversion in ('introvert','extrovert','balanced')),
  learning_style text default 'mixed' check (learning_style in ('visual','auditory','kinesthetic','mixed')),
  concerns      jsonb default '[]'::jsonb,                -- ["...", "..."]
  baseline_5d   jsonb default '{}'::jsonb,                -- {focus,logic,reflex,interaction,creativity}
  summary       text default '',
  generated_at  timestamptz,
  approved_by   uuid references staff(id),
  approved_at   timestamptz,
  updated_at    timestamptz default now(),
  unique (student_id)
);

-- Buổi học (1 ngày + 1 lớp)
create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid not null references centers(id) on delete cascade,
  class_id      uuid references classes(id) on delete set null,
  date          date not null,
  created_by    uuid references staff(id),
  created_at    timestamptz default now(),
  unique (class_id, date)
);

-- GV chấm cho từng bé trong 1 buổi
create table if not exists session_records (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references sessions(id) on delete cascade,
  student_id    uuid not null references students(id) on delete cascade,
  attendance    text default 'present' check (attendance in ('present','absent')),
  strength      jsonb,                                    -- MÔ HÌNH 5 TIÊU CHÍ: {crit,sentence,detail} điểm mạnh
  improve       jsonb,                                    -- {crit,sentence,detail} cần cải thiện
  scores_5d     jsonb default '{}'::jsonb,                -- (legacy) 1..5
  strengths     jsonb default '[]'::jsonb,                -- (legacy) [idx,...]
  observation   text default '',                          -- (legacy fallback) quan sát cụ thể
  effort        text default '',
  mood          text default 'normal' check (mood in ('happy','normal','sad','tired')),
  created_by    uuid references staff(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (session_id, student_id)
);

-- Tin nhắn báo cáo (state machine — SO_TAY mục 12)
create table if not exists session_messages (
  id            uuid primary key default gen_random_uuid(),
  record_id     uuid not null references session_records(id) on delete cascade,
  student_id    uuid not null references students(id) on delete cascade,
  status        text default 'waiting_cs'
                  check (status in ('waiting_gv','ai_writing','waiting_cs','cs_editing','approved','sent','returned','error')),
  source        text default 'engine' check (source in ('engine','ai','manual')),
  diem_manh     text default '',
  co_gang       text default '',
  goi_y         text default '',
  ai_draft      jsonb,                                    -- bản nháp tham khảo {diem_manh,co_gang,goi_y}
  lesson_snapshot jsonb,                                  -- ảnh chụp bài học tuần (📖 phụ huynh thấy)
  featured_strength text,                                 -- key tiêu chí điểm mạnh đã nêu (anti-lặp)
  return_reason text default '',                          -- CSKH trả lại GV: lý do
  returned_by   uuid references staff(id),
  returned_at   timestamptz,
  error_msg     text,
  version       int default 1,                            -- optimistic locking
  lock_owner    uuid references staff(id),                -- ai đang mở sửa
  lock_at       timestamptz,
  edited_by     uuid references staff(id),
  approved_by   uuid references staff(id),
  approved_at   timestamptz,
  sent_at       timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (record_id)
);

-- Link riêng cho phụ huynh (token, hết hạn 30 ngày)
create table if not exists parent_tokens (
  id            uuid primary key default gen_random_uuid(),
  message_id    uuid not null references session_messages(id) on delete cascade,
  token         text not null unique,
  expires_at    timestamptz not null,
  created_at    timestamptz default now()
);

-- Báo cáo TUẦN (gom 2 buổi → 1 tuần, token 'w_...' phụ huynh đọc trực tiếp)
create table if not exists weekly_reports (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid references centers(id) on delete cascade,
  class_id        uuid references classes(id) on delete set null,
  student_id      uuid references students(id) on delete cascade,
  token           text unique,
  expires_at      timestamptz,
  status          text default 'sent',
  sent_date       date,
  range_from      date,
  range_to        date,
  book            text,
  week            text,
  lesson_key      text,
  lesson_snapshot jsonb,
  summary         jsonb,                                   -- {hocGi,tongHop,coGang}
  class_comment   text default '',
  child_comment   text default '',
  created_by      uuid references staff(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Nhật ký truy vết (SO_TAY mục 8)
create table if not exists audit_logs (
  id            uuid primary key default gen_random_uuid(),
  center_id     uuid references centers(id) on delete cascade,
  actor_id      uuid references staff(id),
  actor_name    text default '',
  action        text not null,                            -- 'score','generate','approve','send','profile_approve',...
  entity_type   text default '',
  entity_id     uuid,
  meta          jsonb default '{}'::jsonb,
  created_at    timestamptz default now()
);

-- ──────────────────────────────────────────────────────────────────────────
--  2. INDEX
-- ──────────────────────────────────────────────────────────────────────────
create index if not exists idx_students_center   on students(center_id) where status = 'active';
create index if not exists idx_records_session    on session_records(session_id);
create index if not exists idx_messages_status    on session_messages(status);
create index if not exists idx_messages_student   on session_messages(student_id);
create index if not exists idx_tokens_token       on parent_tokens(token);
create index if not exists idx_audit_center       on audit_logs(center_id, created_at desc);
create index if not exists idx_weekly_token       on weekly_reports(token);
create index if not exists idx_weekly_center      on weekly_reports(center_id, created_at desc);

-- ──────────────────────────────────────────────────────────────────────────
--  3. RPC token-gated cho PHỤ HUYNH (đọc 1 tin qua token, KHÔNG lộ bảng students)
--     SECURITY DEFINER: chạy quyền owner, bỏ qua RLS — chỉ trả đúng 1 tin theo token.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function get_parent_report(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_msg   session_messages;
  v_tok   parent_tokens;
  v_stu   students;
  v_rec   session_records;
  v_ses   sessions;
  v_center centers;
  v_theme weekly_themes;
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
    'student_name', v_stu.name,
    'date',         v_ses.date,
    'theme',        coalesce(v_theme.title,''),
    'lesson_content', coalesce(v_msg.lesson_snapshot->>'content',''),
    'diem_manh',    v_msg.diem_manh,
    'co_gang',      v_msg.co_gang,
    'goi_y',        v_msg.goi_y,
    'center_name',  v_center.name,
    'tagline',      v_center.tagline,
    'brand_color',  v_center.brand_color,
    'closing_line', v_center.closing_line
  );
end;
$$;

-- Cho phép anon gọi RPC này (chỉ RPC, không phải bảng)
grant execute on function get_parent_report(text) to anon;

-- ──────────────────────────────────────────────────────────────────────────
--  4. RLS — NỘI BỘ ĐƠN GIẢN (mặc định)
--     App đăng nhập kiểu nội bộ: chọn tên nhân sự (GV/CSKH/Manager), không
--     mật khẩu. Dùng anon key. Vì là công cụ nội bộ, cho anon thao tác đủ để
--     app chạy. Phụ huynh KHÔNG đọc bảng trực tiếp — chỉ qua RPC token ở mục 3.
--
--     👉 Đặt sau URL + anon key khó đoán, chỉ chia cho nhân sự trung tâm.
--     👉 Cần chặt hơn (nhiều trung tâm, dữ liệu nhạy cảm): xem mục 6 (Auth).
-- ──────────────────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['centers','staff','classes','students','weekly_themes',
    'strength_templates','child_profiles','sessions','session_records',
    'session_messages','parent_tokens','audit_logs','weekly_reports']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists app_internal on %I', t);
    execute format('create policy app_internal on %I using (true) with check (true)', t);
  end loop;
end $$;

-- ──────────────────────────────────────────────────────────────────────────
--  5. SEED demo (1 center + 10 điểm mạnh + 1 lớp + 2 bé + staff demo)
--     Chỉ seed nếu center demo chưa tồn tại.
-- ──────────────────────────────────────────────────────────────────────────
do $$
declare
  v_center uuid;
  v_class  uuid;
begin
  if exists (select 1 from centers where name = 'WonderKids Edu') then return; end if;

  insert into centers(name, tagline) values ('WonderKids Edu','Khai mở tư duy') returning id into v_center;

  insert into classes(center_id, name, age_band) values (v_center,'Lớp Chồi A','3-4 tuổi') returning id into v_class;

  insert into students(center_id, class_id, name, gender, parent_phone, session_count) values
    (v_center, v_class, 'Hải An', 'Nam', '0900000001', 4),
    (v_center, v_class, 'Bảo Ngọc','Nữ',  '0900000002', 2);

  insert into staff(center_id, name, role, pin) values
    (v_center, 'Cô Mai',    'gv',      '1111'),
    (v_center, 'Chị Lan',   'cskh',    '2222'),
    (v_center, 'Anh Tuấn',  'manager', '3333');

  insert into weekly_themes(center_id, week_start, title, description) values
    (v_center, date_trunc('week', current_date)::date, 'Ghép hình & nhận biết hình khối',
     'Tuần này các bé học ghép hình, nhận biết hình tròn/vuông/tam giác qua trò chơi.');

  insert into strength_templates(center_id, idx, label, phrase) values
    (v_center,1, 'Tập trung tốt suốt buổi',   'giữ được sự tập trung rất tốt trong suốt buổi học'),
    (v_center,2, 'Mạnh dạn giơ tay trả lời',  'mạnh dạn giơ tay phát biểu trước lớp'),
    (v_center,3, 'Tự tìm ra cách giải',       'tự tìm ra cách giải mà không cần cô gợi ý'),
    (v_center,4, 'Giúp bạn khi bạn chưa hiểu','chủ động giúp bạn khi bạn chưa hiểu bài'),
    (v_center,5, 'Hào hứng tham gia trò chơi','tham gia trò chơi học tập với sự hào hứng'),
    (v_center,6, 'Kiên nhẫn thử nhiều cách',  'kiên nhẫn thử lại nhiều cách khi gặp khó'),
    (v_center,7, 'Biết giải thích cách làm',  'biết giải thích lại cách làm của mình'),
    (v_center,8, 'Tự giác hoàn thành bài',    'tự giác hoàn thành bài mà không cần nhắc'),
    (v_center,9, 'Quan sát rất nhanh',        'quan sát và nhận ra chi tiết rất nhanh'),
    (v_center,10,'Tự tin trình bày trước lớp','tự tin trình bày ý kiến của mình trước lớp');
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
--  6. (TÙY CHỌN — chỉ khi cần chặt hơn) Supabase Auth + RLS theo trung tâm.
--     Dùng khi: nhiều trung tâm chung 1 DB, hoặc cần đăng nhập email/mật khẩu.
--     Các bước: bật Supabase Auth → tạo tài khoản cho từng nhân sự → điền
--     staff.auth_uid = auth.users.id. Sau đó BỎ COMMENT khối dưới (nó thay
--     chính sách app_internal bằng chính sách lọc theo center của người đăng nhập).
-- ═══════════════════════════════════════════════════════════════════════════
-- create or replace function current_center_id()
-- returns uuid language sql stable security definer set search_path = public as $$
--   select center_id from staff where auth_uid = auth.uid() limit 1;
-- $$;
-- do $$
-- declare t text;
-- begin
--   foreach t in array array['classes','students','weekly_themes','strength_templates',
--     'sessions','session_records','session_messages','audit_logs','child_profiles','parent_tokens']
--   loop execute format('drop policy if exists app_internal on %I', t); end loop;
--   foreach t in array array['classes','students','weekly_themes','strength_templates',
--     'sessions','session_records','session_messages','audit_logs']
--   loop
--     execute format('drop policy if exists auth_center on %I', t);
--     execute format('create policy auth_center on %I using (center_id = current_center_id()) with check (center_id = current_center_id())', t);
--   end loop;
--   drop policy if exists app_internal on staff;  drop policy if exists app_internal on centers;
--   create policy auth_staff   on staff   using (center_id = current_center_id());
--   create policy auth_centers on centers using (id = current_center_id());
--   create policy auth_profiles on child_profiles
--     using (exists (select 1 from students s where s.id=student_id and s.center_id=current_center_id()))
--     with check (exists (select 1 from students s where s.id=student_id and s.center_id=current_center_id()));
--   create policy auth_tokens on parent_tokens
--     using (exists (select 1 from session_messages m join students s on s.id=m.student_id where m.id=message_id and s.center_id=current_center_id()))
--     with check (true);
-- end $$;
