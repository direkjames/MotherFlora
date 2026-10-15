import { api } from '../api.js';
import { ledgerChart, monthName } from '../charts.js';
import { empty, h, num, peso, pesoShort, skeleton, uptime, ago, pageHead } from '../ui.js';

const METHOD_COLORS = ['#d9698a', '#f0a0b8', '#8f7cf0', '#5fc3c0', '#e8b85a'];

function greeting(name) {
  const hour = Number(new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', hour12: false }).format(new Date())) % 24;
  return `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}, ${name}`;
}

export async function render(root, { me }) {
  root.append(pageHead(greeting(me.name), 'Here is how the community is doing.'), h('div', { class: 'grid' }, h('div', { class: 'panel panel-pad' }, skeleton('40%', '48px'), skeleton('100%', '160px'))));
  const d = await api('/api/overview');
  const body = h('div', { class: 'grid' });
  root.replaceChildren(pageHead(greeting(me.name), d.guild ? `${d.guild.name} at a glance.` : 'Here is how the community is doing.'), body);

  // The ledger: this month's donations, large, with six months beside it.
  const s = d.donations.series;
  const prev = s[s.length - 2]?.total ?? 0;
  const cur = d.donations.month;
  const change = prev ? Math.round(((cur.total - prev) / prev) * 100) : null;
  body.append(
    h('section', { class: 'panel ledger', 'aria-label': 'Donations this month' },
      h('div', {},
        h('p', { class: 'muted' }, `Donations in ${monthName(s[s.length - 1].month)}`),
        h('div', { class: 'ledger-total num' }, h('span', { class: 'cur' }, '₱'), Math.round(cur.total / 100).toLocaleString('en-PH')),
        h('p', { class: 'ledger-note' },
          change !== null && h('span', { class: `delta ${change < 0 ? 'down' : ''}` }, `${change >= 0 ? '+' : ''}${change}%`),
          change !== null && ' vs last month. ',
          `${num(cur.count)} donation${cur.count === 1 ? '' : 's'} from ${num(cur.donors)} ${cur.donors === 1 ? 'person' : 'people'}.`),
        h('p', { class: 'muted', style: 'margin-top:14px;font-size:13.5px' }, `All time: ${peso(d.donations.allTime.total)}`)),
      ledgerChart(s)),
  );

  const g = d.guild ?? {};
  const b = d.bot ?? {};
  const cell = (value, label, live) => h('div', {}, h('b', { class: 'num' }, live ? h('span', { class: 'live-dot' }) : null, value), h('span', {}, label));
  body.append(h('section', { class: 'panel strip', 'aria-label': 'Key numbers' },
    cell(g.members !== undefined ? num(g.members) : '—', 'Members'),
    cell(num(d.tickets.open), 'Open tickets'),
    cell(num(d.giveaways.running), 'Running giveaways'),
    cell(`${num(d.notifications.live)} of ${num(d.notifications.feeds)}`, 'Streamers live', d.notifications.live > 0),
    cell(b.ping >= 0 && b.ping !== null ? `${b.ping} ms` : '—', b.uptime ? `Bot up for ${uptime(b.uptime)}` : 'Bot')));

  const top = d.donations.topDonors;
  const maxTop = Math.max(1, ...top.map((t) => t.total));
  const methods = d.donations.byMethod;
  const methodTotal = methods.reduce((a, m) => a + m.total, 0);

  body.append(h('div', { class: 'grid cols-2' },
    h('div', { class: 'grid' },
      h('section', { class: 'panel panel-pad' },
        h('div', { class: 'panel-head' }, h('h2', {}, 'Top donors this month')),
        top.length
          ? h('ol', { class: 'rank' }, top.map((t, i) => h('li', {}, h('span', { class: 'n' }, i + 1), h('span', {}, t.user_tag), h('span', { class: 'amount num' }, peso(t.total)), h('span', { class: 'track' }, h('i', { style: `width:${Math.max(4, (t.total / maxTop) * 100)}%` })))))
          : empty('No donations yet this month', 'They will show up here as soon as staff log one.')),
      h('section', { class: 'panel panel-pad' },
        h('div', { class: 'panel-head' }, h('h2', {}, 'How people paid')),
        methods.length
          ? [h('div', { class: 'seg', role: 'img', 'aria-label': 'Share by payment method' }, methods.map((m, i) => h('i', { style: `flex:${m.total};background:${METHOD_COLORS[i % 5]}` }))),
             h('div', { class: 'legend' }, methods.map((m, i) => h('span', { style: `--c:${METHOD_COLORS[i % 5]}` }, `${m.method} ${Math.round((m.total / methodTotal) * 100)}% (${pesoShort(m.total)})`)))]
          : h('p', { class: 'muted' }, 'Nothing to compare yet.'))),
    h('section', { class: 'panel panel-pad' },
      h('div', { class: 'panel-head' }, h('h2', {}, 'Recent activity')),
      d.recent.length
        ? h('ul', { class: 'timeline' }, d.recent.map((e) => h('li', {}, h('div', {}, h('div', {}, e.summary), h('small', {}, `${e.category}${e.actor ? `, by ${e.actor}` : ''}, ${ago(e.at)}`)))))
        : empty('Quiet so far', 'Joins, leaves, deletions and moderation will appear here.')),
  ));
}
