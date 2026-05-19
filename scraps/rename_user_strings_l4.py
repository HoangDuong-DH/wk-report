"""Rename user-facing 'L3' strings to 'L4' in mau-giao-l4.html.
Internal var names (__ATOMIC_CRITERIA_L3 etc.) stay unchanged.
"""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

target = r'C:/Users/Admin/Downloads/wks/mau-giao-l4.html'

with open(target, 'r', encoding='utf-8') as f:
    html = f.read()

# User-facing strings — replace 'L3' with 'L4' in specific contexts
replacements = [
    # Default field value
    ('value="L3 Diagnostic Assessment"', 'value="L4 Diagnostic Assessment"'),
    # Mock profiles + default state
    ("test:'L3 Diagnostic Assessment'", "test:'L4 Diagnostic Assessment'"),
    # CSV sample header
    ("'Lớp,Mầm non L3'", "'Lớp,Mầm non L4'"),
    ("'Bài test,L3 Diagnostic Assessment'", "'Bài test,L4 Diagnostic Assessment'"),
    # Toast / error messages mentioning L3
    ('Không nhận diện được dữ liệu. File hỗ trợ: ATOMIC L3 (61 tiêu chí) hoặc format 16 năng lực.',
     'Không nhận diện được dữ liệu. File hỗ trợ: ATOMIC L4 (65 tiêu chí) hoặc format 16 năng lực.'),
    # Misc comments shown in UI/dev tools — keep technical (atomic L3 = format name)
    # Skip: comments only seen in source, don't matter for user
]

count = 0
for old, new in replacements:
    if old in html:
        html = html.replace(old, new)
        count += 1
        print(f'  ✓ Replaced: {old[:60]}...')
    else:
        print(f'  ✗ NOT FOUND: {old[:60]}...')

# Also update favicon hue slightly so L4 has visual distinction
# Keep brand orange for L4 too — same visual style; just title + content differ

with open(target, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nDone. {count}/{len(replacements)} replacements applied.')
