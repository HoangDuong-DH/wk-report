/* ═══════════════════════════════════════════════════════════════════════════
   CTRC — ENGINE SINH NỘI DUNG (4 lớp, deterministic, offline)
   ───────────────────────────────────────────────────────────────────────────
   L1 Chuẩn nền   : giọng thương hiệu + format 3 dòng + 10 điểm mạnh
   L2 Bối cảnh    : chủ đề tuần
   L3 Hồ sơ bé    : hướng nội/ngoại + kiểu học → điều chỉnh giọng
   L4 Hôm nay     : GV chấm + tick + QUAN SÁT CỤ THỂ (lõi của tin)

   Deterministic theo seed=hash(studentId+date) → ổn định/buổi, đa dạng/bé.
   KHÔNG dùng Math.random ở chỗ tạo nội dung để 2 lần sinh ra cùng kết quả.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const DIMS = [
    { key: 'focus', label: 'Tập trung' },
    { key: 'logic', label: 'Logic' },
    { key: 'reflex', label: 'Phản xạ' },
    { key: 'interaction', label: 'Tương tác' },
    { key: 'creativity', label: 'Sáng tạo' },
  ];

  const BANNED = ['kém', 'yếu', 'tệ', 'dốt', 'lười', 'chậm chạp', 'ngu', 'hư'];

  // mở đầu Điểm mạnh (xoay theo seed + giọng hồ sơ)
  const OPENERS = [
    'Hôm nay, {ten} đã {phrase}',
    'Trong buổi học hôm nay, {ten} {phrase}',
    'Một điểm rất đáng khen ở {ten} hôm nay: bé {phrase}',
    '{ten} hôm nay khiến cô ấn tượng khi {phrase}',
  ];
  const OPENERS_INTROVERT = [
    'Hôm nay, {ten} nhẹ nhàng nhưng rất chắc chắn khi {phrase}',
    '{ten} hôm nay cho thấy sự tiến bộ đáng yêu: bé {phrase}',
  ];
  const OPENERS_EXTROVERT = [
    'Hôm nay {ten} tràn đầy năng lượng và {phrase}',
    '{ten} hôm nay rất sôi nổi khi {phrase}',
  ];

  // Điểm cố gắng theo chiều yếu nhất (khung tích cực, hướng tới trước)
  const EFFORT_BANK = {
    focus: 'đang làm quen với việc giữ tập trung lâu hơn, và bé đã chủ động ngồi vào bàn để thử lại',
    logic: 'đang tập suy luận từng bước, bé chịu khó nghĩ thay vì bỏ cuộc khi gặp bài khó',
    reflex: 'đang luyện phản xạ trả lời nhanh hơn, và bé ngày càng mạnh dạn đưa ra câu trả lời',
    interaction: 'đang dần cởi mở hơn khi làm việc cùng bạn, bé đã thử chia sẻ ý kiến của mình',
    creativity: 'đang khám phá nhiều cách làm mới, bé sẵn sàng thử ý tưởng khác lạ của riêng mình',
  };

  // Gợi ý ở nhà theo chiều yếu nhất × kiểu học (5-10 phút, không cần mua đồ)
  const TIPS = {
    focus: {
      visual: 'Bố mẹ thử chơi cùng bé trò "tìm điểm khác nhau" giữa hai bức tranh trong 5 phút — vừa vui vừa rèn sự tập trung.',
      auditory: 'Bố mẹ thử đọc cho bé một mẩu chuyện ngắn rồi hỏi lại 2-3 chi tiết — giúp bé tập chú ý lắng nghe.',
      kinesthetic: 'Cho bé xếp lại đồ chơi theo màu trong 5 phút — vận động tay kết hợp tập trung.',
      mixed: 'Bố mẹ cùng bé chơi "tìm điểm khác nhau" giữa hai bức tranh 5 phút để rèn sự tập trung.',
    },
    logic: {
      visual: 'Khi chơi xếp đồ, bố mẹ thử hỏi "vì sao con xếp cái này trước?" để bé tập giải thích suy nghĩ.',
      auditory: 'Bố mẹ đố bé những câu "cái gì… mà…" đơn giản để bé tập suy luận qua lời nói.',
      kinesthetic: 'Cho bé phân loại đồ vật trong nhà theo nhóm (tròn/vuông, to/nhỏ) — học logic qua tay.',
      mixed: 'Khi chơi cùng bé, hỏi "vì sao con chọn cái này?" để bé tập giải thích cách nghĩ.',
    },
    reflex: {
      visual: 'Chơi trò "chỉ nhanh" — bố mẹ nói màu, bé chỉ nhanh đồ vật màu đó quanh nhà.',
      auditory: 'Trò "đố nhanh" đếm số tiếng vỗ tay rồi trả lời ngay giúp bé phản xạ nhanh hơn.',
      kinesthetic: 'Chơi "ai nhanh hơn" nhặt đúng đồ bố mẹ gọi tên trong 5 phút.',
      mixed: 'Chơi "đố nhanh" đếm đồ vật quanh nhà trong 5 phút giúp bé phản xạ nhanh hơn.',
    },
    interaction: {
      visual: 'Bố mẹ cùng bé xem một bức tranh rồi thay nhau kể bé thấy gì — luyện chia sẻ.',
      auditory: 'Để bé kể lại một việc vui trong ngày cho cả nhà nghe — luyện bé tự tin nói.',
      kinesthetic: 'Cùng bé chơi trò đóng vai bán hàng/mua hàng — bé tập tương tác qua vận động.',
      mixed: 'Bố mẹ để bé kể lại một việc trong ngày — luyện bé tự tin chia sẻ với người khác.',
    },
    creativity: {
      visual: 'Cho bé vẽ tiếp một hình bất kỳ thành con vật bé thích — khuyến khích trí tưởng tượng.',
      auditory: 'Bố mẹ kể nửa câu chuyện rồi để bé nghĩ đoạn kết của riêng mình.',
      kinesthetic: 'Cho bé nặn/đắp một hình tự do từ đất nặn hoặc gối — sáng tạo qua đôi tay.',
      mixed: 'Cho bé vẽ tiếp một hình bất kỳ thành thứ bé thích để khuyến khích sáng tạo.',
    },
  };

  // gợi ý gắn chủ đề tuần (nếu có theme → ưu tiên 1 câu nối bối cảnh)
  function themeHook(theme, ten) {
    if (!theme) return '';
    return ` Tuần này lớp đang học "${theme}", bố mẹ có thể trò chuyện thêm với ${ten} về chủ đề này nhé.`;
  }

  /* hash ổn định → số nguyên */
  function seedOf(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }
  const pick = (arr, seed) => arr[seed % arr.length];

  function weakestDim(scores) {
    let best = null, val = 99;
    DIMS.forEach((d) => {
      const v = +(scores && scores[d.key]) || 0;
      if (v > 0 && v < val) { val = v; best = d; }
    });
    return best || DIMS[1]; // mặc định logic
  }

  function ensureDot(s) {
    s = (s || '').trim();
    if (!s) return s;
    return /[.!?…]$/.test(s) ? s : s + '.';
  }

  /* ── BỘ SINH CHÍNH ──
     input: {
       student:{name}, record:{scores_5d,strengths,observation,effort,mood},
       strengths:[{idx,label,phrase}], theme:{title}, profile:{introversion,learning_style},
       recentFeatured:[idx...], date:'YYYY-MM-DD'
     }
     output: { diem_manh, co_gang, goi_y, featured_strength }
  */
  function generate(input) {
    const ten = (input.student && input.student.name) || 'Bé';
    const rec = input.record || {};
    const seed = seedOf((input.student && input.student.id ? input.student.id : ten) + '|' + (input.date || ''));
    const prof = input.profile || {};
    const recent = new Set(input.recentFeatured || []);

    /* chọn điểm mạnh nêu (anti-lặp 5 buổi gần) */
    const picked = (rec.strengths || []).slice();
    const bank = input.strengths || [];
    let featured = null;
    // ưu tiên điểm đã tick mà CHƯA dùng gần đây
    for (const idx of picked) { if (!recent.has(idx)) { featured = idx; break; } }
    // nếu tất cả đã dùng gần đây → lấy điểm tick đầu tiên
    if (featured == null && picked.length) featured = picked[0];
    // nếu GV không tick gì → suy từ chiều mạnh nhất (map mềm)
    if (featured == null) {
      const strongDim = [...DIMS].sort((a, b) => (+(rec.scores_5d || {})[b.key] || 0) - (+(rec.scores_5d || {})[a.key] || 0))[0];
      const mapDim = { focus: 1, logic: 3, reflex: 9, interaction: 2, creativity: 5 };
      featured = mapDim[strongDim.key] || 1;
    }
    const strengthObj = bank.find((s) => s.idx === featured) || { phrase: 'thể hiện sự tiến bộ rõ rệt' };

    /* L3: chọn opener theo hồ sơ */
    let openers = OPENERS;
    if (prof.introversion === 'introvert') openers = OPENERS_INTROVERT.concat(OPENERS);
    else if (prof.introversion === 'extrovert') openers = OPENERS_EXTROVERT.concat(OPENERS);
    const opener = pick(openers, seed).replace('{ten}', ten).replace('{phrase}', strengthObj.phrase);

    /* L4: quan sát cụ thể = "vàng" → ghép vào sau opener */
    const obs = (rec.observation || '').trim();
    let diem_manh = ensureDot(opener);
    if (obs) diem_manh += ' Cụ thể, ' + ensureDot(lowerFirst(obs));

    /* có điểm chấm hợp lệ không? (GV có thể lưu mà chưa tap chiều nào) */
    const hasScores = Object.values(rec.scores_5d || {}).some((v) => +v > 0);

    /* Điểm cố gắng */
    let co_gang;
    if ((rec.effort || '').trim()) {
      co_gang = `${ten} cũng đang cố gắng ${ensureDot(lowerFirst(rec.effort.trim()))}`;
    } else if (hasScores) {
      const wd = weakestDim(rec.scores_5d);
      co_gang = ensureDot(`${ten} ${EFFORT_BANK[wd.key]}`);
    } else {
      co_gang = ensureDot(`${ten} đang làm quen với nhiều hoạt động mới và ngày càng tham gia tích cực hơn`);
    }

    /* Gợi ý ở nhà theo chiều yếu nhất × kiểu học + hook chủ đề */
    const style = prof.learning_style || 'mixed';
    let goi_y;
    if (hasScores) {
      const wd = weakestDim(rec.scores_5d);
      goi_y = (TIPS[wd.key] && TIPS[wd.key][style]) || TIPS[wd.key].mixed;
    } else {
      goi_y = (TIPS.creativity[style]) || TIPS.creativity.mixed;
    }
    goi_y = ensureDot(goi_y) + themeHook(input.theme && input.theme.title, ten);

    return {
      diem_manh: diem_manh.trim(),
      co_gang: co_gang.trim(),
      goi_y: goi_y.trim(),
      featured_strength: featured,
    };
  }

  function lowerFirst(s) { return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }

  /* Guard giọng thương hiệu — quét từ cấm, trả về cảnh báo (không tự sửa nội dung của người) */
  function checkVoice(text) {
    const low = (text || '').toLowerCase();
    const hits = BANNED.filter((w) => low.includes(w));
    return { ok: hits.length === 0, banned: hits };
  }

  /* Ghép khối Copy cho CSKH paste Zalo */
  function composeZalo(student, dateStr, msg, link) {
    return (
      `Báo cáo buổi ${fmtDate(dateStr)} của bé ${student.name}\n\n` +
      `👍 Điểm mạnh: ${msg.diem_manh}\n` +
      `🎯 Cố gắng: ${msg.co_gang}\n` +
      `🏠 Gợi ý ở nhà: ${msg.goi_y}\n\n` +
      (link ? `Xem chi tiết: ${link}` : '')
    ).trim();
  }
  function fmtDate(d) {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  /* Suy luận hồ sơ bé từ lịch sử record (sinh nháp sau ≥3 buổi) */
  function inferProfile(records) {
    const valid = records.filter((r) => r.attendance === 'present');
    const avg = (k) => {
      const xs = valid.map((r) => +((r.scores_5d || {})[k]) || 0).filter((x) => x > 0);
      return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
    };
    const baseline = {};
    DIMS.forEach((d) => (baseline[d.key] = Math.round(avg(d.key) * 10) / 10));

    const interaction = baseline.interaction;
    const introversion = interaction >= 4 ? 'extrovert' : interaction <= 2.5 ? 'introvert' : 'balanced';

    // kiểu học: chiều mạnh nhất → map
    const strong = [...DIMS].sort((a, b) => baseline[b.key] - baseline[a.key])[0].key;
    const styleMap = { focus: 'visual', logic: 'visual', reflex: 'kinesthetic', interaction: 'auditory', creativity: 'kinesthetic' };
    const learning_style = styleMap[strong] || 'mixed';

    // concerns: chiều yếu < 2.5
    const concerns = DIMS.filter((d) => baseline[d.key] > 0 && baseline[d.key] < 2.5)
      .map((d) => `Đang theo dõi thêm ở mảng ${d.label.toLowerCase()}`);

    const styleLabel = { visual: 'thị giác (hình ảnh)', auditory: 'thính giác (lắng nghe)', kinesthetic: 'vận động (thao tác)', mixed: 'hỗn hợp' }[learning_style];
    const introLabel = { introvert: 'thiên hướng nội', extrovert: 'thiên hướng ngoại', balanced: 'cân bằng' }[introversion];
    const summary = `Sau ${valid.length} buổi quan sát, bé có ${introLabel}, học tốt nhất qua kênh ${styleLabel}.` +
      (concerns.length ? ' ' + concerns.join('; ') + '.' : '');

    return { introversion, learning_style, concerns, baseline_5d: baseline, summary, observedSessions: valid.length };
  }

  window.CTRC_ENGINE = { DIMS, generate, checkVoice, composeZalo, inferProfile, fmtDate, seedOf };
})();
