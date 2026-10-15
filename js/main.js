import { api, apiConfigured, captureLogin, hasToken, loginUrl, logout } from './api.js';
import { bloom, clear, h, icon, skeleton, toast } from './ui.js';

const PAGES = [
  { id: 'overview', label: 'Overview', icon: 'home', load: () => import('./pages/overview.js') },
  { id: 'donations', label: 'Donations', icon: 'coins', load: () => import('./pages/donations.js') },
  { id: 'tickets', label: 'Tickets', icon: 'ticket', load: () => import('./pages/tickets.js') },
  { id: 'giveaways', label: 'Giveaways', icon: 'gift', load: () => import('./pages/giveaways.js') },
  { id: 'audit', label: 'Activity log', icon: 'scroll', load: () => import('./pages/audit.js') },
  { id: 'invites', label: 'Invites', icon: 'users', load: () => import('./pages/invites.js') },
  { id: 'notifications', label: 'Notifications', icon: 'bell', load: () => import('./pages/notifications.js') },
  { id: 'fun', label: 'Fun', icon: 'sparkle', load: () => import('./pages/fun.js') },
];

const app = document.getElementById('app');
const loginError = captureLogin();
const REASONS = {
  denied: 'Your Discord account does not have a staff role in this server.',
  cancelled: 'Sign-in was cancelled.',
  discord: 'Discord did not answer. Try again in a moment.',
  expired: 'That sign-in link expired. Start again.',
};
let me = null;
let signedOutMessage = null;
window.addEventListener('flora:signedout', (e) => { signedOutMessage = e.detail ?? 'Please sign in again.'; boot(); });

function theme() { return document.documentElement.dataset.theme; }
function toggleTheme() {
  const next = theme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('flora.theme', next); } catch { /* ignore */ }
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', next === 'dark' ? '#15111A' : '#FBF6F8');
}

function loginScreen(message) {
  clear(app);
  app.append(h('main', { class: 'login' }, h('div', { class: 'panel login-card' },
    bloom('logo'),
    h('h1', {}, 'Mother Flora'),
    h('p', {}, 'Sign in with the Discord account you use in the server. Only staff can enter.'),
    message && h('div', { class: 'error-box' }, message),
    !apiConfigured()
      ? h('div', { class: 'error-box' }, 'The website is not connected to your bot yet. Open config.js and put your bot server address in apiUrl.')
      : h('a', { class: 'btn primary', href: loginUrl() }, 'Sign in with Discord'),
    h('p', { class: 'fine' }, 'Mother Flora only reads your Discord name and picture to know who you are.'))));
}

function shell() {
  const nav = h('nav', { class: 'nav', 'aria-label': 'Sections' }, PAGES.map((p) => h('a', { href: `#/${p.id}`, dataset: { page: p.id } }, icon(p.icon), p.label)));
  const side = h('aside', { class: 'side', id: 'side' },
    h('div', { class: 'brand' }, bloom(), h('div', {}, h('b', {}, 'Mother Flora'), h('span', {}, 'Dashboard'))),
    nav,
    h('div', { class: 'side-foot' },
      h('div', { class: 'chip' }, h('img', { src: me.avatar, alt: '', width: 34, height: 34 }), h('div', {}, h('b', {}, me.name), h('span', { class: 'role-badge' }, me.level === 'admin' ? 'Admin' : 'Staff'))),
      h('div', { class: 'foot-actions' },
        h('button', { class: 'icon-btn', 'aria-label': 'Switch light or dark', onclick: toggleTheme }, icon(theme() === 'dark' ? 'sun' : 'moon')),
        h('button', { class: 'icon-btn', 'aria-label': 'Sign out', onclick: () => { logout(); me = null; boot(); } }, icon('out')))));
  const main = h('main', { class: 'main', id: 'main', tabindex: '-1' });
  const topbar = h('div', { class: 'mobilebar' }, h('button', { class: 'icon-btn', 'aria-label': 'Open menu', onclick: () => toggleSide(true) }, icon('menu')), h('b', {}, 'Mother Flora'));
  const wrap = h('div', { class: 'shell' }, side, h('div', {}, topbar, main));
  const scrim = h('div', { class: 'scrim', hidden: true, onclick: () => toggleSide(false) });
  clear(app);
  app.append(wrap, scrim);
  function toggleSide(open) { side.classList.toggle('open', open); scrim.hidden = !open; }
  nav.addEventListener('click', () => toggleSide(false));
  return main;
}

let main = null;
let token = 0;
async function route() {
  if (!main) return;
  const id = location.hash.replace(/^#\//, '').split('?')[0] || 'overview';
  const page = PAGES.find((p) => p.id === id) ?? PAGES[0];
  document.querySelectorAll('.nav a').forEach((a) => (a.dataset.page === page.id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  document.title = `${page.label} · Mother Flora`;
  const mine = ++token;
  const holder = h('div');
  main.replaceChildren(holder);
  holder.append(h('div', { class: 'panel panel-pad' }, skeleton('30%', '26px'), h('div', { style: 'height:14px' }), skeleton('100%', '180px')));
  try {
    const mod = await page.load();
    if (mine !== token) return;
    const fresh = h('div');
    await mod.render(fresh, { me });
    if (mine === token) main.replaceChildren(fresh);
  } catch (e) {
    if (mine !== token || e.status === 401) return;
    main.replaceChildren(h('div', { class: 'error-box' }, h('b', {}, 'Could not load this page'), h('p', { class: 'muted' }, e.message)));
  }
  window.scrollTo({ top: 0 });
}
window.addEventListener('hashchange', route);

async function boot() {
  if (!apiConfigured() || !hasToken()) {
    main = null;
    return loginScreen(signedOutMessage ?? (loginError ? REASONS[loginError] ?? 'Sign-in failed.' : null));
  }
  try {
    me = await api('/api/me');
  } catch (e) {
    if (e.status === 401 || e.status === 403) return;
    main = null;
    return loginScreen(e.message);
  }
  signedOutMessage = null;
  main = shell();
  route();
}
boot();
