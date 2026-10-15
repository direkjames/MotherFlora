import { pesoShort } from './ui.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}, text) => {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthName = (key) => MONTHS[Number(key.slice(5)) - 1];

/** Six months of donations as rose bars; the current month glows. Built from plain SVG (no library). */
export function ledgerChart(series) {
  const W = window.innerWidth < 600 ? 330 : 520, H = 200, top = 26, bottom = 28, gap = W < 400 ? 10 : 16;
  const max = Math.max(1, ...series.map((s) => s.total));
  const bw = (W - gap * (series.length - 1)) / series.length;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', role: 'img', 'aria-label': `Donations over the last ${series.length} months` });
  const defs = el('defs');
  const g = el('linearGradient', { id: 'roseGrad', x1: 0, y1: 0, x2: 0, y2: 1 });
  g.append(el('stop', { offset: '0', 'stop-color': '#f0a0b8' }), el('stop', { offset: '1', 'stop-color': '#d9698a' }));
  defs.append(g);
  svg.append(defs);
  series.forEach((s, i) => {
    const x = i * (bw + gap);
    const bh = s.total ? Math.max(6, ((H - top - bottom) * s.total) / max) : 3;
    const y = H - bottom - bh;
    const now = i === series.length - 1;
    const grp = el('g');
    const title = el('title', {}, `${monthName(s.month)}: ${pesoShort(s.total)} from ${s.count} donation${s.count === 1 ? '' : 's'}`);
    const rect = el('rect', { x, y, width: bw, height: bh, rx: 9, class: `bar bar-anim${now ? ' now' : ''}`, style: `animation-delay:${i * 70}ms` });
    grp.append(title, rect, el('text', { x: x + bw / 2, y: H - 8, 'text-anchor': 'middle', class: 'axis' }, monthName(s.month)));
    if (s.total && (now || s.total === max)) grp.append(el('text', { x: x + bw / 2, y: y - 8, 'text-anchor': 'middle', class: 'val' }, pesoShort(s.total)));
    svg.append(grp);
  });
  return svg;
}
