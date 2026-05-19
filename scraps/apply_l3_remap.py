"""Apply remap L3 vao mau-giao.html (giu 61 atomic, rescale max=108).
- Update header comment block
- Replace ATOMIC_CRITERIA_L3 array contents (skill/nhom remapped, weight rescaled)
- Keep DESCRIPTIONS_L3 as-is (descriptions per ma; remap khong doi ma -> desc van match)
"""
import re, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

target = r'C:/Users/Admin/Downloads/wks/mau-giao.html'

with open(target, 'r', encoding='utf-8') as f:
    html = f.read()
with open(r'C:/Users/Admin/Downloads/wks/scraps/atomic_l3_array.txt', 'r', encoding='utf-8') as f:
    l3_array = f.read().rstrip()

# 1. Header comment
old_header = '''/* ═══════════════════════════════════════════════════════════════
   ATOMIC SCORING L3 v2 — 61 tiêu chí, hệ số tuyến tính 6 mức
   Source: AUTOMIC-L3-PHAN-TAN-DUNG.xlsx (final format)
   Formula: điểm đạt = trọng số × hệ số nhân
     5→1.00 | 4→0.80 | 3→0.60 | 2→0.40 | 1→0.20 | 0→0.00
   Tổng max: 160 điểm — 14 câu (12×10 + 2×20 cho câu 13,14)
   Cột bổ sung: nhóm, bloom, difficulty, support (1-4)
   ═══════════════════════════════════════════════════════════════ */'''
new_header = '''/* ═══════════════════════════════════════════════════════════════
   ATOMIC SCORING L3 v3 — 61 tiêu chí, REMAPPED theo official rubric
   Source: AUTOMIC-L3-PHAN-TAN-DUNG.xlsx + Level 3 Hướng dẫn chấm thi đầu kỳ.docx
   Formula: điểm đạt = trọng số × hệ số nhân
     5→1.00 | 4→0.80 | 3→0.60 | 2→0.40 | 1→0.20 | 0→0.00
   Tổng max: 108 điểm — khớp official L3:
     Bài 1=5, Bài 2=9, Bài 3=11, Bài 4=4, Bài 5=6, Bài 6-11=4, Bài 12=5,
     Bài 13=22, Bài 14=22
   Nhom + skill primary remap theo OFFICIAL rubric (mỗi bài 1 skill chuẩn).
   ═══════════════════════════════════════════════════════════════ */'''
if old_header not in html:
    print('ERROR: old header not found'); sys.exit(1)
html = html.replace(old_header, new_header)

# 2. Replace atomic array
pattern = re.compile(r'const __ATOMIC_CRITERIA_L3 = \[\n.*?\n\];', re.DOTALL)
m = pattern.search(html)
if not m:
    print('ERROR: array not found'); sys.exit(1)
new_block = 'const __ATOMIC_CRITERIA_L3 = [\n' + l3_array + '\n];'
html = html[:m.start()] + new_block + html[m.end():]

with open(target, 'w', encoding='utf-8') as f:
    f.write(html)

print('Applied L3 remap to mau-giao.html')
print('Final size:', len(html))
