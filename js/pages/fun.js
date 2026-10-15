import { api } from '../api.js';
import { confirmDialog, empty, h, icon, pageHead, pager, skeleton, switchEl, toast, fill } from '../ui.js';

export async function render(root, { me }) {
  const admin = me.level === 'admin';
  let page = 1;
  root.replaceChildren(pageHead('Fun and questions', 'The question of the day and would-you-rather banks.'));
  const body = h('div', { class: 'grid' }, h('div', { class: 'panel panel-pad' }, skeleton('100%', '200px')));
  root.append(body);

  const run = async (fn, ok) => { try { await fn(); if (ok) toast(ok, 'good'); await load(); } catch (e) { toast(e.message, 'bad'); await load().catch(() => {}); } };

  function addForm(fields, submit, label) {
    const inputs = fields.map((f) => h('input', { class: 'input', placeholder: f.placeholder, maxlength: f.max, 'aria-label': f.placeholder, style: 'flex:1;min-width:180px' }));
    const form = h('form', { class: 'row', style: 'margin-bottom:8px', onsubmit: (e) => { e.preventDefault(); const vals = inputs.map((i) => i.value); run(() => submit(vals), 'Added'); } },
      inputs, h('button', { class: 'btn primary', type: 'submit' }, icon('plus'), label));
    return form;
  }
  const del = (path, what) => async () => {
    if (await confirmDialog({ title: 'Remove this question?', body: what, confirm: 'Remove', danger: true })) run(() => api(path, { method: 'DELETE' }), 'Removed');
  };
  const item = (text, extra, onDelete) => h('div', { class: 'setting' }, h('div', {}, text, extra), admin && h('button', { class: 'btn small danger', 'aria-label': 'Remove question', onclick: onDelete }, icon('trash')));

  async function load() {
    const d = await api(`/api/fun?page=${page}`);
    const c = d.qotd.config;
    const time = h('input', { class: 'input', value: c.time, style: 'width:100px', 'aria-label': 'Daily post time', disabled: !admin });
    fill(body, 
      h('section', { class: 'panel panel-pad' },
        h('div', { class: 'panel-head' }, h('h2', {}, 'Question of the day')),
        h('div', { class: 'setting' }, h('div', {}, h('b', {}, 'Post every day'), h('p', {}, c.channelId ? 'Mother Flora posts one question a day.' : 'Pick a channel first with /qotd channel in Discord.')),
          admin ? switchEl(c.enabled, (v) => run(() => api('/api/qotd/config', { method: 'PATCH', body: { enabled: v } }), 'Saved')) : h('span', { class: 'pill' }, c.enabled ? 'on' : 'off')),
        h('div', { class: 'setting' }, h('div', {}, h('b', {}, 'Discussion thread'), h('p', {}, 'Open a thread under each question for answers.')),
          admin ? switchEl(c.thread, (v) => run(() => api('/api/qotd/config', { method: 'PATCH', body: { thread: v } }), 'Saved')) : h('span', { class: 'pill' }, c.thread ? 'on' : 'off')),
        h('div', { class: 'setting' }, h('div', {}, h('b', {}, 'Time (Manila)'), h('p', {}, '24-hour time, like 09:00.')),
          h('div', { class: 'row' }, time, admin && h('button', { class: 'btn', onclick: () => run(() => api('/api/qotd/config', { method: 'PATCH', body: { time: time.value } }), 'Saved') }, 'Save time')))),
      h('section', { class: 'panel panel-pad' },
        h('div', { class: 'panel-head' }, h('h2', {}, `Question bank (${d.qotd.total}, ${d.qotd.unused} unused)`)),
        admin && addForm([{ placeholder: 'Type a new question', max: 300 }], ([text]) => api('/api/qotd', { method: 'POST', body: { text } }), 'Add'),
        d.qotd.rows.length ? d.qotd.rows.map((r) => item(r.text, r.used ? h('span', { class: 'pill', style: 'margin-left:8px' }, 'used') : h('span', { class: 'pill rose', style: 'margin-left:8px' }, 'new'), del(`/api/qotd/${r.id}`, r.text))) : empty('No questions', 'Add one above.')),
      h('section', { class: 'panel panel-pad' },
        h('div', { class: 'panel-head' }, h('h2', {}, `Would you rather (${d.wyr.total})`)),
        admin && addForm([{ placeholder: 'Option A', max: 200 }, { placeholder: 'Option B', max: 200 }], ([a, b]) => api('/api/wyr', { method: 'POST', body: { a, b } }), 'Add'),
        d.wyr.rows.length ? d.wyr.rows.map((r) => item(`${r.a} or ${r.b}`, null, del(`/api/wyr/${r.id}`, `${r.a} or ${r.b}`))) : empty('No questions', 'Add one above.')),
      d.pages > 1 ? h('section', { class: 'panel' }, pager({ page: d.page, pages: d.pages }, (p) => { page = p; load().catch(() => {}); })) : null,
    );
  }
  await load();
}
