/* ═══════════════════════════════════════════════════════════════
   INPUT ALIGNMENT — Multi-student + Info extract + Detailed validation
   Bao trùm các case GV thường làm sai khi điền xlsx.
   ═══════════════════════════════════════════════════════════════ */

// ─── Helper: extract info từ "Thông tin HS" sheet ───
function _extractInfoSheetMG(sheet){
  if(!sheet) return {};
  const rows = XLSX.utils.sheet_to_json(sheet, {header:1, defval:''});
  const info = {};
  rows.forEach(r => {
    if(!r || !r[0]) return;
    const label = String(r[0]).toLowerCase().trim();
    const value = r[1] != null ? String(r[1]).trim() : '';
    if(!value) return;
    // Lenient label matching
    if(label.includes('họ và tên') || label === 'tên' || label.includes('name') || label.includes('học sinh')){
      info.name = info.name || value;
    } else if(label.includes('giới tính') || label.includes('gender') || label.includes('sex')){
      info.sex = info.sex || value;
    } else if(label.includes('năm sinh') || label.includes('ngày sinh') || label.includes('birth') || label.includes('dob')){
      const m = value.match(/(\d{4})/);
      if(m) info.yob = info.yob || m[1];
      info.dob = info.dob || value;
    } else if(label.includes('lớp') || label.includes('class')){
      info.class = info.class || value;
    } else if(label.includes('ngày đánh giá') || label.includes('ngày test') || label.includes('test date') || label.includes('eval date')){
      info.date = info.date || value;
    } else if(label.includes('giáo viên') || label.includes('gv chấm') || label.includes('teacher') || label === 'gv'){
      info.teacher = info.teacher || value;
    } else if(label.includes('trung tâm') || label.includes('center') || label.includes('cơ sở')){
      info.center = info.center || value;
    } else if(label.includes('bài test') || label.includes('test name') || label.includes('cấp độ')){
      info.test = info.test || value;
    }
  });
  return info;
}

// ─── Helper: parse single atomic sheet với error tracking ───
function _parseSingleAtomicSheetMG(sheet, sheetName){
  const info = {};
  const scores = {};
  const errors = [];

  // Info từ sheet name
  const yobMatch = sheetName.match(/(\d{4})/);
  if(yobMatch){
    info.yob = yobMatch[1];
    info.name = sheetName.replace(/\d{4}/, '').replace(/[_\-]+/g, ' ').trim();
  } else {
    info.name = sheetName.trim();
  }
  // Detect kỳ tag trong sheet name (đầu kỳ / cuối kỳ)
  if(/đầu\s*kỳ|dau\s*ky|begin|start/i.test(sheetName)) info.semester = 'đầu kỳ';
  else if(/cuối\s*kỳ|cuoi\s*ky|end|final/i.test(sheetName)) info.semester = 'cuối kỳ';

  // Find header row + columns
  const rows = XLSX.utils.sheet_to_json(sheet, {header:1, defval:''});
  let maCol = 1, lvlCol = 4, headerRow = -1;
  for(let i = 0; i < Math.min(rows.length, 20); i++){
    const r = rows[i];
    if(!r) continue;
    let foundMa = -1, foundLvl = -1;
    for(let j = 0; j < r.length; j++){
      const v = String(r[j] || '').toLowerCase().trim();
      if(foundMa < 0 && (v === 'mã' || v.startsWith('mã ') || v.includes('mã tiêu chí') || v === 'code')) foundMa = j;
      if(foundLvl < 0 && (
        (v.includes('mức') && (v.includes('nhập') || v.includes('đánh giá'))) ||
        v === 'mức' || v === 'điểm' || v === 'level' || v === 'score'
      )) foundLvl = j;
    }
    if(foundMa >= 0 && foundLvl >= 0){
      maCol = foundMa; lvlCol = foundLvl; headerRow = i; break;
    }
  }

  // Parse each row, track errors
  rows.forEach((r, idx) => {
    if(!r) return;
    if(idx <= headerRow) return;  // skip header
    const ma = String(r[maCol] || '').trim();
    if(!ma || !/^\d+\.\d+$/.test(ma)) return;
    let muc = r[lvlCol];
    if(muc === '' || muc === null || muc === undefined) return;
    if(typeof muc === 'string') muc = muc.trim();
    // Allow common variants: "5/5", "100%"
    if(typeof muc === 'string'){
      const slashMatch = muc.match(/^(\d+)\s*\/\s*\d+$/);
      if(slashMatch) muc = slashMatch[1];
      else if(muc.endsWith('%')){
        const pct = parseInt(muc, 10);
        if(Number.isFinite(pct)){
          // Convert % to 5-band: 90+→5, 75+→4, 60+→3, 45+→2, 30+→1, <30→0
          muc = pct >= 90 ? 5 : pct >= 75 ? 4 : pct >= 60 ? 3 : pct >= 45 ? 2 : pct >= 30 ? 1 : 0;
        }
      }
    }
    const lvl = parseInt(muc, 10);
    if(Number.isFinite(lvl) && [5,4,3,2,1,0].includes(lvl)){
      scores[ma] = lvl;
    } else {
      errors.push({
        row: idx + 1,
        ma,
        value: muc,
        col: lvlCol,
        msg: 'Mức "' + muc + '" không hợp lệ (cần 0-5)',
      });
    }
  });

  // Try to extract info from same sheet (label rows above atomic)
  if(headerRow > 0){
    const infoRows = rows.slice(0, headerRow);
    infoRows.forEach(r => {
      if(!r || !r[0]) return;
      const label = String(r[0]).toLowerCase().trim();
      const value = r[1] != null ? String(r[1]).trim() : '';
      if(!value) return;
      if(label.includes('họ và tên') || label === 'tên') info.name = info.name || value;
      else if(label.includes('giới tính')) info.sex = info.sex || value;
      else if(label.includes('năm sinh') || label.includes('ngày sinh')){
        const m = value.match(/(\d{4})/);
        if(m) info.yob = info.yob || m[1];
      }
      else if(label.includes('lớp')) info.class = info.class || value;
      else if(label.includes('ngày đánh giá')) info.date = info.date || value;
      else if(label.includes('giáo viên')) info.teacher = info.teacher || value;
    });
  }

  return {info, scores, errors, sheetName};
}

// ─── Multi-student parser: 1 xlsx có thể chứa N bé (mỗi sheet = 1 bé) ───
window._parseMultiStudentMG = async function(file){
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, {type:'array', cellDates:false});

  // Step 1: find optional shared info sheet
  let sharedInfo = {};
  const INFO_SHEET_RE = /thông\s*tin|^info$|^hs$/i;
  for(const sn of wb.SheetNames){
    if(INFO_SHEET_RE.test(sn)){
      sharedInfo = _extractInfoSheetMG(wb.Sheets[sn]);
      break;
    }
  }

  // Step 2: find all atomic sheets (≥30 atomic rows → đủ data có ý nghĩa)
  const atomicSheets = [];
  for(const sn of wb.SheetNames){
    if(INFO_SHEET_RE.test(sn)) continue;
    const sht = wb.Sheets[sn];
    if(!sht) continue;
    const rows = XLSX.utils.sheet_to_json(sht, {header:1, defval:''});
    let cnt = 0;
    for(const r of rows){
      if(!r) continue;
      for(let i = 0; i < Math.min(r.length, 5); i++){
        if(/^\d+\.\d+$/.test(String(r[i] || '').trim())){ cnt++; break; }
      }
    }
    if(cnt >= 30) atomicSheets.push(sn);
  }

  if(atomicSheets.length === 0) return [];

  // Step 3: parse each atomic sheet
  const students = [];
  for(const sn of atomicSheets){
    const parsed = _parseSingleAtomicSheetMG(wb.Sheets[sn], sn);
    const info = Object.assign({}, sharedInfo, parsed.info);
    students.push({
      name: info.name || sn,
      fileName: file.name,
      info, scores: parsed.scores,
      sheetName: sn,
      errors: parsed.errors,
      exported: false,
    });
  }
  return students;
};

// ─── Update validation panel với per-row errors ───
window.__validateAtomicXlsxMG = async function(file){
  const warnings = [];
  let students = [];
  try{
    students = await _parseMultiStudentMG(file);
    if(students.length === 0){
      warnings.push({sev:'error', msg:'Không tìm thấy atomic data nào — file có thể sai format'});
    } else if(students.length === 1){
      const s = students[0];
      const total = Object.keys(s.scores).length;
      if(total < 30){
        warnings.push({sev:'warn', msg:'Chỉ ' + total + ' atomic được chấm (kỳ vọng 50+)'});
      }
      // Errors detail
      if(s.errors.length > 0){
        s.errors.slice(0, 5).forEach(e => {
          warnings.push({sev:'warn', msg:'Row ' + e.row + ' (atomic ' + e.ma + '): ' + e.msg});
        });
        if(s.errors.length > 5){
          warnings.push({sev:'warn', msg:'... và ' + (s.errors.length - 5) + ' lỗi khác'});
        }
      }
      // Age check
      if(s.info.yob){
        const age = new Date().getFullYear() - +s.info.yob;
        if(age < 2 || age > 8){
          warnings.push({sev:'warn', msg:'Năm sinh ' + s.info.yob + ' → bé ~' + age + ' tuổi, không phải lứa mẫu giáo'});
        }
      }
    } else {
      // Multi-student
      warnings.push({sev:'info', msg:'Phát hiện ' + students.length + ' bé trong 1 file — sẽ import batch tự động'});
      const totalErrors = students.reduce((a, s) => a + s.errors.length, 0);
      if(totalErrors > 0){
        warnings.push({sev:'warn', msg:'Tổng cộng ' + totalErrors + ' atomic lỗi mức (xem chi tiết sau import)'});
      }
    }
  }catch(err){
    warnings.push({sev:'error', msg:'Lỗi đọc file: ' + err.message});
  }
  return {warnings, students, atomicCount: students[0]?.scores ? Object.keys(students[0].scores).length : 0};
};

// ─── Update __showValidationWarnings với UI panel chi tiết ───
window.__showValidationWarnings = function(result){
  if(!result.warnings || result.warnings.length === 0) return true;
  const errors = result.warnings.filter(w => w.sev === 'error');
  const warns = result.warnings.filter(w => w.sev === 'warn');
  const infos = result.warnings.filter(w => w.sev === 'info');
  if(errors.length > 0){
    alert('❌ KHÔNG THỂ IMPORT — phát hiện lỗi nghiêm trọng:\n\n' +
          errors.map(w => '• ' + w.msg).join('\n') +
          '\n\nVui lòng sửa file và import lại.');
    return false;
  }
  if(warns.length === 0 && infos.length === 0) return true;
  // Show consolidated panel
  const lines = [];
  if(infos.length > 0){
    lines.push('ℹ Thông tin:');
    infos.forEach(w => lines.push('  • ' + w.msg));
    lines.push('');
  }
  if(warns.length > 0){
    lines.push('⚠ Cảnh báo (' + warns.length + '):');
    warns.forEach(w => lines.push('  • ' + w.msg));
    lines.push('');
  }
  lines.push('Vẫn tiếp tục import?');
  return confirm(lines.join('\n'));
};

// ─── Multi-student import dispatcher ───
window.__importMultiStudentMG = async function(students){
  if(!students || students.length === 0) return;
  if(students.length === 1){
    // Single → set as current report
    const s = students[0];
    _cleanSlateMG();
    if(typeof _applyMG_InfoFields === 'function') _applyMG_InfoFields(s.info);
    __atomicScoresMG = Object.assign({}, s.scores);
    if(typeof applyAtomicToReportMG === 'function') applyAtomicToReportMG();
    if(typeof fillCommentsMG === 'function') fillCommentsMG(true);
    if(typeof scheduleSaveMG === 'function') scheduleSaveMG();
    _showToastMG('Đã nhập ' + Object.keys(s.scores).length + ' atomic cho bé ' + (s.name || ''), '#5fb74f');
    return;
  }
  // Multi → batch flow
  if(typeof __batchDataMG === 'undefined'){
    _showToastMG('Batch mode chưa khả dụng', '#df5728');
    return;
  }
  __batchDataMG.push(...students);
  if(typeof _renderBatchListMG === 'function') _renderBatchListMG();
  if(typeof toggleBatchModeMG === 'function'){
    const panel = document.getElementById('batch-panel');
    if(panel && !panel.classList.contains('open')) toggleBatchModeMG();
  }
  // Auto-select first student
  if(typeof _selectBatchBeMG === 'function') _selectBatchBeMG(__batchDataMG.length - students.length);
  _showToastMG('Đã import ' + students.length + ' bé từ 1 file — chọn bé từ danh sách', '#5fb74f');
};

// ─── Update Excel template để include "Thông tin HS" sheet ───
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
  // Sheet 1: Thông tin HS (info fields)
  const yearGuess = new Date().getFullYear() - 4;
  const infoRows = [
    ['Họ và tên', 'Nguyễn Văn A'],
    ['Giới tính', 'Nam'],
    ['Năm sinh', yearGuess],
    ['Lớp', 'Lá 1 — Trung tâm Đống Đa'],
    ['Ngày đánh giá', new Date().toLocaleDateString('vi-VN')],
    ['Giáo viên', 'Cô Nguyễn Thị Hoa'],
    ['Trung tâm', 'WonderKids — CS Đống Đa'],
    ['Bài test', (level || 'L3') + ' Diagnostic Assessment'],
    ['Kỳ', 'Đầu kỳ'],
    [],
    ['⚠ Lưu ý:', 'GV chỉ cần điền cột Mức (NHẬP) trong sheet "Atomic" với giá trị 0-5.'],
    ['', '0 = chưa làm được; 1 = cần hướng dẫn nhiều; 2 = cần gợi ý; 3 = khá; 4 = tốt; 5 = xuất sắc'],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(infoRows);
  ws1['!cols'] = [{wch:18}, {wch:50}];

  // Sheet 2: Atomic
  const atomRows = [
    ['Câu', 'Mã', 'Tiêu chí atomic', 'Trọng số', 'Mức (NHẬP)', 'Điểm đạt', 'Nhóm Năng Lực', 'Năng lực', 'Mức độ hỗ trợ', 'Cấp Bloom', 'Mức độ khó'],
  ];
  criteria.forEach(c => {
    atomRows.push([
      c.cau, c.ma, c.label, c.weight, '', '',
      c.nhom || '', c.skill_xlsx || c.skill || '',
      c.support, c.bloom || '', c.difficulty || ''
    ]);
  });
  const ws2 = XLSX.utils.aoa_to_sheet(atomRows);
  ws2['!cols'] = [
    {wch:5},{wch:6},{wch:42},{wch:8},{wch:11},{wch:9},
    {wch:18},{wch:18},{wch:12},{wch:14},{wch:12}
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Thông tin HS');
  XLSX.utils.book_append_sheet(wb, ws2, 'Atomic ' + (level || 'L3'));
  const fname = 'WonderKids_Template_' + (level || 'L3') + '_' + new Date().toISOString().slice(0,10) + '.xlsx';
  XLSX.writeFile(wb, fname);
  if(typeof _showToastMG === 'function') _showToastMG('Đã tải template ' + fname + ' (2 sheets: Info + Atomic)', '#5fb74f');
};

// ─── Hook vào importExcelMG để dùng multi-student parser ───
(function patchImportExcel(){
  const wait = setInterval(() => {
    if(typeof window.importExcelMG !== 'function') return;
    if(window.__importExcelPatched) { clearInterval(wait); return; }
    window.__importExcelPatched = true;
    const orig = window.importExcelMG;
    window.importExcelMG = async function(ev){
      const f = ev.target?.files?.[0];
      if(!f){ return; }
      const name = f.name.toLowerCase();
      const isCSV = name.endsWith('.csv') || f.type === 'text/csv';
      // For CSV, use original flow
      if(isCSV) return orig.call(this, ev);
      // For XLSX: try multi-student parse
      if(typeof _waitXlsxMG === 'function'){
        const ready = await _waitXlsxMG();
        if(!ready){
          _showToastMG('XLSX chưa load được', '#d83c2d');
          return;
        }
      }
      try{
        const validation = await __validateAtomicXlsxMG(f);
        if(!__showValidationWarnings(validation)){
          if(ev?.target) ev.target.value = '';
          return;
        }
        const students = validation.students;
        if(!students || students.length === 0){
          // Fall back to original parser (16-skill legacy)
          return orig.call(this, ev);
        }
        await __importMultiStudentMG(students);
      }catch(err){
        console.error('[multi-import]', err);
        _showToastMG('Lỗi import: ' + (err.message || err), '#d83c2d');
      } finally {
        if(ev?.target) ev.target.value = '';
      }
    };
    clearInterval(wait);
  }, 100);
  setTimeout(() => clearInterval(wait), 5000);
})();
