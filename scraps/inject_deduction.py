"""Inject deduction logic + Bai 13-14 helper into both files."""
import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r'C:/Users/Admin/Downloads/wks/scraps/deduction_features.css', 'r', encoding='utf-8') as f:
    CSS = f.read()
with open(r'C:/Users/Admin/Downloads/wks/scraps/deduction_features.js', 'r', encoding='utf-8') as f:
    JS = f.read()

MARKER_CSS = '/* DED_CSS_INJECTED */'
MARKER_JS  = '<!-- DED_JS_INJECTED -->'

# Panel HTML - đặt giữa Section 3 (detail) và Intelligence panel
# Or right before intel panel
PANEL_HTML = '''
<!-- ═════ DEDUCTION PANEL (theo docx official: 6 case trừ điểm) ═════ -->
<div class="deduction-section">
  <div id="mg-deduction-panel">
    <div class="ded-panel-inner">
      <p style="color:#a4886a;text-align:center;font-style:italic">Đang khởi tạo panel điểm trừ…</p>
    </div>
  </div>
</div>
'''

def inject(path, label):
    print(f'=== {path} ({label}) ===')
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. CSS
    if MARKER_CSS not in html:
        css_block = MARKER_CSS + '\n' + CSS + '\n'
        m = re.search(r'</style>', html)
        if m:
            html = html[:m.start()] + css_block + html[m.start():]
            print('  ✓ CSS injected')
    else:
        print('  ℹ CSS already')

    # 2. HTML panel — trước intelligence panel (or trước section 6 if intel chưa có)
    if 'id="mg-deduction-panel"' not in html:
        # Try intel panel anchor first
        m = re.search(r'<div class="intel-panel">', html)
        if m:
            html = html[:m.start()] + PANEL_HTML + '\n' + html[m.start():]
            print('  ✓ Panel before intel-panel')
        else:
            # Try section 6 anchor
            m = re.search(r'<!-- ?(?:─+ ?)?SECTION 6|<div class="s6', html, re.IGNORECASE)
            if m:
                html = html[:m.start()] + PANEL_HTML + '\n' + html[m.start():]
                print('  ✓ Panel before section 6')
            else:
                # Fallback before foot-bar
                m = re.search(r'<div class="foot-bar"', html)
                if m:
                    html = html[:m.start()] + PANEL_HTML + '\n' + html[m.start():]
                    print('  ✓ Panel before foot-bar')
    else:
        print('  ℹ Panel already')

    # 3. JS
    if MARKER_JS not in html:
        js_block = MARKER_JS + '\n<script>\n/* DEDUCTION + BAI 13-14 HELPER */\n' + JS + '\n</script>\n'
        html = html.replace('</body>', js_block + '</body>', 1)
        print('  ✓ JS injected')
    else:
        print('  ℹ JS already')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'  → {len(html)} chars')

for path, label in [
    (r'C:/Users/Admin/Downloads/wks/mau-giao.html', 'L3'),
    (r'C:/Users/Admin/Downloads/wks/mau-giao-l4.html', 'L4'),
]:
    inject(path, label)
print('Done')
