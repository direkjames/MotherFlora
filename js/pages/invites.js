import { api } from '../api.js';
import { empty, h, num, pageHead, table } from '../ui.js';

export async function render(root) {
  root.replaceChildren(pageHead('Invites', 'Who brings people into the server. Fake counts are brand-new accounts.'));
  const d = await api('/api/invites');
  root.append(h('section', { class: 'panel' }, table([
    { label: 'Member', cell: (r) => h('b', {}, r.name ?? `User ${r.id}`) },
    { label: 'Still here', right: true, cell: (r) => h('span', { class: 'amount num' }, num(r.valid)) },
    { label: 'Left', right: true, cell: (r) => h('span', { class: 'num muted' }, num(r.left)) },
    { label: 'Fake', right: true, cell: (r) => h('span', { class: 'num muted' }, num(r.fake)) },
    { label: 'Total', right: true, cell: (r) => h('span', { class: 'num' }, num(r.total)) },
  ], d.rows, empty('No invite data yet', 'Invites are counted from the moment Mother Flora joined.'))));
}
