import { api } from '../api.js';
import { empty, h, pageHead, pager, skeleton, table, when, fill } from '../ui.js';

export async function render(root) {
  let page = 1, status = '';
  const list = h('section', { class: 'panel' });
  const tabs = h('div', { class: 'tabs', role: 'tablist' });
  const setTabs = () => tabs.replaceChildren(...[['', 'All'], ['open', 'Open'], ['closed', 'Closed']].map(([v, label]) =>
    h('button', { role: 'tab', 'aria-selected': String(status === v), onclick: () => { status = v; page = 1; setTabs(); load().catch(fail); } }, label)));
  setTabs();
  root.replaceChildren(pageHead('Tickets', 'Support requests from members.', tabs), list);

  async function load() {
    fill(list, h('div', { class: 'panel-pad' }, skeleton('100%', '220px')));
    const d = await api(`/api/tickets?page=${page}${status ? `&status=${status}` : ''}`);
    fill(list, 
      table([
        { label: '#', cell: (r) => h('span', { class: 'num muted' }, r.id) },
        { label: 'Topic', cell: (r) => h('div', {}, h('b', {}, r.category), h('div', { class: 'muted' }, r.subject)) },
        { label: 'Opened by', cell: (r) => r.opener },
        { label: 'Handled by', cell: (r) => r.claimedBy ?? h('span', { class: 'muted' }, 'nobody yet') },
        { label: 'Status', cell: (r) => h('span', { class: `pill ${r.status === 'open' ? 'good' : r.status === 'closing' ? 'warn' : ''}` }, r.status) },
        { label: 'Opened', cell: (r) => when(r.at) },
      ], d.rows, empty('No tickets here', 'Tickets that members open will be listed here.')),
      d.rows.length ? pager(d, (p) => { page = p; load().catch(fail); }) : null,
    );
  }
  const fail = (e) => fill(list, h('div', { class: 'error-box' }, e.message));
  await load().catch(fail);
}
