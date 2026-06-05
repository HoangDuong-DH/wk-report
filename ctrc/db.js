/* ═══════════════════════════════════════════════════════════════════════════
   CTRC — DATA LAYER (2 tầng)
   ───────────────────────────────────────────────────────────────────────────
   Tầng thấp  : Adapter — cùng 1 interface cho localStorage & Supabase
                  select(table, match, opts) / insert / update / upsert / rpc
   Tầng cao   : DB — nghiệp vụ viết MỘT lần, chạy trên adapter nào cũng được.
   Nhờ vậy UI không cần biết đang chạy demo hay thật → hạn chế lỗi, dễ test.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  const CFG = window.CTRC_CONFIG || {};
  const useSupa = !!(CFG.supabaseUrl && CFG.supabaseAnonKey);

  /* ── tiện ích ── */
  const uid = () =>
    's_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const nowISO = () => new Date().toISOString();
  const clone = (x) => JSON.parse(JSON.stringify(x));
  function matchRow(row, match) {
    if (!match) return true;
    return Object.keys(match).every((k) => row[k] === match[k]);
  }

  /* ═══════════════ ADAPTER 1: localStorage ═══════════════ */
  const LS_KEY = 'ctrc:db:v1';
  const LocalAdapter = {
    _data: null,
    _load() {
      if (this._data) return this._data;
      try { this._data = JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
      catch (_) { this._data = {}; }
      return this._data;
    },
    _save() {
      try { localStorage.setItem(LS_KEY, JSON.stringify(this._data)); }
      catch (e) { console.warn('CTRC localStorage save failed', e); }
    },
    _tbl(t) {
      const d = this._load();
      if (!d[t]) d[t] = [];
      return d[t];
    },
    async select(table, match, opts = {}) {
      let rows = this._tbl(table).filter((r) => matchRow(r, match));
      if (opts.order) {
        const k = opts.order, dir = opts.desc ? -1 : 1;
        rows = rows.slice().sort((a, b) =>
          (a[k] > b[k] ? 1 : a[k] < b[k] ? -1 : 0) * dir);
      }
      if (opts.limit) rows = rows.slice(0, opts.limit);
      return clone(rows);
    },
    async insert(table, row) {
      const r = Object.assign({ id: row.id || uid() }, row);
      this._tbl(table).push(r);
      this._save();
      return clone(r);
    },
    async update(table, match, patch) {
      const rows = this._tbl(table).filter((r) => matchRow(r, match));
      rows.forEach((r) => Object.assign(r, patch));
      this._save();
      return clone(rows);
    },
    async remove(table, match) {
      const d = this._load(); const before = (d[table] || []).length;
      d[table] = (d[table] || []).filter((r) => !matchRow(r, match));
      this._save();
      return before - d[table].length;
    },
    async upsert(table, row, conflictKeys) {
      const tbl = this._tbl(table);
      const m = {}; (conflictKeys || ['id']).forEach((k) => (m[k] = row[k]));
      const ex = tbl.find((r) => matchRow(r, m));
      if (ex) { Object.assign(ex, row); this._save(); return clone(ex); }
      return this.insert(table, row);
    },
    async rpc(fn, args) {
      // RPC phụ huynh chạy nội bộ trên localStorage (demo)
      if (fn === 'get_parent_report') return this._parentReport(args.p_token);
      return null;
    },
    _parentReport(token) {
      const tok = this._tbl('parent_tokens').find((t) => t.token === token);
      if (!tok) return { error: 'not_found' };
      if (new Date(tok.expires_at) < new Date()) return { error: 'expired' };
      const msg = this._tbl('session_messages').find((m) => m.id === tok.message_id);
      if (!msg || !['approved', 'sent'].includes(msg.status)) return { error: 'not_ready' };
      const stu = this._tbl('students').find((s) => s.id === msg.student_id) || {};
      const rec = this._tbl('session_records').find((r) => r.id === msg.record_id) || {};
      const ses = this._tbl('sessions').find((s) => s.id === rec.session_id) || {};
      const center = this._tbl('centers').find((c) => c.id === stu.center_id) || {};
      const themes = this._tbl('weekly_themes')
        .filter((t) => t.center_id === stu.center_id && t.week_start <= (ses.date || ''))
        .sort((a, b) => (a.week_start < b.week_start ? 1 : -1));
      return {
        student_name: stu.name || '', date: ses.date || '',
        theme: themes[0] ? themes[0].title : '',
        diem_manh: msg.diem_manh, co_gang: msg.co_gang, goi_y: msg.goi_y,
        center_name: center.name || 'WonderKids', tagline: center.tagline || '',
        brand_color: center.brand_color || '#f3811f',
        closing_line: center.closing_line ||
          'Mỗi bé có tốc độ riêng — với sự đồng hành kiên nhẫn, bé sẽ ngày càng tự tin và phát triển toàn diện.',
      };
    },
  };

  /* ═══════════════ ADAPTER 2: Supabase ═══════════════ */
  function SupaAdapter(client) {
    return {
      async select(table, match, opts = {}) {
        let q = client.from(table).select('*');
        if (match) Object.keys(match).forEach((k) => (q = q.eq(k, match[k])));
        if (opts.order) q = q.order(opts.order, { ascending: !opts.desc });
        if (opts.limit) q = q.limit(opts.limit);
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
      },
      async insert(table, row) {
        const { data, error } = await client.from(table).insert(row).select().single();
        if (error) throw error;
        return data;
      },
      async update(table, match, patch) {
        let q = client.from(table).update(patch);
        Object.keys(match).forEach((k) => (q = q.eq(k, match[k])));
        const { data, error } = await q.select();
        if (error) throw error;
        return data || [];
      },
      async remove(table, match) {
        let q = client.from(table).delete();
        Object.keys(match).forEach((k) => (q = q.eq(k, match[k])));
        const { error } = await q;
        if (error) throw error;
        return 1;
      },
      async upsert(table, row, conflictKeys) {
        const { data, error } = await client.from(table)
          .upsert(row, { onConflict: (conflictKeys || ['id']).join(',') })
          .select().single();
        if (error) throw error;
        return data;
      },
      async rpc(fn, args) {
        const { data, error } = await client.rpc(fn, args);
        if (error) throw error;
        return data;
      },
    };
  }

  /* ═══════════════ KHỞI TẠO ADAPTER ═══════════════ */
  let adapter = LocalAdapter;
  let supaClient = null;
  async function initAdapter() {
    if (!useSupa) { await seedDemo(); return 'demo'; }
    // nạp supabase-js từ CDN
    if (!window.supabase) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        s.onload = res; s.onerror = () => rej(new Error('Không tải được supabase-js'));
        document.head.appendChild(s);
      });
    }
    supaClient = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
    adapter = SupaAdapter(supaClient);
    return 'supabase';
  }

  /* ═══════════════ SEED demo (chỉ localStorage) ═══════════════ */
  async function seedDemo() {
    const centers = await LocalAdapter.select('centers');
    if (centers.length) return;
    const center = await LocalAdapter.insert('centers', {
      name: 'WonderKids Edu', tagline: 'Khai mở tư duy', brand_color: '#f3811f',
      closing_line: 'Mỗi bé có tốc độ riêng — với sự đồng hành kiên nhẫn, bé sẽ ngày càng tự tin và phát triển toàn diện.',
      created_at: nowISO(),
    });
    const clsA = await LocalAdapter.insert('classes', {
      center_id: center.id, name: 'Lớp Chồi A', age_band: '3-4 tuổi', created_at: nowISO(),
    });
    const clsB = await LocalAdapter.insert('classes', {
      center_id: center.id, name: 'Lớp Lá B', age_band: '5 tuổi', created_at: nowISO(),
    });
    const demoStudents = [
      ['Hải An', 'Nam', clsA.id, 4], ['Bảo Ngọc', 'Nữ', clsA.id, 2],
      ['Minh Khôi', 'Nam', clsA.id, 6], ['Thảo My', 'Nữ', clsA.id, 5],
      ['Gia Bảo', 'Nam', clsA.id, 3], ['Khánh Vy', 'Nữ', clsA.id, 1],
      ['Đức Anh', 'Nam', clsB.id, 8], ['Linh Đan', 'Nữ', clsB.id, 7],
      ['Tuấn Kiệt', 'Nam', clsB.id, 5], ['Phương Nhi', 'Nữ', clsB.id, 4],
    ];
    let pn = 0;
    for (const [name, gender, classId, sc] of demoStudents) {
      pn++;
      await LocalAdapter.insert('students', {
        center_id: center.id, class_id: classId, name, gender,
        parent_phone: '09000000' + String(pn).padStart(2, '0'), status: 'active', session_count: sc, created_at: nowISO(),
      });
    }
    const staff = [
      { name: 'Cô Mai', role: 'gv', pin: '1111' },
      { name: 'Chị Lan', role: 'cskh', pin: '2222' },
      { name: 'Anh Tuấn', role: 'manager', pin: '3333' },
    ];
    for (const s of staff)
      await LocalAdapter.insert('staff', Object.assign({ center_id: center.id, active: true, created_at: nowISO() }, s));

    const monday = mondayOf(new Date());
    await LocalAdapter.insert('weekly_themes', {
      center_id: center.id, week_start: monday, title: 'Ghép hình & nhận biết hình khối',
      description: 'Tuần này các bé học ghép hình, nhận biết hình tròn/vuông/tam giác qua trò chơi.',
      created_at: nowISO(),
    });
    const STR = [
      [1, 'Tập trung tốt suốt buổi', 'giữ được sự tập trung rất tốt trong suốt buổi học'],
      [2, 'Mạnh dạn giơ tay trả lời', 'mạnh dạn giơ tay phát biểu trước lớp'],
      [3, 'Tự tìm ra cách giải', 'tự tìm ra cách giải mà không cần cô gợi ý'],
      [4, 'Giúp bạn khi bạn chưa hiểu', 'chủ động giúp bạn khi bạn chưa hiểu bài'],
      [5, 'Hào hứng tham gia trò chơi', 'tham gia trò chơi học tập với sự hào hứng'],
      [6, 'Kiên nhẫn thử nhiều cách', 'kiên nhẫn thử lại nhiều cách khi gặp khó'],
      [7, 'Biết giải thích cách làm', 'biết giải thích lại cách làm của mình'],
      [8, 'Tự giác hoàn thành bài', 'tự giác hoàn thành bài mà không cần nhắc'],
      [9, 'Quan sát rất nhanh', 'quan sát và nhận ra chi tiết rất nhanh'],
      [10, 'Tự tin trình bày trước lớp', 'tự tin trình bày ý kiến của mình trước lớp'],
    ];
    for (const [idx, label, phrase] of STR)
      await LocalAdapter.insert('strength_templates', { center_id: center.id, idx, label, phrase });
  }

  function mondayOf(d) {
    const x = new Date(d); const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    return x.toISOString().slice(0, 10);
  }

  /* ═══════════════ DB cấp cao (nghiệp vụ) ═══════════════ */
  const DB = {
    mode: 'demo',
    async init() { this.mode = await initAdapter(); return this.mode; },

    /* center + staff */
    async getCenter() {
      const list = await adapter.select('centers');
      if (CFG.centerId) return list.find((c) => c.id === CFG.centerId) || list[0];
      return list[0];
    },
    async listStaff(centerId) {
      return adapter.select('staff', { center_id: centerId });
    },
    async addStaff(centerId, name, role, pin) { return adapter.insert('staff', { center_id: centerId, name, role, pin: pin || '', active: true, created_at: nowISO() }); },
    async updateStaff(id, patch) { return adapter.update('staff', { id }, patch); },
    async deleteStaff(id) { return adapter.remove('staff', { id }); },

    /* lớp + bé */
    async listClasses(centerId) { return adapter.select('classes', { center_id: centerId }, { order: 'name' }); },
    async addClass(centerId, name, ageBand) { return adapter.insert('classes', { center_id: centerId, name, age_band: ageBand || '', created_at: nowISO() }); },
    async renameClass(id, name) { return adapter.update('classes', { id }, { name }); },
    async listStudents(centerId, classId) {
      const m = { center_id: centerId, status: 'active' };
      if (classId) m.class_id = classId;
      const rows = await adapter.select('students', m, { order: 'name' });
      return rows;
    },
    async getStudent(id) { return (await adapter.select('students', { id }))[0]; },
    async addStudent(s) { return adapter.insert('students', Object.assign({ status: 'active', session_count: 0, created_at: nowISO() }, s)); },
    async updateStudent(id, patch) { return adapter.update('students', { id }, patch); },
    async softDeleteStudent(id) { return adapter.update('students', { id }, { status: 'deleted', deleted_at: nowISO() }); },
    /* đếm bé từng lớp (cho layout tổng quan) */
    async classCounts(centerId) {
      const studs = await this.listStudents(centerId);
      const map = {};
      studs.forEach((s) => { map[s.class_id] = (map[s.class_id] || 0) + 1; });
      return map;
    },

    /* buổi học */
    async _getSessionById(id) { return (await adapter.select('sessions', { id }))[0]; },
    async ensureSession(centerId, classId, date, staffId) {
      const ex = (await adapter.select('sessions', { class_id: classId, date }))[0];
      if (ex) return ex;
      return adapter.insert('sessions', { center_id: centerId, class_id: classId, date, created_by: staffId, created_at: nowISO() });
    },

    /* record GV chấm */
    async getRecord(sessionId, studentId) {
      return (await adapter.select('session_records', { session_id: sessionId, student_id: studentId }))[0];
    },
    async _getRecordById(id) { return (await adapter.select('session_records', { id }))[0]; },
    /* mọi record present của 1 bé (để suy hồ sơ) */
    async _allSessionsOfStudent(studentId) {
      const recs = await adapter.select('session_records', { student_id: studentId });
      return recs.filter((r) => r.attendance === 'present');
    },
    /* các buổi của 1 bé trong khoảng ngày [from..to] (kèm .date) — cho báo cáo tuần */
    async studentRecordsInRange(studentId, fromDate, toDate) {
      const recs = await adapter.select('session_records', { student_id: studentId });
      const out = [];
      for (const r of recs) {
        const ses = await this._getSessionById(r.session_id);
        if (ses && ses.date >= fromDate && ses.date <= toDate) out.push(Object.assign({ date: ses.date }, r));
      }
      return out.sort((a, b) => (a.date < b.date ? -1 : 1));
    },
    /* tăng/giảm bộ đếm buổi đã đi */
    async softUpdateSessionCount(studentId, delta) {
      const s = await this.getStudent(studentId);
      if (!s) return;
      const n = Math.max(0, (s.session_count || 0) + delta);
      return adapter.update('students', { id: studentId }, { session_count: n });
    },
    async listRecordsBySession(sessionId) { return adapter.select('session_records', { session_id: sessionId }); },
    async saveRecord(rec) {
      const ex = await this.getRecord(rec.session_id, rec.student_id);
      if (ex) return adapter.update('session_records', { id: ex.id }, Object.assign({ updated_at: nowISO() }, rec)).then((r) => r[0]);
      return adapter.insert('session_records', Object.assign({ created_at: nowISO(), updated_at: nowISO() }, rec));
    },

    /* tin nhắn */
    async getMessage(recordId) { return (await adapter.select('session_messages', { record_id: recordId }))[0]; },
    async getMessageById(id) { return (await adapter.select('session_messages', { id }))[0]; },
    async listMessages(centerId) {
      // join nhẹ: lấy theo student.center
      const studs = await this.listStudents(centerId);
      const ids = new Set(studs.map((s) => s.id));
      const all = await adapter.select('session_messages', null, { order: 'updated_at', desc: true });
      return all.filter((m) => ids.has(m.student_id));
    },
    async saveMessage(msg) {
      const ex = msg.record_id ? await this.getMessage(msg.record_id) : null;
      if (ex) return adapter.update('session_messages', { id: ex.id }, Object.assign({ updated_at: nowISO() }, msg)).then((r) => r[0]);
      return adapter.insert('session_messages', Object.assign({ version: 1, status: 'waiting_cs', created_at: nowISO(), updated_at: nowISO() }, msg));
    },
    /* cập nhật ATOMIC theo version (optimistic lock) — chống 2 CSKH cùng duyệt.
       update khớp cả {id, version}: nếu version đã đổi → 0 dòng → báo xung đột. */
    async updateMessageGuarded(id, expectedVersion, patch) {
      const rows = await adapter.update('session_messages',
        { id, version: expectedVersion },
        Object.assign({ version: expectedVersion + 1, updated_at: nowISO() }, patch));
      if (!rows || !rows.length) {
        const cur = await this.getMessageById(id);
        if (!cur) throw new Error('Tin không tồn tại');
        throw new Error('Tin vừa được cập nhật bởi thành viên khác — tải lại để xem bản mới.');
      }
      return rows[0];
    },

    /* tự dọn lock kẹt: demo → nhả mọi cs_editing; supabase → chỉ nhả lock cũ >15' */
    async healLocks(centerId, demoMode) {
      try {
        const msgs = await this.listMessages(centerId);
        const cutoff = Date.now() - 15 * 60000;
        for (const m of msgs) {
          if (m.status !== 'cs_editing') continue;
          const stale = !m.lock_at || new Date(m.lock_at).getTime() < cutoff;
          if (demoMode || stale) {
            try { await this.updateMessageGuarded(m.id, m.version, { status: 'waiting_cs', lock_owner: null, lock_at: null }); } catch (_) {}
          }
        }
      } catch (_) {}
    },

    /* lịch sử điểm mạnh gần nhất (anti-lặp) */
    async recentFeaturedStrengths(studentId, n) {
      const msgs = await adapter.select('session_messages', { student_id: studentId }, { order: 'created_at', desc: true, limit: n || 5 });
      return msgs.map((m) => m.featured_strength).filter((x) => x != null);
    },

    /* hồ sơ bé */
    async getProfile(studentId) { return (await adapter.select('child_profiles', { student_id: studentId }))[0]; },
    async saveProfile(p) {
      const ex = await this.getProfile(p.student_id);
      if (ex) return adapter.update('child_profiles', { id: ex.id }, Object.assign({ updated_at: nowISO() }, p)).then((r) => r[0]);
      return adapter.insert('child_profiles', Object.assign({ status: 'observing', updated_at: nowISO() }, p));
    },
    async listProfiles(centerId, status) {
      const studs = await this.listStudents(centerId);
      const ids = new Set(studs.map((s) => s.id));
      let all = await adapter.select('child_profiles');
      all = all.filter((p) => ids.has(p.student_id));
      if (status) all = all.filter((p) => p.status === status);
      return all;
    },

    /* theme + strengths */
    async getThemeFor(centerId, date) {
      const rows = await adapter.select('weekly_themes', { center_id: centerId }, { order: 'week_start', desc: true });
      return rows.find((t) => t.week_start <= date) || rows[0];
    },
    async listThemes(centerId) { return adapter.select('weekly_themes', { center_id: centerId }, { order: 'week_start', desc: true }); },
    async addTheme(t) { return adapter.insert('weekly_themes', Object.assign({ created_at: nowISO() }, t)); },
    async listStrengths(centerId) { return adapter.select('strength_templates', { center_id: centerId }, { order: 'idx' }); },

    /* parent token */
    async createParentToken(messageId) {
      const days = CFG.tokenTtlDays || 30;
      const token = 't_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      const expires = new Date(Date.now() + days * 86400000).toISOString();
      await adapter.insert('parent_tokens', { message_id: messageId, token, expires_at: expires, created_at: nowISO() });
      return token;
    },
    async getExistingToken(messageId) {
      const rows = await adapter.select('parent_tokens', { message_id: messageId }, { order: 'created_at', desc: true });
      return rows[0];
    },

    /* audit */
    async audit(centerId, actor, action, entityType, entityId, meta) {
      return adapter.insert('audit_logs', {
        center_id: centerId, actor_id: actor ? actor.id : null, actor_name: actor ? actor.name : '',
        action, entity_type: entityType || '', entity_id: entityId || null, meta: meta || {}, created_at: nowISO(),
      });
    },
    async listAudit(centerId, limit) {
      return adapter.select('audit_logs', { center_id: centerId }, { order: 'created_at', desc: true, limit: limit || 50 });
    },

    /* ═══ BÁO CÁO TUẦN (lesson content + nhận xét) ═══ */
    async createWeekly(row) {
      const token = 'w_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      const days = CFG.tokenTtlDays || 30;
      const r = await adapter.insert('weekly_reports', Object.assign({
        token, expires_at: new Date(Date.now() + days * 86400000).toISOString(),
        status: 'sent', created_at: nowISO(),
      }, row));
      return r;
    },
    async listWeekly(centerId, classId) {
      const m = { center_id: centerId };
      if (classId) m.class_id = classId;
      return adapter.select('weekly_reports', m, { order: 'created_at', desc: true });
    },
    async weeklyByToken(token) {
      const rows = await adapter.select('weekly_reports', { token });
      const w = rows[0];
      if (!w) return { error: 'not_found' };
      if (w.expires_at && new Date(w.expires_at) < new Date()) return { error: 'expired' };
      const stu = (await adapter.select('students', { id: w.student_id }))[0] || {};
      const center = (await adapter.select('centers', { id: w.center_id }))[0] || {};
      return {
        type: 'weekly',
        student_name: stu.name || '', date: w.sent_date || '',
        range_from: w.range_from || w.sent_date, range_to: w.range_to || w.sent_date,
        book: w.book, week: w.week, lesson: w.lesson_snapshot || null, summary: w.summary || null,
        class_comment: w.class_comment || '', child_comment: w.child_comment || '',
        center_name: center.name || 'WonderKids', tagline: center.tagline || '',
        brand_color: center.brand_color || '#f3811f',
        closing_line: center.closing_line || 'Mỗi bé có tốc độ riêng — với sự đồng hành kiên nhẫn, bé sẽ ngày càng tự tin và phát triển toàn diện.',
      };
    },

    /* parent report (qua RPC — cùng cho cả 2 adapter) */
    async parentReport(token) {
      if (String(token).startsWith('w_')) return this.weeklyByToken(token);
      return adapter.rpc('get_parent_report', { p_token: token });
    },

    /* tiện ích lộ ra ngoài */
    _mondayOf: mondayOf,
  };

  window.CTRC_DB = DB;
})();
