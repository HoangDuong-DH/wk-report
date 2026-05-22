"""Inject improved drag-drop với visual overlay cho L3 v2 + L4 v2."""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

CSS = '''
/* ═════ DRAG-DROP OVERLAY ═════ */
#drop-overlay{
  display:none;position:fixed;inset:0;z-index:99999;
  background:rgba(243,129,31,.94);backdrop-filter:blur(12px);
  align-items:center;justify-content:center;
  pointer-events:none;color:#fff;text-align:center;
  flex-direction:column;gap:18px;padding:40px;
  font-family:var(--font);
}
#drop-overlay.show{display:flex;animation:dropFadeIn .25s ease}
@keyframes dropFadeIn{from{opacity:0}to{opacity:1}}
#drop-overlay .drop-icon{font-size:96px;line-height:1;animation:dropBounce 1.2s ease-in-out infinite}
@keyframes dropBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
#drop-overlay .drop-title{font:800 30px/1.3 var(--font-d);text-shadow:0 2px 8px rgba(0,0,0,.18)}
#drop-overlay .drop-sub{font:500 14px/1.5 var(--font);opacity:.92;max-width:480px}
#drop-overlay .file-types{display:flex;gap:12px;margin-top:6px;flex-wrap:wrap;justify-content:center}
#drop-overlay .ft{padding:9px 18px;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.4);border-radius:99px;font:700 12.5px/1 var(--font);backdrop-filter:blur(4px)}
@media print{#drop-overlay{display:none !important}}
'''

HTML = '''
<!-- ═════ DRAG-DROP OVERLAY (visual feedback khi kéo file vào) ═════ -->
<div id="drop-overlay">
  <div class="drop-icon">📥</div>
  <div class="drop-title">Thả file vào đây để nhập</div>
  <div class="drop-sub">Hệ thống sẽ tự động đọc nội dung và cập nhật báo cáo</div>
  <div class="file-types">
    <span class="ft">📊 .xlsx — Nhập điểm chấm</span>
    <span class="ft">💾 .json — Khôi phục backup</span>
  </div>
</div>
'''

# JS replacement — improved drag-drop với overlay
JS_OLD = '''  // Drag-drop file support
  document.addEventListener('dragover', e => { e.preventDefault(); });
  document.addEventListener('drop', e => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if(f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))){
      importXlsxL4v2({target:{files:[f]}});
    } else if(f && f.name.endsWith('.json')){
      importBackup({target:{files:[f]}});
    }
  });
});'''

JS_NEW = '''  // Drag-drop file support với visual overlay
  let __dragCounter = 0;
  const overlay = document.getElementById('drop-overlay');
  function _hideOverlay(){ __dragCounter = 0; if(overlay) overlay.classList.remove('show'); }

  document.addEventListener('dragenter', e => {
    e.preventDefault();
    if(!e.dataTransfer || !e.dataTransfer.types.includes('Files')) return;
    __dragCounter++;
    if(overlay) overlay.classList.add('show');
  });
  document.addEventListener('dragleave', e => {
    e.preventDefault();
    __dragCounter--;
    if(__dragCounter <= 0) _hideOverlay();
  });
  document.addEventListener('dragover', e => { e.preventDefault(); });
  document.addEventListener('drop', e => {
    e.preventDefault();
    _hideOverlay();
    const files = Array.from(e.dataTransfer.files || []);
    if(files.length === 0) return;

    // Tách xlsx + json
    const xlsxFiles = files.filter(f => /\\.(xlsx|xls)$/i.test(f.name));
    const jsonFiles = files.filter(f => /\\.json$/i.test(f.name));

    if(xlsxFiles.length === 1){
      importXlsxL4v2({target:{files:[xlsxFiles[0]]}});
    } else if(xlsxFiles.length > 1){
      showToast('⚠ Hỗ trợ 1 file xlsx mỗi lần. Sẽ import file đầu tiên: ' + xlsxFiles[0].name, '#df5728');
      importXlsxL4v2({target:{files:[xlsxFiles[0]]}});
    } else if(jsonFiles.length === 1){
      importBackup({target:{files:[jsonFiles[0]]}});
    } else {
      showToast('⚠ File không hỗ trợ. Chỉ chấp nhận .xlsx hoặc .json', '#df5728');
    }
  });
  // Edge case: chuột ra ngoài cửa sổ khi đang drag
  window.addEventListener('blur', _hideOverlay);
  document.addEventListener('mouseleave', _hideOverlay);
});'''

MARKER_CSS = '/* DRAGDROP_CSS_INJECTED */'
MARKER_HTML = '<!-- DRAGDROP_HTML_INJECTED -->'

for path in [
    r'C:/Users/Admin/Downloads/wks/mau-giao-l3-v2.html',
    r'C:/Users/Admin/Downloads/wks/mau-giao-l4-v2.html',
]:
    print('Processing', path)
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Inject CSS trước </style>
    if MARKER_CSS not in html:
        css_block = '\n' + MARKER_CSS + '\n' + CSS + '\n'
        # Find last </style> trước </head>
        import re
        m = re.search(r'</style>', html)
        if m:
            html = html[:m.start()] + css_block + html[m.start():]
            print('  CSS injected')
    else:
        print('  CSS already')

    # 2. Inject HTML overlay sau <body>
    if MARKER_HTML not in html:
        html_block = MARKER_HTML + '\n' + HTML + '\n'
        html = html.replace('<body>', '<body>\n' + html_block, 1)
        print('  HTML injected')
    else:
        print('  HTML already')

    # 3. Replace JS drag-drop handler
    if JS_OLD in html:
        html = html.replace(JS_OLD, JS_NEW)
        print('  JS replaced')
    else:
        print('  JS old pattern not found — may already be updated')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print('  Saved', len(html), 'chars')

print('Done')
