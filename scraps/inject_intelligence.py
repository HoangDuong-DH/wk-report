"""Inject Intelligence Layer (Profile + Insights + Action Plan)
   vao mau-giao.html + mau-giao-l4.html.
"""
import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r'C:/Users/Admin/Downloads/wks/scraps/intelligence_features.css', 'r', encoding='utf-8') as f:
    CSS = f.read()
with open(r'C:/Users/Admin/Downloads/wks/scraps/intelligence_features.js', 'r', encoding='utf-8') as f:
    JS = f.read()

MARKER_CSS = '/* INTEL_CSS_INJECTED */'
MARKER_JS  = '<!-- INTEL_JS_INJECTED -->'

# HTML panel placeholder — đặt giữa section 3 (detail) và section 7 (auto-comment)
# Tìm 1 vị trí phù hợp: sau ".detail-section" (kết thúc) và trước section 6 nhận xét
PANEL_HTML = '''
<!-- ═════ INTELLIGENCE LAYER — Profile + Insights + Action Plan ═════ -->
<div class="intel-panel">
  <div class="sec-h"><span class="num">⭐</span>Phân tích chuyên sâu &amp; Kế hoạch luyện tập</div>
  <div id="mg-intelligence-panel">
    <div class="intel-panel-inner">
      <p style="color:#a4886a;font-style:italic;text-align:center">Chấm đủ atomic để xem profile cá nhân, insight và kế hoạch 4 tuần…</p>
    </div>
  </div>
</div>
'''

def inject(path, label):
    print(f'=== {path} ({label}) ===')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Inject CSS truoc </style> dau tien
    if MARKER_CSS not in html:
        css_block = MARKER_CSS + '\n' + CSS + '\n'
        m = re.search(r'</style>', html)
        if m:
            html = html[:m.start()] + css_block + html[m.start():]
            print('  ✓ CSS injected')
        else:
            print('  ✗ </style> not found')
    else:
        print('  ℹ CSS already injected')

    # 2. Inject HTML panel — sau detail-section, truoc s6/s7
    # Tim </div> dong detail-section. Pattern: ket thuc detail-section roi den s6 (Nhận xét) hoac s7
    # Idempotency: check if panel already added
    if 'id="mg-intelligence-panel"' not in html:
        # Locate insertion point: trước section nhận xét (s6) hoặc trước section 7
        # Look for '<div class="s6' or '<div class="s7' or other anchor
        anchor_pattern = re.compile(r'(<!-- ?(?:─+ ?)?SECTION 6|<div class="s6|<!-- ?(?:─+ ?)?SECTION 7|<div class="s7)', re.IGNORECASE)
        m = anchor_pattern.search(html)
        if m:
            html = html[:m.start()] + PANEL_HTML + '\n' + html[m.start():]
            print(f'  ✓ HTML panel injected before {m.group(0)[:30]}...')
        else:
            # Fallback: trước cuối page (trước foot-bar)
            foot_m = re.search(r'<div class="foot-bar"', html)
            if foot_m:
                html = html[:foot_m.start()] + PANEL_HTML + '\n' + html[foot_m.start():]
                print('  ✓ HTML panel injected before foot-bar')
            else:
                print('  ✗ No anchor found, panel skipped')
    else:
        print('  ℹ HTML panel already exists')

    # 3. Inject JS truoc </body>
    if MARKER_JS not in html:
        js_block = MARKER_JS + '\n<script>\n/* INTELLIGENCE LAYER */\n' + JS + '\n</script>\n'
        html = html.replace('</body>', js_block + '</body>', 1)
        print('  ✓ JS injected')
    else:
        print('  ℹ JS already injected')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  → {len(html)} chars')

for path, label in [
    (r'C:/Users/Admin/Downloads/wks/mau-giao.html', 'L3'),
    (r'C:/Users/Admin/Downloads/wks/mau-giao-l4.html', 'L4'),
]:
    inject(path, label)
print('Done.')
