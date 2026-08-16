# "The Verification Lied" Probe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `probe/verification-lied.html` — a catalog-first MIS report on the five ways automated checks called a dead app "working", with the moodie invisible-modal case study, a live lie-demo exhibit, and the method that doesn't lie.

**Architecture:** One self-contained HTML page following the existing probe template (herobar, numbered sections, TOC aside, zoomable `.side` exhibits). Sections 01–05 per the spec; a small interactive demo (toggleable invisible layer + `elementFromPoint` readout) lives inside section 01. One new entry in the index STATS map.

**Tech Stack:** Vanilla HTML/CSS/JS. Verification: `lens.py` (overflow), `bctl` (CDP: hit-tests + synthetic clicks — NEVER call a synthetic click a real tap; real-tap claims require CDP `Input.dispatchMouseEvent`). Repo: `/var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages` (branch `master`, push `origin master`). Skill: `/Users/nileshsuthar/.agents/skills/html-mis/SKILL.md`.

## Global Constraints

- **Copy rules (non-native readers, binding):** short words, short sentences, no idioms/metaphors. Simple verbs ("returns nothing", "sits on top", "serves the old page"). Keep technical words (elementFromPoint, pointer-events). Honest, slightly imperfect — never a press release. Drop the polish, never the data.
- **Tokens only:** existing `:root` tokens (`--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--muted`, `--pink-bold`, `--mint`, `--r-lg/--r-md/--r-sm`, `--font`, `--mono`). No new colors/radii. Theme-aware (`color-scheme: light dark`). Print-ready (`print-color-adjust: exact`, `break-inside: avoid` on cards).
- **Verification truth rules:** `elementFromPoint` is the truth meter — a closed modal/overlay must never be on top. `bctl click` runs `element.click()` via Runtime.evaluate — synthetic, bypasses hit-testing; it proves the handler fires, nothing about what a real tap hits. Never phrase a `bctl click` result as a "real tap". Test points must be in the viewport (off-screen returns NULL). Hidden/occluded tabs freeze CSS transitions — neutralize with `transition:none` before style assertions.
- Base shell, CSS and zoom plumbing come verbatim from `probe/microservices-rl-pwa.html` (the same token set, herobar, TOC aside, zoom modal CSS + `#zoomModal`/`#zoomBackdrop`/`#zoomCard` IIFE).
- After push: wait ~85s for the Pages CDN, re-verify live with `?v=$(date +%s)`.
- Title: "Session MIS Report — The Verification Lied". Date pill: 16 Aug 2026.

---

### Task 1: Page shell — hero, stats, zoom plumbing

**Files:**
- Create: `probe/verification-lied.html` (copy base from `probe/microservices-rl-pwa.html`)

**Interfaces:**
- Consumes: the verified shell of `probe/microservices-rl-pwa.html` (style block, herobar, TOC aside, footer, zoom modal markup + JS).
- Produces: the full page skeleton with `<title>`, hero, stats strip; zoom modal (`#zoomModal`, `#zoomBackdrop`, `#zoomCard`) working; empty sections 01–05 placeholders to be filled by Tasks 2–4.

- [x] **Step 1: Copy the base file**

```bash
cp /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/microservices-rl-pwa.html \
   /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/verification-lied.html
```

- [x] **Step 2: Replace the `<title>` and meta description**

```html
<title>Session MIS Report — The Verification Lied</title>
```

- [x] **Step 3: Replace the hero block** (the `<header class="hero">` ... `</header>` section) with:

```html
      <!-- HERO -->
    <header class="hero">
      <h1>The verification lied</h1>
      <p class="sub">Five ways automated checks said a dead app was working — and the one check that told the truth.</p>
      <div class="meta">
        <span class="pill"><span class="dot"></span>Date <b>16 Aug 2026</b></span>
        <span class="pill"><span class="dot"></span>Vanilla JS · HTML · CSS</span>
        <span class="pill"><span class="dot"></span>0 build deps</span>
        <a class="pill" href="https://nd28.github.io/moodie/" style="text-decoration:none"><span class="dot"></span>Open the app ↗</a>
      </div>
    </header>
```

- [x] **Step 4: Replace the stats strip** with:

```html
    <!-- AT A GLANCE -->
    <div class="stats">
      <div class="stat"><div class="n">5</div><div class="l">Verification lies</div></div>
      <div class="stat"><div class="n">1</div><div class="l">Real bug</div></div>
      <div class="stat"><div class="n">2</div><div class="l">CSS lines fixed</div></div>
      <div class="stat"><div class="n">1</div><div class="l">Human report that caught it</div></div>
    </div>
```

- [x] **Step 5: Strip the copied report's body sections** — delete every `<section id="s...">` block and its comments from the copy (keep only the empty `<!-- -->` markers), leaving the shell: herobar, hero, stats, footer, TOC aside (edit TOC links to `#s1`…`#s5`), zoom modal markup, and the script. Rename `#modtime` footer date to `16 Aug 2026`.

- [x] **Step 6: Verify the shell** — page opens, hero + stats render, zoom modal exists:

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/verification-lied.html"
bctl eval "document.title='h1:'+document.querySelector('h1').textContent+' | stats:'+document.querySelectorAll('.stat').length+' | zoom:'+!!document.getElementById('zoomModal'); 'x'"
bctl title
```

Expected: `h1:The verification lied | stats:4 | zoom:true`

- [x] **Step 7: Overflow check**

```bash
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "verification-lied" --metrics-only
```

Expected: no overflow 320→1440.

---

### Task 2: Section 01 — the five lies (catalog)

**Files:**
- Modify: `probe/verification-lied.html` (section 01, after the stats strip)

**Interfaces:**
- Consumes: the shell from Task 1.
- Produces: `<section id="s1">` with five `.lie-card` blocks, each containing a `.side` exhibit (zoomable via Task 1's plumbing). The live demo (Task 3) mounts after these cards.

- [x] **Step 1: Insert section 01** — replace the `<!-- 01 -->` marker with:

```html
    <!-- 01 THE FIVE LIES -->
    <section id="s1">
      <div class="sec-head"><div class="sec-num">01</div><h2>The five lies</h2></div>

      <div class="part">
        <h3 class="sub" id="s1-lie1">Lie 1 — the programmatic click</h3>
        <p class="lede">`element.click()` fires the handler without a real pointer. It skips hit-testing — it "works" even when an invisible layer swallows every real tap.</p>
        <div class="exhibit">
          <div class="ex-head">the check that passed <span class="lang">.click()</span></div>
          <pre class="out">btnSettings.click()
→ MODAL:true PANEL:3   ← "it works!"</pre>
          <div class="cap">the handler ran. What a real tap would hit: never checked.</div>
        </div>
      </div>

      <div class="part">
        <h3 class="sub" id="s1-lie2">Lie 2 — the off-screen probe</h3>
        <p class="lede">`elementFromPoint` returns NULL below the fold. A scroll mismatch reads as "blocked".</p>
        <div class="exhibit">
          <div class="ex-head">the probe <span class="lang">result</span></div>
          <pre class="out">TOP:NULL chain:
rect:(47,2048)   ← y=2048 on an 800px viewport</pre>
          <div class="cap">the point was never on screen. The result said nothing about the page.</div>
        </div>
      </div>

      <div class="part">
        <h3 class="sub" id="s1-lie3">Lie 3 — the frozen tab</h3>
        <p class="lede">A hidden tab freezes CSS transitions. Computed styles stay at their start values — `visibility` stuck `hidden`, `opacity` 0 — even when the class says `open`.</p>
        <div class="exhibit">
          <div class="ex-head">open modal, reading styles <span class="lang">hidden tab</span></div>
          <pre class="out">vs:hidden tElapsed:1071ms
vis:hidden opacity:0</pre>
          <div class="cap">the modal was open in the DOM. The frozen tab said hidden.</div>
        </div>
      </div>

      <div class="part">
        <h3 class="sub" id="s1-lie4">Lie 4 — the missing key</h3>
        <p class="lede">Remote key events don't deliver to real https pages. A working Escape handler looks dead.</p>
        <div class="exhibit">
          <div class="ex-head">two Escape presses <span class="lang">https</span></div>
          <pre class="out">state open:true   ← still open!
syntheticEsc open:false   ← handler works</pre>
          <div class="cap">the key never arrived. The handler was fine all along.</div>
        </div>
      </div>

      <div class="part">
        <h3 class="sub" id="s1-lie5">Lie 5 — the stale page</h3>
        <p class="lede">The Pages CDN lags ~85s, and service workers serve old shells. You verify yesterday's build and call it done.</p>
        <div class="exhibit">
          <div class="ex-head">service worker <span class="lang">versions</span></div>
          <pre class="out">moodie-v1  cache-first  → served the broken shell
moodie-v3  network-first → shipped the fix</pre>
          <div class="cap">cache-bust with `?v=$(date +%s)` — never verify yesterday's page.</div>
        </div>
      </div>
    </section>
```

- [x] **Step 2: Verify section 01** — grep the five ids, zoom a `.side` exhibit:

```bash
grep -c 'id="s1-lie' probe/verification-lied.html   # expected: 5
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/verification-lied.html"
bctl eval "document.querySelector('#s1 .side').scrollIntoView({block:'center'}); document.querySelector('#s1 .side').click(); document.title='zoomOpen:'+document.getElementById('zoomModal').classList.contains('open'); 'x'"
bctl title   # expected: zoomOpen:true
```

- [x] **Step 3: Overflow check** — `python3 lens.py "verification-lied" --metrics-only` → no overflow 320→1440.

---

### Task 3: Live demo exhibit — "Lie 1, try it"

**Files:**
- Modify: `probe/verification-lied.html` (inside section 01, after the five lie cards, before `</section>`)

**Interfaces:**
- Consumes: section 01 from Task 2.
- Produces: `#demoBox` card with `#demoBtn` (fake button), `#demoToggle` (toggle), `#demoLayer` (invisible full-screen layer — deliberately the WRONG pattern), `#demoReadout` (elementFromPoint readout). Own IIFE; no CSS collisions (no `.modal` reuse).

- [x] **Step 1: Add the demo CSS** — inside the `<style>` block, before `</style>`:

```css
    .demo-box{border:1px dashed var(--border);border-radius:var(--r-md);padding:24px;background:var(--surface-2);margin-top:32px}
    .demo-box h3{margin:0 0 8px;font-size:16px;color:var(--text)}
    .demo-box p.note{margin:0 0 16px;font-size:13px;color:var(--muted)}
    .demo-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
    #demoBtn{background:var(--surface);border:1px solid var(--border);color:var(--text);border-radius:var(--r-sm);padding:10px 18px;font-family:var(--font);font-size:14px;cursor:pointer}
    #demoBtn.hit{box-shadow:0 0 0 2px var(--pink-bold)}
    #demoToggle{background:var(--surface-2);border:1px solid var(--border);color:var(--muted);border-radius:999px;padding:8px 14px;font-family:var(--font);font-size:12px;cursor:pointer}
    #demoToggle.on{color:var(--pink-bold);border-color:var(--pink-bold)}
    #demoLayer{position:fixed;inset:0;z-index:999;pointer-events:auto;opacity:0;background:#000}
    #demoLayer.on{opacity:.15}
    #demoReadout{font-family:var(--mono);font-size:12px;color:var(--mint);margin:14px 0 0}
```

- [x] **Step 2: Add the demo markup** — inside section 01, after the last lie `.part`, before `</section>`:

```html
      <div class="demo-box">
        <h3>Lie 1 — try it</h3>
        <p class="note">This layer is invisible. It blocks every tap.</p>
        <div class="demo-row">
          <button type="button" id="demoBtn">the button</button>
          <button type="button" id="demoToggle">layer off</button>
        </div>
        <pre id="demoReadout">What is on top of the button: —</pre>
        <div id="demoLayer"></div>
      </div>
```

- [x] **Step 3: Add the demo JS** — a new IIFE before the zoom IIFE in the script:

```js
    (function () {
      var btn = document.getElementById('demoBtn');
      var toggle = document.getElementById('demoToggle');
      var layer = document.getElementById('demoLayer');
      var out = document.getElementById('demoReadout');
      function read() {
        var r = btn.getBoundingClientRect();
        var t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        out.textContent = 'What is on top of the button: ' +
          (t && t.id ? t.id : (t ? t.tagName.toLowerCase() : 'NULL'));
        btn.classList.toggle('hit', !!(t && (t === btn || t.contains(btn))));
      }
      toggle.addEventListener('click', function () {
        layer.classList.toggle('on');
        toggle.textContent = layer.classList.contains('on') ? 'layer on' : 'layer off';
        toggle.classList.toggle('on', layer.classList.contains('on'));
        read();
      });
      btn.addEventListener('click', read);
      read();
    })();
```

- [x] **Step 4: Verify the demo — hit-tests only, no real-tap claims**

```bash
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/verification-lied.html"
bctl eval "document.getElementById('demoBox').scrollIntoView({block:'center'}); 'x'"
bctl eval "document.title='off:'+document.getElementById('demoReadout').textContent; 'x'"; bctl title
# expected: off:What is on top of the button: demobtn (or button)
bctl click "#demoToggle"
bctl eval "document.title='on:'+document.getElementById('demoReadout').textContent; 'x'"; bctl title
# expected: on:What is on top of the button: demobtn-layer → the layer
bctl click "#demoToggle"
bctl eval "document.title='off2:'+document.getElementById('demoReadout').textContent; 'x'"; bctl title
# expected: back to the button
```

Layer off → button is on top. Layer on → `#demoLayer` is on top. Toggle toggles back.

- [x] **Step 5: Overflow check** — `python3 lens.py "verification-lied" --metrics-only` → no overflow 320→1440.

---

### Task 4: Sections 02–05 — case study, method, learnings, tools

**Files:**
- Modify: `probe/verification-lied.html`

**Interfaces:**
- Consumes: shell (Task 1), section 01 (Tasks 2–3).
- Produces: `<section id="s2">` (case study), `<section id="s3">` (method), `<section id="s4">` (learnings), `<section id="s5">` (tools). TOC links updated.

- [x] **Step 1: Insert section 02 — the one bug (case study)** — replace the `<!-- 02 -->` marker with:

```html
    <!-- 02 THE ONE BUG -->
    <section id="s2">
      <div class="sec-head"><div class="sec-num">02</div><h2>The one bug</h2></div>

      <div class="part">
        <h3 class="sub" id="s2-symptom">The symptom</h3>
        <p class="lede">"Nothing works and makes me feel sick." Every real tap was dead: header buttons, garden, everything.</p>
      </div>

      <div class="part">
        <h3 class="sub" id="s2-lie">The first lie in action</h3>
        <p class="lede">Our check ran `element.click()` on the theme button and got `MODAL:true, PANEL:3` — "works!" It was lie 1. The handler ran. What a tap would hit: never checked.</p>
      </div>

      <div class="part">
        <h3 class="sub" id="s2-reveal">The reveal</h3>
        <p class="lede">`elementFromPoint` at the theme button returned a DIV inside the closed check-in modal. The closed modal was a full-screen tap trap: `position:fixed; inset:0; z-index:101; pointer-events:auto`.</p>
        <div class="exhibit">
          <div class="ex-head">hit-testing <span class="lang">before</span></div>
          <pre class="out">elementFromPoint(theme-button) → DIV#pageMood
                                    └ inside #checkinModal (closed, invisible)
elementFromPoint(garden spot)    → DIV#pageMood
                                    └ inside #checkinModal</pre>
          <div class="cap">the top layer at every tap point was a child of the closed modal</div>
        </div>
      </div>

      <div class="part">
        <h3 class="sub" id="s2-fix">The fix</h3>
        <div class="exhibit">
          <div class="ex-head">2 CSS rules <span class="lang">moodie</span></div>
          <pre class="out">.modal{             .modal.open{
  opacity:0;            opacity:1;
  visibility:hidden;    visibility:visible;
  pointer-events:none;  pointer-events:auto;
}                     }</pre>
          <div class="cap">closed modals never receive taps. Open modals always do.</div>
        </div>
      </div>

      <div class="part">
        <h3 class="sub" id="s2-proof">The proof</h3>
        <p class="lede">Hit-test after the fix: the button was on top. The full flow worked: garden → mood → emotion → plant → entry saved.</p>
        <div class="exhibit">
          <div class="ex-head">hit-testing <span class="lang">after</span></div>
          <pre class="out">elementFromPoint(theme-button) → BUTTON
elementFromPoint(garden spot) → the spot, reachable</pre>
        </div>
      </div>

      <div class="part">
        <h3 class="sub" id="s2-lesson">The last lesson</h3>
        <p class="lede">A tap on a real phone caught what every browser check missed. The user's tap was real. Ours was not.</p>
      </div>
    </section>
```

- [x] **Step 2: Insert section 03 — the method that doesn't lie** — replace the `<!-- 03 -->` marker with:

```html
    <!-- 03 THE METHOD -->
    <section id="s3">
      <div class="sec-head"><div class="sec-num">03</div><h2>The method that doesn't lie</h2></div>
      <div class="part">
        <div class="dels">
          <div class="del"><code>elementFromPoint</code><span class="lang">truth meter</span><span class="role">a closed modal must never be on top</span></div>
          <div class="del"><code>real input</code><span class="lang">CDP Input.dispatchMouseEvent</span><span class="role">not synthetic .click() — it skips hit-testing</span></div>
          <div class="del"><code>viewport</code><span class="lang">discipline</span><span class="role">test points inside the viewport — off-screen returns NULL</span></div>
          <div class="del"><code>tab state</code><span class="lang">visibilityState</span><span class="role">hidden tabs freeze transitions — neutralize before asserting</span></div>
          <div class="del"><code>?v=</code><span class="lang">cache-bust</span><span class="role">never verify yesterday's page; check the SW version</span></div>
          <div class="del"><code>the human's device</code><span class="lang">final oracle</span><span class="role">a real tap on a real phone outranks every automated check</span></div>
        </div>
      </div>
    </section>
```

- [x] **Step 3: Insert section 04 — key learnings** — replace the `<!-- 04 -->` marker with:

```html
    <!-- 04 KEY LEARNINGS -->
    <section id="s4">
      <div class="sec-head"><div class="sec-num">04</div><h2>Key learnings</h2></div>
      <div class="part">
        <div class="learn"><span class="dot"></span><p><b>.click()</b> proves the handler runs. It says nothing about what a tap hits.</p></div>
        <div class="learn"><span class="dot"></span><p><b>elementFromPoint</b> is the truth meter for invisible layers.</p></div>
        <div class="learn"><span class="dot"></span><p><b>hidden tabs</b> freeze computed styles — read them with care.</p></div>
        <div class="learn"><span class="dot"></span><p><b>delivery layers</b> — keys, clicks and the network can all lie to you.</p></div>
        <div class="learn"><span class="dot"></span><p><b>the user's device</b> is the final oracle.</p></div>
      </div>
    </section>
```

- [x] **Step 4: Insert section 05 — probes & tools** — replace the `<!-- 05 -->` marker with:

```html
    <!-- 05 PROBES & TOOLS -->
    <section id="s5">
      <div class="sec-head"><div class="sec-num">05</div><h2>Probes &amp; tools</h2></div>
      <div class="part">
        <div class="tools">
          <div class="tool"><span class="name">bctl</span><p>CDP controller — hit-tests and synthetic clicks (never a substitute for a real tap).</p></div>
          <div class="tool"><span class="name">elementFromPoint</span><p>the lie detector — what is actually on top.</p></div>
          <div class="tool"><span class="name">lens.py</span><p>overflow check, 320 → 1440.</p></div>
          <div class="tool"><span class="name">node --check</span><p>syntax gate for inline scripts.</p></div>
          <div class="tool"><span class="name">?v= cache-bust</span><p>never verify yesterday's page.</p></div>
        </div>
      </div>
    </section>
```

- [x] **Step 5: Update the TOC** — `#s1`…`#s5` entries with the lie sub-links:

```html
        <a href="#s1" class="l1"><span class="num">01</span>The five lies</a>
        <a href="#s1-lie1" class="l2">Lie 1 — the programmatic click</a>
        <a href="#s1-lie2" class="l2">Lie 2 — the off-screen probe</a>
        <a href="#s1-lie3" class="l2">Lie 3 — the frozen tab</a>
        <a href="#s1-lie4" class="l2">Lie 4 — the missing key</a>
        <a href="#s1-lie5" class="l2">Lie 5 — the stale page</a>
        <a href="#s2" class="l1"><span class="num">02</span>The one bug</a>
        <a href="#s2-symptom" class="l2">The symptom</a>
        <a href="#s2-lie" class="l2">The first lie in action</a>
        <a href="#s2-reveal" class="l2">The reveal</a>
        <a href="#s2-fix" class="l2">The fix</a>
        <a href="#s2-proof" class="l2">The proof</a>
        <a href="#s2-lesson" class="l2">The last lesson</a>
        <a href="#s3" class="l1"><span class="num">03</span>The method that doesn't lie</a>
        <a href="#s4" class="l1"><span class="num">04</span>Key learnings</a>
        <a href="#s5" class="l1"><span class="num">05</span>Probes &amp; tools</a>
```

- [x] **Step 6: Verify sections 02–05** — grep all section ids; zoom still opens; overflow clean.

```bash
grep -c 'id="s[1-5]"' probe/verification-lied.html   # expected: 5
grep -c 'id="s2-symptom"\|id="s2-lie"\|id="s2-reveal"\|id="s2-fix"\|id="s2-proof"\|id="s2-lesson"' probe/verification-lied.html   # expected: 6
python3 lens.py "verification-lied" --metrics-only   # no overflow 320→1440
```

---

### Task 5: Index entry, full verification, publish

**Files:**
- Modify: `probe/index.html` (STATS map, one line)
- Verify: `probe/verification-lied.html` end-to-end

**Interfaces:**
- Consumes: the finished page (Tasks 1–4).
- Produces: published report + index popup stats line; live-verified page.

- [x] **Step 1: Add the STATS map entry** — in `probe/index.html`, inside the `STATS` object (alphabetical, after `moodie-fix.html`):

```js
        'probe/verification-lied.html': '1 invisible modal · 5 lies · 0 caught by .click()',
```

- [x] **Step 2: Full local verification**

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/verification-lied.html"
# zoom opens and closes
bctl eval "var m=document.getElementById('zoomModal'); m.style.transition='none'; document.querySelector('#s1 .side').click(); document.title='zoom:'+m.classList.contains('open'); 'x'"; bctl title
# demo: layer off → button on top; layer on → layer on top
bctl eval "document.getElementById('demoBox').scrollIntoView({block:'center'}); 'x'"
bctl eval "document.title='off:'+document.getElementById('demoReadout').textContent; 'x'"; bctl title
bctl click "#demoToggle"
bctl eval "document.title='on:'+document.getElementById('demoReadout').textContent; 'x'"; bctl title
bctl click "#demoToggle"
bctl eval "document.title='off2:'+document.getElementById('demoReadout').textContent; 'x'"; bctl title
```

Expected: `zoom:true`; `off:` ends with the button; `on:` ends with the layer; `off2:` back to the button. Console: no errors.

- [x] **Step 3: Commit and push**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/verification-lied.html probe/index.html && git commit -m "probe: 'the verification lied' — five lies, one bug, the method that doesn't lie" && git push origin master
```

- [x] **Step 4: Wait ~85s, verify live**

```bash
sleep 85
bctl goto "https://nd28.github.io/probe/verification-lied.html?v=$(date +%s)"
```

Repeat Step 2's checks against the live URL; also verify the index card and popup stats:

```bash
bctl goto "https://nd28.github.io/probe/?v=$(date +%s)"
bctl eval "document.title='card:'+!!document.querySelector('.list li[data-file=\"probe/verification-lied.html\"]'); 'x'"; bctl title
```

Expected: `card:true`; clicking that card opens the popup showing the new stats line.

- [x] **Step 5: Final overflow + console pass on the live page**

```bash
bctl console   # no errors
```

---

## Self-Review Notes

- Spec coverage: shell/hero/stats (T1), five-lie catalog (T2), live demo (T3), case study + method + learnings + tools (T4), index STATS + publish (T5) — all spec sections covered, including the plain-English copy rules (applied verbatim in every content block above).
- Verification truth rules from the spec carried into every step: hit-tests as the truth meter, `bctl click` never called a "real tap", demo verified by `elementFromPoint` readouts, `transition:none` for style assertions in hidden tabs, `?v=` cache-bust on live checks.
- No placeholders: every content block contains the exact final copy and code; the only references are to the existing verified base file (`probe/microservices-rl-pwa.html`) which Task 1 copies.
- ID/name consistency: `#zoomModal/#zoomBackdrop/#zoomCard` (base plumbing), `#demoBox/#demoBtn/#demoToggle/#demoLayer/#demoReadout` (Task 3) — unique per page, no collisions with `.modal`/`.side` conventions. STATS key `'probe/verification-lied.html'` matches the card's `data-file` produced by the index's API listing.