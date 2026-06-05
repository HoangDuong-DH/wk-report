# -*- coding: utf-8 -*-
"""Đọc các docx báo cáo tuần → thư viện nội dung có cấu trúc (ctrc/lessons.js).
Chạy lại được cho mọi cấp (2xx/3xx/4xx). Mỗi docx = 1 (mã cuốn, tuần).

Cách dùng:
  python scraps/parse_lessons.py
Sửa FOLDERS bên dưới để thêm thư mục docx của các cấp khác.
"""
import io, sys, os, re, glob, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
import docx

BASE = r'C:\Users\Admin\Downloads'
# các thư mục chứa docx (mỗi thư mục = 1 cuốn, 4 file tuần)
FOLDERS = ['201', '202', '203', '204', '205', '205 plus', '206',
           '207', '208', '209', '210', '210+']
OUT_JS = r'C:\Users\Admin\Downloads\wks\ctrc\lessons.js'

TYPE_CANON = {
    'cơ bản': 'Tư duy cơ bản', 'toán học': 'Tư duy toán học', 'toán': 'Tư duy toán học',
    'logic': 'Tư duy logic', 'sáng tạo': 'Tư duy sáng tạo', 'vận động': 'Vận động',
}

def norm_type(t):
    low = t.lower()
    for k, v in TYPE_CANON.items():
        if k in low:
            return v
    return t.strip()

def paras(path):
    d = docx.Document(path)
    return [p.text.strip() for p in d.paragraphs if p.text.strip()]

def folder_to_code(folder):
    f = folder.strip().lower().replace(' ', '')
    f = f.replace('plus', '+')   # "205plus" -> "205+"
    return f

# các dòng "khung" cần bỏ khỏi nội dung bài học
BOILER = [
    'báo cáo tình hình học tập', 'kính gửi', 'chương trình: ucrea',
    'hôm nay, em/cô/thầy', 'dưới đây là phần nhận xét',
    'hẹn gặp lại', 'một số hình ảnh của các con',
]
def is_boiler(p):
    low = p.lower()
    if low.startswith('(ngày'): return True
    if re.match(r'^l[ớo]p\s*:?\s*$', low): return True          # "Lớp:" trống
    if re.match(r'^b[àa]i\s*h[ọo]c\s*:\s*[0-9]+\+?\s*[-–]?\s*tu[ầa]n', low): return True  # dòng mã+tuần
    return any(b in low for b in BOILER)

def parse_doc(path, code, week):
    ps = paras(path)
    full = '\n'.join(ps)
    body = [p for p in ps if not is_boiler(p)]

    title = ''
    knowledge_parts = []
    skill = ''
    pages = []
    for p in ps:
        mb = re.match(r'^B[àa]i\s*h[ọo]c\s*:\s*(.+)$', p)
        if mb and not re.search(r'[Tt]u[ầa]n\s*[0-9]', mb.group(1)) and not title:
            title = mb.group(1).strip(); continue
        # mục tiêu kỹ năng
        ms = re.match(r'^M[ụu]c\s*ti[êe]u\s*k[ỹy]\s*n[ăa]ng\s*:?\s*(.*)$', p, re.I)
        if ms: skill = ms.group(1).strip(); continue
        # mọi "Mục tiêu ..." khác (kiến thức / của trò chơi / của sách...) → knowledge
        mk = re.match(r'^M[ụu]c\s*ti[êe]u\s*(.+)$', p, re.I)
        if mk:
            knowledge_parts.append(p.strip()); continue
        mp = re.match(r'^Trang\s*([0-9][0-9\s\+\-,–]*?)\s*:\s*(.+)$', p)
        if mp:
            rng = 'Trang ' + re.sub(r'\s+', ' ', mp.group(1)).strip()
            rest = mp.group(2).strip()
            if ':' in rest:
                typ, desc = rest.split(':', 1)
                pages.append({'range': rng, 'type': norm_type(typ), 'desc': desc.strip()})
            else:
                pages.append({'range': rng, 'type': '', 'desc': rest})
            continue
    knowledge = '\n'.join(knowledge_parts)
    return {
        'code': code, 'week': week, 'title': title,
        'knowledge': knowledge, 'pages': pages, 'skill': skill,
        'body': body,         # nội dung sạch (đã bỏ khung) — nguồn hiển thị chính
        '_file': os.path.basename(path),
    }

def main():
    lib = {}
    stats = []
    for folder in FOLDERS:
        fdir = os.path.join(BASE, folder)
        if not os.path.isdir(fdir):
            print('  (bỏ qua, không thấy thư mục)', folder); continue
        code = folder_to_code(folder)
        for f in sorted(glob.glob(os.path.join(fdir, '*.docx'))):
            b = os.path.basename(f)
            wm = re.search(r'w\s*([1-4])', b, re.I)
            week = int(wm.group(1)) if wm else 0
            try:
                rec = parse_doc(f, code, week)
            except Exception as e:
                print('  LỖI', b, e); continue
            key = '%s-w%s' % (code, week)
            lib[key] = rec
            stats.append((key, rec['_file'], len(rec['pages']), bool(rec['knowledge']), len(rec['body'])))
    # in thống kê
    print('Đã parse %d mục:' % len(lib))
    for k, fn, np, hk, nb in stats:
        flag = '' if (np and nb) else '  ⚠ kiểm tra'
        print('  %-10s pages=%d kn=%s body=%d  (%s)%s' % (k, np, 'Y' if hk else 'n', nb, fn, flag))
    # ghi lessons.js
    os.makedirs(os.path.dirname(OUT_JS), exist_ok=True)
    with open(OUT_JS, 'w', encoding='utf-8') as fo:
        fo.write('/* TỰ ĐỘNG SINH từ scraps/parse_lessons.py — KHÔNG sửa tay.\n')
        fo.write('   Thư viện nội dung bài học theo (mã cuốn + tuần). Key: "<mã>-w<tuần>". */\n')
        fo.write('window.CTRC_LESSONS = ')
        json.dump(lib, fo, ensure_ascii=False, indent=1)
        fo.write(';\n')
    print('\n→ Đã ghi', OUT_JS, '(%d mục)' % len(lib))

if __name__ == '__main__':
    main()
