-- CTRC schema patch v4 — Manager report/tone config
-- Safe to run multiple times.

alter table centers
  add column if not exists report_config jsonb;

