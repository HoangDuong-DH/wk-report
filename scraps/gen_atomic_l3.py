"""Generate ATOMIC_CRITERIA_L3 JS array remapped theo official L3 rubric.

Source xlsx: AUTOMIC - L3 - PHAN TAN DUNG.xlsx
Rubric: Level 3 Hướng dẫn chấm thi đầu kỳ.docx

Remap rules:
- nhom + skill primary: theo OFFICIAL L3 (mỗi Bài 1 skill chuẩn)
- weight: rescale = xlsx_w × (official_max/10) — match official max per Bài
- bloom + difficulty + support: giữ từ xlsx
- Bài 13-14: mỗi atomic 1 dim (fluency/flexibility/originality/precision)

Note: L3 xlsx header ở R2 (không phải R1), atomic data từ R3.
"""
import zipfile, re, sys, io
from xml.etree import ElementTree as ET

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

XLSX = r'C:/Users/Admin/Downloads/AUTOMIC - L3 - PHAN TAN DUNG.xlsx'
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'

# Official L3 mapping: Bai -> (nhom, primary_skill, max_diem)
BAI_MAP = {
    1:  ('Tư duy cơ bản',   'attention',    5),
    2:  ('Tư duy cơ bản',   'observation',  9),
    3:  ('Tư duy cơ bản',   'memory',       11),
    4:  ('Tư duy logic',    'understanding',4),
    5:  ('Tư duy logic',    'application',  6),
    6:  ('Tư duy logic',    'analysis',     4),
    7:  ('Tư duy logic',    'synthesis',    4),
    8:  ('Tư duy toán học', 'number',       4),
    9:  ('Tư duy toán học', 'geometry',     4),
    10: ('Tư duy toán học', 'measurement',  4),
    11: ('Tư duy toán học', 'pattern',      4),
    12: ('Tư duy toán học', 'data',         5),
    13: ('Tư duy sáng tạo', '__dim__',      22),
    14: ('Tư duy sáng tạo', '__dim__',      22),
}
DIM_MAP = {1:'fluency', 2:'flexibility', 3:'originality', 4:'precision'}

with zipfile.ZipFile(XLSX) as z:
    with z.open('xl/sharedStrings.xml') as f:
        ss = ET.fromstring(f.read().decode('utf-8'))
    strings = [''.join((t.text or '') for t in si.iter(NS+'t')) for si in ss.findall(NS+'si')]
    with z.open('xl/worksheets/sheet1.xml') as f:
        sh = ET.fromstring(f.read().decode('utf-8'))

atomic_rows = []
for row in sh.findall('.//' + NS + 'row'):
    r = int(row.get('r'))
    if r <= 2: continue  # header rows
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
    skill_xlsx = cells.get('H', '').strip()  # FIX #4: preserve xlsx skill
    try:
        support = int(cells.get('I', '4') or 4)
    except:
        support = 4
    atomic_rows.append({
        'cau': cau, 'ma': ma, 'label': label,
        'weight_raw': weight_raw,
        'bloom': bloom, 'difficulty': difficulty, 'support': support,
        'skill_xlsx': skill_xlsx,
    })

# Compute sum_weight_raw per Bài for proper scale
sum_raw = {}
for r in atomic_rows:
    sum_raw[r['cau']] = sum_raw.get(r['cau'], 0) + r['weight_raw']

# Remap
out = []
for r in atomic_rows:
    cau = r['cau']
    if cau not in BAI_MAP: continue
    nhom, primary_skill, max_diem = BAI_MAP[cau]
    # Rescale weight using actual sum_raw (xlsx có thể ≠ 10 ở một số bài)
    raw_total = sum_raw[cau] or 1
    scale = max_diem / raw_total
    w = round(r['weight_raw'] * scale, 2)
    if primary_skill == '__dim__':
        ma_idx = int(r['ma'].split('.')[1])
        skill = DIM_MAP.get(ma_idx, 'fluency')
    else:
        skill = primary_skill
    out.append({
        'cau': cau, 'ma': r['ma'], 'label': r['label'],
        'weight': w, 'skill': skill, 'nhom': nhom,
        'bloom': r['bloom'], 'difficulty': r['difficulty'], 'support': r['support'],
        'skill_xlsx': r['skill_xlsx'],
    })

# Verify
print('// Verification — sum weight per Bài:')
for i in range(1, 15):
    items = [x for x in out if x['cau'] == i]
    if not items: continue
    sum_w = sum(x['weight'] for x in items)
    target = BAI_MAP[i][2]
    ok = '✓' if abs(sum_w - target) < 0.05 else '✗'
    print(f'// Bài {i:2d}: {len(items)} atomic, sum={sum_w:.2f}, target={target} {ok}')
total = sum(x['weight'] for x in out)
print(f'// TOTAL: {total:.2f}đ across {len(out)} atomic')
print()

print('const __ATOMIC_CRITERIA_L3 = [')
for x in out:
    sk_x = (x.get('skill_xlsx') or '').replace('"', "'")
    print(f"  {{cau:{x['cau']}, ma:\"{x['ma']}\", label:\"{x['label']}\", weight:{x['weight']}, skill:\"{x['skill']}\", skill_xlsx:\"{sk_x}\", nhom:\"{x['nhom']}\", bloom:\"{x['bloom']}\", difficulty:\"{x['difficulty']}\", support:{x['support']}}},")
print('];')
