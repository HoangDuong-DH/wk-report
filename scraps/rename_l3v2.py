"""Rename L4-specific strings to L3 trong mau-giao-l3-v2.html.

Giu nguyen:
- Toan bo logic + data model (14 bai + 5 WK + thang H identical)
- Layout pastel-warm
- Production toolbar features

Replace L4-facing strings:
- Title: 'L4 – DIAGNOSTIC ASSESSMENT (5 TUỔI)' -> 'L3 – DIAGNOSTIC ASSESSMENT (4 TUỔI)'
- Logo: 'L4' -> 'L3'
- localStorage keys: 'mg-l4v2-*' -> 'mg-l3v2-*' (avoid collision)
- Default lop: 'L4' -> 'L3'
- Description meta, console logs, etc.
"""
import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

target = r'C:/Users/Admin/Downloads/wks/mau-giao-l3-v2.html'

with open(target, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Title / header text
replacements = [
    # Title
    ('<title>WonderKids L4 v2 — Báo cáo đánh giá năng lực đầu vào</title>',
     '<title>WonderKids L3 v2 — Báo cáo đánh giá năng lực đầu vào</title>'),
    # Logo big text
    ('<span class="big">L4</span>',
     '<span class="big">L3</span>'),
    # Diagnostic subtitle
    ('L4 – DIAGNOSTIC ASSESSMENT (5 TUỔI)',
     'L3 – DIAGNOSTIC ASSESSMENT (4 TUỔI)'),
    # Default class input
    ('<input class="input" id="f-class" value="L4">',
     '<input class="input" id="f-class" value="L3">'),
    # Default year of birth (L3 = 4 tuoi → 2021)
    ('<input class="input" id="f-dob" value="2020">',
     '<input class="input" id="f-dob" value="2021">'),
    # Demo info
    ("class:'L4'",
     "class:'L3'"),
    ("dob:'01/01/2020'",
     "dob:'01/01/2021'"),
    # localStorage keys (avoid clash with L4)
    ("'mg-l4v2-scores'", "'mg-l3v2-scores'"),
    ("'mg-l4v2-info'", "'mg-l3v2-info'"),
    ("'mg-l4v2-edits'", "'mg-l3v2-edits'"),
    ("'mg-l4v2-parent'", "'mg-l3v2-parent'"),
    # Backup filename prefix
    ("'l4v2-backup-'", "'l3v2-backup-'"),
    # Template filename
    ("'WonderKids_L4v2_Template_'", "'WonderKids_L3v2_Template_'"),
    # Backup type marker
    ("'mau-giao-l4-v2'", "'mau-giao-l3-v2'"),
    # Watermark print
    ('CONFIDENTIAL — WONDERKIDS L4',
     'CONFIDENTIAL — WONDERKIDS L3'),
    # Toast/log messages
    ("'Cách tính'+", "'Cách tính'+"),
]

# Favicon (replace L4 SVG text → L3)
old_favicon = "<text x='32' y='42' font-family='Arial' font-size='26' font-weight='900' fill='%23fff' text-anchor='middle'>L4</text>"
new_favicon = "<text x='32' y='42' font-family='Arial' font-size='26' font-weight='900' fill='%23fff' text-anchor='middle'>L3</text>"
if old_favicon in html:
    html = html.replace(old_favicon, new_favicon)
    print('  ✓ Favicon SVG L4 -> L3')

count = 0
for old, new in replacements:
    if old in html:
        cnt_before = html.count(old)
        html = html.replace(old, new)
        count += cnt_before
        print(f'  ✓ Replaced {cnt_before}x: {old[:60]}...')
    else:
        print(f'  ✗ NOT FOUND: {old[:60]}...')

print(f'\nTotal replacements: {count}')

with open(target, 'w', encoding='utf-8') as f:
    f.write(html)
print(f'Saved {len(html)} chars')
