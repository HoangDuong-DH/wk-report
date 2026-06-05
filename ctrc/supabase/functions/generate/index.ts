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
    "",
    `Viết báo cáo gửi phụ huynh bé ${stu.name} gồm ĐÚNG 3 dòng, mỗi dòng 1-2 câu tiếng Việt tự nhiên, ấm áp:`,
    `1. Điểm mạnh hôm nay (cụ thể hành vi, dựa trên quan sát của GV)`,
    `2. Điểm cố gắng (bé thử gì dù chưa hoàn hảo, hướng tới trước)`,
    `3. Gợi ý ở nhà (5-10 phút, không cần mua đồ)`,
    "",
    `Trả về DUY NHẤT một JSON: {"diem_manh":"...","co_gang":"...","goi_y":"..."} — không thêm chữ nào khác.`,
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
    const budget = Math.max(0, +body.thinking_budget || 0);   // extended thinking
    const maxTokens = budget ? budget + outTokens : outTokens;

    // build body messages (kèm thinking nếu có)
    const msgReq = (system: string, content: string) => {
      const b: any = { model, max_tokens: maxTokens, system, messages: [{ role: "user", content }] };
      if (budget) b.thinking = { type: "enabled", budget_tokens: budget };
      return b;
    };
    const pickText = (d: any) => {
      const t = (d?.content || []).find((x: any) => x.type === "text");
      return (t?.text || d?.content?.[0]?.text || "").trim();
    };
    const headers = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };

    // ── Gọi tổng quát (Insights + trợ lý GV): nhận system + prompt, trả {text} ──
    if (body.action === "complete") {
      const cr = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers,
        body: JSON.stringify(msgReq(body.system || SYSTEM, String(body.prompt || ""))),
      });
      if (!cr.ok) throw new Error("Anthropic HTTP " + cr.status + ": " + (await cr.text()).slice(0, 200));
      const cd = await cr.json();
      return new Response(JSON.stringify({ text: pickText(cd) }), {
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers,
      body: JSON.stringify(msgReq(SYSTEM, buildPrompt(body))),
    });
    if (!resp.ok) throw new Error("Anthropic HTTP " + resp.status + ": " + (await resp.text()).slice(0, 200));
    const data = await resp.json();
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
