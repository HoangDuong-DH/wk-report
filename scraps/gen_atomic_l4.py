"""Generate ATOMIC_CRITERIA_L4 JS array from L4 xlsx.

Remap rules:
- nhom + skill primary: theo OFFICIAL rubric L4 (4 nhom chuan)
- weight: rescale = xlsx_weight × (official_max / 10) — match official max per Bai
- bloom + difficulty + support: keep tu xlsx
- Bai 13-14: moi atomic 1 dim (fluency/flexibility/originality/precision)
"""
import zipfile, re, sys, io
from xml.etree import ElementTree as ET

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

XLSX = r'C:/Users/Admin/Downloads/AUTOMIC - L4 - AN NGUYÊN.xlsx'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

# Official L4 mapping: Bai -> (nhom, primary_skill, max_diem)
BAI_MAP = {
    1:  ('Tư duy cơ bản',   'attention',    4),
    2:  ('Tư duy cơ bản',   'observation',  10),
    3:  ('Tư duy cơ bản',   'memory',       6),
    4:  ('Tư duy logic',    'understanding',6),
    5:  ('Tư duy logic',    'application',  8),
    6:  ('Tư duy logic',    'analysis',     4),
    7:  ('Tư duy logic',    'synthesis',    4),
    8:  ('Tư duy toán học', 'number',       4),
    9:  ('Tư duy toán học', 'geometry',     4),
    10: ('Tư duy toán học', 'measurement',  4),
    11: ('Tư duy toán học', 'pattern',      4),
    12: ('Tư duy toán học', 'data',         4),
    13: ('Tư duy sáng tạo', '__dim__',      20),
    14: ('Tư duy sáng tạo', '__dim__',      20),
}
# Bai 13-14 atomic-specific skill (4 dim)
DIM_MAP = {1:'fluency', 2:'flexibility', 3:'originality', 4:'precision'}

# Read xlsx
with zipfile.ZipFile(XLSX) as z:
    with z.open('xl/sharedStrings.xml') as f:
        ss = ET.fromstring(f.read().decode('utf-8'))
    strings = [''.join((t.text or '') for t in si.iter(NS+'t')) for si in ss.findall(NS+'si')]
    with z.open('xl/worksheets/sheet1.xml') as f:
        sh = ET.fromstring(f.read().decode('utf-8'))

# Parse rows -> dict {ma: {data}}
atomic_rows = []
for row in sh.findall('.//' + NS + 'row'):
    r = int(row.get('r'))
    if r == 1: continue  # header
    cells = {}
    for c in row.findall(NS+'c'):
        ref = c.get('r')
        col = re.match(r'([A-Z]+)', ref).group(1)
        t = c.get('t')
        v = c.find(NS+'v')
        val = v.text if v is not None else ''
        if t == 's' and val: val = strings[int(val)]
        cells[col] = val
    cau_raw = cells.get('A', '')
    if not cau_raw or 'Tổng' in cau_raw: continue
    try:
        cau = int(cau_raw)
    except:
        continue
    ma = cells.get('B', '').strip()
    if not re.match(r'^\d+\.\d+$', ma): continue
    label = cells.get('C', '').strip().replace('"', "'")
    try:
        weight_raw = float(cells.get('D', '0') or 0)
    except:
        weight_raw = 0
    bloom = cells.get('J', '').strip()
    difficulty = cells.get('K', '').strip()
    try:
        support = int(cells.get('I', '4') or 4)
    except:
        support = 4
    atomic_rows.append({
        'cau': cau, 'ma': ma, 'label': label,
        'weight_raw': weight_raw,
        'bloom': bloom, 'difficulty': difficulty, 'support': support,
    })

# Now remap per BAI_MAP
out = []
for r in atomic_rows:
    cau = r['cau']
    if cau not in BAI_MAP: continue
    nhom, primary_skill, max_diem = BAI_MAP[cau]
    # Rescale weight
    scale = max_diem / 10  # xlsx weights sum=10 per Bai (or 20 for 13-14)
    if cau in (13, 14): scale = max_diem / 20
    w = round(r['weight_raw'] * scale, 2)
    # Skill: nếu Bai 13-14, lấy dim từ ma
    if primary_skill == '__dim__':
        ma_idx = int(r['ma'].split('.')[1])
        skill = DIM_MAP.get(ma_idx, 'fluency')
    else:
        skill = primary_skill
    out.append({
        'cau': cau, 'ma': r['ma'], 'label': r['label'],
        'weight': w, 'skill': skill, 'nhom': nhom,
        'bloom': r['bloom'], 'difficulty': r['difficulty'], 'support': r['support'],
    })

# Verify sum per Bai
print('// Verification — sum weight per Bài:')
for i in range(1, 15):
    items = [x for x in out if x['cau'] == i]
    sum_w = sum(x['weight'] for x in items)
    target = BAI_MAP[i][2]
    ok = '✓' if abs(sum_w - target) < 0.01 else '✗'
    print(f'// Bài {i:2d}: {len(items)} atomic, sum={sum_w:.2f}, target={target} {ok}')
total = sum(x['weight'] for x in out)
print(f'// TOTAL: {total:.2f}đ across {len(out)} atomic')
print()

# Output as JS array
print('const __ATOMIC_CRITERIA_L4 = [')
for x in out:
    print(f"  {{cau:{x['cau']}, ma:\"{x['ma']}\", label:\"{x['label']}\", weight:{x['weight']}, skill:\"{x['skill']}\", nhom:\"{x['nhom']}\", bloom:\"{x['bloom']}\", difficulty:\"{x['difficulty']}\", support:{x['support']}}},")
print('];')
