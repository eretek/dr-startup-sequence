/*! Eretek Online Araçlar #63 — Felaket Kurtarma Başlatma Sırası */
ERT.def('63', {
	run: function (v, c) {
		var r = c.csv(v.csv, 'csv', 2000), H = r.head, col = function (n) { return ERT.csv.col(H, n); };
		var iN = col(['name', 'system', 'vm', 'sistem']), iD = col(['depends_on', 'depends', 'bagimlilik']), iT = col(['boot_min', 'ready_min', 'sure_dk']);
		if (iN < 0 || iD < 0) { throw c.fe('csv', 'col', { c: 'name, depends_on, boot_min' }); }
		var N = {}, names = [];
		r.rows.forEach(function (x, i) {
			var n = x[iN], t = iT >= 0 && x[iT] !== '' ? ERT.parseNum(x[iT], 'en') : 0;
			if (!n || !(t >= 0)) { throw c.fe('csv', 'rowNum', { r: i + 2 }); }
			if (N[n]) { throw c.fe('csv', 'dup', { n: n }); }
			N[n] = { n: n, t: t, d: (x[iD] || '').split(/[;|]/).map(function (s) { return s.trim(); }).filter(Boolean), i: i };
			names.push(n);
		});
		names.forEach(function (n) { N[n].d.forEach(function (d) { if (!N[d]) { throw c.fe('csv', 'unknown', { n: n, d: d }); } if (d === n) { throw c.fe('csv', 'self', { n: n }); } }); });
		var wave = {}, fin = {}, state = {}, path = [];
		var visit = function (n) {
			if (state[n] === 2) { return; }
			if (state[n] === 1) { var k = path.indexOf(n); throw c.fe('csv', 'cycle', { l: path.slice(k).concat(n).join(' → ') }); }
			state[n] = 1; path.push(n);
			var w = 1, st = 0; N[n].d.forEach(function (d) { visit(d); w = Math.max(w, wave[d] + 1); st = Math.max(st, fin[d]); });
			wave[n] = w; fin[n] = st + N[n].t; state[n] = 2; path.pop();
		};
		names.forEach(visit);
		var sorted = names.slice().sort(function (a, b) { return wave[a] - wave[b] || N[a].i - N[b].i; }), total = 0, last = null;
		var rows = sorted.map(function (n) { total = Math.max(total, fin[n]); return [wave[n], n, N[n].d.join(', ') || '–', c.n(N[n].t, 0), c.n(fin[n] - N[n].t, 0), c.n(fin[n], 0)]; });
		names.forEach(function (n) { if (fin[n] === total && last === null) { last = n; } });
		var cp = []; var cur = last; while (cur) { cp.unshift(cur); var nx = null; N[cur].d.forEach(function (d) { if (fin[d] === fin[cur] - N[cur].t && nx === null) { nx = d; } }); cur = nx; }
		var waves = Math.max.apply(null, names.map(function (n) { return wave[n]; }));
		var cols = [c.t('c_w'), c.t('c_n'), c.t('c_d'), c.t('c_t'), c.t('c_s'), c.t('c_r')];
		return { big: c.t('big', { w: waves, m: c.n(total, 0) }), kv: [[c.t('k_w'), waves], [c.t('k_t'), c.n(total, 0) + ' ' + c.t('min')], [c.t('k_cp'), cp.join(' → ')]], msgs: [['info', c.t('method')], ['info', c.t('test')]], tables: [{ cols: cols, rows: rows }], x: { csv: { name: 'dr-startup', cols: cols, rows: rows } }, v: { waves: waves, total: total, order: sorted, critical: cp } };
	}
});
