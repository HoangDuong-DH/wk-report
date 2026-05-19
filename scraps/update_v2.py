"""Update mau-giao.html sang format v2:
   - Replace __ATOMIC_MULTIPLIER_L3 + __ATOMIC_CRITERIA_L3
   - Update UI: 6 mức buttons (5/4/3/2/1/0)
   - Update batch parser cho new format
   - Update legend
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

target = r'C:/Users/Admin/Downloads/wks/mau-giao.html'
v2_path = r'C:/Users/Admin/Downloads/wks/scraps/atomic_l3_v2_data.js'

with open(target, 'r', encoding='utf-8') as f:
    html = f.read()

with open(v2_path, 'r', encoding='utf-8') as f:
    v2_data = f.read()

# 1. Replace old MULTIPLIER + CRITERIA + DESCRIPTIONS blocks with new
old_start = html.find('/* ═══════════════════════════════════════════════════════════════\n   ATOMIC SCORING L3 — 63 tiêu chí')
if old_start < 0:
    print('ERROR: old atomic block not found'); sys.exit(1)
# Find end of old block — after __ATOMIC_DESCRIPTIONS_L3 closing };
desc_end = html.find('};', html.find('const __ATOMIC_DESCRIPTIONS_L3 = {'))
if desc_end < 0:
    print('ERROR: descriptions end not found'); sys.exit(1)
desc_end += 2  # include };

# Keep descriptions for tooltip (old 5-level, will note mức 1 fallback)
old_desc_start = html.find('const __ATOMIC_DESCRIPTIONS_L3 = {')

# Replace the block from header → end of CRITERIA (before DESCRIPTIONS)
crit_end_pattern = re.compile(r'const __ATOMIC_CRITERIA_L3 = \[[\s\S]*?\];\n')
match = crit_end_pattern.search(html, old_start)
if not match:
    print('ERROR: CRITERIA array not found'); sys.exit(1)
crit_end = match.end()

# New block: v2 multiplier + criteria
# Keep DESCRIPTIONS from old (will use as tooltip fallback)
html = html[:old_start] + v2_data + '\n' + html[crit_end:]

# 2. Update UI button levels — change [5,4,3,2,0] to [5,4,3,2,1,0]
# In _buildAtomicUI_MG()
html = html.replace(
    "[5,4,3,2,0].forEach(lvl => {\n        const active = __atomicScoresMG[c.ma] === lvl ? 'active' : '';\n        html += '<button class=\"'+active+'\" data-lvl=\"'+lvl+'\" onclick=\"_pickAtomicLevel_MG(\\\\''+c.ma+'\\\\','+lvl+')\">'+lvl+'</button>';\n      });",
    "__ATOMIC_LEVELS_L3.forEach(lvl => {\n        const active = __atomicScoresMG[c.ma] === lvl ? 'active' : '';\n        html += '<button class=\"'+active+'\" data-lvl=\"'+lvl+'\" onclick=\"_pickAtomicLevel_MG(\\\\''+c.ma+'\\\\','+lvl+')\">'+lvl+'</button>';\n      });"
)

# 3. Update help popup [5,4,3,2,0] → [5,4,3,2,1,0]
# In _showAtomicHelp_MG
html = re.sub(
    r"\[5,4,3,2,0\]\.forEach\(lvl => \{\s*lines\.push\('Mức '",
    "[5,4,3,2,1,0].forEach(lvl => {\n    lines.push('Mức '",
    html
)

# 4. Update legend HTML — add mức 1 button
old_legend = '''    <span class="lvl" data-l="5"><b>5</b> Hoàn hảo</span>
    <span class="lvl" data-l="4"><b>4</b> Tốt</span>
    <span class="lvl" data-l="3"><b>3</b> Khá</span>
    <span class="lvl" data-l="2"><b>2</b> Hỗ trợ</span>
    <span class="lvl" data-l="0"><b>0</b> Chưa</span>'''
new_legend = '''    <span class="lvl" data-l="5"><b>5</b> Hoàn hảo</span>
    <span class="lvl" data-l="4"><b>4</b> Tốt</span>
    <span class="lvl" data-l="3"><b>3</b> Khá</span>
    <span class="lvl" data-l="2"><b>2</b> Hỗ trợ</span>
    <span class="lvl" data-l="1"><b>1</b> Cần nhiều</span>
    <span class="lvl" data-l="0"><b>0</b> Chưa</span>'''
html = html.replace(old_legend, new_legend)

# 5. Update CSS for mức 1 button color (giữa C và L: nâu nhạt)
old_css = '.atomic-table .levels button.active[data-lvl="0"]{background:var(--g-L);color:#fff;border-color:var(--g-L)}'
new_css = '''.atomic-table .levels button.active[data-lvl="1"]{background:#c84818;color:#fff;border-color:#c84818}
.atomic-table .levels button.active[data-lvl="0"]{background:var(--g-L);color:#fff;border-color:var(--g-L)}'''
html = html.replace(old_css, new_css)

# Also add legend color for mức 1
old_legend_css = '.atomic-legend .lvl[data-l="0"] b{background:var(--g-L)}'
new_legend_css = '''.atomic-legend .lvl[data-l="1"] b{background:#c84818}
.atomic-legend .lvl[data-l="0"] b{background:var(--g-L)}'''
html = html.replace(old_legend_css, new_legend_css)

# 6. Update batch parser cho format mới
# Old: tìm sheet "2.Thông tin HS" + "3.Nhập atomic"
# New: 1 sheet duy nhất, tên = student name + year
old_parser = '''  // Sheet "2.Thông tin HS" — info fields
  const infoSheet = wb.Sheets['2.Thông tin HS'] || wb.Sheets[wb.SheetNames.find(n => /thông tin/i.test(n))];
  if(infoSheet){
    const rows = XLSX.utils.sheet_to_json(infoSheet, {header:1, defval:''});
    rows.forEach(r => {
      if(!r || !r[0] || !r[1]) return;
      const label = String(r[0]).toLowerCase().trim();
      const value = String(r[1]).trim();
      if(label.includes('họ và tên') || label === 'tên') info.name = value;
      else if(label.includes('giới tính')) info.sex = value;
      else if(label.includes('ngày sinh') || label.includes('năm sinh')){
        // Extract year
        const m = value.match(/(\\\\d{4})/);
        if(m) info.yob = m[1];
      }
      else if(label.includes('lớp')) info.class = value;
      else if(label.includes('ngày đánh giá')) info.date = value;
      else if(label.includes('giáo viên')) info.teacher = value;
    });
  }

  // Sheet "3.Nhập atomic" — 63 atomic scores
  const atomicSheet = wb.Sheets['3.Nhập atomic'] || wb.Sheets[wb.SheetNames.find(n => /nhập atomic/i.test(n))];
  if(atomicSheet){
    const rows = XLSX.utils.sheet_to_json(atomicSheet, {header:1, defval:''});
    rows.forEach(r => {
      if(!r || r.length < 5) return;
      const ma = String(r[1] || '').trim();
      const muc = r[4];
      if(!ma || !/^\\\\d+\\\\.\\\\d+$/.test(ma)) return;
      const lvl = parseInt(muc, 10);
      if([5,4,3,2,0].includes(lvl)) scores[ma] = lvl;
    });
  }'''

new_parser = '''  // Format v2: 1 sheet duy nhất, tên = "P.T. DŨNG 2021" (tên + năm sinh)
  const sheetName = wb.SheetNames[0];
  // Extract name + yob từ tên sheet
  const yobMatch = sheetName.match(/(\\\\d{4})/);
  if(yobMatch){
    info.yob = yobMatch[1];
    info.name = sheetName.replace(/\\\\d{4}/, '').replace(/[_\\\\-]+/g, ' ').trim();
  } else {
    info.name = sheetName.trim();
  }

  // Parse atomic scores từ sheet đó
  const atomicSheet = wb.Sheets[sheetName];
  if(atomicSheet){
    const rows = XLSX.utils.sheet_to_json(atomicSheet, {header:1, defval:''});
    rows.forEach(r => {
      if(!r || r.length < 5) return;
      const ma = String(r[1] || '').trim();
      const muc = r[4];
      if(!ma || !/^\\\\d+\\\\.\\\\d+$/.test(ma)) return;
      if(muc === '' || muc === null || muc === undefined) return;
      const lvl = parseInt(muc, 10);
      if([5,4,3,2,1,0].includes(lvl)) scores[ma] = lvl;
    });
  }

  // Backward compat: nếu có sheet "2.Thông tin HS" (format cũ), parse thêm info
  const oldInfoSheet = wb.Sheets['2.Thông tin HS'];
  if(oldInfoSheet){
    const rows = XLSX.utils.sheet_to_json(oldInfoSheet, {header:1, defval:''});
    rows.forEach(r => {
      if(!r || !r[0] || !r[1]) return;
      const label = String(r[0]).toLowerCase().trim();
      const value = String(r[1]).trim();
      if(label.includes('họ và tên') || label === 'tên') info.name = info.name || value;
      else if(label.includes('giới tính')) info.sex = value;
      else if(label.includes('năm sinh')){
        const m = value.match(/(\\\\d{4})/);
        if(m) info.yob = info.yob || m[1];
      }
      else if(label.includes('lớp')) info.class = value;
      else if(label.includes('ngày đánh giá')) info.date = value;
      else if(label.includes('giáo viên')) info.teacher = value;
    });
  }'''

html = html.replace(old_parser, new_parser)

# 7. Update min threshold to accept files (cần ≥30 atomic was 30 vs new 61 total)
html = html.replace('if(Object.keys(scores).length < 30){', 'if(Object.keys(scores).length < 20){')

# 8. Update _showAtomicHelp_MG description fallback
# When mức 1 is selected, descriptions don't have it → show "(Trung gian giữa mức 0 và mức 2)"
# Find the function
old_help = '''  [5,4,3,2,1,0].forEach(lvl => {
    lines.push('Mức ' + lvl + ': ' + (d[lvl] || '—'));
  });'''
new_help = '''  [5,4,3,2,1,0].forEach(lvl => {
    let descText = d[lvl];
    if(lvl === 1 && !descText) descText = '(Trung gian giữa mức 0 và mức 2 — bé có nỗ lực nhưng cần hỗ trợ nhiều)';
    lines.push('Mức ' + lvl + ': ' + (descText || '—'));
  });'''
html = html.replace(old_help, new_help)

with open(target, 'w', encoding='utf-8') as f:
    f.write(html)

print('Updated mau-giao.html to v2 format')
print('Final size:', len(html))
