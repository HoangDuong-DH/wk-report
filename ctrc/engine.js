/* ═══════════════════════════════════════════════════════════════════════════
   CTRC — ENGINE SINH NỘI DUNG (mô hình 5 TIÊU CHÍ)
   ───────────────────────────────────────────────────────────────────────────
   Mỗi buổi GV tick: 1 tiêu chí = ĐIỂM MẠNH (+1 câu) và 1 tiêu chí = CẦN CẢI
   THIỆN (+1 câu). Không chấm 1-5, không đánh giá cả 5 cùng lúc.
   Câu mô tả lấy từ ngân hàng câu của từng tiêu chí (rules/bao-cao-per-buoi.md).
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  /* 5 tiêu chí cốt lõi + ngân hàng câu (pos = tích cực, neg = cần cải thiện) */
  const CRITERIA = [
    {
      key: 'tap_trung', label: 'Tập trung', emoji: '🎯',
      desc: 'Lắng nghe, duy trì sự chú ý và theo kịp hoạt động học tập',
      pos: ['Tập trung tốt trong giờ học.', 'Lắng nghe hướng dẫn cẩn thận.', 'Theo sát hoạt động của lớp.', 'Chú ý quan sát và phản hồi nhanh.', 'Duy trì sự tập trung tốt.'],
      neg: ['Đôi lúc còn mất tập trung trong hoạt động.', 'Cần thêm nhắc nhở để duy trì sự chú ý.', 'Thỉnh thoảng bị phân tâm bởi môi trường xung quanh.', 'Chưa duy trì được sự tập trung xuyên suốt buổi học.', 'Cần hỗ trợ để quay lại nhiệm vụ khi bị gián đoạn.'],
      tip: 'Ở nhà, bố mẹ thử chơi cùng con trò "tìm điểm khác nhau" giữa hai bức tranh 5 phút — vừa vui vừa rèn sự tập trung.',
    },
    {
      key: 'tham_gia', label: 'Tham gia', emoji: '🙋',
      desc: 'Hứng thú, chủ động tham gia trò chơi, hoạt động và thảo luận',
      pos: ['Tham gia hoạt động tích cực.', 'Hào hứng với các thử thách.', 'Chủ động phát biểu ý kiến.', 'Mạnh dạn tham gia trò chơi.', 'Tương tác tốt cùng cô và bạn.'],
      neg: ['Còn khá dè dặt khi tham gia hoạt động.', 'Chưa chủ động chia sẻ ý kiến của mình.', 'Cần khuyến khích thêm để tham gia thảo luận.', 'Tham gia hoạt động khi có sự động viên từ cô.', 'Chưa thực sự tự tin khi thể hiện bản thân.'],
      tip: 'Bố mẹ khuyến khích con kể lại một việc vui trong ngày cho cả nhà nghe — giúp con mạnh dạn chia sẻ hơn.',
    },
    {
      key: 'tu_duy', label: 'Tư duy', emoji: '🧠',
      desc: 'Quan sát, phân loại, nhận biết quy luật, suy luận và giải quyết vấn đề phù hợp độ tuổi',
      pos: ['Quan sát tốt.', 'Nhận biết quy luật nhanh.', 'Phân loại chính xác.', 'Suy luận phù hợp độ tuổi.', 'Biết thử nhiều cách giải.', 'Xử lý nhiệm vụ linh hoạt.'],
      neg: ['Cần thêm thời gian để tìm ra cách giải quyết.', 'Còn gặp khó khăn khi nhận biết quy luật mới.', 'Chưa mạnh dạn thử các hướng giải khác nhau.', 'Cần thêm gợi ý để hoàn thành nhiệm vụ.', 'Đang từng bước làm quen với dạng bài mới.'],
      tip: 'Khi chơi cùng con, thử hỏi "vì sao con chọn cái này?" để con tập quan sát, suy luận và giải thích.',
    },
    {
      key: 'tu_lap', label: 'Tự lập', emoji: '🌱',
      desc: 'Tự thực hiện nhiệm vụ, tự tìm cách giải quyết trước khi nhờ hỗ trợ',
      pos: ['Hoàn thành nhiệm vụ độc lập.', 'Chủ động thực hiện yêu cầu.', 'Tự tin khi làm bài.', 'Có tinh thần tự giác tốt.', 'Kiên trì hoàn thành nhiệm vụ.'],
      neg: ['Thường tìm sự hỗ trợ trước khi tự thử.', 'Cần nhắc nhở để bắt đầu nhiệm vụ.', 'Chưa thực sự tự tin khi làm việc độc lập.', 'Cần hỗ trợ thêm trong quá trình thực hiện nhiệm vụ.', 'Đôi lúc bỏ cuộc khi gặp thử thách.'],
      tip: 'Giao con một việc nhỏ tự làm (cất đồ chơi, gấp khăn) rồi khen khi con tự hoàn thành — nuôi tính tự lập.',
    },
    {
      key: 'hop_tac', label: 'Hợp tác', emoji: '🤝',
      desc: 'Tương tác, làm việc cùng bạn, chờ đến lượt và chia sẻ ý kiến',
      pos: ['Hợp tác tốt cùng bạn bè.', 'Tương tác tích cực trong nhóm.', 'Biết chờ đến lượt.', 'Chia sẻ và hỗ trợ bạn.', 'Hòa đồng với các bạn.', 'Tham gia nhóm rất tích cực.'],
      neg: ['Còn ít tương tác với các bạn trong nhóm.', 'Cần khuyến khích thêm khi tham gia hoạt động nhóm.', 'Chưa chủ động trao đổi cùng bạn bè.', 'Đôi lúc gặp khó khăn khi phối hợp với nhóm.', 'Cần thêm thời gian để hòa nhập với hoạt động chung.'],
      tip: 'Chơi trò luân phiên (xếp hình, board game đơn giản) để con luyện chờ đến lượt và phối hợp cùng người khác.',
    },
  ];
  const CRIT_BY_KEY = {}; CRITERIA.forEach((c) => (CRIT_BY_KEY[c.key] = c));
  const critLabel = (k) => (CRIT_BY_KEY[k] ? CRIT_BY_KEY[k].label : k);
  const TIP_BY_CRIT = {}; CRITERIA.forEach((c) => (TIP_BY_CRIT[c.key] = c.tip));
  // tương thích chỗ cũ còn lặp qua DIMS
  const DIMS = CRITERIA.map((c) => ({ key: c.key, label: c.label }));

  /* ── TIÊU CHÍ TÙY CHỈNH ──
     Bản gốc giữ ở DEFAULT_CRITERIA. setCriteria(list) thay nội dung TẠI CHỖ
     (mutate in-place) để mọi nơi đang giữ tham chiếu ENG.CRITERIA/DIMS thấy ngay.
     Key hệ thống (tap_trung...) giữ nguyên để không lệch dữ liệu đã chấm. */
  const DEFAULT_CRITERIA = JSON.parse(JSON.stringify(CRITERIA));
  function _rebuildCritMaps() {
    Object.keys(CRIT_BY_KEY).forEach((k) => delete CRIT_BY_KEY[k]);
    CRITERIA.forEach((c) => (CRIT_BY_KEY[c.key] = c));
    Object.keys(TIP_BY_CRIT).forEach((k) => delete TIP_BY_CRIT[k]);
    CRITERIA.forEach((c) => (TIP_BY_CRIT[c.key] = c.tip));
    DIMS.length = 0; CRITERIA.forEach((c) => DIMS.push({ key: c.key, label: c.label }));
  }
  function setCriteria(list) {
    if (!Array.isArray(list) || !list.length) return false;
    const ok = list.every((c) => c && c.key && c.label &&
      Array.isArray(c.pos) && c.pos.length && Array.isArray(c.neg) && c.neg.length);
    if (!ok) return false;
    CRITERIA.length = 0;
    list.forEach((c) => CRITERIA.push({
      key: String(c.key), label: String(c.label), emoji: c.emoji || '✨',
      desc: c.desc || '', pos: c.pos.map(String), neg: c.neg.map(String), tip: c.tip || '',
    }));
    _rebuildCritMaps();
    return true;
  }
  function defaultCriteria() { return JSON.parse(JSON.stringify(DEFAULT_CRITERIA)); }

  const BANNED = ['kém', 'yếu', 'tệ', 'dốt', 'lười', 'chậm chạp', 'ngu', 'hư'];

  const OPENERS = [
    'Hôm nay, {ten} {phrase}',
    'Trong buổi học hôm nay, {ten} {phrase}',
    'Một điểm rất đáng khen ở {ten} hôm nay: con {phrase}',
    '{ten} hôm nay khiến cô ấn tượng khi {phrase}',
  ];
  const OPENERS_INTROVERT = ['Hôm nay, {ten} nhẹ nhàng nhưng rất chắc chắn: con {phrase}', '{ten} hôm nay cho thấy tiến bộ đáng yêu khi {phrase}'];
  const OPENERS_EXTROVERT = ['Hôm nay {ten} tràn đầy năng lượng: con {phrase}', '{ten} hôm nay rất sôi nổi khi {phrase}'];

  function themeHook(theme, ten) {
    if (!theme) return '';
    return ` Tuần này lớp đang học "${theme}", bố mẹ có thể trò chuyện thêm với ${ten} về chủ đề này nhé.`;
  }
  function seedOf(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
  const pick = (arr, seed) => arr[seed % arr.length];
  function ensureDot(s) { s = (s || '').trim(); if (!s) return s; return /[.!?…]$/.test(s) ? s : s + '.'; }
  function stripDot(s) { return (s || '').trim().replace(/\.$/, ''); }
  function lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
  function upperFirst(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  /* ── BỘ SINH CHÍNH ──
     input.record: { strength:{crit,sentence,detail}, improve:{crit,sentence,detail}, mood }
     (detail = mô tả chi tiết tuỳ chọn cho từng tiêu chí; observation = field cũ, fallback)
     output: { diem_manh, co_gang, goi_y, featured_strength } */
  function generate(input) {
    const ten = (input.student && input.student.name) || 'Bé';
    const rec = input.record || {};
    const seed = seedOf((input.student && input.student.id ? input.student.id : ten) + '|' + (input.date || ''));
    const prof = input.profile || {};
    const st = rec.strength || null;
    const im = rec.improve || null;
    // chi tiết điểm mạnh: ưu tiên st.detail, fallback observation (bản ghi cũ)
    const stDetail = ((st && st.detail) || rec.observation || '').trim();
    const imDetail = ((im && im.detail) || '').trim();

    // dòng 1 — Điểm mạnh hôm nay
    let diem_manh;
    if (st && st.sentence) {
      let openers = OPENERS;
      if (prof.introversion === 'introvert') openers = OPENERS_INTROVERT.concat(OPENERS);
      else if (prof.introversion === 'extrovert') openers = OPENERS_EXTROVERT.concat(OPENERS);
      diem_manh = ensureDot(pick(openers, seed).replace('{ten}', ten).replace('{phrase}', lowerFirst(stripDot(st.sentence))));
    } else {
      diem_manh = ensureDot(`Hôm nay ${ten} tham gia buổi học và có nhiều cố gắng`);
    }
    if (stDetail) diem_manh += ' Cụ thể, ' + ensureDot(lowerFirst(stDetail));

    // dòng 2 — Điều con đang cố gắng (tiêu chí cần cải thiện)
    let co_gang;
    if (im && im.sentence) co_gang = ensureDot(`Bên cạnh đó, ${ten} ${lowerFirst(stripDot(im.sentence))}`);
    else if ((rec.effort || '').trim()) co_gang = ensureDot(`${ten} cũng đang cố gắng ${lowerFirst(rec.effort.trim())}`);
    else co_gang = ensureDot(`${ten} đang làm quen với nhiều hoạt động mới và ngày một tiến bộ`);
    if (imDetail) co_gang += ' ' + ensureDot(upperFirst(imDetail));

    // dòng 3 — Gợi ý ở nhà theo tiêu chí cần cải thiện
    const tipCrit = (im && im.crit) || (st && st.crit) || 'tu_duy';
    const goi_y = ensureDot(TIP_BY_CRIT[tipCrit] || TIP_BY_CRIT.tu_duy) + themeHook(input.theme && input.theme.title, ten);

    return { diem_manh: diem_manh.trim(), co_gang: co_gang.trim(), goi_y: goi_y.trim(), featured_strength: st ? st.crit : null };
  }

  /* Guard giọng thương hiệu — quét TỪ cấm theo ranh giới từ */
  function checkVoice(text) {
    const low = (text || '').toLowerCase();
    const hits = BANNED.filter((w) => {
      try { return new RegExp('(^|[^\\p{L}])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^\\p{L}])', 'u').test(low); }
      catch (_) { return low.includes(w); }
    });
    return { ok: hits.length === 0, banned: hits };
  }

  /* Ghép văn bản gửi Zalo — KHÔNG link (mặc định). Cấu trúc:
     📖 Nội dung học tuần · ✅ Bé làm được · 📌 Bé cần hỗ trợ */
  function composeZalo(student, dateStr, msg, link) {
    const les = msg.lesson_snapshot && msg.lesson_snapshot.content;
    return (
      `🧸 BÁO CÁO BUỔI HỌC\n` +
      `Bé ${student.name} · ${fmtDate(dateStr)}\n\n` +
      (les ? `📖 NỘI DUNG HỌC TUẦN NÀY\n${les}\n\n` : '') +
      `✅ ĐIỂM BÉ LÀM ĐƯỢC\n${msg.diem_manh}\n\n` +
      `📌 ĐIỂM BÉ CẦN HỖ TRỢ\n${msg.co_gang}` +
      (link ? `\n\n🔗 Xem chi tiết: ${link}` : '')
    ).trim();
  }
  function fmtDate(d) { if (!d) return ''; const [y, m, day] = d.split('-'); return `${day}/${m}/${y}`; }

  /* ════════ TRỢ LÝ GV: gợi ý tiêu chí từ quan sát ════════ */
  const CRIT_KW = {
    tap_trung: ['tập trung', 'chú ý', 'lắng nghe', 'chăm chú', 'ngồi yên', 'theo dõi'],
    tham_gia: ['hào hứng', 'giơ tay', 'phát biểu', 'tham gia', 'sôi nổi', 'thích', 'xung phong', 'mạnh dạn'],
    tu_duy: ['quan sát', 'suy luận', 'quy luật', 'phân loại', 'tìm ra cách', 'giải', 'nhận biết'],
    tu_lap: ['tự làm', 'tự ghép', 'tự tìm', 'không cần', 'tự giác', 'hoàn thành', 'độc lập', 'tự tin'],
    hop_tac: ['giúp bạn', 'cùng bạn', 'chia sẻ', 'chờ đến lượt', 'nhóm', 'phối hợp', 'hoà đồng', 'hòa đồng'],
  };
  const THIN_PATTERNS = ['bé ngoan', 'bé giỏi', 'ngoan', 'tốt', 'bình thường', 'ok', 'được'];
  function suggestFromObservation(obs) {
    const text = (obs || '').toLowerCase().trim();
    const out = { crit: null, thin: false, hints: [] };
    const wc = text ? text.split(/\s+/).length : 0;
    if (wc < 4 || THIN_PATTERNS.some((p) => text === p || text === p + '.')) {
      out.thin = true; out.hints.push('Quan sát hơi chung — thêm 1 chi tiết cụ thể (con làm gì, với cái gì) để tin nhắn "đắt" hơn.');
    }
    if (!text) return out;
    let best = null, bestN = 0;
    for (const k in CRIT_KW) { const n = CRIT_KW[k].filter((w) => text.includes(w)).length; if (n > bestN) { bestN = n; best = k; } }
    out.crit = best;
    return out;
  }

  /* ════════ MANAGER INSIGHTS (theo tiêu chí) ════════ */
  function computeInsights(items) {
    const sCnt = {}, iCnt = {}; CRITERIA.forEach((c) => { sCnt[c.key] = 0; iCnt[c.key] = 0; });
    let totalRecords = 0; const attention = [];
    items.forEach(({ student, records }) => {
      const present = (records || []).filter((r) => r.attendance === 'present');
      totalRecords += present.length;
      const myImp = {};
      present.forEach((r) => {
        if (r.strength && r.strength.crit) sCnt[r.strength.crit]++;
        if (r.improve && r.improve.crit) { iCnt[r.improve.crit]++; myImp[r.improve.crit] = (myImp[r.improve.crit] || 0) + 1; }
      });
      const negMood = present.length ? present.filter((r) => r.mood === 'sad' || r.mood === 'tired').length / present.length : 0;
      const recurring = Object.entries(myImp).filter(([, n]) => n >= 2).map(([k]) => critLabel(k));
      const reasons = [];
      if (recurring.length) reasons.push('cần rèn thêm: ' + recurring.join(', ').toLowerCase());
      if (negMood >= 0.5) reasons.push('nhiều buổi tâm trạng chưa vui');
      if (reasons.length) attention.push({ name: student.name, gender: student.gender, sessions: present.length, reasons });
    });
    const rankS = Object.entries(sCnt).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    const rankI = Object.entries(iCnt).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
    return {
      strengthCounts: sCnt, improveCounts: iCnt,
      strongest: rankS[0] ? { key: rankS[0][0], label: critLabel(rankS[0][0]), n: rankS[0][1] } : null,
      weakest: rankI[0] ? { key: rankI[0][0], label: critLabel(rankI[0][0]), n: rankI[0][1] } : null,
      attention, totalRecords, totalStudents: items.length,
    };
  }

  /* ════════ BÁO CÁO TUẦN: gom các buổi của 1 bé ════════ */
  function weeklyDigest(records) {
    const present = (records || []).filter((r) => r.attendance === 'present');
    const absent = (records || []).filter((r) => r.attendance === 'absent');
    const sCnt = {}, iCnt = {}; const sSent = [], iSent = [], sDet = [], iDet = [];
    present.forEach((r) => {
      if (r.strength && r.strength.crit) { sCnt[r.strength.crit] = (sCnt[r.strength.crit] || 0) + 1; if (r.strength.sentence) sSent.push(r.strength.sentence); if (r.strength.detail) sDet.push(r.strength.detail.trim()); }
      if (r.improve && r.improve.crit) { iCnt[r.improve.crit] = (iCnt[r.improve.crit] || 0) + 1; if (r.improve.sentence) iSent.push(r.improve.sentence); if (r.improve.detail) iDet.push(r.improve.detail.trim()); }
    });
    const topStrengths = Object.entries(sCnt).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => critLabel(k));
    const improveAreas = Object.entries(iCnt).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => critLabel(k));
    const highlights = present.map((r) => (((r.strength && r.strength.detail) || r.observation) || '').trim()).filter((o) => o.split(/\s+/).length >= 4).slice(0, 3);
    const topImp = Object.entries(iCnt).sort((a, b) => b[1] - a[1])[0];
    const uniq = (a) => Array.from(new Set(a.filter(Boolean)));
    return {
      sessions: present.length, absent: absent.length, topStrengths, improveAreas, highlights,
      strengthSentences: uniq(sSent), improveSentences: uniq(iSent), strengthDetails: uniq(sDet), improveDetails: uniq(iDet),
      weakest: topImp ? { key: topImp[0], label: critLabel(topImp[0]) } : null,
      moods: present.map((r) => r.mood),
    };
  }
  function weeklyNarrative(dg, ten) {
    // bé không học buổi nào → không bịa nhận xét (báo cáo tuần sẽ bỏ qua bé này)
    if (!dg || dg.sessions === 0) {
      return { tongHop: `Tuần này ${ten} chưa có buổi học nào được ghi nhận.`, coGang: '', oNha: '' };
    }
    let tongHop;
    {
      tongHop = `Tuần này ${ten} tham gia ${dg.sessions} buổi học` + (dg.absent ? ` (nghỉ ${dg.absent} buổi)` : '') + '. ';
      if (dg.topStrengths.length) tongHop += `Con thể hiện tốt ở ${dg.topStrengths.join(', ').toLowerCase()}. `;
      if (dg.highlights.length) tongHop += 'Một vài khoảnh khắc đáng nhớ: ' + dg.highlights.map((h) => ensureDot(lowerFirst(h))).join(' ');
    }
    // điểm cần cải thiện — ưu tiên câu cụ thể GV đã chọn/ghi
    let coGang;
    const impBits = (dg && (dg.improveSentences || []).length) ? dg.improveSentences.map((s) => lowerFirst(stripDot(s))) : [];
    if (impBits.length) coGang = `Điều ${ten} cần cải thiện thêm: ${impBits.join('; ')}. Cô sẽ tiếp tục đồng hành để con tiến bộ ở những điểm này.`;
    else if (dg && dg.improveAreas && dg.improveAreas.length) coGang = `${ten} đang cố gắng hơn ở ${dg.improveAreas.join(', ').toLowerCase()}, và ngày một tiến bộ.`;
    else coGang = `${ten} đang làm quen với nhiều hoạt động mới và tham gia ngày một tích cực.`;
    const wk = (dg && dg.weakest) ? dg.weakest.key : 'tu_duy';
    return { tongHop: tongHop.trim(), coGang: ensureDot(coGang), oNha: ensureDot(TIP_BY_CRIT[wk] || TIP_BY_CRIT.tu_duy) };
  }

  /* tóm tắt "tuần này con học gì" — ưu tiên nội dung AI soạn cho phụ huynh */
  const THINKING_SKILLS = [
    { label: 'tư duy cơ bản', words: ['tư duy cơ bản', 'quan sát', 'so sánh', 'giống', 'khác', 'phân biệt', 'phân loại'] },
    { label: 'tư duy logic', words: ['tư duy logic', 'suy luận', 'quy luật', 'logic', 'bắc cầu', 'tiêu chí', 'giống', 'khác', 'phân loại'] },
    { label: 'tư duy toán học', words: ['tư duy toán học', 'toán', 'phép cộng', 'phép trừ', 'đếm', 'số', 'nhiều hơn', 'ít hơn'] },
    { label: 'tư duy sáng tạo', words: ['tư duy sáng tạo', 'sáng tạo', 'tưởng tượng', 'ý tưởng', 'tạo ra đồ vật mới'] },
  ];
  const ACTIVITY_PATTERNS = [
    { text: 'câu chuyện', words: ['câu chuyện', 'kể chuyện'] },
    { text: 'quan sát', words: ['quan sát'] },
    { text: 'so sánh và tìm điểm giống - khác', words: ['giống', 'khác', 'tương đồng', 'khác biệt'] },
    { text: 'phân loại', words: ['phân loại'] },
    { text: 'vẽ bằng hai tay', words: ['vẽ bằng 2 tay', 'vẽ bằng hai tay'] },
    { text: 'ghép hình theo mẫu', words: ['ghép hình', 'lắp hình'] },
    { text: 'thao tác học cụ', words: ['học cụ', 'numberblock', 'block', 'thẻ', 'phiếu bài tập'] },
    { text: 'trò chơi và khám phá', words: ['trò chơi', 'khám phá'] },
  ];
  function hasAny(text, words) { text = (text || '').toLowerCase(); return words.some((w) => text.includes(w)); }
  function joinNice(items) {
    items = Array.from(new Set((items || []).filter(Boolean)));
    if (items.length <= 1) return items.join('');
    if (items.length === 2) return items[0] + ' và ' + items[1];
    return items.slice(0, -1).join(', ') + ' và ' + items[items.length - 1];
  }
  function inferThinkingSkills(text) {
    const found = THINKING_SKILLS.filter((s) => hasAny(text, s.words)).map((s) => s.label);
    return found.length ? found.slice(0, 3) : ['tư duy cơ bản'];
  }
  function inferActivities(text) {
    const found = ACTIVITY_PATTERNS.filter((a) => hasAny(text, a.words)).map((a) => a.text);
    return found.length ? found.slice(0, 5) : ['các hoạt động trải nghiệm', 'thao tác học cụ'];
  }
  function lessonSummary(les) {
    if (!les) return '';
    if (les.parent_content) return les.parent_content;
    const raw = [
      les.title || '',
      les.objective || '',
      Array.isArray(les.objectives) ? les.objectives.join(' ') : '',
      les.knowledge || '',
      les.skill || '',
      (les.pages || []).map((p) => [p.type, p.desc].filter(Boolean).join(' ')).join(' '),
      Array.isArray(les.body) ? les.body.join(' ') : '',
    ].join(' ');
    const title = (les.title || '').replace(/\.$/, '').trim();
    const skills = joinNice(inferThinkingSkills(raw));
    let actList = inferActivities(raw);
    if (title.toLowerCase().includes('câu chuyện')) actList = actList.filter((a) => a !== 'câu chuyện');
    const acts = joinNice(actList);
    const titlePart = title ? ` thông qua ${title.toLowerCase().includes('câu chuyện') ? title : 'chủ đề "' + title + '"'}` : '';
    return (`Tuần này, các con được rèn luyện ${skills}${titlePart} cùng các hoạt động như ${acts}. ` +
      `Các hoạt động đa dạng, linh hoạt theo hướng học qua trải nghiệm, khám phá và học cụ giúp con phát triển khả năng tập trung, phối hợp và suy luận một cách hứng thú.`).trim();
  }

  /* Hồ sơ bé: suy từ tần suất tiêu chí mạnh/cần cải thiện */
  function inferProfile(records) {
    const present = records.filter((r) => r.attendance === 'present');
    const sCnt = {}, iCnt = {};
    present.forEach((r) => {
      if (r.strength && r.strength.crit) sCnt[r.strength.crit] = (sCnt[r.strength.crit] || 0) + 1;
      if (r.improve && r.improve.crit) iCnt[r.improve.crit] = (iCnt[r.improve.crit] || 0) + 1;
    });
    const topS = (Object.entries(sCnt).sort((a, b) => b[1] - a[1])[0] || [])[0];
    const topI = (Object.entries(iCnt).sort((a, b) => b[1] - a[1])[0] || [])[0];
    let introversion = 'balanced';
    if (['tham_gia', 'hop_tac'].includes(topS)) introversion = 'extrovert';
    else if (['tham_gia', 'hop_tac'].includes(topI)) introversion = 'introvert';
    const concerns = topI ? ['Đang rèn thêm ở mảng ' + critLabel(topI).toLowerCase()] : [];
    const summary = `Sau ${present.length} buổi, con nổi bật ở ${topS ? critLabel(topS).toLowerCase() : 'nhiều mặt'}` + (topI ? `, đang rèn thêm ${critLabel(topI).toLowerCase()}` : '') + '.';
    return { introversion, learning_style: 'mixed', concerns, summary, observedSessions: present.length, topStrength: topS, topImprove: topI };
  }

  window.CTRC_ENGINE = {
    CRITERIA, DIMS, critLabel, generate, checkVoice, composeZalo, inferProfile,
    fmtDate, seedOf, suggestFromObservation, computeInsights, weeklyDigest, weeklyNarrative, lessonSummary,
    setCriteria, defaultCriteria,
  };
})();
