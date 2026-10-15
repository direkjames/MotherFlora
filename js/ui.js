// Tiny DOM helpers. Text always goes in as text (never as HTML), so nothing from Discord can inject markup.
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  add(el, kids);
  return el;
}
function add(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k === null || k === undefined || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
export const clear = (el) => el.replaceChildren();
/** Replaces an element's content, skipping null/false so nothing prints as the word "null". */
export const fill = (el, ...kids) => el.replaceChildren(...kids.flat(Infinity).filter((k) => k !== null && k !== undefined && k !== false).map((k) => (k instanceof Node ? k : document.createTextNode(String(k)))));

const ICONS = {
  home: 'M3 11.5 12 4l9 7.5M5.5 10v9.5h13V10',
  coins: 'M12 6c4.4 0 8-1.1 8-2.5S16.4 1 12 1 4 2.1 4 3.5 7.6 6 12 6Zm-8-2.5v5C4 10 7.6 11 12 11s8-1 8-2.5v-5M4 8.5v5C4 15 7.6 16 12 16s8-1 8-2.5v-5M4 13.5v5C4 20 7.6 21 12 21s8-1 8-2.5v-5',
  ticket: 'M3 9V6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5V9a3 3 0 0 0 0 6v2.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5V15a3 3 0 0 0 0-6ZM14 5v14',
  gift: 'M20 12v8.5H4V12M2.5 7.5h19V12h-19ZM12 7.5v13M12 7.5S10.5 3 8 3.5 8 7.5 12 7.5Zm0 0S13.5 3 16 3.5 16 7.5 12 7.5Z',
  scroll: 'M8 4h11v13.5a2.5 2.5 0 0 1-5 0V16H5v1.5M8 4a2 2 0 0 0-3 1.7V16h9M11 8.5h5M11 12h5',
  users: 'M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 20v-1.5a4 4 0 0 0-3-3.9M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  bell: 'M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9ZM10 20a2 2 0 0 0 4 0',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8ZM19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z',
  out: 'M9 20H5.5A1.5 1.5 0 0 1 4 18.5v-13A1.5 1.5 0 0 1 5.5 4H9M16 16l4-4-4-4M20 12H9',
  menu: 'M4 7h16M4 12h16M4 17h16',
  down: 'M12 4v11m0 0 4-4m-4 4-4-4M5 20h14',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12.5h10L18 7M9 7V4h6v3',
  refresh: 'M20 11a8 8 0 0 0-14.5-3.5M4 4v4h4M4 13a8 8 0 0 0 14.5 3.5M20 20v-4h-4',
};
export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '1.7');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', ICONS[name] ?? '');
  svg.append(p);
  return svg;
}

// The flower mark (SVG built with DOM calls, no innerHTML).
export function bloom(cls = '') {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  if (cls) svg.setAttribute('class', cls);
  svg.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < 5; i++) {
    const e = document.createElementNS(NS, 'ellipse');
    for (const [k, v] of Object.entries({ cx: 32, cy: 17, rx: 8, ry: 12, fill: '#D9698A', transform: `rotate(${i * 72} 32 32)` })) e.setAttribute(k, v);
    svg.append(e);
  }
  const c = document.createElementNS(NS, 'circle');
  for (const [k, v] of Object.entries({ cx: 32, cy: 32, r: 6, fill: '#F6D6A8' })) c.setAttribute(k, v);
  svg.append(c);
  return svg;
}

// ---------- formats (all times in Manila) ----------
export const peso = (centavos) => '₱' + (centavos / 100).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pesoShort = (centavos) => '₱' + Math.round(centavos / 100).toLocaleString('en-PH');
export const num = (n) => Number(n ?? 0).toLocaleString('en-PH');
const dtf = new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
export const when = (iso) => (iso ? dtf.format(new Date(iso)) : '');
export function ago(iso) {
  if (!iso) return 'never';
  const s = Math.max(0, (Date.now() - Date.parse(iso)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
export function until(iso) {
  const s = (Date.parse(iso) - Date.now()) / 1000;
  if (s <= 0) return 'ended';
  if (s < 3600) return `in ${Math.ceil(s / 60)}m`;
  if (s < 86400) return `in ${Math.floor(s / 3600)}h`;
  return `in ${Math.floor(s / 86400)}d`;
}
export const uptime = (s) => (s >= 86400 ? `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h` : s >= 3600 ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m` : `${Math.floor(s / 60)}m`);

// ---------- feedback ----------
export function toast(message, kind = '') {
  let box = document.querySelector('.toasts');
  if (!box) document.body.append((box = h('div', { class: 'toasts', 'aria-live': 'polite' })));
  const t = h('div', { class: `toast ${kind}` }, message);
  box.append(t);
  setTimeout(() => t.remove(), 3800);
}

export function confirmDialog({ title, body, confirm = 'Confirm', danger = false }) {
  return new Promise((resolve) => {
    const dlg = h('dialog', {},
      h('h2', {}, title),
      h('p', { class: 'muted' }, body),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => dlg.close('no') }, 'Cancel'),
        h('button', { class: `btn ${danger ? 'danger' : 'primary'}`, onclick: () => dlg.close('yes') }, confirm),
      ),
    );
    dlg.addEventListener('close', () => {
      resolve(dlg.returnValue === 'yes');
      dlg.remove();
    });
    document.body.append(dlg);
    dlg.showModal();
  });
}

export const skeleton = (w = '100%', hgt = '18px') => h('div', { class: 'skeleton', style: `width:${w};height:${hgt}` });
export const empty = (title, text) => h('div', { class: 'empty' }, h('b', {}, title), text);

export function table(columns, rows, emptyState) {
  if (!rows.length) return emptyState;
  return h('div', { class: 'table-wrap' },
    h('table', {},
      h('thead', {}, h('tr', {}, columns.map((c) => h('th', { class: c.right ? 'right' : '' }, c.label)))),
      h('tbody', {}, rows.map((r) => h('tr', {}, columns.map((c) => h('td', { class: c.right ? 'right' : '' }, c.cell(r)))))),
    ),
  );
}

export function pager(state, onPage) {
  return h('div', { class: 'pager' },
    h('span', {}, `Page ${state.page} of ${state.pages}`),
    h('div', { class: 'row' },
      h('button', { class: 'btn small', disabled: state.page <= 1, onclick: () => onPage(state.page - 1) }, 'Previous'),
      h('button', { class: 'btn small', disabled: state.page >= state.pages, onclick: () => onPage(state.page + 1) }, 'Next'),
    ),
  );
}

export const pageHead = (title, sub, ...actions) =>
  h('div', { class: 'page-head' }, h('div', {}, h('h1', {}, title), sub && h('p', {}, sub)), actions.length ? h('div', { class: 'row' }, actions) : null);

export function switchEl(checked, onchange, label) {
  const input = h('input', { type: 'checkbox', 'aria-label': label });
  input.checked = checked;
  input.addEventListener('change', () => onchange(input.checked, input));
  return h('label', { class: 'switch' }, input, h('i'));
}
