import { api } from '../api.js';
import { empty, h, num, pageHead, table, until, when } from '../ui.js';

export async function render(root) {
  root.replaceChildren(pageHead('Giveaways', 'Running and finished giveaways. Start or end them with /giveaway in Discord.'));
  const d = await api('/api/giveaways');
  root.append(h('section', { class: 'panel' }, table([
    { label: 'Prize', cell: (r) => h('b', {}, r.prize) },
    { label: 'Status', cell: (r) => h('span', { class: `pill ${r.status === 'running' ? 'good' : r.status === 'cancelled' ? 'bad' : ''}` }, r.status) },
    { label: 'Entries', right: true, cell: (r) => h('span', { class: 'num' }, num(r.entries)) },
    { label: 'Ends', cell: (r) => (r.status === 'running' ? `${until(r.endsAt)}, ${when(r.endsAt)}` : when(r.endsAt)) },
    { label: 'Winners', cell: (r) => (r.winnerNames.length ? r.winnerNames.join(', ') : h('span', { class: 'muted' }, r.status === 'running' ? `${r.winners} to pick` : 'none')) },
    { label: 'Host', cell: (r) => r.host ?? h('span', { class: 'muted' }, 'unknown') },
  ], d.rows, empty('No giveaways yet', 'Run /giveaway start in Discord to create one.'))));
}
