"""Apply L4 atomic data to mau-giao-l4.html.

Steps:
1. Replace header comment block (L3 -> L4 metadata)
2. Replace __ATOMIC_CRITERIA_L3 array contents (L3 61 atomic -> L4 65 atomic)
3. Replace __ATOMIC_DESCRIPTIONS_L3 with empty object (L4 descriptions TBD)
4. Update HTML title + level chip
"""
import re, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

target = r'C:/Users/Admin/Downloads/wks/mau-giao-l4.html'

with open(target, 'r', encoding='utf-8') as f:
    html = f.read()

with open(r'C:/Users/Admin/Downloads/wks/scraps/atomic_l4_array.txt', 'r', encoding='utf-8') as f:
    l4_array = f.read().rstrip()

# 1. Update header comment block
old_header = '''/* ═══════════════════════════════════════════════════════════════
   ATOMIC SCORING L3 v2 — 61 tiêu chí, hệ số tuyến tính 6 mức
   Source: AUTOMIC-L3-PHAN-TAN-DUNG.xlsx (final format)
   Formula: điểm đạt = trọng số × hệ số nhân
     5→1.00 | 4→0.80 | 3→0.60 | 2→0.40 | 1→0.20 | 0→0.00
   Tổng max: 160 điểm — 14 câu (12×10 + 2×20 cho câu 13,14)
   Cột bổ sung: nhóm, bloom, difficulty, support (1-4)
   ═══════════════════════════════════════════════════════════════ */'''
new_header = '''/* ═══════════════════════════════════════════════════════════════
   ATOMIC SCORING L4 — 65 tiêu chí, remapped theo official rubric
   Source: AUTOMIC-L4-AN-NGUYEN.xlsx + Level 4 Hướng dẫn chấm điểm.docx
   Formula: điểm đạt = trọng số × hệ số nhân
     5→1.00 | 4→0.80 | 3→0.60 | 2→0.40 | 1→0.20 | 0→0.00
   Tổng max: 102 điểm — khớp với official L4:
     Bài 1=4, Bài 2=10, Bài 3=6, Bài 4=6, Bài 5=8, Bài 6-11=4, Bài 12=4,
     Bài 13=20, Bài 14=20
   Nhom + skill primary remap theo OFFICIAL rubric (mỗi bài 1 skill chuẩn).
   ═══════════════════════════════════════════════════════════════ */'''
if old_header not in html:
    print('ERROR: old header block not found'); sys.exit(1)
html = html.replace(old_header, new_header)

# 2. Replace ATOMIC_CRITERIA array content
# Find: const __ATOMIC_CRITERIA_L3 = [ ... ];
pattern_crit = re.compile(r'const __ATOMIC_CRITERIA_L3 = \[\n.*?\n\];', re.DOTALL)
m = pattern_crit.search(html)
if not m:
    print('ERROR: ATOMIC_CRITERIA_L3 block not found'); sys.exit(1)
new_crit = 'const __ATOMIC_CRITERIA_L3 = [\n' + l4_array + '\n];'
html = html[:m.start()] + new_crit + html[m.end():]

# 3. Replace DESCRIPTIONS with empty object (descriptions will be added later)
pattern_desc = re.compile(r'const __ATOMIC_DESCRIPTIONS_L3 = \{\n.*?\n\};', re.DOTALL)
m = pattern_desc.search(html)
if not m:
    print('ERROR: ATOMIC_DESCRIPTIONS_L3 block not found'); sys.exit(1)
new_desc = '''const __ATOMIC_DESCRIPTIONS_L3 = {
  // L4 descriptions chưa được biên soạn — tooltip hiện sẽ rỗng.
  // TODO: nếu cần, generate từ official rubric L4 cho từng atomic.
};'''
html = html[:m.start()] + new_desc + html[m.end():]

# 4. Update title + level chip
html = html.replace(
    '<title>WonderKids — Báo cáo đánh giá năng lực tư duy</title>',
    '<title>WonderKids — Báo cáo L4 — Đánh giá năng lực tư duy</title>'
)
# Update auto cache-bust session key to avoid collision with L3
html = html.replace("'wk-fresh-session-mg'", "'wk-fresh-session-mg-l4'")

with open(target, 'w', encoding='utf-8') as f:
    f.write(html)

print('Applied L4 data to mau-giao-l4.html')
print('Final size:', len(html), 'chars')
