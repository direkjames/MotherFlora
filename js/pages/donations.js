import { api } from '../api.js';
import { empty, h, icon, num, pageHead, pager, peso, skeleton, table, toast, when, fill } from '../ui.js';

function lastMonths(n = 12) {
  const out = [];
  const now = new Date(Date.now() + 8 * 3_600_000);
  let y = now.getUTCFullYear(), m = now.getUTCMonth();
  for (let i = 0; i < n; i++) {
    out.push(`${y}-${String(m + 1).padStart(2, '0')}`);
    if (--m < 0) { m = 11; y--; }
  }
  return out;
}

export async function render(root) {
  let page = 1;
  const list = h('section', { class: 'panel' });
  const select = h('select', { class: 'input', 'aria-label': 'Month to download', style: 'width:auto' }, h('option', { value: '' }, 'Everything'), lastMonths().map((m) => h('option', { value: m }, m)));
  const download = h('button', { class: 'btn', onclick: async () => {
    try {
      const res = await api(`/api/donations/export${select.value ? `?month=${select.value}` : ''}`, { raw: true });
      const a = h('a', { href: URL.createObjectURL(await res.blob()), download: `donations-${select.value || 'all'}.csv` });
      document.body.append(a); a.click(); a.remove();
    } catch (e) { toast(e.message, 'bad'); }
  } }, icon('down'), 'Download CSV');
  root.replaceChildren(pageHead('Donations', 'Every donation staff have logged. Voided ones stay visible so the record is complete.', select, download), list);

  async function load() {
    fill(list, h('div', { class: 'panel-pad' }, skeleton('100%', '220px')));
    const d = await api(`/api/donations?page=${page}`);
    fill(list, 
      table([
        { label: 'Date', cell: (r) => when(r.at) },
        { label: 'Donor', cell: (r) => r.user },
        { label: 'Method', cell: (r) => h('span', { class: 'pill' }, r.method) },
        { label: 'Rank', cell: (r) => r.rank ?? h('span', { class: 'muted' }, 'none') },
        { label: 'Status', cell: (r) => h('span', { class: `pill ${r.status === 'active' ? 'good' : 'bad'}` }, r.status) },
        { label: 'Amount', right: true, cell: (r) => h('span', { class: `amount num${r.status === 'voided' ? ' muted' : ''}`, style: r.status === 'voided' ? 'text-decoration:line-through' : '' }, peso(r.amount)) },
      ], d.rows, empty('No donations yet', 'Use /donation add in Discord and it will appear here.')),
      d.rows.length ? pager(d, (p) => { page = p; load().catch(fail); }) : null,
    );
  }
  const fail = (e) => fill(list, h('div', { class: 'error-box' }, e.message));
  await load().catch(fail);
}
