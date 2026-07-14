/* ═══════════════════════════════════════════════════════════════════════════
   CTRC — CẤU HÌNH
   ───────────────────────────────────────────────────────────────────────────
   • Để TRỐNG supabaseUrl  → app chạy DEMO MODE (localStorage, không cần backend).
   • Điền supabaseUrl + anonKey → app tự chuyển sang Supabase (đồng bộ nhiều máy).
   • edgeFnUrl: URL Edge Function sinh nội dung bằng Claude API (xem SETUP.md).
     Để trống → nút "Sinh bằng AI" ẩn, vẫn còn engine offline + dán nháp tay.
   ═══════════════════════════════════════════════════════════════════════════ */
window.CTRC_CONFIG = {
  // ── Supabase (để trống = demo localStorage) ──
  supabaseUrl:  'https://ciqgahajvnweuaopfghl.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpcWdhaGFqdm53ZXVhb3BmZ2hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MDA5OTYsImV4cCI6MjA5ODk3Njk5Nn0.UhLezB8v8tecUeL14bn3B-NhPW0yqut8cc11hbSg47Y',  // anon public key — công khai theo thiết kế, RLS bảo vệ

  // ── Edge Function sinh AI (tùy chọn) ──
  edgeFnUrl: '',             // vd 'https://abcd.supabase.co/functions/v1/generate'

  // ── Mặc định AI (có thể đổi trong app → Cấu hình → AI; lưu localStorage đè lên đây) ──
  // provider: 'gemini' (Google) | 'anthropic' (Claude). Đổi trong app được, cả 2 đều chạy.
  ai: {
    provider: 'gemini',
    mode: 'direct',          // 'direct' (key ở trình duyệt máy này) | 'edge' (key ở server Supabase)
    model: 'gemini-3.5-flash',
    maxTokens: 600,
    baseUrl: 'https://generativelanguage.googleapis.com',
    // ⚠ KEY KHÔNG để ở đây (repo CÔNG KHAI). Dán key trong app → Cấu hình → AI → API key → Lưu.
  },

  // ── Trung tâm mặc định khi nhiều center (để trống = lấy center đầu tiên) ──
  centerId: '',

  // ── Cách gửi phụ huynh (xem rules/gui-phu-huynh.md) ──
  delivery: {
    includeLink: false,      // KHÔNG gắn link vào nội dung gửi PH (PH e ngại link)
  },
  parentBaseUrl: '',         // (chỉ dùng nếu includeLink=true) tự suy ra cùng thư mục
  tokenTtlDays: 30,
};
