/* ═══════════════════════════════════════════════════════════════
   PRODUCTION FEATURES — backup, parent mode, dark mode, validation
   Injected vào mau-giao.html + mau-giao-l4.html + tieu-hoc.html
   ═══════════════════════════════════════════════════════════════ */

// ─── 1. BACKUP / RESTORE toàn bộ localStorage ───
window.__exportBackupMG = function(){
  const data = {};
  for(let i = 0; i < localStorage.length; i++){
    const k = localStorage.key(i);
    if(k && (k.startsWith('mg-') || k.startsWith('th-') || k.startsWith('wk-'))){
      data[k] = localStorage.getItem(k);
    }
  }
  const out = {
    version: 1,
    exportedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    data: data,
  };
  const blob = new Blob([JSON.stringify(out, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wonderkids-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  if(typeof _showToastMG === 'function') _showToastMG('Đã backup ' + Object.keys(data).length + ' keys', '#5fb74f');
};

window.__importBackupMG = function(file){
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const obj = JSON.parse(e.target.result);
      if(!obj.data || typeof obj.data !== 'object') throw new Error('Invalid backup format');
      const keys = Object.keys(obj.data);
      if(!confirm('Khôi phục ' + keys.length + ' keys từ backup (' + obj.exportedAt + ')?\nDữ liệu hiện tại có thể bị ghi đè.')) return;
      keys.forEach(k => localStorage.setItem(k, obj.data[k]));
      if(typeof _showToastMG === 'function') _showToastMG('Đã khôi phục ' + keys.length + ' keys. Reload để áp dụng.', '#5fb74f');
      setTimeout(() => location.reload(), 1500);
    }catch(err){
      alert('Lỗi đọc backup: ' + err.message);
    }
  };
  reader.readAsText(file);
};

// ─── 2. EXCEL TEMPLATE DOWNLOAD (blank xlsx mẫu) ───
window.__downloadXlsxTemplate = function(level){
  if(typeof XLSX === 'undefined'){
    alert('XLSX library chưa load — kiểm tra kết nối internet.');
    return;
  }
  const criteria = (typeof __ATOMIC_CRITERIA_L3 !== 'undefined') ? __ATOMIC_CRITERIA_L3 : [];
  if(criteria.length === 0){
    alert('Không tìm thấy template atomic — load page đầy đủ trước.');
    return;
  }
  // Build sheet: header + 1 row per atomic, "Mức (NHẬP)" để trống cho GV điền
  const rows = [
    ['Câu', 'Mã', 'Tiêu chí atomic', 'Trọng số', 'Mức (NHẬP)', 'Điểm đạt', 'Nhóm Năng Lực', 'Năng lực', 'Mức độ hỗ trợ', 'Cấp Bloom', 'Mức độ khó'],
  ];
  criteria.forEach(c => {
    rows.push([
      c.cau, c.ma, c.label, c.weight, '', '',
      c.nhom || '', c.skill_xlsx || c.skill || '',
      c.support, c.bloom || '', c.difficulty || ''
    ]);
  });
  const ws = XLSX.utils.aoa_to_sheet(rows);
  // Set column widths
  ws['!cols'] = [
    {wch:5},{wch:6},{wch:42},{wch:8},{wch:11},{wch:9},
    {wch:18},{wch:18},{wch:12},{wch:14},{wch:12}
  ];
  const wb = XLSX.utils.book_new();
  const sheetName = 'TÊN BÉ ' + (new Date().getFullYear() - 4); // gợi ý format
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const fname = 'WonderKids_Template_' + (level || 'L3') + '_' + new Date().toISOString().slice(0,10) + '.xlsx';
  XLSX.writeFile(wb, fname);
  if(typeof _showToastMG === 'function') _showToastMG('Đã tải template ' + fname, '#5fb74f');
};

// ─── 3. PRE-IMPORT VALIDATION ───
window.__validateAtomicXlsxMG = function(file){
  return new Promise(async (resolve) => {
    const warnings = [];
    try{
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, {type:'array'});
      const sheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, {header:1, defval:''});
      // Check 1: Atomic count
      let atomicCount = 0, filledCount = 0, outOfRange = 0;
      for(const r of rows){
        if(!r) continue;
        const ma = String(r[1] || '').trim();
        if(/^\d+\.\d+$/.test(ma)){
          atomicCount++;
          const muc = r[4];
          if(muc !== '' && muc !== null && muc !== undefined){
            filledCount++;
            const lvl = parseInt(muc, 10);
            if(!Number.isFinite(lvl) || lvl < 0 || lvl > 5) outOfRange++;
          }
        }
      }
      if(atomicCount === 0){
        warnings.push({sev:'error', msg:'Không tìm thấy atomic data nào — file có thể sai format'});
      } else if(atomicCount < 30){
        warnings.push({sev:'warn', msg:'Chỉ có ' + atomicCount + ' atomic (kỳ vọng 61 cho L3 hoặc 65 cho L4)'});
      }
      // Check 2: Filled vs total
      if(atomicCount > 0){
        const pctFilled = Math.round(filledCount / atomicCount * 100);
        if(pctFilled < 50){
          warnings.push({sev:'warn', msg:'Chỉ ' + filledCount + '/' + atomicCount + ' atomic đã chấm (' + pctFilled + '%)'});
        }
      }
      // Check 3: Out of range
      if(outOfRange > 0){
        warnings.push({sev:'error', msg:outOfRange + ' atomic có mức ngoài range 0-5'});
      }
      // Check 4: Sheet name format (tên + năm sinh)
      if(!/\d{4}/.test(sheetName)){
        warnings.push({sev:'info', msg:'Tên sheet không chứa năm sinh — info bé có thể không tự fill'});
      }
      // Check 5: Tuổi bé hợp lý
      const m = sheetName.match(/(\d{4})/);
      if(m){
        const yob = +m[1];
        const age = new Date().getFullYear() - yob;
        if(age < 2 || age > 8) warnings.push({sev:'warn', msg:'Năm sinh ' + yob + ' → bé ~' + age + ' tuổi, không phải lứa mẫu giáo điển hình'});
      }
      resolve({warnings, atomicCount, filledCount, sheetName});
    }catch(err){
      warnings.push({sev:'error', msg:'Lỗi đọc file: ' + err.message});
      resolve({warnings, atomicCount:0, filledCount:0, sheetName:''});
    }
  });
};

window.__showValidationWarnings = function(result){
  if(!result.warnings || result.warnings.length === 0) return true;
  const errors = result.warnings.filter(w => w.sev === 'error');
  if(errors.length > 0){
    alert('❌ Không thể import:\n\n' + errors.map(w => '• ' + w.msg).join('\n'));
    return false;
  }
  const warns = result.warnings.filter(w => w.sev === 'warn');
  const infos = result.warnings.filter(w => w.sev === 'info');
  if(warns.length > 0 || infos.length > 0){
    const msg = '⚠ Phát hiện ' + result.warnings.length + ' cảnh báo:\n\n' +
                result.warnings.map(w => (w.sev === 'warn' ? '⚠' : 'ℹ') + ' ' + w.msg).join('\n') +
                '\n\nVẫn tiếp tục import?';
    return confirm(msg);
  }
  return true;
};

// ─── 4. DARK MODE TOGGLE ───
window.__toggleDarkMode = function(){
  const next = document.body.classList.toggle('dark-mode');
  localStorage.setItem('wk-dark-mode', next ? '1' : '0');
  const btn = document.getElementById('btn-dark-mode');
  if(btn) btn.textContent = next ? '☀️' : '🌙';
};
// Auto-load preference
(function initDarkMode(){
  if(localStorage.getItem('wk-dark-mode') === '1'){
    document.body.classList.add('dark-mode');
    const btn = document.getElementById('btn-dark-mode');
    if(btn) btn.textContent = '☀️';
  }
})();

// ─── 5. PARENT MODE TOGGLE (simplified language) ───
window.__toggleParentMode = function(){
  const next = document.body.classList.toggle('parent-mode');
  localStorage.setItem('wk-parent-mode', next ? '1' : '0');
  const btn = document.getElementById('btn-parent-mode');
  if(btn) btn.textContent = next ? '👨‍🏫 Chế độ GV' : '👪 Chế độ phụ huynh';
};
(function initParentMode(){
  if(localStorage.getItem('wk-parent-mode') === '1'){
    document.body.classList.add('parent-mode');
  }
})();

// ─── 6. ONBOARDING BANNER (first visit) ───
(function showOnboardingBanner(){
  if(localStorage.getItem('wk-onboarded')) return;
  setTimeout(() => {
    const banner = document.createElement('div');
    banner.id = 'onboarding-banner';
    banner.innerHTML = `
      <div class="ob-inner">
        <h4>👋 Chào mừng đến với WonderKids Report!</h4>
        <p>Để bắt đầu nhanh nhất:</p>
        <ol>
          <li><b>📥 Tải template Excel</b> ở panel Nhập liệu → điền điểm cho bé</li>
          <li><b>📂 Import file</b> đã điểm vào hệ thống</li>
          <li><b>🖨️ In PDF</b> để giao phụ huynh</li>
        </ol>
        <p style="font-size:11px;color:#a4886a;margin-top:8px">
          💡 Tip: Click chuột phải vào báo cáo → Print → chọn A3 portrait để in đẹp.
        </p>
        <button onclick="document.getElementById('onboarding-banner').remove(); localStorage.setItem('wk-onboarded', '1')">
          ✓ Đã hiểu, không hiện lại
        </button>
      </div>`;
    document.body.appendChild(banner);
  }, 800);
})();

// ─── 7. CLASS ANALYTICS DASHBOARD (multi-student from batch) ───
window.__showClassAnalyticsMG = function(){
  if(typeof __batchDataMG === 'undefined' || __batchDataMG.length === 0){
    alert('Chưa có data batch nào. Import ≥2 bé qua "Nhập liệu hàng loạt" để xem analytics lớp.');
    return;
  }
  // Compute class-level metrics
  const N = __batchDataMG.length;
  const skillTotals = {};  // skill → [pct1, pct2, ...]
  __batchDataMG.forEach(b => {
    if(!b.scores) return;
    // Mimick aggregateAtomicMG for each student
    const stuAgg = aggregateAtomicMG(b.scores);
    for(const sk in stuAgg.skillSum){
      if(!skillTotals[sk]) skillTotals[sk] = [];
      skillTotals[sk].push(stuAgg.skillSum[sk].pct);
    }
  });
  // Summary by skill
  const summary = {};
  for(const sk in skillTotals){
    const arr = skillTotals[sk];
    const avg = Math.round(arr.reduce((a,b)=>a+b, 0) / arr.length);
    const min = Math.min(...arr), max = Math.max(...arr);
    const strugglers = arr.filter(p => p < 40).length;
    summary[sk] = {avg, min, max, n:arr.length, strugglers};
  }
  // Build modal
  let html = '<div style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px" onclick="if(event.target===this) this.remove()">';
  html += '<div style="background:#fff;border-radius:16px;padding:24px;max-width:760px;width:100%;max-height:85vh;overflow:auto;box-shadow:0 24px 60px rgba(0,0,0,.3)">';
  html += '<h3 style="margin:0 0 8px;color:#df5728;font:800 20px/1 var(--font-display)">📊 Class Analytics — ' + N + ' bé</h3>';
  html += '<p style="margin:0 0 16px;font-size:11.5px;color:#6b5a45">Aggregate theo skill từ atomic data của tất cả bé đã import qua "Nhập liệu hàng loạt".</p>';
  // Sort skills by avg desc
  const skLabels = (typeof __ATOMIC_SKILL_LABELS_MG !== 'undefined') ? __ATOMIC_SKILL_LABELS_MG : {};
  const sorted = Object.entries(summary).sort((a,b) => b[1].avg - a[1].avg);
  html += '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="background:#fff3da">';
  html += '<th style="padding:8px;text-align:left;border:1px solid #f0c080">Năng lực</th>';
  html += '<th style="padding:8px;border:1px solid #f0c080">Avg %</th>';
  html += '<th style="padding:8px;border:1px solid #f0c080">Min</th>';
  html += '<th style="padding:8px;border:1px solid #f0c080">Max</th>';
  html += '<th style="padding:8px;border:1px solid #f0c080">Bé yếu (<40%)</th>';
  html += '</tr></thead><tbody>';
  sorted.forEach(([sk, s]) => {
    const lbl = skLabels[sk] || sk;
    const color = s.avg >= 65 ? '#5fb74f' : s.avg >= 45 ? '#f5a623' : '#df5728';
    html += '<tr>';
    html += '<td style="padding:6px 8px;border:1px solid #f0c080">' + lbl + '</td>';
    html += '<td style="padding:6px 8px;border:1px solid #f0c080;text-align:center;font-weight:700;color:' + color + '">' + s.avg + '%</td>';
    html += '<td style="padding:6px 8px;border:1px solid #f0c080;text-align:center">' + s.min + '</td>';
    html += '<td style="padding:6px 8px;border:1px solid #f0c080;text-align:center">' + s.max + '</td>';
    html += '<td style="padding:6px 8px;border:1px solid #f0c080;text-align:center">' + (s.strugglers > 0 ? '<b style="color:#df5728">' + s.strugglers + '/' + s.n + '</b>' : s.strugglers + '/' + s.n) + '</td>';
    html += '</tr>';
  });
  html += '</tbody></table>';
  // Insight
  const weakest = sorted[sorted.length - 1];
  const strongest = sorted[0];
  if(weakest && strongest){
    html += '<div style="margin-top:16px;padding:12px;background:#fff3da;border-radius:8px;font-size:12px;line-height:1.6">';
    html += '<b>💡 Insight cho ' + N + ' bé:</b><br>';
    html += '• Lớp <b>mạnh nhất</b> ở: <b style="color:#5fb74f">' + (skLabels[strongest[0]]||strongest[0]) + '</b> (avg ' + strongest[1].avg + '%)<br>';
    html += '• Lớp <b>cần đầu tư</b> ở: <b style="color:#df5728">' + (skLabels[weakest[0]]||weakest[0]) + '</b> (avg ' + weakest[1].avg + '%, ' + weakest[1].strugglers + ' bé yếu)';
    html += '</div>';
  }
  html += '<button style="margin-top:16px;background:#df5728;color:#fff;padding:10px 20px;border:none;border-radius:8px;font-weight:700;cursor:pointer" onclick="this.closest(\'div[style*=fixed]\').remove()">Đóng</button>';
  html += '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
};
