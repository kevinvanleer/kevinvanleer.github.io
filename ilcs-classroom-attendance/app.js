const API = 'https://app.sycamoreschool.com/api/v1/';

// Error reporting to Sentry, without the Sentry SDK. Reports carry only the error type, a scrubbed
// message, the stack, the screen, and the app version: never student data, names, or the token.
// Empty DSN = reporting off.
const SENTRY_DSN = 'https://e57b9bd028c0553ef05a197b74226aca@o4512329506422784.ingest.us.sentry.io/4512329520709632';
const VERSION = '11';
let view = 'start', reports = 0;

function report(type, value, stack, extra) {
  if (!SENTRY_DSN || reports++ >= 10) return;
  try {
    const { protocol, host, pathname, username: key } = new URL(SENTRY_DSN);
    const scrub = s => String(s || '').replace(/[A-Za-z0-9_\-.]{24,}/g, '[redacted]').slice(0, 300);
    const event = {
      event_id: crypto.randomUUID().replace(/-/g, ''), timestamp: Date.now() / 1000, platform: 'javascript', level: 'error',
      release: 'ilcs-classroom-attendance@' + VERSION,
      environment: location.hostname === 'www.kevinvanleer.com' ? 'production' : 'local',
      tags: { view, installed: String(installed()) },
      exception: { values: [{ type: scrub(type), value: scrub(value) }] },
      extra: { stack: scrub(stack), ...extra },
      request: { headers: { 'User-Agent': navigator.userAgent } },
    };
    const body = [JSON.stringify({ event_id: event.event_id, sent_at: new Date().toISOString() }),
                  JSON.stringify({ type: 'event' }), JSON.stringify(event)].join('\n');
    const url = `${protocol}//${host}/api${pathname}/envelope/?sentry_key=${key}&sentry_version=7`;
    fetch(url, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
  } catch {}
}
addEventListener('error', e => report(e.error?.name || 'Error', e.message, e.error?.stack));
addEventListener('unhandledrejection', e => report(e.reason?.name || 'UnhandledRejection', e.reason?.message || e.reason, e.reason?.stack));
const store = {
  get(k) { try { return localStorage.getItem(k) || ''; } catch { return ''; } },
  set(k, v) { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch {} },
};
// Unlocked token for this tab only, so a refresh doesn't ask for fingerprint again; closing the app clears it.
const session = {
  get() { try { return sessionStorage.getItem('token') || ''; } catch { return ''; } },
  set(v) { try { v ? sessionStorage.setItem('token', v) : sessionStorage.removeItem('token'); } catch {} },
};
const app = document.getElementById('app');
const today = () => new Date().toLocaleDateString('en-CA');
let token = store.get('token') || session.get(), me = {}, classes = [], roster = [], state = {}, existing = {};

async function api(path, body) {
  const res = await fetch(API + path, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/json',
               ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    // Status and the call's shape only; Sycamore's response text can contain student data.
    if (res.status !== 401 && res.status !== 403) report('HTTPError', `${body ? 'POST' : 'GET'} ${path.split('?')[0].replace(/\d+/g, ':id')} ${res.status}`);
    throw Object.assign(new Error(`${res.status} ${text.slice(0, 120)}`), { status: res.status });
  }
  return text.trim() ? JSON.parse(text) : null;
}

// Biometric lock: a passkey's PRF output derives an AES key that encrypts the token at rest,
// so the stored token is unreadable without the device's fingerprint or face check.
const LOCK = 'lock';
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
const rand = n => crypto.getRandomValues(new Uint8Array(n));

async function lockAvailable() {
  try { return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); }
  catch { return false; }
}

async function aesKey(prfOutput) {
  const base = await crypto.subtle.importKey('raw', prfOutput, 'HKDF', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(), info: new TextEncoder().encode('ilcs-attendance-token') },
    base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

async function prfFromGet(credId, salt) {
  const a = await navigator.credentials.get({ publicKey: {
    challenge: rand(32), allowCredentials: [{ type: 'public-key', id: credId }], userVerification: 'required',
    extensions: { prf: { eval: { first: salt } } } } });
  const out = a.getClientExtensionResults().prf?.results?.first;
  if (!out) throw new Error('This device cannot encrypt with fingerprint or face.');
  return out;
}

async function enableLock() {
  const salt = rand(32);
  const cred = await navigator.credentials.create({ publicKey: {
    rp: { name: 'ILCS Classroom Attendance' },
    user: { id: rand(16), name: 'ILCS Classroom Attendance', displayName: 'ILCS Classroom Attendance' },
    challenge: rand(32),
    pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
    authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' },
    extensions: { prf: { eval: { first: salt } } } } });
  const ext = cred.getClientExtensionResults().prf;
  if (!ext?.enabled && !ext?.results) throw new Error('This device cannot encrypt with fingerprint or face.');
  // Some platforms return the PRF output at creation; the rest need one sign-in with the new passkey.
  const key = await aesKey(ext.results?.first || await prfFromGet(cred.rawId, salt));
  const iv = rand(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(token));
  store.set(LOCK, JSON.stringify({ id: b64(cred.rawId), salt: b64(salt), iv: b64(iv), ct: b64(ct) }));
  store.set('token', '');
}

async function unlock() {
  const l = JSON.parse(store.get(LOCK));
  const key = await aesKey(await prfFromGet(unb64(l.id), unb64(l.salt)));
  token = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(l.iv) }, key, unb64(l.ct)));
  session.set(token);
}

function forget(...keys) {
  for (const k of ['token', LOCK, ...keys]) store.set(k, '');
  session.set('');
  token = '';
}

function signOut() {
  forget('nolock');
  setup();
}

const shell = body => `<div class="setup"><img class="logo" src="ilcs-logo.png" alt="Immanuel Lutheran Church and School" width="399" height="100"><h2>Classroom Attendance</h2>${body}</div>`;

// auto: prompt for fingerprint/face as soon as the lock screen opens. Browsers that require a tap
// first (Safari) refuse that silently, and the Unlock button at the bottom is there for the tap.
function lockScreen(error, auto) {
  view = "lock";
  app.innerHTML = shell(`<p class="msg err">${esc(error || '')}</p>
    ${error ? '<button id="forget" class="secondary">Sign out and paste my token again</button>' : '<p class="hint"><button class="link" id="forget">Sign out</button></p>'}`)
    + '<footer><button id="unlock">Unlock with fingerprint or face</button></footer>';
  let busy = false;
  const attempt = quiet => { if (busy) return; busy = true; unlock().finally(() => { busy = false; }).then(start, e => {
    // Browsers report a missing passkey the same way as a cancel, on purpose, so that case can only be explained.
    if (['NotAllowedError', 'AbortError', 'InvalidStateError'].includes(e.name)) return quiet ? undefined : lockScreen('Unlock was cancelled, or this device no longer has the passkey. '
      + 'If the passkey was removed, sign out and paste your token again.');
    // Anything else means the saved lock itself is unusable (bad data, no key from the passkey, decrypt failed).
    report(e.name || "UnlockError", "Saved lock unusable, reset: " + e.message, e.stack);
    forget();
    setup('Your saved lock could not be opened, so it was reset. Please paste your token again.');
  }); };
  document.getElementById('unlock').onclick = () => attempt(false);
  document.getElementById('forget').onclick = signOut;
  if (auto && !document.hidden) attempt(true);
}

function offerLock(error) {
  view = "offer-lock";
  app.innerHTML = shell(`<p>This device can protect your token with your fingerprint or face. The token is encrypted and
      can only be unlocked by you on this device. You will be asked to unlock each time you open the app.</p>
    <button id="lockon">Turn on fingerprint or face lock</button>
    <p class="msg err">${esc(error || '')}</p>
    <p class="hint"><button class="link" id="nolock">Not now</button></p>`);
  document.getElementById('lockon').onclick = () => enableLock().then(ready,
    e => { if (e.name !== 'NotAllowedError') report(e.name || 'LockSetupError', e.message, e.stack); offerLock(e.name === 'NotAllowedError' ? 'Setup was cancelled.' : e.message); });
  document.getElementById('nolock').onclick = () => { store.set('nolock', '1'); ready(); };
}

function setup(error) {
  view = "sign-in";
  app.innerHTML = `<div class="setup"><img class="logo" src="ilcs-logo.png" alt="Immanuel Lutheran Church and School" width="399" height="100"><h2>Classroom Attendance</h2>
    ${ios() && !installed() ? '<p class="hint install">On iPhone or iPad, tap Share, then <strong>Add to Home Screen</strong>, and open the app from there. In a Safari tab, iOS may delete your token after 7 days without use.</p>'
      : android() && !installed() ? '<p class="hint install">Tip: install this app from Chrome\'s ⋮ menu &gt; <strong>Install app</strong>, and open it from your home screen.</p>' : ''}

    <h3>Getting your token</h3>
    <ol>
      <li><a href="https://app.sycamoreschool.com/index.php?schoolid=4502" target="_blank" rel="noopener">Sign in to Sycamore</a>.</li>
      <li>Go to My Organizer &gt; Utilities &gt; Applications.</li>
      <li>Create a token, copy it, and paste it below.</li>
    </ol>

    <div class="warn"><strong>Keep your token secret.</strong> Like your password, it lets anyone see and change your
      class records as you. Never share, email, or text it, even to the office. If it leaks, delete it in Applications
      and create a new one.</div>

    <div class="signin">
      <label for="tok">Sycamore access token</label>
      <input id="tok" type="password" autocomplete="off" placeholder="Paste your token">
      <button id="save">Sign in</button>
      <p class="msg err">${esc(error || '')}</p>
      <p class="hint">Your token is saved only on this device. Signing out deletes it from the device.${SENTRY_DSN ? ' Error reports are sent to help fix problems; they never include student names or your token.' : ''}</p>
    </div></div>`;
  if (error) document.getElementById('tok').scrollIntoView({ block: 'center' });
  document.getElementById('save').onclick = () => {
    token = document.getElementById('tok').value.trim();
    store.set('token', token);
    start();
  };
}

// Groups come back keyed by class type (Daylong, Period, Preschool...); keep homerooms.
const homerooms = groups => Object.values(groups || {}).flat().filter(c => String(c.HomeRoom) === '1');

async function start() {
  if (!token && store.get(LOCK)) return lockScreen(null, true);
  if (!token) return setup();
  try {
    me = await api('Me');
    classes = homerooms(await api(`User/${encodeURIComponent(me.UserID)}/Classes`));
    // ponytail: office accounts teach no class; fall back to every homeroom in the school
    if (!classes.length) classes = homerooms(await api(`School/${encodeURIComponent(me.SchoolID)}/Classes`));
  } catch (e) {
    // Only a rejected token is forgotten; a network failure must not sign the teacher out.
    if (e.status === 401 || e.status === 403) {
      forget();
      return setup('That token did not work: ' + e.message);
    }
    app.innerHTML = shell(`<p class="msg err">Could not reach Sycamore: ${esc(e.message)}</p><button id="retry">Try again</button>`);
    document.getElementById('retry').onclick = start;
    return;
  }
  if (!classes.length) return setup('No homeroom classes found for this account.');
  classes.sort((a, b) => a.Name.localeCompare(b.Name));
  if (store.get('token') && !store.get('nolock') && await lockAvailable()) return offerLock();
  ready();
}

function ready() {
  render();
  load();
}

function render() {
  view = "attendance";
  const saved = store.get('class');
  app.innerHTML = `<header>
      <div class="dates"><button id="prev" aria-label="Previous day">‹</button>
        <button id="datebtn" class="datebtn"></button>
        <input id="date" type="date" value="${today()}" max="${today()}" tabindex="-1" aria-hidden="true">
        <button id="next" aria-label="Next day" disabled>›</button></div>
      <button id="today" class="today" hidden>Today</button>
      <div class="avatar"><button id="avatar" aria-label="Account" aria-haspopup="true">${esc(initials())}</button>
        <div class="menu" id="menu" hidden><p>${esc(`${me.FirstName || ''} ${me.LastName || ''}`.trim())}</p>
          <p class="note">Students not yet marked start as</p>
          <div class="seg">${['P', 'A'].map(v => `<button data-default="${v}" aria-pressed="${dflt() === v}">${v === 'P' ? 'Present' : 'Absent'}</button>`).join('')}</div>
          <hr>
          <button id="signout">Sign out</button>
          <p class="note">Signing out removes your token from this device. You will need to paste it again to sign back in.</p></div></div>
    </header>
    <main><div class="controls"><select id="cls" aria-label="Class">${classes.map(c => `<option value="${esc(c.ID)}"${String(c.ID) === saved ? ' selected' : ''}>${esc(c.Name)}</option>`).join('')}</select></div>
      <ul id="list"></ul>
    </main>
    <footer><p class="summary" id="summary">Loading...</p><button id="submit" disabled>Submit</button><p class="msg" id="msg"></p></footer>`;
  for (const id of ['cls', 'date']) {
    const el = document.getElementById(id);
    el.dataset.prev = el.value;
    el.onchange = () => {
      if (Object.keys(changes()).length && !confirm('Attendance for this class has not been submitted. Leave without saving?')) {
        el.value = el.dataset.prev;
        return;
      }
      el.dataset.prev = el.value;
      if (id === 'cls') store.set('class', el.value);
      document.getElementById('next').disabled = val('date') >= today();
      if (id === 'date') followDay = val('date') === today() ? today() : null;
      load();
    };
  }
  // A teacher looking at today stays on today: when the app is reopened on a later day
  // (or left open past midnight), roll forward, unless they picked another date or have unsaved changes.
  let followDay = today();
  const rollDate = () => {
    if (document.hidden) return;
    const t = today(), el = document.getElementById('date');
    el.max = t;
    if (followDay && followDay !== t && el.value === followDay && !Object.keys(changes()).length) {
      el.value = el.dataset.prev = followDay = t;
      load();
    }
    document.getElementById('next').disabled = el.value >= t;
  };
  document.onvisibilitychange = rollDate;
  clearInterval(window.rollTimer);
  window.rollTimer = setInterval(rollDate, 60000);
  const step = days => {
    const el = document.getElementById('date'), d = new Date(el.value + 'T12:00');
    do d.setDate(d.getDate() + days); while (d.getDay() === 0 || d.getDay() === 6);
    const next = d.toLocaleDateString('en-CA');
    if (next > today()) return;
    el.value = next;
    el.dispatchEvent(new Event('change'));
  };
  // Typing into a date input fires change on every partial date, so open the picker instead.
  document.getElementById('datebtn').onclick = () => {
    const el = document.getElementById('date');
    try { el.showPicker(); } catch { el.focus(); }
  };
  document.getElementById('today').onclick = () => {
    const el = document.getElementById('date');
    el.value = today();
    el.dispatchEvent(new Event('change'));
  };
  document.getElementById('prev').onclick = () => step(-1);
  document.getElementById('next').onclick = () => step(1);
  document.getElementById('submit').onclick = submit;
  document.getElementById('signout').onclick = signOut;
  // Re-marks only students with no saved record; saved and office records keep their status.
  document.querySelectorAll('[data-default]').forEach(b => b.onclick = () => {
    store.set('default', b.dataset.default === 'A' ? 'A' : '');
    document.querySelectorAll('[data-default]').forEach(x => x.setAttribute('aria-pressed', x === b));
    for (const s of roster) if (!existing[s.ID]) state[s.ID] = dflt();
    draw();
  });
  const menu = document.getElementById('menu');
  document.getElementById('avatar').onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; };
  document.onclick = e => { if (!menu.contains(e.target)) menu.hidden = true; };
}

// iPadOS reports itself as a Mac, so also check for a touch screen.
const ios = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const android = () => /Android/.test(navigator.userAgent);
const installed = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const initials = () => ((me.FirstName || '?').charAt(0) + (me.LastName || '').charAt(0)).toUpperCase();
const dflt = () => store.get('default') === 'A' ? 'A' : 'P';
const val = id => document.getElementById(id).value;
const msg = (text, kind) => { const m = document.getElementById('msg'); m.textContent = text; m.className = 'msg ' + (kind || ''); };

const isPast = () => val('date') < today();
const friendly = d => new Date(d + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

async function load() {
  document.querySelector('header').classList.toggle('past', isPast());
  document.getElementById('datebtn').textContent = new Date(val('date') + 'T12:00')
    .toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  document.getElementById('today').hidden = !isPast();
  msg('');
  document.getElementById('submit').disabled = true;
  document.getElementById('summary').textContent = 'Loading...';
  try {
    const data = await api(`Class/${encodeURIComponent(val('cls'))}/Attendance?date=${encodeURIComponent(val('date'))}`);
    roster = (data?.Students || []).sort((a, b) => a.LastName.localeCompare(b.LastName) || a.FirstName.localeCompare(b.FirstName));
    existing = {};
    for (const [id, r] of Object.entries(data?.AttendanceResults || {})) if (r.Here) existing[id] = r;
    reset();
  } catch (e) {
    document.getElementById('summary').textContent = '';
    msg('Could not load the class: ' + e.message, 'err');
  }
}

const savedStatus = r => Number(r.Present) === 1 && !Number(r.Absent) ? 'P' : Number(r.Absent) === 1 && !Number(r.Present) ? 'A' : 'other';

function reset() {
  state = {};
  for (const s of roster) state[s.ID] = existing[s.ID] ? savedStatus(existing[s.ID]) : dflt();
  draw();
}

function label(s) {
  if (state[s.ID] === 'A') return 'Absent';
  if (state[s.ID] === 'other') return 'Partial day (set by office)';
  return 'Present';
}

function draw() {
  const list = document.getElementById('list'), unsaved = changes();
  list.innerHTML = roster.map(s => {
    const st = state[s.ID];
    const cls = [st === 'A' ? 'absent' : st === 'other' ? 'other' : '', unsaved[s.ID] ? 'unsaved' : ''].join(' ');
    return `<li><button data-id="${esc(s.ID)}" class="${cls}">
      <span>${esc(s.LastName)}, ${esc(s.NickName || s.FirstName)}</span><span class="state">${label(s)}${unsaved[s.ID] ? ' · not saved' : ''}</span></button></li>`;
  }).join('');
  list.querySelectorAll('button').forEach(b => b.onclick = () => {
    const id = b.dataset.id;
    state[id] = state[id] === 'A' ? 'P' : 'A';
    draw();
  });
  const absent = roster.filter(s => state[s.ID] === 'A').length;
  const taken = Object.keys(existing).length;
  const pending = Object.keys(unsaved).length, btn = document.getElementById('submit');
  document.getElementById('summary').innerHTML = `${roster.length - absent} present, ${absent} absent`
    + (pending ? ` · <span class="unsaved-count">${pending} not saved</span>` : taken ? ' · saved' : '')
    + (pending && taken ? ' · <button class="link" id="reset">Undo</button>' : '');
  document.getElementById('reset')?.addEventListener('click', reset);
  btn.disabled = !pending;
  btn.textContent = pending ? 'Submit attendance' : taken ? 'Submitted ✓' : 'Submit attendance';
  if (pending) msg('');
}

// Only students with no record yet or whose status changed, so office corrections
// (partial days, tardies, notes) are never overwritten.
function changes() {
  const students = {};
  for (const s of roster) {
    const st = state[s.ID], r = existing[s.ID];
    if (st === 'other') continue;
    const was = r ? savedStatus(r) : null;
    if (was === st) continue;
    students[s.ID] = st === 'A' ? { Present: 0, Absent: 1 } : { Present: 1, Absent: 0 };
  }
  return students;
}

window.onbeforeunload = e => { if (Object.keys(changes()).length) e.preventDefault(); };

async function submit() {
  const students = changes();
  if (!Object.keys(students).length) return;
  if (isPast() && !confirm(`You are submitting attendance for ${friendly(val('date'))}, not today. Submit anyway?`)) return;
  const btn = document.getElementById('submit');
  btn.disabled = true;
  msg('Submitting...');
  try {
    const res = await api(`Class/${encodeURIComponent(val('cls'))}/Attendance`, { Date: val('date'), Students: students });
    if (!res || Number(res.Success) !== 1) {
      report('SubmitRejected', 'POST Class/:id/Attendance returned ' + JSON.stringify({ Success: res?.Success, Created: res?.Created, Updated: res?.Updated }));
      throw new Error(JSON.stringify(res));
    }
    await load();
    msg(`Saved: ${res.Created || 0} new, ${res.Updated || 0} updated.`, 'ok');
  } catch (e) {
    btn.disabled = false;
    msg('Not saved: ' + e.message, 'err');
  }
}

start();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
navigator.storage?.persist?.().catch(() => {});
