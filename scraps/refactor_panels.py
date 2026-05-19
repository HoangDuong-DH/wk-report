"""Refactor mau-giao.html — base panels on real ATOMIC data:
   1. Remove ABS panel (no base in data)
   2. HỖ TRỢ panel → 4 bậc (Mức độ hỗ trợ 1-4 từ data)
   3. BLOOM panel → split thành 2: Cấp Bloom (5 levels) + Mức độ khó (3 levels)
   4. Mini radar mỗi nhóm dùng nhánh năng lực con (3-5 axes per group)
   5. Aggregator tính supportSum, bloomSum, difficultySum từ atomic
"""
import sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

target = r'C:/Users/Admin/Downloads/wks/mau-giao.html'
with open(target, 'r', encoding='utf-8') as f:
    html = f.read()

# ─── 1. Replace section 2 HTML (3 panels: HỖ TRỢ + Bloom + Difficulty) ───
new_panels_html = '''      <!-- HỖ TRỢ: 4 bậc dựa vào cột "Mức độ hỗ trợ" trong data atomic -->
      <div class="insight-panel channel-panel">
        <h3><span class="chip">HỖ TRỢ</span>Mức độ hỗ trợ bé cần khi làm bài</h3>
        <div class="insight-split">
          <div>
            <table class="insight-table" id="mg-support-table">
              <thead><tr><th>Mức</th><th>Mô tả</th><th>Thực tế</th><th>Tỷ lệ</th></tr></thead>
              <tbody></tbody>
            </table>
            <div class="insight-help" id="mg-support-highlight">
              <p><b>Điểm nổi bật:</b> —</p>
            </div>
          </div>
          <svg id="mg-support-chart" class="insight-chart" viewBox="0 0 360 240"></svg>
        </div>
      </div>

      <!-- CẤP BLOOM: 5 cấp (Nhận biết / Hiểu / Ứng dụng / Phân tích / Sáng tạo) -->
      <div class="insight-panel metric-panel">
        <h3><span class="chip">BLOOM</span>Năng lực theo cấp độ Bloom</h3>
        <div class="insight-split">
          <div>
            <table class="insight-table" id="mg-bloom-table">
              <thead><tr><th>Cấp độ</th><th>Số câu</th><th>Tỷ lệ</th></tr></thead>
              <tbody></tbody>
            </table>
            <div class="insight-help" id="mg-bloom-highlight">
              <p><b>Điểm nổi bật:</b> —</p>
            </div>
          </div>
          <svg id="mg-bloom-chart" class="insight-chart" viewBox="0 0 360 260"></svg>
        </div>
      </div>

      <!-- MỨC ĐỘ KHÓ: 3 cấp (Dễ / Trung bình / Khó) -->
      <div class="insight-panel metric-panel">
        <h3><span class="chip">ĐỘ KHÓ</span>Phân tích theo mức độ khó</h3>
        <div class="insight-split">
          <div>
            <table class="insight-table" id="mg-difficulty-table">
              <thead><tr><th>Mức</th><th>Số câu</th><th>Tỷ lệ</th></tr></thead>
              <tbody></tbody>
            </table>
            <div class="insight-help" id="mg-difficulty-highlight">
              <p><b>Điểm nổi bật:</b> —</p>
            </div>
          </div>
          <svg id="mg-difficulty-chart" class="insight-chart" viewBox="0 0 360 200"></svg>
        </div>
      </div>'''

# Find and replace from ABS panel to closing of BLOOM panel (the 3 old panels block)
old_panels_pattern = re.compile(
    r'<div class="insight-panel metric-panel">\s*<h3><span class="chip">ABS.*?</div>\s*</div>\s*<div class="insight-panel channel-panel">.*?</div>\s*</div>\s*<div class="insight-panel metric-panel">\s*<h3><span class="chip">BLOOM.*?</div>\s*</div>',
    re.DOTALL
)
match = old_panels_pattern.search(html)
if match:
    html = html[:match.start()] + new_panels_html + html[match.end():]
    print('✓ Replaced 3 old panels with new 3 panels')
else:
    print('✕ Old panels not found')
    sys.exit(1)

# ─── 2. Update aggregateAtomicMG — add supportSum, bloomSum, difficultySum ───
new_aggregator = '''// Aggregate atomic scores → 16 skills (per dataKey)
function aggregateAtomicMG(scores){
  scores = scores || __atomicScoresMG;
  const skillSum = {};   // {observation: {score: X, max: Y}}
  const cauSum = {};     // {1: {score: X, max: 10}, ...}
  const supportSum = {1:{score:0,max:0,count:0,filled:0}, 2:{score:0,max:0,count:0,filled:0},
                      3:{score:0,max:0,count:0,filled:0}, 4:{score:0,max:0,count:0,filled:0}};
  const bloomSum = {};   // {bloom_label: {score, max, count}}
  const difficultySum = {Dễ:{score:0,max:0,count:0,filled:0},
                         'Trung bình':{score:0,max:0,count:0,filled:0},
                         Khó:{score:0,max:0,count:0,filled:0}};
  __ATOMIC_CRITERIA_L3.forEach(c => {
    const lvl = scores[c.ma];
    const point = lvl != null ? _atomicPointMG(c.ma, lvl) : 0;
    const scored = lvl != null;
    // Per-skill
    if(!skillSum[c.skill]) skillSum[c.skill] = {score:0, max:0, count:0};
    skillSum[c.skill].score += point;
    skillSum[c.skill].max += c.weight;
    skillSum[c.skill].count++;
    // Per-câu
    if(!cauSum[c.cau]) cauSum[c.cau] = {score:0, max:0, filled:0, total:0};
    cauSum[c.cau].score += point;
    cauSum[c.cau].max += c.weight;
    cauSum[c.cau].total++;
    if(scored) cauSum[c.cau].filled++;
    // Per-support (1-4)
    if(c.support && supportSum[c.support]){
      supportSum[c.support].score += point;
      supportSum[c.support].max += c.weight;
      supportSum[c.support].count++;
      if(scored) supportSum[c.support].filled++;
    }
    // Per-bloom
    const bloomKey = c.bloom ? c.bloom.trim() : '';
    if(bloomKey){
      if(!bloomSum[bloomKey]) bloomSum[bloomKey] = {score:0, max:0, count:0, filled:0};
      bloomSum[bloomKey].score += point;
      bloomSum[bloomKey].max += c.weight;
      bloomSum[bloomKey].count++;
      if(scored) bloomSum[bloomKey].filled++;
    }
    // Per-difficulty
    const diffKey = c.difficulty ? c.difficulty.trim() : '';
    if(diffKey && difficultySum[diffKey]){
      difficultySum[diffKey].score += point;
      difficultySum[diffKey].max += c.weight;
      difficultySum[diffKey].count++;
      if(scored) difficultySum[diffKey].filled++;
    }
  });

  // Compute pct for each
  for(const k in skillSum){
    const s = skillSum[k];
    s.pct = s.max ? Math.round(s.score / s.max * 100) : 0;
    s.grade = _pctToGradeMG(s.pct);
  }
  for(const k in supportSum){
    const s = supportSum[k];
    s.pct = s.max ? Math.round(s.score / s.max * 100) : 0;
  }
  for(const k in bloomSum){
    const s = bloomSum[k];
    s.pct = s.max ? Math.round(s.score / s.max * 100) : 0;
  }
  for(const k in difficultySum){
    const s = difficultySum[k];
    s.pct = s.max ? Math.round(s.score / s.max * 100) : 0;
  }

  // Per-lĩnh vực (4 nhóm)
  const fieldMap = {
    'basic':['attention','observation','memory'],
    'math':['number','geometry','measurement','pattern','data'],
    'logic':['understanding','application','analysis','synthesis'],
    'creative':['fluency','flexibility','originality','precision'],
  };
  const fields = {};
  for(const f in fieldMap){
    let sc=0, mx=0;
    fieldMap[f].forEach(sk => {
      if(skillSum[sk]){ sc += skillSum[sk].score; mx += skillSum[sk].max; }
    });
    fields[f] = {score:sc, max:mx, pct: mx ? Math.round(sc/mx*100) : 0};
    fields[f].grade = _pctToGradeMG(fields[f].pct);
  }
  const totalScore = Object.values(skillSum).reduce((a,s)=>a+s.score,0);
  const totalMax = Object.values(skillSum).reduce((a,s)=>a+s.max,0);
  return {
    skillSum, cauSum, fields, supportSum, bloomSum, difficultySum,
    skillGrades: skillSum,
    total: {score: totalScore, max: totalMax, pct: totalMax ? Math.round(totalScore/totalMax*100) : 0},
  };
}'''

# Replace old aggregateAtomicMG function
old_agg_pattern = re.compile(
    r'// Aggregate atomic scores → 16 skills.*?\n}',
    re.DOTALL
)
match = old_agg_pattern.search(html)
if match:
    html = html[:match.start()] + new_aggregator + html[match.end():]
    print('✓ Replaced aggregateAtomicMG')
else:
    print('✕ Old aggregator not found')
    sys.exit(1)

# ─── 3. Add new render functions for 3 panels ───
new_renderers = '''

// Map support level → friendly label
const __SUPPORT_LABELS_MG = {
  4: 'Tự làm sau khi nghe đề 1 lần',
  3: 'Cần đọc lại đề 2 lần',
  2: 'Cần gợi ý nhẹ',
  1: 'Cần hướng dẫn từng bước',
};

function renderSupportAnalyticsMG(){
  const agg = aggregateAtomicMG();
  const tbody = document.querySelector('#mg-support-table tbody');
  if(tbody){
    let html = '';
    [4,3,2,1].forEach(lvl => {
      const s = agg.supportSum[lvl] || {score:0,max:0,count:0,pct:0};
      const score = Math.round(s.score*10)/10;
      html += '<tr><td class="code">' + lvl + '</td>';
      html += '<td>' + _escHtmlMG(__SUPPORT_LABELS_MG[lvl]) + '</td>';
      html += '<td class="num">' + score + '/' + s.max + '</td>';
      html += '<td>' + _pctBadgeMG(s.pct) + '</td></tr>';
    });
    tbody.innerHTML = html;
  }
  const svg = document.getElementById('mg-support-chart');
  if(svg){
    const rows = [4,3,2,1].map(lvl => ({
      label: __SUPPORT_LABELS_MG[lvl],
      pct: agg.supportSum[lvl]?.pct || 0,
      level: lvl,
    }));
    svg.innerHTML = _barSvgMG(rows, {h:240, rowH:48});
  }
  // Highlight
  const hi = document.getElementById('mg-support-highlight');
  if(hi){
    const rows = [4,3,2,1].map(lvl => ({lvl, ...(agg.supportSum[lvl]||{})}));
    const filledOnly = rows.filter(r => r.count > 0);
    const best = [...filledOnly].sort((a,b)=>(b.pct||0)-(a.pct||0))[0];
    const weak = [...filledOnly].sort((a,b)=>(a.pct||0)-(b.pct||0))[0];
    if(best){
      hi.innerHTML = '<p><b>Điểm nổi bật:</b> bé mạnh nhất ở mức <b>' + best.lvl +
                     ' (' + _escHtmlMG(__SUPPORT_LABELS_MG[best.lvl]) + ')</b> đạt ' +
                     Math.round(best.pct) + '%. Mức cần luyện thêm: <b>' + weak.lvl + '</b> ' +
                     Math.round(weak.pct) + '%.</p>';
    }
  }
}

function renderBloomAnalyticsMG(){
  const agg = aggregateAtomicMG();
  const order = ['Nhận biết','Hiểu','Ứng dụng','Phân tích','Sáng tạo','Sáng tạo '];
  const seen = new Set();
  const bloomOrdered = order.filter(o => {
    const trimmed = o.trim();
    if(seen.has(trimmed)) return false;
    seen.add(trimmed);
    return agg.bloomSum[trimmed] || agg.bloomSum[o];
  }).map(o => o.trim());
  // Include any other bloom keys not in standard order
  for(const k in agg.bloomSum){
    if(!seen.has(k.trim())){ bloomOrdered.push(k); seen.add(k.trim()); }
  }
  const tbody = document.querySelector('#mg-bloom-table tbody');
  if(tbody){
    let html = '';
    bloomOrdered.forEach(k => {
      const s = agg.bloomSum[k] || {count:0, pct:0};
      html += '<tr><td>' + _escHtmlMG(k) + '</td>';
      html += '<td class="num">' + (s.count||0) + '</td>';
      html += '<td>' + _pctBadgeMG(s.pct) + '</td></tr>';
    });
    tbody.innerHTML = html;
  }
  const svg = document.getElementById('mg-bloom-chart');
  if(svg){
    const rows = bloomOrdered.map(k => ({
      label: k,
      pct: agg.bloomSum[k]?.pct || 0,
      count: agg.bloomSum[k]?.count || 0,
    }));
    svg.innerHTML = _barSvgMG(rows, {h:260, rowH:48});
  }
  const hi = document.getElementById('mg-bloom-highlight');
  if(hi){
    const all = bloomOrdered.map(k => ({k, ...(agg.bloomSum[k]||{})})).filter(r => r.count);
    const best = [...all].sort((a,b)=>(b.pct||0)-(a.pct||0))[0];
    const weak = [...all].sort((a,b)=>(a.pct||0)-(b.pct||0))[0];
    if(best && weak){
      hi.innerHTML = '<p><b>Điểm nổi bật:</b> cấp <b>' + _escHtmlMG(best.k) + '</b> đạt ' +
                     Math.round(best.pct) + '%; thấp nhất là <b>' + _escHtmlMG(weak.k) + '</b> (' +
                     Math.round(weak.pct) + '%).</p>';
    }
  }
}

function renderDifficultyAnalyticsMG(){
  const agg = aggregateAtomicMG();
  const order = ['Khó','Trung bình','Dễ'];
  const tbody = document.querySelector('#mg-difficulty-table tbody');
  if(tbody){
    let html = '';
    order.forEach(k => {
      const s = agg.difficultySum[k] || {count:0, pct:0};
      html += '<tr><td>' + _escHtmlMG(k) + '</td>';
      html += '<td class="num">' + (s.count||0) + '</td>';
      html += '<td>' + _pctBadgeMG(s.pct) + '</td></tr>';
    });
    tbody.innerHTML = html;
  }
  const svg = document.getElementById('mg-difficulty-chart');
  if(svg){
    const rows = order.map(k => ({
      label: k,
      pct: agg.difficultySum[k]?.pct || 0,
    }));
    svg.innerHTML = _barSvgMG(rows, {h:200, rowH:50});
  }
  const hi = document.getElementById('mg-difficulty-highlight');
  if(hi){
    const all = order.map(k => ({k, ...(agg.difficultySum[k]||{})})).filter(r => r.count);
    const best = [...all].sort((a,b)=>(b.pct||0)-(a.pct||0))[0];
    const weak = [...all].sort((a,b)=>(a.pct||0)-(b.pct||0))[0];
    if(best && weak){
      hi.innerHTML = '<p><b>Điểm nổi bật:</b> mức <b>' + _escHtmlMG(best.k) + '</b> đạt ' +
                     Math.round(best.pct) + '%; mức thấp nhất <b>' + _escHtmlMG(weak.k) + '</b> (' +
                     Math.round(weak.pct) + '%).</p>';
    }
  }
}
'''

# Insert new renderers AFTER aggregateAtomicMG (before old renderUnitAnalyticsMG)
needle = 'function renderUnitAnalyticsMG('
idx = html.find(needle)
if idx < 0:
    print('✕ renderUnitAnalyticsMG not found'); sys.exit(1)
html = html[:idx] + new_renderers + '\n' + html[idx:]
print('✓ Added new render functions')

# ─── 4. Update renderAnalyticsMG to call new renderers ───
old_render_call = re.compile(
    r'function renderAnalyticsMG\(\)\{\s*renderUnitAnalyticsMG\(\);\s*renderAbstractAnalyticsMG\(\);\s*renderChannelAnalyticsMG\(\);\s*renderBloomAnalyticsMG\(\);',
    re.DOTALL
)
match = old_render_call.search(html)
if match:
    html = html[:match.start()] + '''function renderAnalyticsMG(){
  renderUnitAnalyticsMG();
  renderSupportAnalyticsMG();
  renderBloomAnalyticsMG();
  renderDifficultyAnalyticsMG();''' + html[match.end():]
    print('✓ Updated renderAnalyticsMG calls')

# ─── 5. Refactor mini radar to use group-specific skills ───
new_mini_radar = '''/* ─── Mini radars cho từng ability block — show năng lực con của nhóm ───
   Mỗi mini radar có axes = skills trong nhóm (3-5 axes per group).
   Value = pct của skill từ aggregateAtomicMG hoặc _GRADE_PCT từ click.
   ═══════════════════════════════════════════════════════════════ */
const __ABILITY_GROUPS_MG = {
  0: { title:'CƠ BẢN', skills:[
    {key:'attention', label:'Chú ý'},
    {key:'observation', label:'Quan sát'},
    {key:'memory', label:'Ghi nhớ'},
  ]},
  1: { title:'TOÁN HỌC', skills:[
    {key:'number', label:'Số học'},
    {key:'geometry', label:'Hình học'},
    {key:'measurement', label:'Đo lường'},
    {key:'pattern', label:'Kiểu mẫu'},
    {key:'data', label:'Dữ liệu'},
  ]},
  2: { title:'LOGIC', skills:[
    {key:'understanding', label:'Hiểu'},
    {key:'application', label:'Ứng dụng'},
    {key:'analysis', label:'Phân tích'},
    {key:'synthesis', label:'Tổng hợp'},
  ]},
  3: { title:'SÁNG TẠO', skills:[
    {key:'fluency', label:'Trôi chảy'},
    {key:'flexibility', label:'Linh hoạt'},
    {key:'originality', label:'Độc đáo'},
    {key:'precision', label:'Chính xác'},
  ]},
};

function _getSkillPctMG(skillKey){
  // Try ATOMIC agg first
  if(typeof aggregateAtomicMG === 'function' && Object.keys(__atomicScoresMG || {}).length > 0){
    const agg = aggregateAtomicMG();
    const s = agg.skillSum[skillKey];
    if(s && s.max > 0) return s.pct;
  }
  // Fallback: từ grade span hiện tại trên DOM
  const span = document.querySelector('.ability tbody span[data-skill="' + skillKey + '"]');
  if(span){
    const m = span.className.match(/g([SABCL])/);
    if(m) return __GRADE_PCT[m[1]] || 50;
  }
  return 50;
}

function renderMiniRadars(){
  document.querySelectorAll('.mini-radar-svg').forEach(svg => {
    const groupIdx = +svg.dataset.mrIdx || 0;
    const group = __ABILITY_GROUPS_MG[groupIdx];
    if(!group) return;
    const N = group.skills.length;
    const cx = 75, cy = 62, R = 30;
    const ang = i => -Math.PI/2 + i*(2*Math.PI/N);
    const pt = (i, v) => {
      const r = R * (v/100);
      return [cx + r*Math.cos(ang(i)), cy + r*Math.sin(ang(i))];
    };
    let html = '';
    // Background polygon
    const bgPts = [];
    for(let i = 0; i < N; i++){ const [x, y] = pt(i, 100); bgPts.push(`${x},${y}`); }
    html += `<polygon points="${bgPts.join(' ')}" fill="#fff7e2" stroke="none"/>`;
    // Grid rings
    for(let k = 1; k <= 4; k++){
      const pts = [];
      for(let i = 0; i < N; i++){ const [x, y] = pt(i, k*25); pts.push(`${x},${y}`); }
      html += `<polygon points="${pts.join(' ')}" fill="none" stroke="#f0dcb0" stroke-width=".8" stroke-dasharray="${k===4?'':'2 2'}"/>`;
    }
    // Axes
    for(let i = 0; i < N; i++){
      const [x, y] = pt(i, 100);
      html += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#f0dcb0" stroke-width=".8"/>`;
    }
    // Skill values
    const vals = group.skills.map(s => _getSkillPctMG(s.key));
    const pts = vals.map((v, i) => pt(i, v).join(',')).join(' ');
    html += `<polygon points="${pts}" fill="#f5b84a" fill-opacity=".4" stroke="#f08526" stroke-width="1.8" stroke-linejoin="round"/>`;
    // Vertex dots
    vals.forEach((v, i) => {
      const [x, y] = pt(i, v);
      html += `<circle cx="${x}" cy="${y}" r="3" fill="#f08526" stroke="#fff" stroke-width="1.2"/>`;
    });
    // Labels
    const LR = R + 16;
    group.skills.forEach((s, i) => {
      const a = ang(i);
      const lx = cx + LR * Math.cos(a);
      const ly = cy + LR * Math.sin(a) + (i === 0 ? -2 : 3);
      let anchor = 'middle';
      const angDeg = (a * 180 / Math.PI + 360) % 360;
      if(angDeg > 5 && angDeg < 175) anchor = 'start';
      else if(angDeg > 185 && angDeg < 355) anchor = 'end';
      html += `<text class="mr-axis" x="${lx}" y="${ly}" text-anchor="${anchor}" dominant-baseline="middle">${s.label}</text>`;
    });
    svg.innerHTML = html;
  });
}
renderMiniRadars();'''

# Replace old renderMiniRadars function (from "function renderMiniRadars" to its renderMiniRadars(); call)
old_radar_pattern = re.compile(
    r'/\* ─── Mini radars.*?renderMiniRadars\(\);',
    re.DOTALL
)
match = old_radar_pattern.search(html)
if match:
    html = html[:match.start()] + new_mini_radar + html[match.end():]
    print('✓ Refactored mini radar (group-specific skills)')
else:
    print('✕ Old mini radar not found')

with open(target, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nNew file size: {len(html)} bytes')
