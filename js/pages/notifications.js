import { api } from '../api.js';
import { ago, confirmDialog, empty, h, icon, pageHead, switchEl, table, toast, fill } from '../ui.js';

const LABEL = { twitch: 'Twitch', youtube: 'YouTube', kick: 'Kick', tiktok: 'TikTok' };

export async function render(root, { me }) {
  const admin = me.level === 'admin';
  root.replaceChildren(pageHead('Notifications', 'Who Mother Flora announces when they go live or upload. Add or edit accounts with /notify in Discord.'));
  const body = h('div', { class: 'grid' });
  root.append(body);

  async function load() {
    const d = await api('/api/notify');
    fill(body, 
      h('section', { class: 'panel panel-pad' },
        h('div', { class: 'panel-head' }, h('h2', {}, 'Platforms')),
        Object.entries(LABEL).map(([k, name]) => {
          const p = d.platforms[k] ?? {};
          const text = !p.configured ? 'Not set up. Add its keys to the bot settings.' : p.lastError ? `Problem: ${p.lastError}` : p.lastOk ? `Working, last check ${ago(new Date(p.lastOk).toISOString())}` : 'Set up, waiting for the first check';
          return h('div', { class: 'setting' }, h('div', {}, h('b', {}, name), h('p', {}, text)),
            h('span', { class: `pill ${!p.configured ? '' : p.lastError ? 'bad' : 'good'}` }, !p.configured ? 'off' : p.lastError ? 'problem' : 'on'));
        })),
      h('section', { class: 'panel' }, table([
        { label: 'Account', cell: (r) => h('div', {}, h('b', {}, r.name ?? r.handle), h('div', { class: 'muted' }, LABEL[r.platform])) },
        { label: 'Now', cell: (r) => (r.live ? h('span', { class: 'pill good' }, 'Live') : h('span', { class: 'pill' }, 'Offline')) },
        { label: 'Announce live', cell: (r) => (admin ? switchEl(r.notifyLive, (v, input) => patch(r, { notifyLive: v }, input), `Announce ${r.handle} going live`) : h('span', { class: 'pill' }, r.notifyLive ? 'yes' : 'no')) },
        { label: 'Announce videos', cell: (r) => (r.platform !== 'youtube' ? h('span', { class: 'muted' }, 'n/a') : admin ? switchEl(r.notifyVideos, (v, input) => patch(r, { notifyVideos: v }, input), `Announce ${r.handle} uploads`) : h('span', { class: 'pill' }, r.notifyVideos ? 'yes' : 'no')) },
        { label: 'Last announced', cell: (r) => h('span', { class: 'muted' }, r.lastNotified ? ago(r.lastNotified) : 'never') },
        { label: '', right: true, cell: (r) => admin && h('button', { class: 'btn small danger', 'aria-label': `Remove ${r.handle}`, onclick: () => remove(r) }, icon('trash'), 'Remove') },
      ], d.feeds, empty('Nobody is being watched', 'Run /notify add in Discord to start announcing a streamer.'))),
    );
  }
  async function patch(feed, change, input) {
    try { await api(`/api/notify/${feed.id}`, { method: 'PATCH', body: change }); toast('Saved', 'good'); }
    catch (e) { input.checked = !input.checked; toast(e.message, 'bad'); }
  }
  async function remove(feed) {
    if (!(await confirmDialog({ title: `Stop announcing ${feed.name ?? feed.handle}?`, body: 'Mother Flora will no longer post when they go live. You can add them again later with /notify add.', confirm: 'Remove', danger: true }))) return;
    try { await api(`/api/notify/${feed.id}`, { method: 'DELETE' }); toast('Removed', 'good'); await load(); } catch (e) { toast(e.message, 'bad'); }
  }
  await load();
}
