// ═══════════════════════════════════════════════════════════════════════════
//  CTRC — Supabase Edge Function: sinh 3 dòng báo cáo bằng Claude API
//  ───────────────────────────────────────────────────────────────────────────
//  Giữ ANTHROPIC_API_KEY ở server (Supabase secret) — KHÔNG lộ ra frontend.
//  Deploy:
//    supabase functions deploy generate --no-verify-jwt
//    supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//  URL kết quả: https://<project>.supabase.co/functions/v1/generate
//  → dán vào ctrc/config.js → edgeFnUrl
// ═══════════════════════════════════════════════════════════════════════════
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DEFAULT_MODEL = "claude-sonnet-4-5";   // model mặc định nếu request không gửi
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DIM_VI: Record<string, string> = {
  focus: "Tập trung", logic: "Logic", reflex: "Phản xạ",
  interaction: "Tương tác", creativity: "Sáng tạo",
};
const CRIT_VI: Record<string, string> = {
  tap_trung: "Tập trung", tham_gia: "Tham gia", tu_duy: "Tư duy",
  tu_lap: "Tự lập", hop_tac: "Hợp tác",
};
const REPORT_CFG_DEFAULT = {
  tone: "warm_logic",
  detail: "standard",
  audience: "busy_parent",
  childNoun: "con",
  teacherNoun: "cô",
  avoidWords: "kém, yếu, tệ, chậm, dốt, lười, hư, không biết, thua bạn",
  mustInclude: "",
  lessonFrame: "Luôn diễn giải nội dung học trong khung 4 kỹ năng tư duy: cơ bản, logic, toán học, sáng tạo. Chỉ nhắc kỹ năng thật sự có trong giáo án/dữ liệu.",
  activityFrame: "Mô tả hoạt động theo hướng học qua trải nghiệm, khám phá, học cụ và hoạt động đa dạng; tránh ngôn ngữ nội bộ như slide, flashfile, số trang, file powerpoint.",
  extra: "",
};
const REPORT_TONE: Record<string, string> = {
  warm_logic: "Ấm áp, rõ logic, cụ thể hành vi; phù hợp gửi phụ huynh đại trà.",
  concise: "Ngắn gọn, trực tiếp, dễ copy Zalo; mỗi block ít câu nhưng đủ ý.",
  premium: "Chuyên nghiệp, chỉn chu, nhấn mạnh giá trị giáo dục và tiến trình phát triển.",
  encouraging: "Động viên nhiều hơn, mềm mại hơn, vẫn không né điểm cần hỗ trợ.",
};
const REPORT_DETAIL: Record<string, string> = {
  short: "Ngắn: mỗi block 1-2 câu, ưu tiên dễ đọc trên Zalo.",
  standard: "Chuẩn: mỗi block 2-3 câu, đủ nội dung và vẫn gọn.",
  rich: "Chi tiết: mỗi block 3-4 câu khi dữ liệu đủ, nhấn mạnh hoạt động và logic học tập.",
};
const REPORT_AUDIENCE: Record<string, string> = {
  busy_parent: "Phụ huynh bận: câu rõ, ít thuật ngữ, đọc nhanh hiểu ngay.",
  education_minded: "Phụ huynh quan tâm giáo dục: giải thích rõ kỹ năng tư duy và giá trị hoạt động.",
  first_time: "Phụ huynh mới: diễn giải mềm, tránh jargon, giúp họ hiểu trung tâm đang rèn gì.",
};

function reportConfigPrompt(raw: any): string {
  const c = Object.assign({}, REPORT_CFG_DEFAULT, raw || {});
  return [
    "CẤU HÌNH GIỌNG VĂN & CONTENT DO MANAGER CHỌN (ưu tiên cao, nhưng KHÔNG được trái dữ liệu GV/giáo án):",
    `- Tone: ${REPORT_TONE[c.tone] || c.tone}`,
    `- Độ dài: ${REPORT_DETAIL[c.detail] || c.detail}`,
    `- Đối tượng đọc: ${REPORT_AUDIENCE[c.audience] || c.audience}`,
    `- Cách gọi bé/phụ huynh: ưu tiên gọi bé là "${c.childNoun || "con"}", giáo viên/trung tâm là "${c.teacherNoun || "cô"}".`,
    c.lessonFrame ? `- Khung diễn giải bài học: ${c.lessonFrame}` : "",
    c.activityFrame ? `- Khung diễn giải hoạt động: ${c.activityFrame}` : "",
    c.mustInclude ? `- Ý/cụm từ nên có khi phù hợp: ${c.mustInclude}` : "",
    c.avoidWords ? `- Từ/cụm từ cần tránh thêm: ${c.avoidWords}` : "",
    c.extra ? `- Ghi chú riêng của manager: ${c.extra}` : "",
  ].filter(Boolean).join("\n");
}

function buildPrompt(body: any): string {
  const stu = body.student || {};
  const rec = body.record || {};
  const theme = body.theme || {};
  const prof = body.profile || {};
  const strengths = body.strengths || [];
  const center = body.center || {};

  const picked = (rec.strengths || [])
    .map((i: number) => (strengths.find((s: any) => s.idx === i) || {}).label)
    .filter(Boolean);
  const scores = Object.entries(rec.scores_5d || {})
    .map(([k, v]) => `${DIM_VI[k] || k}: ${v}/5`).join(", ");

  const profLine = prof && prof.status === "active"
    ? `Tính cách: ${prof.introversion}; kiểu học: ${prof.learning_style}. ${prof.summary || ""}`
    : "Chưa có hồ sơ (giọng trung tính, tập trung vào quan sát hôm nay).";

  return [
    `BỐI CẢNH: Trung tâm ${center.name || "WonderKids"}. Tuần này lớp học chủ đề "${theme.title || "(chưa có)"}".`,
    `HỒ SƠ BÉ ${stu.name}: ${profLine}`,
    `HÔM NAY GV chấm: ${scores || "(chưa chấm điểm)"}.`,
    `Điểm mạnh GV tick: ${picked.join(", ") || "(không)"}.`,
    `QUAN SÁT CỤ THỂ CỦA GV (quan trọng nhất, dùng làm lõi): "${rec.observation || "(trống)"}".`,
    rec.effort ? `Ghi chú cố gắng: "${rec.effort}".` : "",
    reportConfigPrompt(center.report_config),
    "",
    `Viết báo cáo gửi phụ huynh bé ${stu.name} gồm ĐÚNG 3 dòng, mỗi dòng 1-2 câu tiếng Việt tự nhiên, ấm áp:`,
    `1. Điểm mạnh hôm nay (cụ thể hành vi, dựa trên quan sát của GV)`,
    `2. Điểm cố gắng (bé thử gì dù chưa hoàn hảo, hướng tới trước)`,
    `3. Gợi ý ở nhà (5-10 phút, không cần mua đồ)`,
    "",
    `Trả về DUY NHẤT một JSON: {"diem_manh":"...","co_gang":"...","goi_y":"..."} — không thêm chữ nào khác.`,
  ].filter(Boolean).join("\n");
}

function buildWeeklyPrompt(body: any): string {
  const stu = body.student || {};
  const center = body.center || {};
  const les = body.lesson || {};
  const recs = (body.records || []).filter((r: any) => r.attendance === "present");
  const label = (k: string) => CRIT_VI[k] || k || "(chưa chọn)";
  const sessions = recs.map((r: any, i: number) => {
    const st = r.strength || {};
    const im = r.improve || {};
    return `• Buổi ${i + 1}: LÀM ĐƯỢC = ${label(st.crit)} ("${st.sentence || ""}"${st.detail ? "; chi tiết: " + st.detail : ""}); CẦN HỖ TRỢ = ${label(im.crit)} ("${im.sentence || ""}"${im.detail ? "; chi tiết: " + im.detail : ""})${r.mood ? "; tâm trạng: " + r.mood : ""}.`;
  }).join("\n");
  const selectedSessions = les ? (les.session_range || (Array.isArray(les.sessions) && les.sessions.length ? "Buổi " + les.sessions.join(" & ") : "")) : "";
  const sessionItems = Array.isArray(les.session_items)
    ? les.session_items.map((si: any) => ["Buổi " + si.no, si.summary || si.title || si.skill].filter(Boolean).join(": ")).join("; ")
    : "";
  const lessonLines = [
    "NỘI DUNG HỌC TUẦN (dùng làm bối cảnh cho cả nhận xét, KHÔNG viết lại nguyên văn trong tongHop):",
    selectedSessions ? `- Buổi thực học được chọn: ${selectedSessions}` : "",
    sessionItems ? `- Tóm tắt từng buổi được chọn: ${sessionItems}` : "",
    les.content ? `- Bản phụ huynh đang dùng: "${les.content}"` : "",
    les.title ? `- Tên bài/chủ đề: ${les.title}` : "",
    les.objective ? `- Mục tiêu: ${les.objective}` : "",
    les.activity ? `- Hoạt động: ${les.activity}` : "",
  ].filter(Boolean).join("\n");
  return [
    `Trung tâm TƯ DUY ${center.name || "WonderKids"}. Soạn BÁO CÁO TUẦN gửi phụ huynh cho bé ${stu.name}, tổng hợp từ ${recs.length} buổi trong tuần.`,
    lessonLines,
    "DỮ LIỆU TỪNG BUỔI (giáo viên ghi):",
    sessions || "(chưa có buổi nào)",
    body.childComment ? `Lời nhắn riêng của cô: "${body.childComment}".` : "",
    "",
    reportConfigPrompt(center.report_config),
    "",
    selectedSessions ? `Khi liên hệ nhận xét với bài học, CHỈ dùng các buổi thực học đã chọn (${selectedSessions}); không kéo hoạt động của buổi khác.` : "",
    "Viết 2 phần nhận xét ấm áp, cụ thể, bám dữ liệu GV là chính, dùng nội dung/buổi học làm bối cảnh để nhận xét đúng bài:",
    "1. tongHop: 2-3 câu cho mục \"ĐIỂM BÉ LÀM ĐƯỢC\" — nêu rõ con thể hiện tốt ở đâu, hành vi cụ thể nào, liên hệ nhẹ với hoạt động/kỹ năng tư duy nếu phù hợp. KHÔNG lặp lại toàn bộ nội dung học tuần.",
    "2. coGang: 2-3 câu cho mục \"ĐIỂM BÉ CẦN HỖ TRỢ\" — nêu rõ điểm cần rèn thêm, tích cực và hướng tới trước, kèm cách cô/trung tâm sẽ đồng hành.",
    "Quy tắc: KHÔNG dùng từ kém/yếu/tệ/chậm/dốt/lười/hư; KHÔNG so sánh với bé khác; tiếng Việt tự nhiên, hướng tới trước.",
    "Trả về DUY NHẤT JSON: {\"tongHop\":\"...\",\"coGang\":\"...\"} — không thêm chữ nào khác.",
  ].filter(Boolean).join("\n");
}

const SYSTEM = [
  "Bạn là trợ lý viết báo cáo cho giáo viên mầm non WonderKids. Giọng văn:",
  "- LUÔN cụ thể hành vi, KHÔNG chung chung ('bé ngoan', 'bé giỏi').",
  "- LUÔN hướng tới trước; TUYỆT ĐỐI tránh: kém, yếu, tệ, chậm, dốt, lười, hư.",
  "- KHÔNG so sánh bé này với bé khác. Tôn trọng tốc độ riêng.",
  "- Tiếng Việt tự nhiên, ấm áp, không Anh-Việt lẫn lộn.",
  "- Mỗi dòng ngắn gọn (1-2 câu).",
].join("\n");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const key = Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) throw new Error("Thiếu ANTHROPIC_API_KEY");
    const body = await req.json();

    // ── Liệt kê model (cho UI lọc/chọn) ──
    if (body.action === "list_models") {
      const mr = await fetch("https://api.anthropic.com/v1/models?limit=100", {
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
      });
      if (!mr.ok) throw new Error("Anthropic models HTTP " + mr.status);
      const md = await mr.json();
      return new Response(JSON.stringify(md), {
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const model = (body.model || DEFAULT_MODEL).toString();
    const outTokens = Math.min(2000, Math.max(100, +body.max_tokens || 600));
    const effort = String(body.thinking_effort || "off");
    const EFFORT_BUDGET: Record<string, number> = { low: 2048, medium: 6144, high: 12288, xhigh: 20000, max: 32000 };
    const EFFORT_MAXTOK: Record<string, number> = { low: 4000, medium: 8000, high: 16000, xhigh: 32000, max: 48000 };
    const isAdaptive = /(opus-4-(6|7|8|9))|(sonnet-4-(6|7|8|9))|mythos/i.test(model);

    const pickText = (d: any) => {
      const t = (d?.content || []).find((x: any) => x.type === "text");
      return (t?.text || d?.content?.[0]?.text || "").trim();
    };
    const headers = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };

    // danh sách variant để thử (model mới: adaptive+output_config.effort; cũ: enabled+budget) + fallback
    const variants = (): any[] => {
      const plain = { max_tokens: outTokens };
      if (effort === "off") return [plain];
      const adaptive = { thinking: { type: "adaptive" }, output_config: { effort }, max_tokens: EFFORT_MAXTOK[effort] || 16000 };
      const enabled = { thinking: { type: "enabled", budget_tokens: EFFORT_BUDGET[effort] || 6144 }, max_tokens: (EFFORT_BUDGET[effort] || 6144) + outTokens };
      return isAdaptive ? [adaptive, enabled, plain] : [enabled, adaptive, plain];
    };
    const callMessages = async (system: string, content: string) => {
      let lastErr = "";
      for (const v of variants()) {
        const b = Object.assign({ model, system, messages: [{ role: "user", content }] }, v);
        const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers, body: JSON.stringify(b) });
        if (r.ok) return r.json();
        const txt = await r.text();
        lastErr = "Anthropic HTTP " + r.status + ": " + txt.slice(0, 180);
        if (!(r.status === 400 && /thinking|adaptive|enabled|budget|effort|output_config/i.test(txt))) throw new Error(lastErr);
      }
      throw new Error(lastErr || "AI lỗi");
    };

    // ── Gọi tổng quát (Insights + trợ lý GV): nhận system + prompt, trả {text} ──
    if (body.action === "complete") {
      const cd = await callMessages(body.system || SYSTEM, String(body.prompt || ""));
      return new Response(JSON.stringify({ text: pickText(cd) }), {
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    if (body.kind === "weekly") {
      const wd = await callMessages(SYSTEM, buildWeeklyPrompt(body));
      const weeklyText = pickText(wd);
      let weeklyOut: any = {};
      const wm = weeklyText.match(/\{[\s\S]*\}/);
      if (wm) { try { weeklyOut = JSON.parse(wm[0]); } catch (_) { /* fallthrough */ } }
      if (!weeklyOut.tongHop) weeklyOut = { tongHop: weeklyText, coGang: "" };
      return new Response(JSON.stringify(weeklyOut), {
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const data = await callMessages(SYSTEM, buildPrompt(body));
    const text = pickText(data);

    // tách JSON
    let out: any = {};
    const m = text.match(/\{[\s\S]*\}/);
    if (m) { try { out = JSON.parse(m[0]); } catch (_) { /* fallthrough */ } }
    if (!out.diem_manh) out = { diem_manh: text, co_gang: "", goi_y: "" };

    return new Response(JSON.stringify(out), {
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500, headers: { ...cors, "content-type": "application/json" },
    });
  }
});
