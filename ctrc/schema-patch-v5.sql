-- CTRC schema patch v5 — Cloud lesson library for imported docx lesson plans
-- Safe to run multiple times.

create table if not exists lesson_library (
  id              uuid primary key default gen_random_uuid(),
  center_id       uuid not null references centers(id) on delete cascade,
  key             text not null,
  code            text not null,
  week            int not null check (week between 1 and 8),
  title           text default '',
  source          text default 'imported',
  raw_text        text default '',
  skeleton        jsonb default '{}'::jsonb,
  manager_summary text default '',
  parent_content  text default '',
  imported_by     uuid references staff(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (center_id, key)
);

create index if not exists idx_lessons_center on lesson_library(center_id, code, week);

alter table lesson_library enable row level security;
drop policy if exists app_internal on lesson_library;
create policy app_internal on lesson_library using (true) with check (true);
