# Safe Modal on Probe Pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the moodie-proven safe modal pattern to the nd28pages probe site: a card-details popup on the index, click-to-zoom exhibits in the three reports, an updated moodie report, and a skill recipe.

**Architecture:** Self-contained pages (no external JS). Each page gets the canonical safe-modal CSS (closed = `pointer-events:none` + `visibility:hidden`, open = auto), a backdrop + dialog, and a small inline IIFE. The index popup reuses the dates the page already fetches from the GitHub API. Reports stay single-file; the snippet is inlined per page.

**Tech Stack:** Vanilla HTML/CSS/JS. Verification: `lens.py` (overflow), `bctl` (real-tap/hit-testing). Repo: `/var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages` (branch `master`, push `origin master`).

## Global Constraints

- Canonical safe modal CSS (verbatim from spec `docs/superpowers/specs/2026-08-16-probe-safe-modal-design.md`):
  ```css
  .modal-backdrop{position:fixed;inset:0;background:rgba(21,19,28,.6);backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility .3s;z-index:100}
  .modal-backdrop.open{opacity:1;visibility:visible;pointer-events:auto}
  .modal{position:fixed;inset:0;z-index:101;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility .3s}
  .modal.open{opacity:1;visibility:visible;pointer-events:auto}
  ```
- **Verification rule:** never rely on programmatic `.click()` alone — prove hit-testing with `document.elementFromPoint` (closed modal must NOT be on top) and use real `bctl click`.
- All tokens come from each page's existing `:root` (`--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--muted`, `--pink-bold`, `--mint`, `--r-lg`, `--r-md`, `--r-sm`, `--font`, `--mono`). No new colors/radii.
- Close via ✕ / backdrop click / Escape. `role="dialog" aria-modal="true"` + `aria-label` on the modal. Focus moves into the modal on open, returns to the trigger on close.
- Copy: honest, terse, no filler.
- After every push: wait ~85s for the Pages CDN, re-verify live with `?v=$(date +%s)`.

---

### Task 1: Card details popup — `probe/index.html`

**Files:**
- Modify: `probe/index.html` — CSS (~after line 144, before `footer`), markup (before the `<script>` at line 204), JS (inside the existing IIFE, after the `Promise.all` block at line ~314)

**Interfaces:**
- Consumes: existing card markup `<li data-file="probe/xxx.html"><a href="xxx.html"><div class="meta">…</div><span class="title">…</span><span class="desc">…</span></a></li>`; existing `.mod` dates fetched into `li.dataset.mtime`.
- Produces: modal `#popModal` + `#popBackdrop` + `#popCard`; functions `openPopup(li)` / `closePopup()`; card clicks open the popup instead of navigating.

- [ ] **Step 1: Add the CSS** — insert before the `footer` rule (line 145):

```css
    .modal-backdrop{position:fixed;inset:0;background:rgba(21,19,28,.6);backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility .3s;z-index:100}
    .modal-backdrop.open{opacity:1;visibility:visible;pointer-events:auto}
    .modal{position:fixed;inset:0;z-index:101;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility .3s}
    .modal.open{opacity:1;visibility:visible;pointer-events:auto}
    .modal-card{width:min(520px,100%);background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:28px;box-shadow:0 24px 64px rgba(0,0,0,.4)}
    .modal-card .file{display:block;margin-bottom:10px}
    .modal-card h2{margin:0 0 8px;font-size:22px;letter-spacing:-.02em;color:var(--text)}
    .modal-card .desc{color:var(--muted);font-size:14px;margin:0 0 16px}
    .modal-card .meta-line{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-family:var(--mono);font-size:12px;color:var(--muted);border-top:1px solid var(--border);padding-top:14px;margin-bottom:18px}
    .modal-actions{display:flex;justify-content:space-between;align-items:center;gap:12px}
    .modal-close{border:1px solid var(--border);background:var(--surface-2);color:var(--text);border-radius:999px;padding:9px 16px;font-family:var(--font);font-size:13px;cursor:pointer}
    .modal-close:hover{border-color:var(--pink-bold)}
    .modal-open-link{color:var(--mint);font-weight:600;text-decoration:none;font-size:14px}
    .modal-open-link:hover{text-decoration:underline}
```

- [ ] **Step 2: Add the markup** — directly before `<script>` (line 204):

```html
    <div class="modal-backdrop" id="popBackdrop"></div>
    <div class="modal" id="popModal" role="dialog" aria-modal="true" aria-label="Probe details">
      <div class="modal-card" id="popCard"></div>
    </div>
```

- [ ] **Step 3: Add the JS** — inside the existing IIFE, after the `Promise.all(pending).then(...)` block (end of the script):

```js
      // card details popup
      var popModal = document.getElementById('popModal');
      var popBackdrop = document.getElementById('popBackdrop');
      var popCard = document.getElementById('popCard');
      var lastFocus = null;
      var STATS = {
        'probe/diskvis.rb.html': 'written twice — Ruby and Perl',
        'probe/microservices-rl-pwa.html': '5 fixes: glass, modal, swipe, stats, no greeting',
        'probe/moodie-fix.html': '1 misplaced quote · 3 lines · 1 invisible tap-blocking modal'
      };
      function closePopup() {
        popModal.classList.remove('open');
        popBackdrop.classList.remove('open');
        if (lastFocus) lastFocus.focus();
      }
      function openPopup(li) {
        var a = li.querySelector('a');
        var file = li.getAttribute('data-file');
        var title = li.querySelector('.title').textContent;
        var desc = li.querySelector('.desc').textContent;
        var mod = li.querySelector('.mod').textContent;
        var stat = STATS[file] || '';
        popCard.innerHTML =
          '<span class="file">' + file + '</span>' +
          '<h2>' + title + '</h2>' +
          '<p class="desc">' + desc + '</p>' +
          '<div class="meta-line"><span>' + (mod || '') + '</span><span>' + stat + '</span></div>' +
          '<div class="modal-actions">' +
          '<a class="modal-open-link" href="' + a.getAttribute('href') + '">Open probe →</a>' +
          '<button type="button" class="modal-close" id="popClose">Close</button>' +
          '</div>';
        lastFocus = a;
        popModal.classList.add('open');
        popBackdrop.classList.add('open');
        document.getElementById('popClose').focus();
        document.getElementById('popClose').addEventListener('click', closePopup);
        popModal.querySelector('.modal-open-link').addEventListener('click', closePopup);
      }
      items.forEach(function (li) {
        li.addEventListener('click', function (e) {
          var a = li.querySelector('a');
          if (a && e.target.closest && e.target.closest('a')) e.preventDefault();
          openPopup(li);
        });
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePopup(); });
      popBackdrop.addEventListener('click', closePopup);
```

- [ ] **Step 4: Verify locally (hit-test + real tap + overflow)**

```bash
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/index.html"
bctl eval "var a=document.querySelector('.list a'); var r=a.getBoundingClientRect(); var t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); var ids=[]; var n=t; while(n&&n!==document.body){ids.push(n.id||n.tagName); n=n.parentElement;} document.title=(t&&t.closest('a')?'HITS_CARD':'BLOCKED')+' '+ids.slice(0,3).join('<'); 'x'"
```
Expected: `HITS_CARD` — the closed modal is NOT on top.
Then: `bctl click ".list li"` → expect popup visible; check `#popCard` text contains the title, file, stats line and an `Open probe` link whose href equals the card's original href. Press Escape via `bctl key Escape` → popup closes, focus back on the card. Also run `python3 lens.py "index" --metrics-only` in `/Users/nileshsuthar/.agents/skills/html-mis/` → no overflow 320→1440.

- [ ] **Step 5: Commit, push, verify live**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/index.html && git commit -m "probe index: card details popup (safe modal — closed modals never block taps)" && git push origin master
```
Sleep 85s, then repeat Step 4 against `https://nd28.github.io/probe/?v=$(date +%s)`.

---

### Task 2: Exhibit zoom — the three report pages

**Files:**
- Modify: `probe/moodie-fix.html`, `probe/microservices-rl-pwa.html`, `probe/diskvis.rb.html` (identical snippet in each; pages stay self-contained)

**Interfaces:**
- Consumes: existing exhibit markup `<div class="side"><span class="tag rb|pl">before|after</span><span class="note">…</span></div>` inside `.pair`.
- Produces: `#zoomModal` + `#zoomBackdrop` + `#zoomCard`; clicking a `.side` opens the zoom modal with a clone of that panel; close via ✕ / backdrop / Escape.

- [ ] **Step 1: Add the CSS** — in each report's `<style>`, after the last existing rule before `</style>`:

```css
    .modal-backdrop{position:fixed;inset:0;background:rgba(21,19,28,.6);backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility .3s;z-index:100}
    .modal-backdrop.open{opacity:1;visibility:visible;pointer-events:auto}
    .modal{position:fixed;inset:0;z-index:101;display:flex;align-items:center;justify-content:center;padding:28px 24px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility .3s}
    .modal.open{opacity:1;visibility:visible;pointer-events:auto}
    .zoom-card{width:min(620px,100%);max-height:80vh;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:28px;box-shadow:0 24px 64px rgba(0,0,0,.4);outline:none}
    .zoom-card .side{font-size:19px;line-height:1.55;padding:20px;border-radius:var(--r-md);cursor:default}
    .zoom-card .note{display:block;margin-top:12px}
    .zoom-card .tag{font-size:13px}
    .side{cursor:zoom-in}
    .side:hover{border-color:var(--pink-bold)}
```

- [ ] **Step 2: Add the markup** — in each report, directly before the closing `<script>` tag:

```html
    <div class="modal-backdrop" id="zoomBackdrop"></div>
    <div class="modal" id="zoomModal" role="dialog" aria-modal="true" aria-label="Zoomed exhibit">
      <div class="zoom-card" id="zoomCard" tabindex="-1"></div>
    </div>
```

- [ ] **Step 3: Add the JS** — in each report, inside the existing script block, after the existing IIFE:

```js
    (function () {
      var modal = document.getElementById('zoomModal');
      var backdrop = document.getElementById('zoomBackdrop');
      var card = document.getElementById('zoomCard');
      var last = null;
      function close() {
        modal.classList.remove('open');
        backdrop.classList.remove('open');
        if (last) last.focus();
      }
      document.querySelectorAll('.side').forEach(function (side) {
        side.setAttribute('tabindex', '0');
        side.setAttribute('role', 'button');
        side.addEventListener('click', function () {
          card.innerHTML = '';
          card.appendChild(side.cloneNode(true));
          last = side;
          modal.classList.add('open');
          backdrop.classList.add('open');
          card.focus();
        });
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      backdrop.addEventListener('click', close);
      modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    })();
```

- [ ] **Step 4: Verify locally on all three pages** (hit-test + real tap + Escape):

```bash
bctl goto "file:///.../probe/moodie-fix.html"
bctl eval "var s=document.querySelector('.side'); var r=s.getBoundingClientRect(); var t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); document.title=(t&&t.closest('.side')?'HITS_SIDE':'BLOCKED'); 'x'"
```
Expected: `HITS_SIDE` on each page (closed modal not on top). Then `bctl click ".side"` → zoom modal visible with the panel's `.tag` text; `bctl key Escape` closes. Repeat for `microservices-rl-pwa.html` and `diskvis.rb.html`. Run `python3 lens.py "<page-substring>" --metrics-only` for each → no overflow 320→1440.

- [ ] **Step 5: Commit, push, verify live** (one commit for all three)

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/*.html && git commit -m "reports: click-to-zoom exhibits (safe modal)" && git push origin master
```
Sleep 85s; repeat Step 4 against the live URLs with `?v=$(date +%s)`.

---

### Task 3: moodie-fix report — add the invisible-modal finding

**Files:**
- Modify: `probe/moodie-fix.html` (stats ~424-428, h1 ~412, evidence section ~443-470, fix diffs ~476-491, verification ~495, footer date ~509, TOC ~513-524)

**Interfaces:**
- Consumes: nothing from other tasks (content-only edit).
- Produces: updated report; the index popup stats map from Task 1 stays consistent with it.

- [ ] **Step 1: Update h1/sub** (line 412-413):

```html
      <h1>moodie — two silent killers</h1>
      <p class="sub">Therapeutic mood tracker PWA. A stray quote and an invisible modal killed every tap.</p>
```

- [ ] **Step 2: Update the stats** (lines 424-427):

```html
      <div class="stat"><div class="n">1</div><div class="l">Misplaced quote</div></div>
      <div class="stat"><div class="n">3</div><div class="l">Lines changed</div></div>
      <div class="stat"><div class="n">1</div><div class="l">Invisible tap-blocking modal</div></div>
      <div class="stat"><div class="n">v3</div><div class="l">SW cache bump</div></div>
```

- [ ] **Step 3: Add the modal evidence** — inside section 01, after the existing Evidence `part` (after line 470), add:

```html
      <div class="part">
        <h3 class="sub" id="s1-modal">The invisible modal</h3>
        <p class="lede">Even after the script parses, taps can still land nowhere. The check-in modal is <code>position:fixed; inset:0; z-index:101</code> — and while closed it kept <code>pointer-events:auto</code>. Invisible, full-screen, swallowing every tap the app ever received.</p>
        <div class="exhibit">
          <div class="ex-head">hit-testing <span class="lang">before</span></div>
          <pre class="out">elementFromPoint(theme-button) → DIV#pageMood
                                    └ inside #checkinModal (closed, invisible)</pre>
          <div class="cap"><code>elementFromPoint</code> proved it: the top layer at the button was a child of the closed modal</div>
        </div>
      </div>
```

- [ ] **Step 4: Add the fix exhibit** — inside section 03, after the Service worker `diff` (after line 490), add:

```html
        <div class="diff">
          <div class="aspect">Closed modals</div>
          <div class="pair">
            <div class="side"><span class="tag rb">before</span><span class="note"><code>.modal</code> closed: <code>inset:0; z-index:101; pointer-events:auto</code> — an invisible full-screen tap trap</span></div>
            <div class="side"><span class="tag pl">after</span><span class="note"><code>pointer-events:none</code> + <code>visibility:hidden</code> while closed; <code>auto</code> only when <code>.open</code></span></div>
          </div>
        </div>
```

- [ ] **Step 5: Update the SW exhibit "after" note** (line 488):

```html
            <div class="side"><span class="tag pl">after</span><span class="note">bumped to <code>moodie-v3</code>, network-first — every load fetches the freshest shell</span></div>
```

- [ ] **Step 6: Update verification lede** (line 495) and footer date (line 509):

```html
        <p class="lede"><code>node --check</code> is clean. Live in a controlled browser: console shows no script error, and hit-testing (<code>elementFromPoint</code>) proves no invisible layer sits above any button — the real flow works: open a check-in, pick a mood, the bloom plays, the emotion page advances, plant completes.</p>
```
Footer: `modified 15 Aug 2026` → `modified 16 Aug 2026`.

- [ ] **Step 7: Update the TOC** — add under `s1-evidence` (after line 518):

```html
        <a href="#s1-modal" class="l2">The invisible modal</a>
```

- [ ] **Step 8: Verify** — `python3 lens.py "moodie-fix" --metrics-only` → no overflow 320→1440; `bctl goto file:///.../probe/moodie-fix.html` → grep text: h1 "two silent killers", stat "Invisible tap-blocking modal", exhibit `#s1-modal` present, TOC link present.

- [ ] **Step 9: Commit, push, verify live**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/moodie-fix.html && git commit -m "moodie report: add the invisible-modal root cause" && git push origin master
```
Sleep 85s; verify live with `?v=$(date +%s)`.

---

### Task 4: Skill recipe — html-mis SKILL.md

**Files:**
- Modify: `/Users/nileshsuthar/.agents/skills/html-mis/SKILL.md` (insert after the "Sticky search row" section, before `## Structure` at line 455; not in the repo — no commit)

**Interfaces:**
- Consumes: nothing.
- Produces: documented canonical pattern for all future pages.

- [ ] **Step 1: Insert the recipe** after line 453 (end of the sticky-search-row section):

```markdown
### Safe modal (closed modals never block taps)

A closed modal must never receive pointer events. `opacity: 0` alone leaves an
invisible full-screen layer that swallows every tap — moodie shipped exactly
this: `position:fixed; inset:0; z-index:101` with default `pointer-events:auto`
made the whole app untappable. Closed state needs both `pointer-events: none`
and `visibility: hidden` (opacity is decorative):

```css
.modal-backdrop{position:fixed;inset:0;background:rgba(21,19,28,.6);backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility .3s;z-index:100}
.modal-backdrop.open{opacity:1;visibility:visible;pointer-events:auto}
.modal{position:fixed;inset:0;z-index:101;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .3s,visibility .3s}
.modal.open{opacity:1;visibility:visible;pointer-events:auto}
```

Rules:
- Close via ✕ / backdrop click / Escape; `role="dialog" aria-modal="true"` +
  `aria-label` on the modal; focus moves into the modal on open and returns to
  the trigger on close.
- Verify with hit-testing, never programmatic `.click()` alone:
  `document.elementFromPoint(x, y)` at the trigger must return the trigger (or a
  descendant), never the closed modal.

Used on: probe index card popup, report exhibit zoom.
```

- [ ] **Step 2: Add a common-mistakes bullet** — in `## Common mistakes` (line 471+):

```markdown
- **Invisible full-screen layers with `pointer-events: auto`** — closed modals/backdrops swallow every tap; always `pointer-events: none` + `visibility: hidden` when closed.
```

- [ ] **Step 3: Verify** — read the file back; confirm the section sits before `## Structure`, no markdown fence is broken (the CSS block inside the recipe uses a fence inside the section).

---

## Self-Review Notes

- Spec coverage: popup (T1), exhibit zoom (T2), moodie report (T3), skill (T4), verification rules (Global Constraints + each task) — all covered.
- No placeholders; every step has exact content.
- Type/name consistency: `#popModal`/`#popBackdrop`/`#popCard` (T1) and `#zoomModal`/`#zoomBackdrop`/`#zoomCard` (T2) are unique per page; `openPopup`/`closePopup` (T1) vs `close()` (T2, local scope) don't collide across pages.