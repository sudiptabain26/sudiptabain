(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach(c => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
    return e;
  };
  const load = f => fetch('data/' + f + '.json').then(r => {
    if (!r.ok) throw new Error('Could not load data/' + f + '.json');
    return r.json();
  });
  const NAV = [['index', 'Home'], ['research', 'Research'], ['demos', 'Demos'], ['projects', 'Projects'],
    ['papers', 'Papers'], ['notes', 'Notes'], ['cv', 'CV'], ['contact', 'Contact']];
  const tagList = a => (a && a.length) ? h('span', { class: 'tags' }, a.map(t => h('span', { class: 'chip', text: t }))) : null;
  const badge = s => s ? h('span', { class: 'status s-' + s.toLowerCase().replace(/\s+/g, '-'), text: s }) : null;
  const linkRow = o => {
    const e = Object.entries(o || {}).filter(([, u]) => u);
    return e.length ? h('p', { class: 'links' }, e.map(([k, u]) => h('a', { href: u, text: k }))) : null;
  };
  const empty = (root, msg) => root.append(h('p', { class: 'muted', text: msg }));

  function chrome(site) {
    const page = document.body.dataset.page;
    const label = (NAV.find(n => n[0] === page) || NAV[0])[1];
    document.title = page === 'index' ? site.name : label + ' \u00b7 ' + site.name;
    const btn = h('button', { class: 'theme-toggle', type: 'button' });
    const paint = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      btn.textContent = dark ? '\u2600 Light' : '\u263e Dark';
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    };
    btn.addEventListener('click', () => {
      const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem('theme', t); } catch (e) {}
      paint();
    });
    paint();
    $('#site-header').append(h('div', { class: 'wrap bar' },
      h('a', { class: 'brand', href: 'index.html', text: site.name }),
      h('nav', { 'aria-label': 'Main' }, NAV.map(([p, l]) =>
        h('a', { href: p + '.html', text: l, 'aria-current': p === page ? 'page' : null }))),
      btn));
    $('#site-footer').append(h('p', { class: 'muted', text: '\u00a9 ' + new Date().getFullYear() + ' ' + site.name }));
  }

  function wave(box) {
    const n = 56, W = 640, sp = W / n;
    let bars = '';
    for (let i = 0; i < n; i++) {
      const bh = 14 + 52 * Math.abs(Math.sin(i * 0.55) * Math.cos(i * 0.23)) + 14 * Math.abs(Math.sin(i * 1.7));
      const t = Math.min(1, Math.max(0, (i / n - 0.3) / 0.4));
      bars += '<rect x="' + (i * sp + 2).toFixed(1) + '" y="' + (66 - bh / 2).toFixed(1) + '" width="' + (sp - 4).toFixed(1) +
        '" height="' + bh.toFixed(1) + '" rx="3" style="fill:color-mix(in srgb,var(--accent) ' + (t * 100).toFixed(0) + '%,var(--bar))"/>';
    }
    box.innerHTML = '<svg viewBox="0 0 ' + W + ' 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + bars +
      '<text x="0" y="142" class="wl">Source speech</text><text x="' + W + '" y="142" text-anchor="end" class="wl wt">Dubbed speech</text></svg>';
  }

  const pages = {
    index: async site => {
      $('#name').textContent = site.name;
      $('#intro').append(...(site.intro || []).map(t => h('p', { text: t })));
      wave($('#wave'));
      const ups = await load('updates'), root = $('#updates');
      if (!ups.length) return empty(root, 'No updates yet.');
      ups.slice(0, 6).forEach(u => root.append(h('div', { class: 'card' },
        h('div', { class: 'row' }, h('strong', { text: u.title }), badge(u.status)),
        h('div', { class: 'row meta' }, h('span', { class: 'muted small', text: u.date }), tagList(u.tags)))));
    },

    research: async () => {
      const d = await load('research');
      $('#motivation').append(...d.motivation.map(t => h('p', { text: t })));
      const list = $('#pipeline'), box = $('#step-detail');
      const show = i => {
        [...list.querySelectorAll('.step')].forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
        const s = d.pipeline[i];
        box.replaceChildren(...[
          h('h3', { text: s.sub ? s.label + ' \u2014 ' + s.sub : s.label }),
          s.focus ? h('p', { class: 'focus-note', text: 'My focus: the stage I plan to concentrate on.' }) : null,
          h('p', { text: s.description })
        ].filter(Boolean));
      };
      d.pipeline.forEach((s, i) => list.append(h('li', {},
        h('button', { class: 'step' + (s.focus ? ' focus' : ''), type: 'button', 'aria-pressed': 'false', onclick: () => show(i) },
          s.focus ? h('span', { class: 'badge', text: 'My focus' }) : null,
          h('span', { class: 'step-name', text: s.label }),
          s.sub ? h('span', { class: 'step-sub', text: s.sub }) : null))));
      show(Math.max(0, d.pipeline.findIndex(s => s.focus)));
      $('#questions').append(...d.questions.map(q => h('li', { text: q })));
      $('#status').append(...d.status.map(s => h('div', { class: 'card row' }, h('span', { text: s.label }), badge(s.status))));
    },

    demos: async () => {
      const list = await load('demos'), root = $('#demos-root');
      if (!list.length) return empty(root, 'No demos yet.');
      const cell = (label, src) => h('td', { 'data-label': label },
        src ? h('audio', { controls: true, preload: 'none', src }) : h('span', { class: 'muted', text: '\u2014' }));
      root.append(h('div', { class: 'table-wrap' }, h('table', {},
        h('thead', {}, h('tr', {}, ['Sentence', 'Original', 'Baseline', 'Ours'].map(x => h('th', { text: x })))),
        h('tbody', {}, list.map(d => h('tr', {},
          h('td', { 'data-label': 'Sentence' }, h('div', { text: d.sentence }), d.note ? h('div', { class: 'muted small', text: d.note }) : null),
          cell('Original', d.original), cell('Baseline', d.baseline), cell('Ours', d.ours)))))));
    },

    projects: async () => {
      const list = await load('projects'), root = $('#projects-root');
      if (!list.length) return empty(root, 'No projects yet.');
      list.forEach(p => root.append(h('article', { class: 'card' },
        h('div', { class: 'row' }, h('h3', { text: p.title }), badge(p.status)),
        h('p', { text: p.description }), tagList(p.tags), linkRow(p.links))));
    },

    papers: async () => {
      const list = (await load('papers')).slice().sort((a, b) => (b.year || 0) - (a.year || 0));
      const tags = [...new Set(list.flatMap(p => p.tags || []))].sort((a, b) => a.localeCompare(b));
      const bar = $('#filters'), root = $('#papers-root');
      let active = 'All';
      const card = p => h('article', { class: 'card' },
        h('h3', { text: p.title }),
        h('p', { class: 'muted small', text: [p.authors, p.venue, p.year].filter(Boolean).join(' \u00b7 ') }),
        p.summary ? h('p', { text: p.summary }) : null, tagList(p.tags), linkRow(p.links));
      const draw = () => {
        bar.replaceChildren(...['All', ...tags].map(t => h('button', {
          class: 'chip filter', type: 'button', 'aria-pressed': String(t === active), text: t,
          onclick: () => { active = t; draw(); }
        })));
        root.replaceChildren();
        [['mine', 'My papers'], ['reading', 'Reading notes']].forEach(([type, title]) => {
          const items = list.filter(p => p.type === type && (active === 'All' || (p.tags || []).includes(active)));
          if (items.length) root.append(h('h2', { text: title }), ...items.map(card));
        });
        if (!root.children.length) empty(root, 'No papers match this tag yet.');
      };
      draw();
    },

    notes: async () => {
      const list = await load('notes'), root = $('#notes-root');
      if (!list.length) return empty(root, 'No notes yet.');
      list.forEach(n => root.append(h('article', { class: 'card' },
        h('div', { class: 'row' },
          h('h3', {}, n.url ? h('a', { href: n.url, text: n.title }) : n.title),
          h('span', { class: 'muted small', text: n.date })),
        n.summary ? h('p', { text: n.summary }) : null, tagList(n.tags))));
    },

    contact: async site => {
      const root = $('#contact-root');
      if (site.email) root.append(h('dt', { text: 'Email' }), h('dd', {}, h('a', { href: 'mailto:' + site.email, text: site.email })));
      (site.links || []).filter(l => l.url).forEach(l =>
        root.append(h('dt', { text: l.label }), h('dd', {}, h('a', { href: l.url, text: l.url.replace(/^https?:\/\//, '') }))));
    }
  };

  (async () => {
    const site = await load('site').catch(() => ({ name: 'Portfolio', intro: [], links: [] }));
    chrome(site);
    const run = pages[document.body.dataset.page];
    if (!run) return;
    try { await run(site); } catch (e) {
      $('main').prepend(h('p', { class: 'card error', text: 'Could not load page data. If you opened the file directly, serve the folder over HTTP (see README). ' + e.message }));
    }
  })();
})();
