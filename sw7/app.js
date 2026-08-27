/* SW7 — a round-first micro-app deck for a watch browser.
 *
 * Three things make this feel like a watch app instead of a web page:
 *   1. the outer 40% of the glass behaves like a rotating bezel
 *   2. the first tap grabs fullscreen + a screen wake lock
 *   3. the system back gesture pops to the dial instead of leaving the site
 */
(() => {
'use strict';

/* Stamped by ./bump.sh on every publish — do not hand-edit these two lines. */
const VERSION = '0.6.0';
const BUILD   = '2026-08-27 18:30 IST';

const $ = (s, r = document) => r.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const pad = n => String(n).padStart(2, '0');

/* ── storage ───────────────────────────────────────────────────────────── */

const store = {
  get(k, d) { try { const v = localStorage.getItem('sw7.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('sw7.' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ── haptics ───────────────────────────────────────────────────────────── */

function haptic(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

/* ── geometry shared by every dial-shaped view ─────────────────────────── */

const RAD = Math.PI / 180, DEG = 180 / Math.PI;
/* 0° points right and angles run clockwise, matching SVG. Callers subtract 90
   when they want twelve o'clock to be zero. */
const pol = (a, r) => [100 + r * Math.cos(a * RAD), 100 + r * Math.sin(a * RAD)];
function arcDeg(a0, a1, r) {
  const [x0, y0] = pol(a0, r), [x1, y1] = pol(a1, r);
  const large = (((a1 - a0) % 360) + 360) % 360 > 180 ? 1 : 0;
  return 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) +
         'A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2);
}

/* ── audio ─────────────────────────────────────────────────────────────── */

let ctx = null;
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function tone(freq, dur, type, vol, delay) {
  const c = ac();
  if (!c) return;
  try {
    const t = c.currentTime + (delay || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol == null ? 0.18 : vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.08));
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + (dur || 0.08) + 0.03);
  } catch (e) {}
}

/* ── screen wake lock ──────────────────────────────────────────────────── */

const wakeDot = $('#wakeDot');
let wakeLock = null;

async function keepAwake() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; paintWake(); });
    }
  } catch (e) {}
  paintWake();
}
function paintWake() { wakeDot.classList.toggle('lit', !!wakeLock); }
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') keepAwake();
});

/* ── fullscreen (one shot, on the first real tap) ──────────────────────── */

let fsTried = false;
function goFullscreen() {
  if (fsTried) return;
  fsTried = true;
  const el = document.documentElement;
  const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
  if (!fn) return;
  try { const p = fn.call(el, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
}

/* ── toast ─────────────────────────────────────────────────────────────── */

const toastEl = $('#toast');
let toastT = 0;
function toast(msg, ms) {
  toastEl.textContent = msg;
  toastEl.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('on'), ms || 1300);
}

/* ── the shared progress ring ──────────────────────────────────────────── */

const CIRC = 584.34;
const hudEl = $('.hud'), hudArc = $('.hud-arc');
const HUD = {
  set(p, color, snap, dim) {
    hudEl.classList.add('on');
    hudEl.classList.toggle('snap', !!snap);
    hudEl.classList.toggle('dim', !!dim);
    if (color) hudArc.style.stroke = color;
    hudArc.style.strokeDashoffset = CIRC * (1 - clamp(p, 0, 1));
  },
  off() { hudEl.classList.remove('on'); }
};

/* ── layout: --u is 1% of the watch diameter ───────────────────────────── */

function layout() {
  const m = Math.min(innerWidth, innerHeight);
  const coarse = matchMedia('(any-pointer: coarse)').matches;
  const preview = !coarse || m > 700;
  document.body.classList.toggle('preview', preview);
  const d = preview ? Math.min(m * 0.72, 420) : m;
  document.documentElement.style.setProperty('--u', (d / 100) + 'px');
}
addEventListener('resize', layout);
layout();

/* ── icons ─────────────────────────────────────────────────────────────── */

const ico = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
                 'stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';

const ICONS = {
  clock: ico('<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.6 2.1"/>'),
  timer: ico('<path d="M7 2.6h10M7 21.4h10"/><path d="M8.4 2.6v3.1c0 2.4 3.6 3.9 3.6 6.3s-3.6 3.9-3.6 6.3v3.1"/>' +
             '<path d="M15.6 2.6v3.1c0 2.4-3.6 3.9-3.6 6.3s3.6 3.9 3.6 6.3v3.1"/>'),
  stop:  ico('<circle cx="12" cy="13.6" r="7.8"/><path d="M9.6 2.4h4.8M12 9.8v3.8"/><path d="M18.6 6.2l1.4-1.4"/>'),
  tally: ico('<path d="M5 5.4v13.2M9.3 5.4v13.2M13.6 5.4v13.2M17.9 5.4v13.2"/><path d="M3.4 17.6 20.6 6.4"/>'),
  breathe: ico('<circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="12" r="5.9" opacity=".72"/>' +
               '<circle cx="12" cy="12" r="9.2" opacity=".42"/>'),
  metro: ico('<path d="M9.6 3h4.8l4.2 18H5.4z"/><path d="M7.6 14.4 17 7"/>'),
  dice:  ico('<rect x="3.4" y="3.4" width="17.2" height="17.2" rx="4.4"/>' +
             '<circle cx="8.6" cy="8.6" r="1.25" fill="currentColor" stroke="none"/>' +
             '<circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/>' +
             '<circle cx="15.4" cy="15.4" r="1.25" fill="currentColor" stroke="none"/>'),
  reps: ico('<path d="M20.4 12a8.4 8.4 0 1 1-2.5-5.9"/><path d="M20.4 2.9v3.6h-3.6"/>' +
             '<circle cx="12" cy="12" r="2.5"/>'),
  sun: ico('<circle cx="12" cy="12" r="4.2"/><path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2' +
           'M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6"/>'),
  moon: ico('<path d="M15.9 3.1A9.1 9.1 0 1 0 20.9 14.3 7.3 7.3 0 0 1 15.9 3.1z"/>'),
  echo: ico('<circle cx="12" cy="5.2" r="2.3"/><circle cx="18.8" cy="12" r="2.3"/>' +
            '<circle cx="12" cy="18.8" r="2.3"/><circle cx="5.2" cy="12" r="2.3"/>'),
  compass: ico('<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.2 5-5 2.2 2.2-5z"/>'),
  level: ico('<rect x="2.4" y="8.4" width="19.2" height="7.2" rx="3.6"/>' +
             '<circle cx="12" cy="12" r="2.1"/><path d="M9.2 8.4v7.2M14.8 8.4v7.2"/>'),
  react: ico('<path d="M13.4 2.4 5.6 13.4h5.2l-.6 8.2 7.8-11h-5.2z"/>'),
  torch: ico('<path d="M8.4 2.6h7.2l-.9 4.4H9.3z"/><path d="M9.3 7h5.4v13a1.4 1.4 0 0 1-1.4 1.4h-2.6A1.4 1.4 0 0 1 9.3 20z"/>' +
             '<path d="M12 10.8v2.6"/>')
};

/* ═══════════════════════════════════════════════════════════════════════
   APPS
   Each entry: { key, name, color, icon, view, enter, exit, tap, long, rotate, frame }
   ═══════════════════════════════════════════════════════════════════════ */

const APPS = [];
const reg = a => { a.view = $('#v-' + a.key); APPS.push(a); return a; };

/* ── clock ─────────────────────────────────────────────────────────────── */

const ckTime = $('#ckTime'), ckDate = $('#ckDate'), ckMeta = $('#ckMeta');
const vClock = $('#v-clock'), ckTicks = $('#ckTicks'), ckFDate = $('#ckFDate');
const ckHr = $('#ckHr'), ckMn = $('#ckMn'), ckSc = $('#ckSc');
const ckW1 = $('#ckW1'), ckW2 = $('#ckW2');

let batteryTxt = '';
if (navigator.getBattery) {
  navigator.getBattery().then(b => {
    const p = () => { batteryTxt = Math.round(b.level * 100) + '%' + (b.charging ? ' charging' : ''); };
    p(); b.addEventListener('levelchange', p); b.addEventListener('chargingchange', p);
  }).catch(() => {});
}

(function buildFace() {
  let out = '';
  for (let i = 0; i < 60; i++) {
    const maj = i % 5 === 0;
    const [x1, y1] = pol(i * 6 - 90, maj ? 81 : 87);
    const [x2, y2] = pol(i * 6 - 90, 92);
    out += '<line class="tick' + (maj ? ' maj' : '') + '" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) +
           '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
  }
  ckTicks.innerHTML = out;
})();

const WMIN = ['', 'five past', 'ten past', 'quarter past', 'twenty past', 'twenty-five past',
              'half past', 'twenty-five to', 'twenty to', 'quarter to', 'ten to', 'five to'];
const WHR = ['twelve', 'one', 'two', 'three', 'four', 'five',
             'six', 'seven', 'eight', 'nine', 'ten', 'eleven'];
const FACES = ['digital', 'analog', 'words'];

reg({
  key: 'clock', name: 'Clock', color: '#F7B8D2', icon: ICONS.clock,
  h24: store.get('h24', true), face: store.get('face', 0), last: '',
  enter() { this.apply(); },
  apply() {
    vClock.setAttribute('data-face', this.face);
    if (this.face === 1) HUD.off();
    this.last = '';
  },
  tap() {
    this.h24 = !this.h24;
    store.set('h24', this.h24);
    haptic(12);
    this.last = '';
    toast(this.h24 ? '24-hour' : '12-hour');
  },
  rotate(d) {
    this.face = (this.face + d + FACES.length) % FACES.length;
    store.set('face', this.face);
    haptic(10);
    this.apply();
    toast(FACES[this.face]);
  },
  frame() {
    const d = new Date();
    const secs = d.getSeconds() + d.getMilliseconds() / 1000;

    if (this.face === 1) {
      /* sub-second on the second hand, so it sweeps instead of stepping */
      const mins = d.getMinutes() + secs / 60;
      const hrs = (d.getHours() % 12) + mins / 60;
      ckSc.setAttribute('transform', 'rotate(' + (secs * 6).toFixed(2) + ' 100 100)');
      ckMn.setAttribute('transform', 'rotate(' + (mins * 6).toFixed(2) + ' 100 100)');
      ckHr.setAttribute('transform', 'rotate(' + (hrs * 30).toFixed(2) + ' 100 100)');
    } else if (this.face === 0) {
      HUD.set(secs / 60, this.color);
    }

    const key = d.getHours() + ':' + d.getMinutes();
    if (key === this.last) return;
    this.last = key;

    let h = d.getHours(), suf = '';
    if (!this.h24) { suf = h < 12 ? ' am' : ' pm'; h = h % 12 || 12; }
    ckTime.innerHTML = (this.h24 ? pad(h) : h) + ':' + pad(d.getMinutes()) +
                       (suf ? '<span class="cs">' + suf + '</span>' : '');
    ckDate.textContent = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    ckMeta.textContent = batteryTxt;
    ckFDate.textContent = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }).toUpperCase();

    const step = Math.round(d.getMinutes() / 5);
    const wi = step % 12;
    ckW1.textContent = WMIN[wi] || ' ';
    ckW2.textContent = WHR[(d.getHours() + (step >= 7 ? 1 : 0)) % 12] + (wi === 0 ? " o'clock" : '');
  }
});

/* ── timer ─────────────────────────────────────────────────────────────── */

const tmTime = $('#tmTime'), tmState = $('#tmState');
const mmss = s => { s = Math.max(0, Math.ceil(s)); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
const stepFor = v => v < 120 ? 10 : v < 600 ? 30 : 60;

reg({
  key: 'timer', name: 'Timer', color: '#F06FA3', icon: ICONS.timer,
  target: store.get('timer', 300), left: 0, endAt: 0, running: false, done: false,
  enter() { if (!this.running && !this.done && this.left <= 0) this.left = this.target; this.paint(); },
  exit() { /* keeps running in the background on purpose */ },
  tap() {
    if (this.done) { this.done = false; this.left = this.target; haptic(14); this.paint(); return; }
    if (this.running) {
      this.left = (this.endAt - Date.now()) / 1000;
      this.running = false;
      this.disarm();
      haptic(14);
    } else {
      if (this.left <= 0) this.left = this.target;
      this.endAt = Date.now() + this.left * 1000;
      this.running = true;
      this.arm();
      haptic([0, 10, 60, 10]);
      tone(880, 0.06, 'sine', 0.14);
    }
    this.paint();
  },
  /* frame() only ticks for whichever app is on screen, so the countdown needs
     its own timeout to survive a trip back to the dial. */
  arm() {
    this.disarm();
    this.al = setTimeout(() => this.fire(), Math.max(0, this.endAt - Date.now()));
  },
  disarm() { clearTimeout(this.al); this.al = 0; },
  fire() {
    if (this.done) return;
    this.running = false; this.left = 0; this.done = true;
    this.disarm();
    this.alarm();
    if (cur !== this) toast('timer done', 3000);
    else this.paint();
  },
  long() {
    this.running = false; this.done = false;
    this.disarm();
    this.left = this.target;
    haptic(38); toast('reset'); this.paint();
  },
  rotate(d, m) {
    const k = m || 1;
    if (this.running) {
      const rem = (this.endAt - Date.now()) / 1000;
      this.endAt += d * stepFor(rem) * 1000 * k;
      if (this.endAt < Date.now()) this.endAt = Date.now();
      this.arm();
    } else {
      this.done = false;
      this.target = clamp(this.target + d * stepFor(this.target) * k, 10, 5400);
      this.left = this.target;
      this.disarm();
      store.set('timer', this.target);
    }
    this.paint();
  },
  alarm() {
    haptic([0, 320, 140, 320, 140, 560]);
    for (let i = 0; i < 3; i++) { tone(1046, 0.14, 'sine', 0.22, i * 0.34); tone(784, 0.14, 'sine', 0.18, i * 0.34 + 0.16); }
  },
  paint() {
    const v = this.running ? (this.endAt - Date.now()) / 1000 : this.left;
    tmTime.textContent = mmss(v);
    tmState.textContent = this.done ? 'done · tap to reset' :
      this.running ? 'running · tap to pause' :
      this.left < this.target ? 'paused · tap to resume' : 'turn the edge to set';
    HUD.set(this.done ? 1 : clamp(v / this.target, 0, 1), this.done ? '#FFC46B' : this.color, !this.running);
  },
  frame() {
    if (!this.running) return;
    if (this.endAt - Date.now() <= 0) { this.fire(); return; }
    this.paint();
  },
  live() { return this.running || this.done; },
  now() { return this.done ? 'done' : mmss(this.running ? (this.endAt - Date.now()) / 1000 : this.left); }
});

/* ── intervals ─────────────────────────────────────────────────────────── */

const rpPhase = $('#rpPhase'), rpTime = $('#rpTime'), rpSet = $('#rpSet'), rpHint = $('#rpHint');
const SETS = [
  { w: 20, r: 10, n: 8, tag: 'tabata' },
  { w: 30, r: 15, n: 8 },
  { w: 40, r: 20, n: 6 },
  { w: 45, r: 15, n: 12 },
  { w: 60, r: 30, n: 10 },
  { w: 60, r: 60, n: 5 }
];
const setName = s => s.w + ' / ' + s.r + ' \u00d7 ' + s.n + (s.tag ? '  ' + s.tag : '');

reg({
  key: 'reps', name: 'Intervals', color: '#FF5D73', icon: ICONS.reps,
  i: store.get('reps', 1), on: false, startAt: 0, cue: 0,
  enter() { this.paint(); },
  live() { return this.on; },
  now() { const p = this.phaseAt((Date.now() - this.startAt) / 1000);
          return p ? p.kind.toLowerCase() + ' ' + Math.ceil(p.left) : ''; },

  /* The whole run is derived from one timestamp, so leaving for the dial and
     coming back lands on the right second instead of resuming from a stall. */
  phaseAt(el) {
    const s = SETS[this.i], cyc = s.w + s.r;
    for (let k = 0; k < s.n; k++) {
      const t0 = k * cyc;
      if (el < t0 + s.w) return { kind: 'WORK', round: k + 1, left: t0 + s.w - el, dur: s.w };
      if (k === s.n - 1) break;
      if (el < t0 + cyc) return { kind: 'REST', round: k + 1, left: t0 + cyc - el, dur: s.r };
    }
    return null;
  },
  arm() {
    clearTimeout(this.cue);
    const p = this.phaseAt((Date.now() - this.startAt) / 1000);
    if (p) this.cue = setTimeout(() => this.boundary(), Math.max(0, p.left * 1000));
  },
  boundary() {
    const p = this.phaseAt((Date.now() - this.startAt) / 1000);
    if (!p) { this.finish(); return; }
    this.signal(p.kind);
    this.arm();
  },
  signal(kind) {
    if (kind === 'WORK') {
      haptic([0, 90, 60, 90]);
      tone(880, 0.10, 'square', 0.20); tone(1320, 0.12, 'square', 0.15, 0.10);
    } else {
      haptic(40);
      tone(587, 0.13, 'sine', 0.15);
    }
  },
  start() {
    this.on = true;
    this.startAt = Date.now();
    this.signal('WORK');
    this.arm();
    this.paint();
  },
  stop() { this.on = false; clearTimeout(this.cue); this.paint(); },
  finish() {
    this.on = false; clearTimeout(this.cue);
    haptic([0, 300, 120, 300, 120, 520]);
    for (let i = 0; i < 3; i++) tone(1046, 0.16, 'sine', 0.22, i * 0.28);
    if (cur !== this) toast('intervals done', 3000);
    this.paint();
  },
  tap() { this.on ? this.stop() : this.start(); haptic(14); },
  long() { this.stop(); haptic(38); toast('stopped'); },
  rotate(d) {
    if (this.on) return;
    this.i = (this.i + d + SETS.length) % SETS.length;
    store.set('reps', this.i);
    haptic(9);
    this.paint();
  },
  paint() {
    const s = SETS[this.i];
    if (!this.on) {
      rpPhase.textContent = '';
      rpTime.textContent = s.w;
      rpSet.textContent = setName(s);
      rpHint.textContent = 'turn to pick \u00b7 tap to start';
      HUD.off();
      return;
    }
    const p = this.phaseAt((Date.now() - this.startAt) / 1000);
    if (!p) return;
    const c = p.kind === 'WORK' ? '#FF5D73' : '#5FD3C4';
    document.documentElement.style.setProperty('--accent', c);
    rpPhase.textContent = p.kind;
    rpTime.textContent = Math.ceil(p.left);
    rpSet.textContent = 'round ' + p.round + ' of ' + s.n;
    rpHint.textContent = 'tap to stop';
    HUD.set(p.left / p.dur, c);
  },
  frame() { if (this.on) this.paint(); }
});

/* ── stopwatch ─────────────────────────────────────────────────────────── */

const swTime = $('#swTime'), swLaps = $('#swLaps'), swHint = $('#swHint');
function hms(ms) {
  const t = Math.max(0, ms), cs = Math.floor(t % 1000 / 10);
  const s = Math.floor(t / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
  const head = h ? h + ':' + pad(m % 60) : String(m);
  return { head: head + ':' + pad(s % 60), cs: pad(cs) };
}

reg({
  key: 'stop', name: 'Stopwatch', color: '#7FB3FF', icon: ICONS.stop,
  running: false, acc: 0, t0: 0, laps: [],
  el() { return this.acc + (this.running ? Date.now() - this.t0 : 0); },
  enter() { this.paint(); },
  tap() {
    if (this.running) { this.acc = this.el(); this.running = false; haptic(14); }
    else { this.t0 = Date.now(); this.running = true; haptic([0, 10, 60, 10]); tone(880, 0.05, 'sine', 0.12); }
    this.paint();
  },
  long() {
    if (this.running) {
      const e = this.el();
      const prev = this.laps.length ? this.laps[0].at : 0;
      this.laps.unshift({ at: e, split: e - prev });
      haptic(30); tone(1200, 0.05, 'square', 0.12);
      toast('lap ' + this.laps.length);
    } else {
      this.acc = 0; this.laps = []; haptic(38); toast('reset');
    }
    this.paint();
  },
  rotate() {},
  paint() {
    const e = this.el(), f = hms(e);
    swTime.innerHTML = f.head + '<span class="cs">.' + f.cs + '</span>';
    HUD.set(e % 60000 / 60000, this.color);
    swLaps.innerHTML = this.laps.slice(0, 3).map((l, i) => {
      const s = hms(l.split);
      return '<span>' + (this.laps.length - i) + '   ' + s.head + '.' + s.cs + '</span>';
    }).join('');
    swHint.textContent = this.running ? 'hold for a lap' : this.acc ? 'hold to reset' : 'tap to start';
  },
  frame() { if (this.running) this.paint(); },
  live() { return this.running; },
  now() { return hms(this.el()).head; }
});

/* ── tally ─────────────────────────────────────────────────────────────── */

const tlNum = $('#tlNum'), tlHint = $('#tlHint');

reg({
  key: 'tally', name: 'Tally', color: '#FFC46B', icon: ICONS.tally,
  n: store.get('tally', 0),
  enter() { this.paint(); },
  bump(d) {
    this.n = clamp(this.n + d, 0, 99999);
    store.set('tally', this.n);
    this.paint();
  },
  tap() {
    this.bump(1);
    haptic(16);
    tone(660 + Math.min(this.n, 24) * 12, 0.04, 'sine', 0.10);
    tlNum.animate(
      [{ transform: 'scale(1.10)' }, { transform: 'scale(1)' }],
      { duration: 170, easing: 'cubic-bezier(.2,.8,.25,1)' }
    );
  },
  long() { this.n = 0; store.set('tally', 0); haptic(38); toast('reset'); this.paint(); },
  rotate(d, m) { this.bump(d * (m || 1)); haptic(8); },
  paint() {
    tlNum.textContent = this.n;
    tlHint.textContent = this.n ? 'turn the edge to correct · hold to reset' : 'tap anywhere to count';
    HUD.set(this.n % 100 / 100, this.color, true);
  }
});

/* ── breathe ───────────────────────────────────────────────────────────── */

const brOrb = $('#brOrb'), brPhase = $('#brPhase'), brCount = $('#brCount'), brHint = $('#brHint');
const PATTERNS = [
  { n: 'Box',   p: [['Inhale', 4], ['Hold', 4], ['Exhale', 4], ['Hold', 4]] },
  { n: '4-7-8', p: [['Inhale', 4], ['Hold', 7], ['Exhale', 8]] },
  { n: 'Calm',  p: [['Inhale', 5], ['Exhale', 5]] },
  { n: 'Deep',  p: [['Inhale', 6], ['Hold', 2], ['Exhale', 7]] }
];

reg({
  key: 'breathe', name: 'Breathe', color: '#5FD3C4', icon: ICONS.breathe,
  i: store.get('breathe', 0), on: false, ph: 0, phT: 0, cycles: 0,
  enter() { this.stop(); },
  exit() { this.stop(); },
  stop() {
    this.on = false; this.cycles = 0;
    brOrb.style.transitionDuration = '.45s';
    brOrb.style.transitionTimingFunction = 'cubic-bezier(.2,.8,.25,1)';
    brOrb.style.transform = 'scale(.46)';
    const pt = PATTERNS[this.i];
    brPhase.textContent = pt.n;
    brCount.textContent = '';
    brHint.textContent = pt.p.map(x => x[1]).join('·') + ' · tap to begin';
    HUD.off();
  },
  start() {
    this.on = true; this.ph = -1; this.cycles = 0;
    this.next();
  },
  next() {
    const pt = PATTERNS[this.i].p;
    this.ph = (this.ph + 1) % pt.length;
    if (this.ph === 0) this.cycles++;
    this.phT = performance.now();
    const [name, dur] = pt[this.ph];
    brPhase.textContent = name;
    brOrb.style.transitionTimingFunction = 'cubic-bezier(.37,0,.63,1)';
    if (name === 'Inhale') { brOrb.style.transitionDuration = dur + 's'; brOrb.style.transform = 'scale(1)'; haptic([0, 18, 70, 18]); }
    else if (name === 'Exhale') { brOrb.style.transitionDuration = dur + 's'; brOrb.style.transform = 'scale(.46)'; haptic(26); }
    else { haptic(9); }
    tone(name === 'Inhale' ? 523 : name === 'Exhale' ? 392 : 466, 0.09, 'sine', 0.09);
  },
  tap() { this.on ? this.stop() : this.start(); haptic(14); },
  long() { this.stop(); haptic(38); },
  rotate(d) {
    if (this.on) return;
    this.i = (this.i + d + PATTERNS.length) % PATTERNS.length;
    store.set('breathe', this.i);
    haptic(10);
    this.stop();
  },
  frame(now) {
    if (!this.on) return;
    const pt = PATTERNS[this.i].p;
    const dur = pt[this.ph][1] * 1000;
    const el = now - this.phT;
    if (el >= dur) { this.next(); return; }
    brCount.textContent = Math.ceil((dur - el) / 1000);
    brHint.textContent = 'cycle ' + this.cycles + ' · tap to stop';
    const total = pt.reduce((a, x) => a + x[1], 0) * 1000;
    const before = pt.slice(0, this.ph).reduce((a, x) => a + x[1], 0) * 1000;
    HUD.set((before + el) / total, this.color);
  }
});

/* ── sun ───────────────────────────────────────────────────────────────── */

/* Sunrise equation, NOAA form — pure arithmetic, so it works with the watch
   offline. Good to a couple of minutes, which is all a wrist needs. */
const J2000 = 2451545.0;
const toJD = d => d.getTime() / 86400000 + 2440587.5;
const fromJD = j => new Date((j - 2440587.5) * 86400000);

function solar(date, lat, lng) {
  const n = Math.round(toJD(date) - J2000 - 0.0009 + lng / 360);
  const Js = J2000 + 0.0009 - lng / 360 + n;
  const M = (357.5291 + 0.98560028 * (Js - J2000)) % 360;
  const C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
  const lam = (M + C + 180 + 102.9372) % 360;
  const Jt = Js + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * lam * RAD);
  const dec = Math.asin(Math.sin(lam * RAD) * Math.sin(23.4397 * RAD));
  const at = h => {
    const c = (Math.sin(h * RAD) - Math.sin(lat * RAD) * Math.sin(dec)) /
              (Math.cos(lat * RAD) * Math.cos(dec));
    if (c > 1 || c < -1) return null;                    // polar night / midnight sun
    const w = Math.acos(c) * DEG / 360;
    return { rise: fromJD(Jt - w), set: fromJD(Jt + w) };
  };
  return { noon: fromJD(Jt), day: at(-0.833), gold: at(6) };
}

const snLabel = $('#snLabel'), snTime = $('#snTime'), snIn = $('#snIn');
const sdDay = $('#sdDay'), sdGoldA = $('#sdGoldA'), sdGoldB = $('#sdGoldB'), sdNow = $('#sdNow');
const SR = 80;
const hourOf = d => d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
const hAng = h => (h / 24) * 360 + 90;                    // midnight at the bottom
const arcPath = (h0, h1, r) => arcDeg(hAng(h0), hAng(h1), r);
const clock = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
function until(d) {
  let m = Math.round((d - Date.now()) / 60000);
  const past = m < 0;
  m = Math.abs(m);
  const h = Math.floor(m / 60);
  const span = (h ? h + 'h ' : '') + (m % 60) + 'm';
  return past ? span + ' ago' : 'in ' + span;
}

const READS = ['next', 'sunrise', 'sunset', 'golden hour', 'daylight'];

reg({
  key: 'sun', name: 'Sun', color: '#FF9E2C', icon: ICONS.sun,
  pos: store.get('geo', null), sol: null, day: '', i: 0, asking: false,
  enter() { HUD.off(); this.pos ? this.compute() : this.locate(); this.paint(); },
  locate() {
    if (this.asking || !navigator.geolocation) { this.paint(); return; }
    this.asking = true;
    snLabel.textContent = 'locating';
    navigator.geolocation.getCurrentPosition(
      p => {
        this.asking = false;
        this.pos = { lat: +p.coords.latitude.toFixed(3), lng: +p.coords.longitude.toFixed(3) };
        store.set('geo', this.pos);
        haptic(16);
        this.compute(); this.paint();
      },
      () => { this.asking = false; this.paint(); },
      { timeout: 15000, maximumAge: 6 * 3600 * 1000 }
    );
  },
  compute() {
    const now = new Date();
    this.day = now.toDateString();
    this.sol = solar(now, this.pos.lat, this.pos.lng);
    this.arcs();
  },
  arcs() {
    const s = this.sol;
    if (!s || !s.day) { sdDay.setAttribute('d', ''); sdGoldA.setAttribute('d', ''); sdGoldB.setAttribute('d', ''); return; }
    const r = hourOf(s.day.rise), st = hourOf(s.day.set);
    sdDay.setAttribute('d', arcPath(r, st, SR));
    if (s.gold) {
      sdGoldA.setAttribute('d', arcPath(r, hourOf(s.gold.rise), SR));
      sdGoldB.setAttribute('d', arcPath(hourOf(s.gold.set), st, SR));
    }
  },
  tap() { haptic(14); this.locate(); },
  long() { this.pos = null; this.sol = null; store.set('geo', null); haptic(38); toast('location cleared'); this.locate(); },
  rotate(d) { this.i = (this.i + d + READS.length) % READS.length; haptic(9); this.paint(); },
  paint() {
    const [x, y] = pol(hAng(hourOf(new Date())), SR);
    sdNow.setAttribute('cx', x.toFixed(2));
    sdNow.setAttribute('cy', y.toFixed(2));

    if (!this.pos) {
      snLabel.textContent = this.asking ? 'locating' : 'no location';
      snTime.textContent = '--:--';
      snIn.textContent = this.asking ? 'hold still' : 'tap to allow';
      return;
    }
    const s = this.sol;
    if (!s) { snLabel.textContent = 'no fix'; snTime.textContent = '--:--'; snIn.textContent = 'tap to retry'; return; }
    if (!s.day) {
      snLabel.textContent = 'polar';
      snTime.textContent = '--:--';
      snIn.textContent = hourOf(s.noon) ? 'no sunrise or sunset today' : '';
      return;
    }
    const k = READS[this.i];
    if (k === 'next') {
      const nxt = Date.now() < s.day.rise ? ['sunrise', s.day.rise]
                : Date.now() < s.day.set ? ['sunset', s.day.set]
                : ['sunrise tomorrow', s.day.rise];
      snLabel.textContent = nxt[0];
      snTime.textContent = clock(nxt[1]);
      snIn.textContent = Date.now() < s.day.set ? until(nxt[1]) : 'tomorrow';
    } else if (k === 'sunrise') {
      snLabel.textContent = 'sunrise'; snTime.textContent = clock(s.day.rise); snIn.textContent = until(s.day.rise);
    } else if (k === 'sunset') {
      snLabel.textContent = 'sunset'; snTime.textContent = clock(s.day.set); snIn.textContent = until(s.day.set);
    } else if (k === 'golden hour') {
      snLabel.textContent = 'golden hour';
      snTime.textContent = s.gold ? clock(s.gold.set) : '--:--';
      snIn.textContent = s.gold ? 'until ' + clock(s.day.set) : 'not today';
    } else {
      const mins = Math.round((s.day.set - s.day.rise) / 60000);
      snLabel.textContent = 'daylight';
      snTime.textContent = Math.floor(mins / 60) + 'h ' + pad(mins % 60) + 'm';
      snIn.textContent = 'noon ' + clock(s.noon);
    }
  },
  frame() {
    if (this.pos && this.sol && new Date().toDateString() !== this.day) this.compute();
    this.paint();
  }
});

/* ── moon ──────────────────────────────────────────────────────────────── */

/* Meeus, low precision (Astronomical Algorithms ch. 48). The mean-lunation
   shortcut is a day out either way near the quarters; this is not. */
const SYNODIC = 29.530588853;
const norm360 = x => ((x % 360) + 360) % 360;

function moonPhase(date) {
  const T = (toJD(date) - J2000) / 36525;
  const D  = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
  const M  = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
  const i = 180 - D
          - 6.289 * Math.sin(Mp * RAD)
          + 2.100 * Math.sin(M * RAD)
          - 1.274 * Math.sin((2 * D - Mp) * RAD)
          - 0.658 * Math.sin(2 * D * RAD)
          - 0.214 * Math.sin(2 * Mp * RAD)
          - 0.110 * Math.sin(D * RAD);
  return { k: (1 + Math.cos(i * RAD)) / 2, waxing: D < 180, elong: D };
}

function moonName(k, waxing) {
  if (k < 0.015) return 'New moon';
  if (k > 0.985) return 'Full moon';
  if (k < 0.47) return waxing ? 'Waxing crescent' : 'Waning crescent';
  if (k < 0.53) return waxing ? 'First quarter' : 'Last quarter';
  return waxing ? 'Waxing gibbous' : 'Waning gibbous';
}

/* The lit face is a semicircular limb closed by the terminator, which is a
   half-ellipse whose width collapses to zero at the quarters and bulges the
   other way once past half. */
function moonPath(k, waxing, cx, cy, R) {
  const rx = (R * Math.abs(1 - 2 * k)).toFixed(2);
  const limb = waxing ? 1 : 0;
  const term = ((k > 0.5) === waxing) ? 1 : 0;
  return 'M' + cx + ' ' + (cy - R) +
         'A' + R + ' ' + R + ' 0 0 ' + limb + ' ' + cx + ' ' + (cy + R) +
         'A' + rx + ' ' + R + ' 0 0 ' + term + ' ' + cx + ' ' + (cy - R) + 'Z';
}

const mnLit = $('#mnLit'), mnName = $('#mnName'), mnRead = $('#mnRead'), mnWhen = $('#mnWhen');
const MREADS = ['lit', 'age', 'next full', 'next new'];
const days = n => n < 1 ? Math.round(n * 24) + 'h' : n.toFixed(1) + ' days';

reg({
  key: 'moon', name: 'Moon', color: '#CFD6FF', icon: ICONS.moon,
  off: 0, i: 0,
  enter() { HUD.off(); this.off = 0; this.paint(); },
  tap() {
    if (this.off) { this.off = 0; haptic(14); toast('tonight'); }
    else { this.i = (this.i + 1) % MREADS.length; haptic(10); }
    this.paint();
  },
  long() { this.off = 0; this.i = 0; haptic(38); this.paint(); },
  /* turning the rim walks the calendar and the disc fills and empties with it */
  rotate(d, m) { this.off = clamp(this.off + d * (m || 1), -400, 400); haptic(7); this.paint(); },
  paint() {
    const when = new Date(Date.now() + this.off * 86400000);
    const ph = moonPhase(when);
    mnLit.setAttribute('d', moonPath(ph.k, ph.waxing, 100, 80, 42));
    mnName.textContent = moonName(ph.k, ph.waxing);

    const age = ph.elong / 360 * SYNODIC;
    const toFull = norm360(180 - ph.elong) / 360 * SYNODIC;
    const toNew = norm360(360 - ph.elong) / 360 * SYNODIC;
    const k = MREADS[this.i];
    mnRead.textContent =
      k === 'lit' ? Math.round(ph.k * 100) + '% lit' :
      k === 'age' ? 'day ' + age.toFixed(1) + ' of 29.5' :
      k === 'next full' ? 'full in ' + days(toFull) :
                          'new in ' + days(toNew);

    mnWhen.textContent = this.off === 0 ? 'tonight'
      : when.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  }
});

/* ── compass ───────────────────────────────────────────────────────────── */

const roseG = $('#roseG'), cpDeg = $('#cpDeg'), cpCard = $('#cpCard');
const CARD = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
              'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
(function buildRose() {
  let out = '';
  for (let a = 0; a < 360; a += 5) {
    const maj = a % 30 === 0;
    const [x1, y1] = pol(a - 90, maj ? 76 : 83);
    const [x2, y2] = pol(a - 90, 90);
    out += '<line class="' + (maj ? 'maj' : '') + '" x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) +
           '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
  }
  ['N', 'E', 'S', 'W'].forEach((c, i) => {
    const [x, y] = pol(i * 90 - 90, 63);
    out += '<text class="' + (c === 'N' ? 'north' : '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '">' + c + '</text>';
  });
  out += '<line class="bearing" id="cpBear" x1="100" y1="10" x2="100" y2="26" style="display:none"/>';
  roseG.innerHTML = out;
})();
const cpBear = $('#cpBear');

reg({
  key: 'compass', name: 'Compass', color: '#55E0A6', icon: ICONS.compass,
  h: null, sh: 0, bearing: store.get('bearing', null), t0: 0, handler: null,
  enter() {
    HUD.off();
    this.h = null; this.t0 = performance.now();
    /* deviceorientationabsolute is the Android path; webkitCompassHeading the
       iOS one. Plain deviceorientation without absolute is relative, so it is
       no use as a compass and gets ignored. */
    this.handler = e => {
      let hd = null;
      if (typeof e.webkitCompassHeading === 'number') hd = e.webkitCompassHeading;
      else if (e.absolute && typeof e.alpha === 'number') hd = (360 - e.alpha) % 360;
      if (hd == null || isNaN(hd)) return;
      if (this.h == null) this.sh = hd;
      this.h = hd;
    };
    addEventListener('deviceorientationabsolute', this.handler, true);
    addEventListener('deviceorientation', this.handler, true);
    this.miss = setTimeout(() => {
      if (this.h != null) return;
      cpDeg.textContent = '—';
      cpCard.textContent = 'no compass here';
    }, 2200);
    this.paintBearing();
  },
  exit() {
    clearTimeout(this.miss);
    if (!this.handler) return;
    removeEventListener('deviceorientationabsolute', this.handler, true);
    removeEventListener('deviceorientation', this.handler, true);
    this.handler = null;
  },
  paintBearing() {
    if (this.bearing == null) { cpBear.style.display = 'none'; return; }
    cpBear.style.display = '';
    cpBear.setAttribute('transform', 'rotate(' + this.bearing + ' 100 100)');
  },
  tap() {
    if (this.h == null) return;
    this.bearing = this.bearing == null ? Math.round(this.sh) : null;
    store.set('bearing', this.bearing);
    haptic(this.bearing == null ? 14 : [0, 12, 50, 24]);
    this.paintBearing();
  },
  long() { this.bearing = null; store.set('bearing', null); haptic(38); toast('bearing cleared'); this.paintBearing(); },
  rotate(d) {
    if (this.bearing == null) return;
    this.bearing = (this.bearing + d + 360) % 360;
    store.set('bearing', this.bearing);
    haptic(7);
    this.paintBearing();
  },
  frame() {
    if (this.h == null) return;
    clearTimeout(this.miss);
    let d = this.h - this.sh;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    this.sh = (this.sh + d * 0.2 + 360) % 360;
    roseG.setAttribute('transform', 'rotate(' + (-this.sh).toFixed(1) + ' 100 100)');
    const deg = Math.round(this.sh) % 360;
    cpDeg.textContent = String(deg).padStart(3, '0') + '°';
    let sub = CARD[Math.round(deg / 22.5) % 16];
    if (this.bearing != null) {
      let off = this.bearing - deg;
      while (off > 180) off -= 360;
      while (off < -180) off += 360;
      sub += Math.abs(off) < 2 ? '  ·  on bearing'
           : '  ·  ' + (off > 0 ? '› ' : '‹ ') + Math.abs(Math.round(off)) + '°';
    }
    cpCard.textContent = sub;
  }
});

/* ── level ─────────────────────────────────────────────────────────────── */

const vial = $('#vial'), vlBubG = $('#vlBubG'), vlNum = $('#vlNum'), lvMsg = $('#lvMsg'), vLevel = $('#v-level');
const RANGES = [5, 15, 45];
const TRAVEL = 40;                       // outer ring 62 minus the bubble's 22

reg({
  key: 'level', name: 'Level', color: '#7ED0F0', icon: ICONS.level,
  b: null, g: null, sb: 0, sg: 0, ri: store.get('lvr', 1),
  handler: null, miss: 0, flat: false,
  enter() {
    HUD.off();
    this.b = null; this.g = null; this.flat = false;
    vial.style.opacity = '';
    const z = store.get('lvzero', null);
    this.zb = z ? z[0] : 0;
    this.zg = z ? z[1] : 0;
    /* beta and gamma are relative tilt, so unlike the compass this needs no
       absolute orientation and works on far more browsers. */
    this.handler = e => {
      if (typeof e.beta !== 'number' || typeof e.gamma !== 'number') return;
      const first = this.b == null;
      this.b = e.beta; this.g = e.gamma;
      if (first) {
        this.sb = e.beta - this.zb; this.sg = e.gamma - this.zg;
        this.dead = false; vial.style.opacity = ''; lvMsg.textContent = '';
      }
    };
    addEventListener('deviceorientation', this.handler, true);
    this.dead = false;
    lvMsg.textContent = '';
    vlNum.textContent = '--';
    vlBubG.setAttribute('transform', 'translate(100,100)');
    this.miss = setTimeout(() => {
      if (this.b != null) return;
      this.dead = true;
      vial.style.opacity = '.25';
      lvMsg.textContent = 'no tilt sensor here';
    }, 2200);
  },
  exit() {
    clearTimeout(this.miss);
    if (this.handler) removeEventListener('deviceorientation', this.handler, true);
    this.handler = null;
    vLevel.classList.remove('flat');
  },
  tap() {
    if (this.b == null) return;
    this.zb = this.b; this.zg = this.g;
    store.set('lvzero', [this.zb, this.zg]);
    haptic([0, 12, 50, 24]);
    toast('zeroed here');
  },
  long() {
    this.zb = 0; this.zg = 0;
    store.set('lvzero', null);
    haptic(38); toast('zero cleared');
  },
  rotate(d) {
    this.ri = (this.ri + d + RANGES.length) % RANGES.length;
    store.set('lvr', this.ri);
    haptic(9);
    toast('\u00b1' + RANGES[this.ri] + '\u00b0');
  },
  frame() {
    if (this.b == null) return;
    clearTimeout(this.miss);
    const R = RANGES[this.ri];
    const b = this.b - this.zb, g = this.g - this.zg;
    this.sb += (b - this.sb) * 0.22;
    this.sg += (g - this.sg) * 0.22;
    /* the bubble rides to the high side, the way one in oil would */
    vlBubG.setAttribute('transform', 'translate(' +
      (100 + clamp(this.sg / R, -1, 1) * TRAVEL).toFixed(1) + ',' +
      (100 - clamp(this.sb / R, -1, 1) * TRAVEL).toFixed(1) + ')');
    const tilt = Math.hypot(this.sb, this.sg);
    vlNum.textContent = (tilt < 10 ? tilt.toFixed(1) : Math.round(tilt)) + '°';
    const flat = tilt < 0.4;
    if (flat !== this.flat) {
      this.flat = flat;
      vLevel.classList.toggle('flat', flat);
      if (flat) { haptic([0, 18, 60, 18]); tone(1046, 0.09, 'sine', 0.14); }
    }
  }
});

/* ── reaction ──────────────────────────────────────────────────────────── */

const rxOut = $('#rxOut'), rxHint = $('#rxHint'), rxBest = $('#rxBest');
const RXMODE = ['see it', 'feel it'];

reg({
  key: 'react', name: 'Reaction', color: '#E8F06F', icon: ICONS.react,
  state: 'idle', at: 0, to: 0, last: null,
  mode: store.get('rxmode', 0), best: store.get('rxbest', null),
  enter() { HUD.off(); this.idle(); },
  exit() { clearTimeout(this.to); document.body.classList.remove('flash'); this.state = 'idle'; },
  idle() {
    clearTimeout(this.to);
    document.body.classList.remove('flash');
    this.state = 'idle';
    this.paint();
  },
  arm() {
    this.state = 'wait';
    this.paint();
    this.to = setTimeout(() => this.fire(), 1300 + Math.random() * 3200);
  },
  fire() {
    this.state = 'go';
    this.at = performance.now();
    if (this.mode === 0) document.body.classList.add('flash');
    haptic(this.mode === 0 ? 30 : [0, 140]);
    tone(1320, 0.06, 'square', 0.16);
    this.to = setTimeout(() => { this.last = null; this.idle(); toast('too slow'); }, 3000);
    this.paint();
  },
  tap() {
    if (this.state === 'idle') { haptic(10); this.arm(); return; }
    if (this.state === 'wait') { clearTimeout(this.to); this.last = null; haptic(50); toast('too soon'); this.idle(); return; }
    const ms = Math.round(performance.now() - this.at);
    clearTimeout(this.to);
    this.last = ms;
    if (this.best == null || ms < this.best) { this.best = ms; store.set('rxbest', ms); toast('best yet'); tone(1568, 0.12, 'sine', 0.2); }
    haptic(18);
    this.idle();
  },
  long() { this.best = null; store.set('rxbest', null); this.last = null; haptic(38); toast('cleared'); this.idle(); },
  rotate(d) {
    if (this.state !== 'idle') return;
    this.mode = (this.mode + d + RXMODE.length) % RXMODE.length;
    store.set('rxmode', this.mode);
    haptic(9);
    this.paint();
  },
  paint() {
    if (this.state === 'wait') {
      rxOut.textContent = '…'; rxOut.classList.remove('small');
      rxHint.textContent = 'wait for it';
    } else if (this.state === 'go') {
      rxOut.textContent = 'now'; rxOut.classList.remove('small');
      rxHint.textContent = '';
    } else if (this.last != null) {
      rxOut.innerHTML = this.last + '<span class="cs">ms</span>';
      rxOut.classList.add('small');
      rxHint.textContent = RXMODE[this.mode] + ' · tap to go again';
    } else {
      rxOut.textContent = 'tap'; rxOut.classList.remove('small');
      rxHint.textContent = RXMODE[this.mode] + ' · tap to arm';
    }
    rxBest.textContent = this.best != null ? 'best ' + this.best + ' ms' : '';
  }
});

/* ── echo ──────────────────────────────────────────────────────────────── */

const QUADS = [$('#q0'), $('#q1'), $('#q2'), $('#q3')];
const QTONE = [523.25, 659.25, 783.99, 1046.50];
const ecOut = $('#ecOut'), ecHint = $('#ecHint'), ecBest = $('#ecBest');
const SPEEDS = [{ n: 'easy', on: 440, gap: 200 }, { n: 'brisk', on: 310, gap: 130 }, { n: 'sharp', on: 200, gap: 80 }];

/* Centred on the diagonals, not the axes: bottom-centre belongs to the home
   button, and a pad hiding behind it would be unhittable. */
QUADS.forEach((el, i) => el.setAttribute('d', arcDeg(i * 90 - 83, i * 90 - 7, 74)));

reg({
  key: 'echo', name: 'Echo', color: '#9BE8A8', icon: ICONS.echo,
  state: 'idle', seq: [], pos: 0, timers: [],
  sp: store.get('ecsp', 1), best: store.get('ecbest', null),
  enter() { HUD.off(); this.reset(); },
  exit() { this.reset(); },
  reset() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    QUADS.forEach(q => q.classList.remove('lit'));
    this.state = 'idle'; this.seq = []; this.pos = 0;
    HUD.off();
    this.paint();
  },
  lightUp(q) {
    QUADS[q].classList.add('lit');
    tone(QTONE[q], 0.24, 'sine', 0.16);
    haptic(16);
    this.timers.push(setTimeout(() => QUADS[q].classList.remove('lit'), SPEEDS[this.sp].on));
  },
  next() {
    this.seq.push(Math.floor(Math.random() * 4));
    this.state = 'show';
    this.pos = 0;
    HUD.off();
    this.paint();
    const sp = SPEEDS[this.sp];
    let t = 400;
    this.seq.forEach(q => {
      this.timers.push(setTimeout(() => this.lightUp(q), t));
      t += sp.on + sp.gap;
    });
    this.timers.push(setTimeout(() => { this.state = 'input'; this.pos = 0; this.paint(); }, t));
  },
  fail() {
    this.state = 'over';
    QUADS.forEach(q => q.classList.remove('lit'));
    haptic([0, 90, 70, 240]);
    tone(180, 0.34, 'sawtooth', 0.16);
    HUD.off();
    this.paint();
  },
  tap(pt) {
    if (this.state === 'idle' || this.state === 'over') {
      this.timers.forEach(clearTimeout); this.timers = [];
      this.seq = []; haptic(12); this.next(); return;
    }
    if (this.state !== 'input') return;
    if (pt.r < 0.2) return;                     // the middle is not a pad
    const a = (Math.atan2(pt.ny, pt.nx) * DEG + 450) % 360;   // 0 = up, clockwise
    const q = Math.floor(a / 90);                            // 0 NE, 1 SE, 2 SW, 3 NW
    this.lightUp(q);
    if (q !== this.seq[this.pos]) { this.fail(); return; }
    this.pos++;
    HUD.set(this.pos / this.seq.length, this.color);
    if (this.pos < this.seq.length) { this.paint(); return; }
    const round = this.seq.length;
    if (this.best == null || round > this.best) { this.best = round; store.set('ecbest', round); }
    this.state = 'show';
    this.paint();
    this.timers.push(setTimeout(() => this.next(), 640));
  },
  long() { this.best = null; store.set('ecbest', null); haptic(38); toast('cleared'); this.reset(); },
  rotate(d) {
    if (this.state !== 'idle' && this.state !== 'over') return;
    this.sp = (this.sp + d + SPEEDS.length) % SPEEDS.length;
    store.set('ecsp', this.sp);
    haptic(9);
    this.paint();
  },
  paint() {
    if (this.state === 'idle') {
      ecOut.textContent = 'go';
      ecHint.textContent = SPEEDS[this.sp].n + ' · tap to start';
    } else if (this.state === 'over') {
      ecOut.textContent = String(Math.max(0, this.seq.length - 1));
      ecHint.textContent = 'missed · tap to retry';
    } else {
      ecOut.textContent = String(this.seq.length);
      ecHint.textContent = this.state === 'show' ? 'watch' : 'repeat it';
    }
    ecBest.textContent = this.best != null ? 'best ' + this.best : '';
  }
});

/* ── dice ──────────────────────────────────────────────────────────────── */

const dcOut = $('#dcOut'), dcMode = $('#dcMode');
const rnd = n => 1 + Math.floor(Math.random() * n);
const DICE = [
  { n: 'd6',       roll: () => rnd(6) },
  { n: 'd20',      roll: () => rnd(20) },
  { n: 'd100',     roll: () => rnd(100) },
  { n: 'coin',     roll: () => Math.random() < .5 ? 'HEADS' : 'TAILS', word: true },
  { n: 'yes / no', roll: () => Math.random() < .5 ? 'YES' : 'NO', word: true }
];

reg({
  key: 'dice', name: 'Decide', color: '#C79BFF', icon: ICONS.dice,
  i: store.get('dice', 0), busy: false,
  enter() { HUD.off(); this.paint(DICE[this.i].roll()); },
  paint(v) {
    dcOut.textContent = v;
    dcOut.classList.toggle('word', !!DICE[this.i].word);
    dcMode.textContent = DICE[this.i].n;
  },
  tap() {
    if (this.busy) return;
    this.busy = true;
    const m = DICE[this.i];
    let k = 0;
    const step = () => {
      this.paint(m.roll());
      dcOut.classList.add('spin');
      setTimeout(() => dcOut.classList.remove('spin'), 55);
      haptic(4);
      if (++k < 11) setTimeout(step, 32 + k * k * 0.9);
      else {
        this.paint(m.roll());
        haptic([0, 12, 40, 26]);
        tone(659, 0.08, 'sine', 0.16);
        tone(988, 0.11, 'sine', 0.14, 0.07);
        this.busy = false;
      }
    };
    step();
  },
  long() { this.tap(); },
  rotate(d) {
    if (this.busy) return;
    this.i = (this.i + d + DICE.length) % DICE.length;
    store.set('dice', this.i);
    haptic(10);
    this.paint(DICE[this.i].roll());
  }
});

/* ── metronome ─────────────────────────────────────────────────────────── */

const mtBpm = $('#mtBpm'), mtBeat = $('#mtBeat'), mtHint = $('#mtHint'), mtPulse = $('#mtPulse');

reg({
  key: 'metro', name: 'Metronome', color: '#FF8A65', icon: ICONS.metro,
  bpm: store.get('bpm', 96), on: false, beat: 0, sched: 0, nextAt: 0, fallback: 0,
  enter() { HUD.off(); this.paint(); },
  exit() { this.stop(); },
  paint() {
    mtBpm.textContent = this.bpm;
    mtBeat.innerHTML = [0, 1, 2, 3].map(i =>
      i === this.beat && this.on ? '<b>●</b>' : '·').join(' ');
    mtHint.textContent = this.on ? 'bpm · tap to stop' : 'bpm · turn the edge';
  },
  flash(acc, i) {
    this.beat = i;
    mtPulse.classList.remove('hit', 'acc');
    void mtPulse.offsetWidth;
    mtPulse.classList.add('hit');
    if (acc) mtPulse.classList.add('acc');
    haptic(acc ? 22 : 9);
    this.paint();
  },
  tick() {
    const c = ac();
    if (!c) return;
    while (this.nextAt < c.currentTime + 0.14) {
      const acc = this.beat2 % 4 === 0;
      const lead = Math.max(0, this.nextAt - c.currentTime);
      tone(acc ? 1568 : 1046, 0.035, 'square', acc ? 0.20 : 0.11, lead);
      const i = this.beat2 % 4;
      setTimeout(() => { if (this.on) this.flash(acc, i); }, lead * 1000);
      this.nextAt += 60 / this.bpm;
      this.beat2++;
    }
  },
  start() {
    this.on = true; this.beat2 = 0; this.beat = 0;
    const c = ac();
    if (c) {
      this.nextAt = c.currentTime + 0.06;
      this.tick();
      this.sched = setInterval(() => this.tick(), 25);
    } else {
      let i = 0;
      this.fallback = setInterval(() => { this.flash(i % 4 === 0, i % 4); i++; }, 60000 / this.bpm);
    }
    this.paint();
  },
  stop() {
    this.on = false;
    clearInterval(this.sched); this.sched = 0;
    clearInterval(this.fallback); this.fallback = 0;
    this.paint();
  },
  live() { return this.on; },
  now() { return this.bpm + ' bpm'; },
  tap() { this.on ? this.stop() : this.start(); haptic(14); },
  long() { this.stop(); this.bpm = 96; store.set('bpm', 96); haptic(38); toast('96 bpm'); this.paint(); },
  rotate(d, m) {
    this.bpm = clamp(this.bpm + d * 2 * (m || 1), 30, 260);
    store.set('bpm', this.bpm);
    haptic(7);
    if (this.on) { this.stop(); this.start(); } else this.paint();
  }
});

/* ── torch ─────────────────────────────────────────────────────────────── */

const trLvl = $('#trLvl'), trHint = $('#trHint');
const LEVELS = [0.16, 0.34, 0.58, 0.80, 1];

reg({
  key: 'torch', name: 'Torch', color: '#FFE1A8', icon: ICONS.torch,
  i: store.get('torch', 4), on: false,
  enter() { HUD.off(); this.on = false; document.body.classList.remove('torch'); this.paint(); },
  exit() { this.on = false; document.body.classList.remove('torch'); },
  paint() {
    trLvl.textContent = Math.round(LEVELS[this.i] * 100);
    trHint.textContent = this.on ? 'tap to close' : 'tap for light · turn to dim';
    document.documentElement.style.setProperty('--lvl', LEVELS[this.i]);
  },
  tap() {
    this.on = !this.on;
    document.body.classList.toggle('torch', this.on);
    haptic(this.on ? 20 : 12);
    this.paint();
  },
  long() { if (this.on) this.tap(); },
  rotate(d) {
    this.i = clamp(this.i + d, 0, LEVELS.length - 1);
    store.set('torch', this.i);
    haptic(8);
    this.paint();
  }
});

/* ═══════════════════════════════════════════════════════════════════════
   HOME DIAL
   ═══════════════════════════════════════════════════════════════════════ */

const dialRing = $('#dialRing'), dialIco = $('#dialIco'), dialName = $('#dialName'),
      dialHint = $('#dialHint'), dialClock = $('#dialClock'), vHome = $('#v-home');

const SLOT_DEG = 360 / APPS.length;
const SLOT_R = 33;               // % of the diameter, from the centre
/* Half the gap between neighbouring icons: with twelve on the dial a generous
   radius would open whichever app happens to sit next to the one you hit. */
const TAP_R = Math.min(0.28, (SLOT_R / 50) * Math.sin(Math.PI / APPS.length) * 0.96);
const slotPos = APPS.map((_, i) => {
  const a = (i * SLOT_DEG - 90) * Math.PI / 180;
  return { x: SLOT_R * Math.cos(a) / 50, y: SLOT_R * Math.sin(a) / 50 };  // normalised -1..1
});

dialRing.innerHTML = APPS.map((a, i) => {
  const p = slotPos[i];
  return '<div class="slot" data-i="' + i + '" style="left:' + (50 + p.x * 50) + '%;top:' + (50 + p.y * 50) + '%">' +
         '<div class="sico" style="--c:' + a.color + '">' + a.icon + '</div></div>';
}).join('');
const slotEls = [].slice.call(dialRing.children);

let rotIdx = store.get('sel', 0);          // unbounded: keeps the spin going the short way
let selIdx = ((rotIdx % APPS.length) + APPS.length) % APPS.length;

function paintDial() {
  selIdx = ((rotIdx % APPS.length) + APPS.length) % APPS.length;
  dialRing.style.setProperty('--rot', (-rotIdx * SLOT_DEG) + 'deg');
  slotEls.forEach((el, i) => el.classList.toggle('sel', i === selIdx));
  paintLive();
  const a = APPS[selIdx];
  dialIco.innerHTML = a.icon;
  dialIco.style.color = a.color;
  dialName.textContent = a.name;
  paintHint();
  HUD.set((selIdx + 1) / APPS.length, a.color, true, true);
  store.set('sel', rotIdx);
}

/* If the selected app is doing something, the dial says what — no point making
   someone open a timer just to see how long is left. */
function paintHint() {
  const a = APPS[selIdx];
  const live = a.live && a.live() && a.now ? a.now() : '';
  dialHint.textContent = live || 'tap to open';
  dialHint.style.color = live ? a.color : '';
}

function paintLive() {
  for (let i = 0; i < APPS.length; i++) {
    slotEls[i].classList.toggle('live', !!(APPS[i].live && APPS[i].live()));
  }
}

const HOME = {
  key: 'home', name: 'SW7', view: vHome,
  enter() { paintDial(); },
  tap(pt) {
    // forgiving: tapping straight at an icon opens that icon
    let best = -1, bd = 1e9;
    const rot = -rotIdx * SLOT_DEG * Math.PI / 180;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    slotPos.forEach((p, i) => {
      const x = p.x * cs - p.y * sn, y = p.x * sn + p.y * cs;
      const d = Math.hypot(x - pt.nx, y - pt.ny);
      if (d < bd) { bd = d; best = i; }
    });
    if (bd < TAP_R && best !== selIdx) {
      rotIdx += ((best - selIdx + APPS.length + APPS.length / 2) % APPS.length) - APPS.length / 2;
      paintDial();
      haptic(10);
      return;
    }
    open(APPS[selIdx].key);
  },
  long() { haptic(30); showCard(); },
  rotate(d) { rotIdx += d; paintDial(); },
  frame() {
    const n = new Date();
    dialClock.textContent = pad(n.getHours()) + ':' + pad(n.getMinutes());
    paintLive();
    paintHint();
  }
};

/* ═══════════════════════════════════════════════════════════════════════
   ROUTER
   ═══════════════════════════════════════════════════════════════════════ */

/* Fifteen apps times three gestures is more than anyone will hold in their
   head. Holding the home button (or the dial) asks the current app instead. */
const HELP = {
  home:    ['open the app', 'this card', 'browse the deck'],
  clock:   ['12-hour ⇄ 24-hour', '—', 'digital / analog / words'],
  timer:   ['start · pause', 'reset', 'set the time'],
  reps:    ['start · stop', 'stop', 'pick a set'],
  stop:    ['start · stop', 'lap, or reset when idle', '—'],
  tally:   ['+1', 'reset to zero', 'correct by ±1'],
  breathe: ['start · stop', 'stop', 'pick a pattern'],
  sun:     ['refresh the fix', 'forget the location', 'cycle the readout'],
  moon:    ['cycle the readout', 'back to tonight', 'walk the calendar'],
  compass: ['drop · clear a bearing', 'clear the bearing', 'nudge the bearing'],
  level:   ['zero it here', 'clear the zero', 'range ±5 / 15 / 45°'],
  react:   ['arm, then tap the cue', 'clear the best', 'see it ⇄ feel it'],
  echo:    ['start · tap the pads back', 'clear the best', 'easy / brisk / sharp'],
  dice:    ['roll', 'roll', 'd6 / d20 / d100 / coin'],
  metro:   ['start · stop', 'back to 96 bpm', '±2 bpm'],
  torch:   ['light on · off', 'off', 'brightness']
};

const cardEl = $('#card'), cdName = $('#cdName'), cdTap = $('#cdTap'),
      cdHold = $('#cdHold'), cdRim = $('#cdRim'), cdVer = $('#cdVer');
let cardT = 0;

function showCard() {
  const h = HELP[cur.key] || HELP.home;
  cdName.textContent = cur.name;
  cdTap.textContent = h[0];
  cdHold.textContent = h[1];
  cdRim.textContent = h[2];
  cdVer.textContent = 'v' + VERSION + ' · ' + BUILD;
  cardEl.classList.add('on');
  clearTimeout(cardT);
  cardT = setTimeout(hideCard, 7000);
}
function hideCard() { clearTimeout(cardT); cardEl.classList.remove('on'); }
cardEl.addEventListener('pointerdown', e => { e.stopPropagation(); haptic(10); hideCard(); });

let cur = HOME;

function render(key) {
  const next = key ? APPS.find(a => a.key === key) || HOME : HOME;
  if (next === cur) return;
  hideCard();
  if (cur.exit) cur.exit();
  cur.view.classList.remove('on');
  cur = next;
  document.body.classList.toggle('inapp', cur !== HOME);
  document.documentElement.style.setProperty('--accent', cur.color || '#5FD3C4');
  HUD.off();
  cur.view.classList.add('on');
  if (cur.enter) cur.enter();
}

/* history.back() lands a tick later, so opening an app in that window would
   push on top of the old entry and then get popped straight back to the dial.
   Hold the open until the pop has landed. */
let backPending = false;

function open(key) {
  if (cur.key === key) return;
  if (backPending) { setTimeout(() => open(key), 0); return; }
  history.pushState({ app: key }, '');
  render(key);
  haptic([0, 14, 50, 8]);
}
function home() {
  if (cur === HOME) return;
  if (history.state && history.state.app) { backPending = true; history.back(); }
  else render(null);
  haptic(12);
}

history.replaceState({ app: null }, '');
addEventListener('popstate', e => {
  backPending = false;
  render(e.state && e.state.app);
});

const homeBtn = $('#homeBtn');
let hbTimer = 0, hbLong = false;
homeBtn.addEventListener('pointerdown', e => {
  e.stopPropagation();
  hbLong = false;
  hbTimer = setTimeout(() => { hbLong = true; haptic(30); showCard(); }, 600);
});
homeBtn.addEventListener('pointerup', e => {
  e.stopPropagation();
  clearTimeout(hbTimer);
  if (!hbLong) home();
});
['pointerleave', 'pointercancel'].forEach(t =>
  homeBtn.addEventListener(t, () => clearTimeout(hbTimer)));

/* ═══════════════════════════════════════════════════════════════════════
   INPUT — the outer 40% of the glass is a bezel
   ═══════════════════════════════════════════════════════════════════════ */

const watch = $('#watch');
const STEP_DEG = 18;
const OUTER = 0.60;      // fraction of the radius where the bezel begins
let g = null;
let firstTouch = true;

function pointOf(e, rect) {
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const nx = (e.clientX - cx) / (rect.width / 2);
  const ny = (e.clientY - cy) / (rect.height / 2);
  return { nx, ny, r: Math.hypot(nx, ny), ang: Math.atan2(ny, nx) };
}

watch.addEventListener('pointerdown', e => {
  if (e.target.closest('#homeBtn')) return;
  const rect = watch.getBoundingClientRect();
  const p = pointOf(e, rect);
  g = {
    id: e.pointerId, rect, ang: p.ang, acc: 0,
    bezel: p.r > OUTER, moved: 0, rotated: false, longFired: false,
    x0: e.clientX, y0: e.clientY, t0: performance.now(),
    lastDetent: performance.now(),
    lt: setTimeout(() => {
      if (!g || g.rotated || g.moved > 14) return;
      g.longFired = true;
      if (cur.long) cur.long(p);
    }, 620)
  };
  try { watch.setPointerCapture(e.pointerId); } catch (err) {}
});

watch.addEventListener('pointermove', e => {
  if (!g || e.pointerId !== g.id) return;
  g.moved = Math.max(g.moved, Math.hypot(e.clientX - g.x0, e.clientY - g.y0));
  if (g.moved > 14) clearTimeout(g.lt);
  if (!g.bezel) return;
  const p = pointOf(e, g.rect);
  let d = (p.ang - g.ang) * 180 / Math.PI;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  g.ang = p.ang;
  g.acc += d;
  while (Math.abs(g.acc) >= STEP_DEG) {
    const s = g.acc > 0 ? 1 : -1;
    g.acc -= s * STEP_DEG;
    g.rotated = true;
    clearTimeout(g.lt);
    /* Spin fast and each detent counts for more, the way a digital crown
       behaves. Without it, 5:00 to 45:00 is forty separate detents. Apps with
       a small value space (patterns, modes, the dial itself) ignore it. */
    const t = performance.now();
    const gap = t - g.lastDetent;
    g.lastDetent = t;
    if (cur.rotate) cur.rotate(s, gap < 70 ? 5 : gap < 130 ? 3 : 1);
  }
});

function endGesture(e) {
  if (!g || e.pointerId !== g.id) return;
  clearTimeout(g.lt);
  const dt = performance.now() - g.t0;
  const wasTap = !g.rotated && !g.longFired && g.moved < 14 && dt < 620;
  const p = pointOf(e, g.rect);
  g = null;
  if (!wasTap) return;
  if (firstTouch) {
    firstTouch = false;
    goFullscreen();
    keepAwake();
    ac();
  }
  if (cur.tap) cur.tap(p);
}
watch.addEventListener('pointerup', endGesture);
watch.addEventListener('pointercancel', e => { if (g && e.pointerId === g.id) { clearTimeout(g.lt); g = null; } });

/* desk testing: wheel + keys stand in for the bezel */
addEventListener('wheel', e => { if (cur.rotate) cur.rotate(e.deltaY > 0 ? 1 : -1); }, { passive: true });
addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'ArrowRight' || k === 'ArrowDown') { cur.rotate && cur.rotate(1); e.preventDefault(); }
  else if (k === 'ArrowLeft' || k === 'ArrowUp') { cur.rotate && cur.rotate(-1); e.preventDefault(); }
  else if (k === 'Enter' || k === ' ') { cur.tap && cur.tap({ nx: 0, ny: 0, r: 0 }); e.preventDefault(); }
  else if (k === 'Backspace' || k === 'Escape') { home(); e.preventDefault(); }
  else if (k === 'r' || k === 'R') { cur.long && cur.long({ nx: 0, ny: 0, r: 0 }); }
});

/* ═══════════════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════════════ */

const loop = now => { if (cur.frame) cur.frame(now); requestAnimationFrame(loop); };
requestAnimationFrame(loop);

HOME.enter();

const cap = $('#caption');
if (cap) cap.innerHTML = 'SW7 <b>v' + VERSION + '</b> &middot; built ' + BUILD +
  '<br>Turn the outer edge, tap the middle, hold to reset. Hold the dial for the build stamp.';
document.documentElement.style.setProperty('--accent', APPS[selIdx].color);

if (!store.get('seen', false)) {
  store.set('seen', true);
  setTimeout(() => toast('tap — goes fullscreen, stays awake', 3400), 700);
  setTimeout(() => toast('turn the rim to browse', 3400), 4400);
}

/* ?dev exposes the router for a desktop browser console — handy when you are
   poking at a view without a wrist in front of you. */
const DEV = /[?&]dev\b/.test(location.search);
if (DEV) {
  window.SW7 = { open, home, apps: APPS.map(a => a.key), cur: () => cur.key, app: k => APPS.find(a => a.key === k),
    g: () => g && { bezel: g.bezel, acc: g.acc, moved: g.moved, rotated: g.rotated } };
}

/* ?dev also skips the service worker, so an edit shows up on reload. */
if ('serviceWorker' in navigator && !DEV) {
  /* A new build lands in the cache behind the page that is already running, so
     without this the watch keeps showing the old SW7 until someone thinks to
     reload. Take the update only when it costs nothing: sitting on the dial
     with nothing counting down. Otherwise say so and let them choose. */
  const hadController = !!navigator.serviceWorker.controller;
  let handled = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || handled) return;
    handled = true;
    if (cur === HOME && !APPS.some(a => a.live && a.live())) location.reload();
    else toast('update ready · reload', 3200);
  });
  addEventListener('load', () =>
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {}));
}

})();
