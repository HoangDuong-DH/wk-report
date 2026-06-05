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
  supabaseUrl:  '',          // vd 'https://abcd.supabase.co'
  supabaseAnonKey: '',       // anon public key

  // ── Edge Function sinh AI (tùy chọn) ──
  edgeFnUrl: '',             // vd 'https://abcd.supabase.co/functions/v1/generate'

  // ── Trung tâm mặc định khi nhiều center (để trống = lấy center đầu tiên) ──
  centerId: '',

  // ── Link phụ huynh ──
  parentBaseUrl: '',         // để trống = tự suy ra (cùng thư mục) → '.../ctrc/parent.html'
  tokenTtlDays: 30,
};
