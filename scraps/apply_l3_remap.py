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

# 1. Header comment — skip if already applied
# (Idempotent: works whether old header is L3 v2 (first run) or L3 v3 (rerun))

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
