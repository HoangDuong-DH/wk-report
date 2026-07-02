# WonderKids — Project Handoff / Session Continuation Guide

> **Mục đích / Purpose:** Đọc file này sau khi `git clone` là đủ để một phiên Claude (hoặc dev) mới tiếp tục dự án y hệt, không cần lịch sử chat cũ.
> This file is the single source of truth to resume work. Read it top-to-bottom, then you're ready.

---

## 0. TL;DR for a fresh Claude session

- This is a **static, no-build** set of Vietnamese education report web-apps (HTML + vanilla JS), deployed on **GitHub Pages**.
- **Nothing to install/compile.** Serve the folder with any static server to preview.
- **Deploy = `git push origin main`** → GitHub Pages rebuilds. (Details + a redirect gotcha in §5.)
- **No secrets live in this repo** (see §6). It runs in demo mode out of the box.
- Owner/brand: **WonderKids Edu**. UI + content are in **Vietnamese**.

---

## 1. What this project is

Three families of report tools under one repo, all linked from the root hub page:

| Area | Entry file | What it does |
|---|---|---|
| **Hub** | `index.html` | Landing page — "Chọn loại báo cáo" (choose report type), links to the reports below. |
| **Tiểu học (primary)** | `tieu-hoc.html` | Beginning-of-term (**đầu kỳ**) math-ability assessment report. Import a child's `.xlsx`/`.csv`, auto-fills tables, renders charts (donut / radar / cluster / question-matrix), exports A4 PDF. Single self-contained file. |
| **Mẫu giáo (kindergarten)** | `mau-giao.html`, `mau-giao-l3-v2.html`, `mau-giao-l4.html`, `mau-giao-l4-v2.html` | Thinking-ability reports for kindergarten levels L3/L4. Same single-file pattern. |
| **CTRC (operations app)** | `ctrc/index.html` | The biggest sub-app: a **per-buổi + weekly parent-communication system** for a center. Teacher (GV) scores each session → CSKH reviews/edits → Manager oversees → parent gets a private link. Optional Claude AI to generate the parent message. Has its own DB layer, template engine, objectives library, and rules. |

`WonderKids - Báo cáo đánh giá.html` is a standalone report variant kept at root.

---

## 2. Repository map

```
/
├── index.html                      # Hub / report chooser (Pages entry point)
├── tieu-hoc.html                   # Primary-school đầu-kỳ report (single file, ~5k lines)
├── mau-giao.html                   # Kindergarten report(s)
├── mau-giao-l3-v2.html
├── mau-giao-l4.html
├── mau-giao-l4-v2.html
├── WonderKids - Báo cáo đánh giá.html
├── README.md                       # Original tieu-hoc README (partly outdated — trust THIS file)
├── INPUT-FORMAT.md                 # Notes on the import CSV/XLSX format
├── HANDOFF.md                      # ← you are here
│
├── ctrc/                           # Operations app (per-buổi + weekly)
│   ├── index.html                  # Main app: roles GV / CSKH / Manager, scoring, weekly, dashboard
│   ├── parent.html                 # Parent-facing report (opened via token link: parent.html#t=<token>)
│   ├── config.js                   # Config: Supabase + AI. EMPTY by default = demo mode (localStorage)
│   ├── db.js                       # 2-tier DB adapter: LocalAdapter (localStorage) + SupaAdapter (Supabase)
│   ├── engine.js                   # Report template engine: CRITERIA model, generate(), weekly digest, composeZalo()
│   ├── objectives.js               # Weekly learning objectives grouped by program (UCREA / BLACKHOLE / BRIGHT IG)
│   ├── lessons.js                  # Lesson library (strength/weakness suggestions on the scoring form)
│   ├── SETUP.md                    # How to turn on Supabase + the Claude Edge Function
│   ├── rules/                      # AI "skill"/rules as Markdown (versioned, with output contracts)
│   │   ├── README.md
│   │   ├── giong-thuong-hieu.md    # Brand voice
│   │   ├── bao-cao-per-buoi.md     # Per-session report rules
│   │   ├── bao-cao-tuan.md         # Weekly report rules
│   │   ├── doc-hieu-giao-an.md     # Reading the lesson plan
│   │   ├── gui-phu-huynh.md        # Parent-delivery rules
│   │   └── an-toan-du-lieu.md      # Data-safety rules
│   └── supabase/functions/generate/index.ts   # Edge Function that calls Claude (key stays server-side)
│
├── scraps/                         # Dev tools & scratch data (md2docx.py, make_intake_form.py, atomic_*.json)
├── templates/                      # Input templates (atomic input template .md/.csv)
├── .claude/launch.json             # Local preview server config (python http.server, autoPort)
└── .gitignore
```

**NOT in git (intentionally — see §6/§8):** `mẫu giáo/` and `archive/` (old versions + scratch + screenshots), and any `uploads/` (contain **student PII** — must never go to this public repo).

---

## 3. Tech & conventions

- **No framework, no build step.** Plain HTML/CSS/JS. `tieu-hoc.html` and each report is one self-contained file.
- **CDN libs** (with fallbacks): SheetJS (`XLSX`) for Excel import; React+Babel only for small "tweaks" panels.
- **CTRC cache-busting:** script tags use `?v=N` (e.g. `config.js?v=29`). **When you edit a `ctrc/*.js` file, bump the `?v=` number** on its `<script>`/link tags in `ctrc/index.html` and `ctrc/parent.html`, otherwise browsers serve the old cached file.
- **Import convention (tieu-hoc):** in the source xlsx, mark column uses **`X` = sai (wrong)**, **`O` = đúng (correct)**. The importer (`importWonderkids`, `_findAnchor`, `_readTable`, `parseQMatrix`, `parseTuDuyScores`) is **dynamic** — it finds tables by header keyword and columns by name, so it tolerates different unit/domain names across programs. Keep it dynamic; don't hardcode row/column indexes.
- **Tư duy total quirk (tieu-hoc):** Section-2 (Tư duy) total comes from the **qscore 10-mục table (=60đ)** via `_tuduyTotals`/`parseTuDuyScores` (reads col B=mục, C=điểm chuẩn, D=KẾT QỦA), **not** the "đánh giá theo lĩnh vực" (t-nl) table. If a file's KẾT QỦA column is blank/0, Tư duy shows ~0% — verify it's real data vs. an ungraded column before treating a low score as the child's result.
- **Vietnamese everywhere.** Keep tone appropriate; for **đầu-kỳ** reports remember it's a *baseline/diagnostic* (low is expected), but **only change wording when asked** (see §7 history).

---

## 4. Run locally (preview)

Any static file server works. Two easy options from the repo root:

```bash
# Option A — python (matches .claude/launch.json)
python -c "import http.server; http.server.ThreadingHTTPServer(('127.0.0.1',4191), http.server.SimpleHTTPRequestHandler).serve_forever()"
# then open http://127.0.0.1:4191/index.html  (or /tieu-hoc.html, /ctrc/index.html)

# Option B — npx
npx serve .
```

Opening the files directly with `file://` mostly works too, but a server avoids CORS/cache quirks. In Claude Code, the preview MCP is configured via `.claude/launch.json` (server name `ctrc-static`).

---

## 5. Deploy (IMPORTANT — read fully)

Deploy = push to `main`; GitHub Pages builds automatically.

```bash
git push origin main
```

**Gotchas that will bite you:**

1. **Remote name vs Pages repo.** `origin` points at the OLD repo name `wonderkids-baocao`, which **redirects** to the current repo **`wk-report`**. The push works through the redirect. **Do NOT run `git remote set-url`** — it's unnecessary and has been blocked/avoided on purpose. Live site + Pages API use **`HoangDuong-DH/wk-report`**.

2. **Pages build sometimes lags / doesn't pick up the newest commit.** After pushing, verify — and if the built commit is behind `main`, trigger a build manually:

```bash
# What commit is currently on the remote main?
gh api repos/HoangDuong-DH/wk-report/commits/main --jq '.sha[0:7]'

# What did Pages actually build last?
gh api repos/HoangDuong-DH/wk-report/pages/builds/latest --jq '{status:.status, commit:.commit[0:7]}'

# If Pages is behind, force a rebuild:
gh api --method POST repos/HoangDuong-DH/wk-report/pages/builds

# Poll until status == "built" (and commit matches main):
gh api repos/HoangDuong-DH/wk-report/pages/builds/latest --jq '{status:.status, commit:.commit[0:7]}'
```

3. **Live URLs** (all under the `/wk-report/` path prefix):
   - Hub: https://hoangduong-dh.github.io/wk-report/
   - Tiểu học: https://hoangduong-dh.github.io/wk-report/tieu-hoc.html
   - CTRC app: https://hoangduong-dh.github.io/wk-report/ctrc/index.html
   - Parent view: https://hoangduong-dh.github.io/wk-report/ctrc/parent.html#t=<token>

4. **Edge caching.** `index.html` self-cache-busts once per session; for others append `?v=<something>` when verifying a fresh deploy.

**New machine needs its own GitHub auth** to push: `gh auth login` (account `HoangDuong-DH`, or a collaborator with write access). Auth tokens are per-machine and are **not** stored in this repo — you must set them up on the new machine. This is the only "credential" required to continue development.

---

## 6. Keys, secrets & config — the honest picture

**There are ZERO secret keys in this repository, by design.** `ctrc/config.js` ships with empty strings, which means the app runs in **DEMO MODE** (all data in browser `localStorage`, no backend). So a fresh clone works immediately with **no keys at all**.

You only need keys if you want to turn on the two *optional* integrations:

### (a) Supabase (multi-device sync instead of localStorage)
Fill in `ctrc/config.js`:
```js
supabaseUrl:  'https://<project>.supabase.co',
supabaseAnonKey: 'eyJ...anon public key...',
```
The **anon key is public by design** (it's shipped in client JS and protected by Row-Level Security) — safe to put in `config.js`. Full setup (tables, RLS) is in `ctrc/SETUP.md`. There is currently **no Supabase project wired up**, so this is blank.

### (b) Claude AI (generate the parent message)
Two modes (see `ctrc/config.js → ai.mode`):
- **`edge` (recommended, secure):** deploy `ctrc/supabase/functions/generate/index.ts`, then
  `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...` — the key lives **server-side only**, never in the repo. Put the function URL in `config.js → edgeFnUrl`.
- **`direct` (quick, less secure):** open the app → **Cấu hình → AI** → paste your `sk-ant-...` key into the password field. It's stored **only in your browser's localStorage**, never committed.

### ⚠️ Why keys are NOT pasted into this file
This repo is **PUBLIC**. If a live `sk-ant-...` (or any private key) is committed here, GitHub secret-scanning + Anthropic will **auto-revoke it within minutes**, and bots will try to abuse it before that. So embedding a real key would *break* the very thing you want (a working setup) and is irreversible (it stays in git history). 

**To reproduce AI on the new setup:** just paste your Anthropic key at runtime via **Cấu hình → AI** (mode `direct`), or set it as the Supabase secret (mode `edge`). That's the intended, safe flow — no code change, no obstacle. If you also want Supabase, create a project and drop the URL+anon key into `config.js` per `ctrc/SETUP.md`.

> If you truly want a keys note that travels with you, keep it in a local, git-ignored file (e.g. `SECRETS.local.md`, already covered by `.gitignore` patterns) — never in a tracked file of a public repo.

---

## 7. Current state & recent history (as of 2026-07)

**Done & live (commit `c53719c`):**
- `tieu-hoc.html`: the "đánh giá theo lĩnh vực" (t-nl) table now **imports label + điểm chuẩn + điểm thực tế dynamically** from the file (was hardcoded max=209). Verified accurate against a real I.G L2 file.
- `ctrc/`: large UX pass — dashboard for Manager, speed accelerators (auto-advance, quick-approve, quick-attendance), skeleton/empty states, bottom nav on mobile, removed demo staff names, weekly AI synthesis (2 sessions → 1 week, editable), objectives imported from real SÁCH HOẠT ĐỘNG xlsx across 3 programs.

**Explicitly reverted (do NOT reintroduce unless asked):**
- A tone "reframe" of `tieu-hoc.html` (baseline framing banner, renaming the harsh level "Yếu" → friendly labels, softened auto-comments, amber instead of red). It was built, then the owner said **"không cần sửa, cho về bản trước"** and it was `git restore`d. Live is back to `c53719c`. Note for context: the literal "Yếu" is actually **dead code** (the `LEVELS` array + `refreshLevelScale()` are never rendered — no markup for `#level-bar`); the live parent-facing text comes from `autoCommentKTCB()` / `autoCommentTuDuy()` / `autoCommentDinhHuong()` (NOT the dead `autoCommentChung()`).

**Open question the owner may return to:**
- For the sample child (Ngọc Tú, I.G L2), **Tư duy = 1/60 (2%)** because the file's KẾT QỦA column is all 0 for mục 1–9. The import is *correct*; the number is genuinely in the file. Before shipping such a report, confirm with the owner whether that section is a real result or simply wasn't graded.

---

## 8. Data protection (non-negotiable)

- The reports handle **children's personal data** and cite **Nghị định 13/2023/NĐ-CP**. 
- **Never commit student data** (`uploads/*.xlsx`, `*.csv` with real names/scores, screenshots of reports) to this **public** repo. Keep sample/real data local; `.gitignore` excludes `uploads/` and pasted screenshots.
- Parent links use expiring tokens (`tokenTtlDays: 30` in `config.js`), and `delivery.includeLink:false` by default (parents dislike links).

---

## 9. Quick "am I set up?" checklist for the new machine

1. `git clone https://github.com/HoangDuong-DH/wk-report.git` (or via the `wonderkids-baocao` redirect).
2. `gh auth login` as `HoangDuong-DH` (or a write collaborator).
3. Serve locally (§4) and open `index.html` / `ctrc/index.html` — should work in demo mode with no keys.
4. (Optional) Paste an Anthropic key via **Cấu hình → AI** to enable AI generation.
5. Make a change → `git push origin main` → verify Pages build (§5).

You're now developing exactly as before. 🎯
