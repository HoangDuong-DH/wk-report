"""Inject input alignment features into mau-giao + mau-giao-l4."""
import io, sys, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open(r'C:/Users/Admin/Downloads/wks/scraps/input_alignment.js', 'r', encoding='utf-8') as f:
    JS = f.read()

MARKER = '<!-- INPUT_ALIGN_INJECTED -->'

for path in [
    r'C:/Users/Admin/Downloads/wks/mau-giao.html',
    r'C:/Users/Admin/Downloads/wks/mau-giao-l4.html',
]:
    print('Processing', path)
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    if MARKER in html:
        print('  Already injected — skip')
        continue
    injection = MARKER + '\n<script>\n/* ═════ INPUT ALIGNMENT (multi-student + info + validation) ═════ */\n' + JS + '\n</script>\n'
    html = html.replace('</body>', injection + '</body>', 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print('  Injected, total size:', len(html))
print('Done')
