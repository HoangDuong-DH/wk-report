/* ═══════════════════════════════════════════════════════════════
   DEDUCTION LOGIC + BÀI 13-14 HELPER
   Theo docx official L3/L4: 6 case trừ điểm + count→mức converter
   ═══════════════════════════════════════════════════════════════ */

// ─── 1. DEDUCTION STATE ───
window.__deductionsMG = {
  markedWrong:    0,  // Đúng nhưng đánh dấu lựa chọn sai
  markedBoth:     0,  // Đúng nhưng đánh dấu cả đúng-sai
  wrongSymbol:    0,  // Đúng nhưng vẽ sai ký hiệu
  wrongPosition:  0,  // Đúng nhưng không viết đúng vị trí
  scribble:       0,  // Nguệch ngoạc, vô nghĩa
  wrongAnswer:    0,  // Câu trả lời sai
};

window.__deductionLabelsMG = {
  markedWrong:   '☑ Đúng nhưng đánh dấu lựa chọn sai',
  markedBoth:    '☒ Đúng nhưng đánh dấu cả đúng-sai',
  wrongSymbol:   '✎ Đúng nhưng vẽ sai ký hiệu',
  wrongPosition: '✗ Đúng nhưng viết sai vị trí',
  scribble:      '〰 Nguệch ngoạc, vô nghĩa',
  wrongAnswer:   '× Câu trả lời sai',
};

window.__totalDeductionMG = function(){
  return Object.values(__deductionsMG).reduce((a, b) => a + (+b || 0), 0);
};

window.__setDeductionMG = function(key, value){
  __deductionsMG[key] = Math.max(0, +value || 0);
  // Save state
  try{ localStorage.setItem('mg-deductions', JSON.stringify(__deductionsMG)); }catch(_){}
  // Trigger recompute
  if(typeof recomputeAllMG === 'function') recomputeAllMG();
  if(typeof renderDeductionPanelMG === 'function') renderDeductionPanelMG();
};

// Restore from localStorage
(function restoreDeductions(){
  try{
    const saved = localStorage.getItem('mg-deductions');
    if(saved){
      const obj = JSON.parse(saved);
      Object.keys(__deductionsMG).forEach(k => {
        if(typeof obj[k] === 'number') __deductionsMG[k] = obj[k];
      });
    }
  }catch(_){}
})();

// ─── 2. DEDUCTION PANEL UI ───
window.renderDeductionPanelMG = function(){
  const target = document.getElementById('mg-deduction-panel');
  if(!target) return;
  const total = __totalDeductionMG();
  let html = '<div class="ded-panel-inner">';
  html += '<h4>⚖ Điểm trừ tiêu chuẩn (theo docx official)</h4>';
  html += '<p class="ded-note">Số lần bé phạm — mỗi lần trừ <b>1 điểm</b>. Tổng điểm trừ ' +
          '<b style="color:#df5728">' + total + 'đ</b> sẽ trừ vào điểm cuối.</p>';
  html += '<div class="ded-grid">';
  Object.keys(__deductionLabelsMG).forEach(k => {
    const label = __deductionLabelsMG[k];
    const value = __deductionsMG[k] || 0;
    html += `<div class="ded-item">`;
    html += `<label>${label}</label>`;
    html += `<div class="ded-counter">`;
    html += `<button onclick="__setDeductionMG('${k}', (__deductionsMG['${k}']||0)-1)" type="button">−</button>`;
    html += `<input type="number" min="0" value="${value}" onchange="__setDeductionMG('${k}', this.value)" />`;
    html += `<button onclick="__setDeductionMG('${k}', (__deductionsMG['${k}']||0)+1)" type="button">+</button>`;
    html += `</div>`;
    html += `</div>`;
  });
  html += '</div>';
  if(total > 0){
    html += '<div class="ded-summary">⚠ Tổng trừ <b>' + total + 'đ</b> sẽ áp dụng vào điểm cuối báo cáo.</div>';
  }
  html += '</div>';
  target.innerHTML = html;
};

// ─── 3. HOOK total score (subtract deduction in display) ───
// We don't mutate aggregateAtomicMG (it's used elsewhere). Instead, expose adjusted total.
window.__getAdjustedTotalMG = function(){
  if(typeof aggregateAtomicMG !== 'function') return null;
  const agg = aggregateAtomicMG();
  const adjScore = Math.max(0, agg.total.score - __totalDeductionMG());
  const adjPct = agg.total.max > 0 ? Math.round(adjScore / agg.total.max * 100) : 0;
  return {
    raw: agg.total,
    deduction: __totalDeductionMG(),
    adjustedScore: adjScore,
    adjustedPct: adjPct,
  };
};

// ─── 4. BÀI 13-14 COUNT → MỨC CONVERTER ───
window.__BAIO_1314_BANDS_MG = {
  fluency: {
    name:'Trôi chảy', desc:'Số ô vẽ thành hình có nghĩa',
    bands:[
      {min:8, mức:5, label:'8+ ô'},
      {min:6, mức:4, label:'6-7 ô'},
      {min:3, mức:3, label:'3-5 ô'},
      {min:1, mức:2, label:'1-2 ô'},
      {min:0, mức:0, label:'0 ô'},
    ],
  },
  flexibility: {
    name:'Linh hoạt', desc:'Số nhóm chủ đề khác nhau',
    bands:[
      {min:6, mức:5, label:'6+ nhóm'},
      {min:4, mức:4, label:'4-5 nhóm'},
      {min:2, mức:3, label:'2-3 nhóm'},
      {min:1, mức:2, label:'1 nhóm'},
      {min:0, mức:0, label:'0 nhóm'},
    ],
  },
  originality: {
    name:'Độc đáo', desc:'Số ý lạ ngoài danh sách phổ biến',
    bands:[
      {min:4, mức:5, label:'4+ ý'},
      {min:3, mức:4, label:'3 ý'},
      {min:2, mức:3, label:'2 ý'},
      {min:1, mức:2, label:'1 ý'},
      {min:0, mức:0, label:'0 ý'},
    ],
  },
  precision: {
    name:'Chính xác', desc:'Số chi tiết tỉ mỉ / có chủ ý',
    bands:[
      {min:4, mức:5, label:'4+ chi tiết'},
      {min:3, mức:4, label:'3 chi tiết'},
      {min:2, mức:3, label:'2 chi tiết'},
      {min:1, mức:2, label:'1 chi tiết'},
      {min:0, mức:0, label:'0 chi tiết'},
    ],
  },
};

window.__countToMucMG = function(skill, count){
  count = Math.max(0, +count || 0);
  const cfg = __BAIO_1314_BANDS_MG[skill];
  if(!cfg) return null;
  for(const b of cfg.bands){
    if(count >= b.min) return b.mức;
  }
  return 0;
};

// ─── 5. BÀI 13-14 HELPER PANEL ───
window.__showBai1314HelperMG = function(){
  const lines = ['🎨 BÀI 13-14: TƯ DUY SÁNG TẠO — Count → Mức (NHẬP)\n'];
  lines.push('Đếm thực tế từng dim → chọn mức tương ứng trong workspace:\n');
  Object.keys(__BAIO_1314_BANDS_MG).forEach(sk => {
    const cfg = __BAIO_1314_BANDS_MG[sk];
    lines.push('━━━ ' + cfg.name + ' (' + cfg.desc + ') ━━━');
    cfg.bands.forEach(b => {
      lines.push('  ' + b.label.padEnd(15) + '→ Mức ' + b.mức);
    });
    lines.push('');
  });
  lines.push('💡 Tip: trong workspace có nút "?" cạnh mỗi atomic 13.x/14.x — click xem chi tiết.');
  alert(lines.join('\n'));
};

// ─── 6. UPDATE DATA TOM TAT để hiển thị điểm trừ + adjusted total ───
(function hookKPIDisplay(){
  const wait = setInterval(() => {
    if(typeof window.fillCommentsMG !== 'function') return;
    if(window.__deductionHooked){ clearInterval(wait); return; }
    window.__deductionHooked = true;
    // Find KPI total span
    const tryAttach = setInterval(() => {
      const totalEl = document.getElementById('mg-kpi-total');
      if(totalEl){
        clearInterval(tryAttach);
        // Patch recomputeAllMG to refresh KPI display with deduction info
        const orig = window.recomputeAllMG;
        if(typeof orig === 'function' && !window.__dedKpiHooked){
          window.__dedKpiHooked = true;
          window.recomputeAllMG = function(){
            orig.apply(this, arguments);
            try{
              const adj = __getAdjustedTotalMG();
              if(!adj) return;
              const sub = document.getElementById('mg-kpi-total-sub');
              if(sub){
                if(adj.deduction > 0){
                  sub.innerHTML = '<span style="color:#df5728;font-size:10px">−' + adj.deduction +
                                  'đ trừ chuẩn</span> · ' + adj.adjustedPct + '% (sau trừ)';
                }
              }
              if(typeof renderDeductionPanelMG === 'function') renderDeductionPanelMG();
            }catch(e){ console.warn('ded kpi refresh:', e); }
          };
        }
      }
    }, 200);
    setTimeout(() => clearInterval(tryAttach), 5000);
    clearInterval(wait);
  }, 100);
  setTimeout(() => clearInterval(wait), 8000);
})();

// ─── 7. Initial render ───
setTimeout(() => { try{ renderDeductionPanelMG(); }catch(_){} }, 600);
