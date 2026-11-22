/* PAVORA independent IDs: the original verified email controls creation/recovery. */
(() => {
  'use strict';
  const top = document.querySelector('.top');
  if (!top || !window.supabase) return;
  const button = document.createElement('button');
  button.id = 'pvManageIds';
  button.className = 'secondary';
  button.textContent = 'My IDs';
  button.hidden = true;
  top.insertBefore(button, document.getElementById('signout'));

  const layer = document.createElement('div');
  layer.id = 'pvIdsOverlay';
  layer.hidden = true;
  layer.innerHTML = `
    <section class="pvIdsCard" role="dialog" aria-modal="true" aria-labelledby="pvIdsHeading">
      <button type="button" id="pvIdsClose" aria-label="Close">×</button>
      <h2 id="pvIdsHeading">Your PAVORA IDs</h2>
      <p class="pvIdsHelp">One verified email, up to 3 independent IDs. Each ID has its own username, password, reels and chats.</p>
      <p id="pvIdsCount"></p><div id="pvIdsList"></div>
      <form id="pvIdsCreate">
        <h3>Create another ID</h3>
        <label>Full name <input name="displayName" maxlength="60" required autocomplete="off"></label>
        <label>Username <input name="username" maxlength="24" minlength="3" required pattern="[A-Za-z0-9_]{3,24}" autocomplete="off"></label>
        <label>New ID password <input name="newPassword" type="password" minlength="8" maxlength="128" required autocomplete="new-password"></label>
        <label>Original email account password <input name="masterPassword" type="password" required autocomplete="current-password"></label>
        <button type="submit">Create ID</button>
      </form>
      <form id="pvIdsReset">
        <h3>Reset an extra ID password</h3>
        <label>Extra ID username <input name="username" required autocomplete="off"></label>
        <label>New password <input name="newPassword" type="password" minlength="8" maxlength="128" required autocomplete="new-password"></label>
        <label>Original email account password <input name="masterPassword" type="password" required autocomplete="current-password"></label>
        <button type="submit">Change ID password</button>
      </form>
      <p class="pvIdsHelp">Forgot an extra ID password? Reset your original email account password from the login screen, log into that account, then return here to change the extra ID password.</p>
      <p id="pvIdsStatus" role="status" aria-live="polite"></p>
    </section>`;
  document.body.append(layer);
  const style = document.createElement('style');
  style.textContent = `
    #pvManageIds[hidden],#pvIdsOverlay[hidden],#pvIdsCreate[hidden]{display:none!important}
    #pvIdsOverlay{position:fixed;inset:0;background:#171020b8;z-index:1002;display:grid;place-items:center;padding:14px}
    .pvIdsCard{width:min(480px,100%);max-height:92dvh;overflow:auto;position:relative;background:#fff;color:#231a30;border-radius:24px;padding:24px;box-shadow:0 20px 70px #0005;font-family:system-ui,sans-serif}
    .pvIdsCard h2{font-size:23px;margin:0 40px 8px 0}.pvIdsCard h3{font-size:17px;margin:20px 0 12px}.pvIdsHelp{font-size:12px;color:#615a6e;line-height:1.5}
    #pvIdsClose{position:absolute;top:10px;right:16px;font-size:28px;background:transparent;color:#444;border:0}
    .pvIdsCard form{display:grid;gap:10px;padding-top:8px;border-top:1px solid #e4dceb;margin-top:20px}
    .pvIdsCard label{display:grid;gap:5px;font-size:12px;font-weight:700}.pvIdsCard input{box-sizing:border-box;width:100%;border:1px solid #d5cae0;border-radius:11px;padding:11px;font:inherit;background:#fff;color:#171020}
    .pvIdsCard form button{background:#7948da;color:#fff;border:0;border-radius:12px;padding:12px;font-weight:750}
    .pvIdsCard button:disabled{opacity:.6}.pvIdsRow{padding:8px 0;border-bottom:1px solid #eee7f3}
    #pvIdsStatus{font-size:13px;font-weight:700;color:#6340a7;min-height:20px}
  `;
  document.head.append(style);

  const status = layer.querySelector('#pvIdsStatus');
  const list = layer.querySelector('#pvIdsList');
  const count = layer.querySelector('#pvIdsCount');
  let currentUser = null;
  async function invoke(body) {
    const { data, error } = await db.functions.invoke('pavora-linked-accounts', { body });
    if (error) throw new Error(data?.error || 'Could not connect. Please try again.');
    if (data?.error) throw new Error(data.error);
    return data;
  }
  async function load() {
    status.textContent = 'Loading IDs…';
    try {
      const data = await invoke({ action: 'list' });
      count.textContent = `${data.total} of 3 IDs used`;
      list.replaceChildren();
      for (const account of data.accounts || []) {
        const row = document.createElement('div');
        row.className = 'pvIdsRow';
        row.textContent = `@${account.username} · ${account.display_name}`;
        list.append(row);
      }
      layer.querySelector('#pvIdsCreate').hidden = data.total >= 3;
      status.textContent = '';
    } catch (error) { status.textContent = error.message; }
  }
  button.onclick = () => { layer.hidden = false; load(); };
  layer.querySelector('#pvIdsClose').onclick = () => { layer.hidden = true; };
  layer.addEventListener('click', event => { if (event.target === layer) layer.hidden = true; });
  layer.addEventListener('submit', async event => {
    if (event.target.id !== 'pvIdsCreate' && event.target.id !== 'pvIdsReset') return;
    event.preventDefault();
    const form = event.target;
    const submit = form.querySelector('button[type=submit]');
    const fields = Object.fromEntries(new FormData(form));
    submit.disabled = true;
    status.textContent = 'Saving securely…';
    try {
      const data = await invoke({ action: form.id === 'pvIdsCreate' ? 'create' : 'reset', ...fields });
      form.reset();
      await load();
      status.textContent = data.message;
    } catch (error) { status.textContent = error.message; }
    finally { submit.disabled = false; }
  });
  function updateVisibility(session) {
    currentUser = session?.user || null;
    const email = currentUser?.email || '';
    button.hidden = !email || email.endsWith('.invalid');
    if (!currentUser) layer.hidden = true;
  }
  db.auth.onAuthStateChange((_event, session) => { updateVisibility(session); });
  db.auth.getSession().then(({ data }) => updateVisibility(data.session)).catch(() => {});
})();
