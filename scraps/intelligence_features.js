/* ═══════════════════════════════════════════════════════════════
   INTELLIGENCE LAYER — Skill Profile + Insights + Action Plan
   Biến report từ "list metrics" → "story + insight + action"
   ═══════════════════════════════════════════════════════════════ */

// ─── 1. SKILL PROFILE TYPING — 8 archetypes ───
const __PROFILES_MG = {
  PRODIGY: {
    key: 'PRODIGY', emoji: '🌟', color: '#d4af37',
    name: 'Thần đồng đa năng',
    headline: 'Bé phát triển vượt trội ở cả 4 nhóm năng lực — hiếm gặp ở lứa tuổi.',
    strengths: 'Tư duy logic, sáng tạo, toán học và năng lực cơ bản đều ở mức cao.',
    growth: 'Tiếp tục thử thách bé với bài toán mở để tránh nhàm chán. Quan tâm đến phát triển kỹ năng xã hội cân bằng với học thuật.',
  },
  LOGICIAN: {
    key: 'LOGICIAN', emoji: '🧠', color: '#4a7fc4',
    name: 'Nhà tư duy logic',
    headline: 'Bé có khả năng suy luận, phân tích vấn đề và tổng hợp thông tin nổi bật.',
    strengths: 'Hiểu mối quan hệ nguyên nhân-kết quả, phân loại, lập luận chặt chẽ.',
    growth: 'Khuyến khích thêm hoạt động sáng tạo (vẽ, kể chuyện) để cân bằng não trái-phải.',
  },
  ARTIST: {
    key: 'ARTIST', emoji: '🎨', color: '#c4577a',
    name: 'Tâm hồn sáng tạo',
    headline: 'Bé giàu ý tưởng, linh hoạt và độc đáo — phù hợp các lĩnh vực nghệ thuật, thiết kế.',
    strengths: 'Tư duy trôi chảy, linh hoạt, có nhiều ý tưởng mới lạ.',
    growth: 'Cần luyện thêm tính tỉ mỉ, kiên nhẫn hoàn thiện chi tiết — tránh "vẽ vời" dở dang.',
  },
  MATHEMATICIAN: {
    key: 'MATHEMATICIAN', emoji: '📐', color: '#5fa860',
    name: 'Đầu óc toán học',
    headline: 'Bé nắm vững các khái niệm số, hình học, đo lường và kiểu mẫu.',
    strengths: 'Số học, hình học không gian, nhận diện quy luật.',
    growth: 'Đầu tư thêm phần ngôn ngữ, kể chuyện để cân bằng tư duy phân tích vs cảm xúc.',
  },
  OBSERVER: {
    key: 'OBSERVER', emoji: '🔍', color: '#d68a3c',
    name: 'Người quan sát tinh tế',
    headline: 'Bé tập trung tốt, quan sát chi tiết và ghi nhớ chắc chắn.',
    strengths: 'Chú ý, quan sát và ghi nhớ — nền tảng tốt cho học tập kiên trì.',
    growth: 'Cần luyện thêm phần ÁP DỤNG kiến thức (chuyển từ quan sát → hành động).',
  },
  ALLROUNDER: {
    key: 'ALLROUNDER', emoji: '⚡', color: '#7e57c2',
    name: 'Học sinh toàn diện',
    headline: 'Bé phát triển đều ở 4 nhóm năng lực, không có điểm yếu rõ rệt.',
    strengths: 'Cân bằng — linh hoạt thích ứng với nhiều loại bài học.',
    growth: 'Có thể chọn 1 nhóm bé yêu thích nhất để đầu tư sâu hơn, tạo điểm vượt trội.',
  },
  LATE_BLOOMER: {
    key: 'LATE_BLOOMER', emoji: '🌱', color: '#8a7560',
    name: 'Bé cần thêm thời gian',
    headline: 'Bé đang trong giai đoạn phát triển — cần đồng hành, kiên nhẫn và khuyến khích.',
    strengths: 'Mỗi bé có tốc độ riêng — đây là điểm xuất phát, không phải mức độ tối đa.',
    growth: 'Tập trung 1-2 hoạt động đơn giản 10p/ngày, ưu tiên niềm vui hơn kết quả.',
  },
  BALANCED: {
    key: 'BALANCED', emoji: '🌈', color: '#3e98a4',
    name: 'Phát triển hài hòa',
    headline: 'Bé có nét nổi bật riêng kết hợp với những nhóm năng lực đang phát triển.',
    strengths: 'Hồ sơ năng lực đa dạng — mỗi bé là 1 cá thể độc đáo.',
    growth: 'Tiếp tục theo dõi để hỗ trợ đúng điểm mạnh và điểm cần luyện thêm.',
  },
};

function __classifyProfileMG(){
  if(typeof aggregateAtomicMG !== 'function') return __PROFILES_MG.BALANCED;
  const agg = aggregateAtomicMG();
  if(!agg.fields || Object.keys(agg.fields).length === 0) return __PROFILES_MG.BALANCED;
  const cb = agg.fields.basic?.pct || 0;
  const to = agg.fields.math?.pct || 0;
  const lg = agg.fields.logic?.pct || 0;
  const st = agg.fields.creative?.pct || 0;
  const avg = (cb + to + lg + st) / 4;
  const arr = [cb, to, lg, st];
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  const variance = max - min;

  // Rules ordered by specificity (most specific first)
  if(min > 75) return __PROFILES_MG.PRODIGY;
  if(avg < 45) return __PROFILES_MG.LATE_BLOOMER;
  if(variance < 12 && avg > 55) return __PROFILES_MG.ALLROUNDER;
  if(st > 65 && st === max) return __PROFILES_MG.ARTIST;
  if(lg > 65 && lg === max) return __PROFILES_MG.LOGICIAN;
  if(to > 65 && to === max) return __PROFILES_MG.MATHEMATICIAN;
  if(cb > 65 && cb === max) return __PROFILES_MG.OBSERVER;
  return __PROFILES_MG.BALANCED;
}

// ─── 2. INSIGHT ENGINE — pattern-based rule firing ───
function __generateInsightsMG(){
  if(typeof aggregateAtomicMG !== 'function') return [];
  const agg = aggregateAtomicMG();
  const insights = [];
  const sk = agg.skillSum || {};
  const fields = agg.fields || {};
  const support = agg.supportSum || {};
  const bloom = agg.bloomSum || {};

  const pct = key => sk[key]?.pct ?? null;
  const fld = key => fields[key]?.pct ?? null;

  // ─── Cross-field patterns ───
  if(fld('basic') >= 60 && fld('logic') < 50){
    insights.push({
      icon:'🔍', tone:'observation',
      title:'Quan sát tốt nhưng kết nối còn yếu',
      desc:'Bé nhận biết thông tin xung quanh khá tốt nhưng chưa kết nối thành lập luận. Khuyến khích đặt câu hỏi "vì sao?" sau mỗi quan sát, kể lại quá trình bé suy nghĩ.'
    });
  }
  if(fld('math') >= 60 && fld('creative') < 45){
    insights.push({
      icon:'📐', tone:'balance',
      title:'Toán mạnh, sáng tạo cần khơi gợi',
      desc:'Bé nắm tốt khái niệm số/hình nhưng thiếu hoạt động mở. Kết hợp toán với câu chuyện (vd: "có 3 con thỏ, mỗi con thích..."), khuyến khích vẽ tự do sau giờ học.'
    });
  }
  if(fld('creative') >= 60 && pct('precision') !== null && pct('precision') < 45){
    insights.push({
      icon:'🎨', tone:'refine',
      title:'Ý tưởng phong phú, cần luyện chi tiết',
      desc:'Bé có nhiều ý tưởng nhưng chưa rèn được tính tỉ mỉ, hoàn thiện. Hoạt động xếp lego/origami nhiều bước, vẽ chi tiết, tô màu trong khung sẽ giúp ích.'
    });
  }
  if(fld('logic') >= 60 && fld('basic') < 50){
    insights.push({
      icon:'🧠', tone:'foundation',
      title:'Suy luận sắc bén, nền tảng cần củng cố',
      desc:'Bé tư duy nhanh nhưng có thể "đốt cháy giai đoạn". Luyện thêm bài tập tập trung (puzzle 10p), ghi nhớ chuỗi đơn giản trước khi bài khó.'
    });
  }

  // ─── Single skill spotlights ───
  if(pct('memory') !== null && pct('memory') < 40 && pct('attention') > 55){
    insights.push({
      icon:'⏳', tone:'memory',
      title:'Tập trung OK nhưng nhớ chưa lâu',
      desc:'Bé chú ý được tại thời điểm học nhưng chưa chuyển vào trí nhớ dài hạn. Cách giúp: hỏi lại bé sau 1 tiếng / hôm sau về việc vừa học, dùng flashcard.'
    });
  }
  if(pct('pattern') > 65 && pct('application') !== null && pct('application') < 45){
    insights.push({
      icon:'🔁', tone:'application',
      title:'Nhận ra quy luật nhưng chưa áp dụng',
      desc:'Bé thấy được pattern nhưng chưa dùng để giải bài mới. Cùng bé tạo "tủ rule": tự nghĩ luật rồi áp dụng (vd: "tất cả con vật có cánh đều biết bay → tìm phản ví dụ").'
    });
  }
  if(pct('analysis') !== null && pct('analysis') < 40 && pct('synthesis') !== null && pct('synthesis') < 40){
    insights.push({
      icon:'🧩', tone:'logic-build',
      title:'Logic phức tạp đang xây dựng',
      desc:'Phân tích + tổng hợp đều ở mức cần luyện — bình thường với lứa mẫu giáo. Câu chuyện có 3-4 yếu tố để bé sắp xếp lại theo logic.'
    });
  }

  // ─── Autonomy patterns ───
  if(support[4] && support[4].pct >= 60 && support[1] && support[1].pct < 30){
    insights.push({
      icon:'🦋', tone:'autonomy',
      title:'Tự lập tốt nhưng gặp khó khi cần hỗ trợ',
      desc:'Bé giỏi khi tự làm nhưng khi câu khó cần hướng dẫn thì lúng túng. Tập "yêu cầu giúp đỡ" — bé học cách hỏi rõ ràng cũng là kỹ năng quan trọng.'
    });
  }
  if(support[1] && support[1].pct >= 60 && support[4] && support[4].pct < 40){
    insights.push({
      icon:'🤝', tone:'guidance',
      title:'Tốt với hướng dẫn, cần nuôi tự tin',
      desc:'Bé hoàn thành tốt khi có người dắt nhưng e ngại tự làm. Khuyến khích thử trước 3 phút trước khi gọi giúp đỡ — xây tự tin từng bước.'
    });
  }

  // ─── Bloom patterns ───
  const bloomAvg = (b) => b && b.pct != null ? b.pct : null;
  const bnhan = bloomAvg(bloom['Nhận biết']);
  const bhieu = bloomAvg(bloom['Hiểu']);
  const bung = bloomAvg(bloom['Ứng dụng']);
  const bphan = bloomAvg(bloom['Phân tích']);
  if(bnhan != null && bphan != null && bnhan > 65 && bphan < 40){
    insights.push({
      icon:'📚', tone:'depth',
      title:'Biết nhiều, hiểu sâu cần thời gian',
      desc:'Bé nhận biết tốt nhưng chưa phân tích sâu — phù hợp tuổi. Đừng vội ép, thay vào đó hỏi "con thấy giống/khác gì?" sau mỗi câu chuyện.'
    });
  }
  if(bung != null && bphan != null && bung > 60 && bphan > 60){
    insights.push({
      icon:'🚀', tone:'advanced',
      title:'Đã sẵn sàng cho bài học sâu hơn',
      desc:'Cả ứng dụng và phân tích đều cao — bé có thể tiếp cận bài tập mở hơn (sách bài tập lớp lớn hơn, dự án mini 1 tuần).'
    });
  }

  // ─── Difficulty patterns ───
  const diff = agg.difficultySum || {};
  if(diff['Khó']?.pct >= 60){
    insights.push({
      icon:'💎', tone:'challenge',
      title:'Sẵn sàng với thử thách khó',
      desc:'Bé làm tốt câu khó (>60%) — không nên chỉ cho bé câu dễ. Giới thiệu bài stem, câu đố nhiều bước phù hợp tuổi.'
    });
  }
  if(diff['Dễ']?.pct < 50 && diff['Trung bình']?.pct < 40){
    insights.push({
      icon:'🌱', tone:'foundation-rebuild',
      title:'Cần củng cố nền tảng cơ bản',
      desc:'Câu dễ và trung bình đang ở mức cần luyện thêm. Quay lại các hoạt động đơn giản: đếm 1-10, hình tròn-vuông-tam giác, nhớ 2-3 đồ vật.'
    });
  }

  return insights.slice(0, 4);  // Tối đa 4 insights để không overwhelm
}

// ─── 3. ACTION PLAN 4-WEEK GENERATOR ───
const __ACTION_PLANS_MG = {
  attention: {
    title:'Luyện tập trung',
    weeks:[
      'Cùng bé tô màu / xếp hình KHÔNG ngắt 10 phút mỗi ngày',
      'Đọc sách 5 phút, dừng giữa hỏi "vừa rồi mẹ kể gì?"',
      'Trò chơi "Tìm 5 điểm khác nhau" giữa 2 bức tranh',
      'Câu đố "nghe và nhớ chuỗi 4-5 yếu tố", phản hồi đúng/sai',
    ],
  },
  observation: {
    title:'Luyện quan sát',
    weeks:[
      'Đi siêu thị, chỉ giúp mẹ 3 món màu đỏ / hình tròn',
      'Quan sát 1 đồ vật 30 giây, che lại — kể lại đặc điểm',
      'So sánh 2 con vật: ai có gì khác nhau?',
      'Vẽ lại 1 đồ vật từ trí nhớ sau khi đã quan sát kỹ',
    ],
  },
  memory: {
    title:'Luyện ghi nhớ',
    weeks:[
      'Nghe và lặp lại chuỗi 3 số / 3 từ',
      'Kể lại câu chuyện vừa nghe theo trình tự',
      'Trò chơi memory pair cards (8 cặp)',
      'Hôm sau hỏi bé về phim/sách hôm trước — nhớ chi tiết',
    ],
  },
  understanding: {
    title:'Luyện hiểu biết',
    weeks:[
      'Đọc truyện ngắn, hỏi "nhân vật cảm thấy thế nào?"',
      'Xem hoạt hình xong: "vì sao bạn nhỏ buồn?"',
      'Giải thích lý do hành động (vd: tại sao mặc áo ấm)',
      'Thử trả lời câu hỏi mở "nếu...thì..."',
    ],
  },
  application: {
    title:'Luyện ứng dụng',
    weeks:[
      'Cho bé chỉ dẫn 2 bước: "lấy bút, ngồi ghế"',
      'Tự mặc áo, cài cúc, đi giày — kỹ năng tự lập',
      'Áp dụng quy luật đã học vào trò chơi mới',
      'Giải bài toán mở: cho 3 đồ, bé nghĩ cách dùng',
    ],
  },
  analysis: {
    title:'Luyện phân tích',
    weeks:[
      'So sánh 2 con vật: cao-thấp, nặng-nhẹ, dài-ngắn',
      'Phân loại đồ chơi theo nhóm (cứng/mềm, to/nhỏ)',
      'Sắp xếp 4 tranh theo thứ tự sự việc',
      'Tìm điểm chung/khác giữa 3 đối tượng',
    ],
  },
  synthesis: {
    title:'Luyện tổng hợp',
    weeks:[
      'Cho 3 đồ chơi bất kỳ, bé kể chuyện có cả 3',
      'Cùng làm bánh: chọn 2-3 nguyên liệu yêu thích',
      'Vẽ 1 bức tranh có 4 yếu tố theo gợi ý',
      'Sáng tạo câu chuyện kết thúc từ đầu chuyện mẹ kể',
    ],
  },
  number: {
    title:'Luyện số học',
    weeks:[
      'Đếm trong sinh hoạt: bao nhiêu cái ghế, người',
      'Phép cộng đơn giản trong 5 (dùng đồ vật)',
      'Phép cộng trong 10 (lá, viên kẹo)',
      'So sánh nhiều-ít, lớn-nhỏ với số cụ thể',
    ],
  },
  geometry: {
    title:'Luyện hình học',
    weeks:[
      'Chỉ ra hình tròn / vuông / tam giác xung quanh',
      'Xếp hình lego/wooden block theo mẫu',
      'Vẽ lại hình 3D đơn giản (ngôi nhà, ô tô)',
      'Ghép hình puzzle 12-20 mảnh',
    ],
  },
  measurement: {
    title:'Luyện đo lường',
    weeks:[
      'Đo bằng gang tay: bàn dài mấy gang? ghế?',
      'So sánh độ dài 3 đối tượng',
      'Xếp thứ tự cao-thấp 5 con thú nhồi bông',
      'Đánh dấu chiều cao bé mỗi tháng trên tường',
    ],
  },
  pattern: {
    title:'Luyện kiểu mẫu',
    weeks:[
      'Tô màu theo trình tự đỏ-xanh-đỏ-xanh',
      'Xếp đồ chơi theo quy luật ABAB',
      'Tự tạo pattern mới (vd: AABB, ABCABC)',
      'Tìm số tiếp theo trong dãy 2-4-6-?-10',
    ],
  },
  data: {
    title:'Luyện dữ liệu',
    weeks:[
      'Sắp xếp đồ chơi theo nhóm (xe, búp bê, gấu)',
      'Dọn tủ lạnh: rau riêng, trái cây riêng',
      'Đếm + biểu đồ đơn giản: nhà mình có mấy người, ăn mấy món',
      'Khảo sát mini: hỏi 3 người thích màu gì → so sánh',
    ],
  },
  fluency: {
    title:'Luyện trôi chảy ý tưởng',
    weeks:[
      'Hỏi "kể 5 cách dùng cái ly?" — nhiều ý',
      'Nhìn vết bẩn / mây / vệt sơn — tưởng tượng giống gì',
      'Brainstorm: nếu là siêu nhân, bé sẽ làm gì? (5 idea)',
      'Trò chơi "Yes, and..." — phát triển ý từ câu trước',
    ],
  },
  flexibility: {
    title:'Luyện linh hoạt',
    weeks:[
      'Cho bé 1 hình, vẽ thêm thành 5 thứ khác nhau',
      'Đổi luật trò chơi giữa chừng — bé thích nghi',
      'Kể chuyện ngược (từ kết thúc → đầu)',
      'Tìm 3 cách giải khác nhau cho cùng 1 vấn đề',
    ],
  },
  originality: {
    title:'Luyện độc đáo',
    weeks:[
      'Vẽ 1 con vật chưa từng có thật trong đời',
      'Đặt tên độc đáo cho gấu bông, đồ vật',
      'Sáng tác bài hát ngắn 2 câu',
      'Thiết kế ngôi nhà cho mèo cổ tích',
    ],
  },
  precision: {
    title:'Luyện chính xác chi tiết',
    weeks:[
      'Tô màu trong khung không lem',
      'Vẽ đường thẳng nối 2 điểm chính xác',
      'Origami 3-5 bước, hoàn thiện gọn gàng',
      'Sao chép một bức tranh đơn giản, càng giống càng tốt',
    ],
  },
};

function __generateActionPlanMG(weakSkills){
  // weakSkills = mảng key skill yếu nhất (top 2)
  const plans = [];
  for(const sk of weakSkills.slice(0, 2)){
    const plan = __ACTION_PLANS_MG[sk];
    if(plan) plans.push({skill: sk, ...plan});
  }
  return plans;
}

// ─── 4. RENDER INTELLIGENCE PANEL ───
function renderIntelligencePanelMG(){
  const target = document.getElementById('mg-intelligence-panel');
  if(!target) return;
  const profile = __classifyProfileMG();
  const insights = __generateInsightsMG();
  // Find 2 weakest skills (filter ra skills có data)
  const agg = (typeof aggregateAtomicMG === 'function') ? aggregateAtomicMG() : {skillSum:{}};
  const skLabels = (typeof __ATOMIC_SKILL_LABELS_MG !== 'undefined') ? __ATOMIC_SKILL_LABELS_MG : {};
  const skArr = Object.entries(agg.skillSum || {})
    .filter(([k, s]) => s && s.max > 0)
    .map(([k, s]) => ({key:k, pct:s.pct, label: skLabels[k] || k}))
    .sort((a, b) => a.pct - b.pct);
  const weakest = skArr.slice(0, 2);
  const plans = __generateActionPlanMG(weakest.map(s => s.key));

  // Build HTML
  let html = '<div class="intel-panel-inner">';

  // Profile card
  html += `<div class="intel-profile" style="border-left:5px solid ${profile.color}">`;
  html += `<div class="intel-profile-header">`;
  html += `<span class="intel-profile-emoji">${profile.emoji}</span>`;
  html += `<div><div class="intel-profile-label">PROFILE NĂNG LỰC</div>`;
  html += `<h3 style="color:${profile.color}">${_escHtmlMG(profile.name)}</h3></div>`;
  html += `</div>`;
  html += `<p class="intel-headline">${_escHtmlMG(profile.headline)}</p>`;
  html += `<div class="intel-grid-2col">`;
  html += `<div><b>✅ Điểm mạnh:</b><br>${_escHtmlMG(profile.strengths)}</div>`;
  html += `<div><b>🌱 Hướng phát triển:</b><br>${_escHtmlMG(profile.growth)}</div>`;
  html += `</div>`;
  html += `</div>`;

  // Insights
  if(insights.length > 0){
    html += '<div class="intel-section"><h4>💡 Insight chi tiết</h4>';
    insights.forEach(ins => {
      html += `<div class="intel-insight">`;
      html += `<span class="intel-insight-icon">${ins.icon}</span>`;
      html += `<div><b>${_escHtmlMG(ins.title)}</b><br><span class="intel-insight-desc">${_escHtmlMG(ins.desc)}</span></div>`;
      html += `</div>`;
    });
    html += '</div>';
  }

  // Action plan 4 weeks
  if(plans.length > 0){
    html += '<div class="intel-section"><h4>📅 Kế hoạch luyện tập 4 tuần</h4>';
    html += '<p class="intel-plan-note">Gợi ý cho 2 năng lực cần ưu tiên — phụ huynh áp dụng tại nhà 10-15 phút mỗi ngày.</p>';
    plans.forEach(plan => {
      const lbl = skLabels[plan.skill] || plan.skill;
      html += `<div class="intel-plan">`;
      html += `<div class="intel-plan-header"><b>🎯 ${_escHtmlMG(plan.title)}</b> <span class="intel-plan-sub">(${_escHtmlMG(lbl)})</span></div>`;
      html += `<ol class="intel-plan-weeks">`;
      plan.weeks.forEach((w, i) => {
        html += `<li><b>Tuần ${i+1}:</b> ${_escHtmlMG(w)}</li>`;
      });
      html += `</ol>`;
      html += `</div>`;
    });
    html += '<p class="intel-plan-followup">→ <b>Tái đánh giá sau 4 tuần</b> để đo tiến bộ và điều chỉnh kế hoạch.</p>';
    html += '</div>';
  }

  html += '</div>';
  target.innerHTML = html;
}

// Hook vào recompute pipeline
(function hookIntelligence(){
  const wait = setInterval(() => {
    if(typeof recomputeAllMG === 'function' && !window.__intelHooked){
      window.__intelHooked = true;
      const orig = window.recomputeAllMG;
      window.recomputeAllMG = function(){
        orig.apply(this, arguments);
        if(typeof renderIntelligencePanelMG === 'function'){
          try{ renderIntelligencePanelMG(); } catch(e){ console.warn('intel render fail:', e); }
        }
      };
      clearInterval(wait);
      // Initial render
      setTimeout(() => { try{ renderIntelligencePanelMG(); }catch(e){} }, 300);
    }
  }, 100);
  setTimeout(() => clearInterval(wait), 5000);
})();
