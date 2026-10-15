import { api } from '../api.js';
import { empty, h, pageHead, pager, skeleton, table, when, fill } from '../ui.js';

const CATEGORIES = ['messages', 'members', 'roles', 'voice', 'channels', 'invites', 'security', 'tickets'];

export async function render(root) {
  let page = 1, category = '';
  const list = h('section', { class: 'panel' });
  const select = h('select', { class: 'input', 'aria-label': 'Filter by type', style: 'width:auto', onchange: () => { category = select.value; page = 1; load().catch(fail); } },
    h('option', { value: '' }, 'All activity'), CATEGORIES.map((c) => h('option', { value: c }, c[0].toUpperCase() + c.slice(1))));
  root.replaceChildren(pageHead('Activity log', 'What happened in the server, newest first.', select), list);

  async function load() {
    fill(list, h('div', { class: 'panel-pad' }, skeleton('100%', '260px')));
    const d = await api(`/api/audit?page=${page}${category ? `&category=${category}` : ''}`);
    fill(list, 
      table([
        { label: 'When', cell: (r) => h('span', { class: 'muted' }, when(r.at)) },
        { label: 'Type', cell: (r) => h('span', { class: 'pill rose' }, r.category) },
        { label: 'What happened', cell: (r) => r.summary },
        { label: 'By', cell: (r) => r.actor ?? h('span', { class: 'muted' }, '') },
      ], d.rows, empty('Nothing logged', 'Events appear here once the bot has seen some activity.')),
      d.rows.length ? pager(d, (p) => { page = p; load().catch(fail); }) : null,
    );
  }
  const fail = (e) => fill(list, h('div', { class: 'error-box' }, e.message));
  await load().catch(fail);
}
