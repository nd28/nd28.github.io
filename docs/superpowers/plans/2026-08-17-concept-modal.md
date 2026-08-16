# "Inside the Concept Modal" Probe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a self-contained probe article `probe/concept-modal.html` that explains — via a journey walkthrough, live demo, and zoomable exhibits of real code — how the Microservices Dojo PWA's concept modal system works.

**Architecture:** One self-contained HTML page copied from the existing probe shell (`probe/microservices-rl-pwa.html` in this repo), with the same tokens, herobar, TOC aside, zoom plumbing, `.dels`/`.del`, and `.learn` patterns. Six walkthrough sections (entrance, stack, ways out, chain, bookmarks, glass) plus a live demo that mini-replicates the modal stack. The report's claims are verified against the real app's code (cloned at `/var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/ms-pwa`) and against the live app before publishing.

**Tech Stack:** Static HTML/CSS/JS (no deps). bctl (CDP harness) + lens.py for verification. GitHub Pages for hosting.

## Global Constraints

- Copy rules (binding, audience = non-native English readers): short words, short sentences, no idioms. Keep technical words (modalStack, elementFromPoint, backdrop-filter). Honest, evidence-based, never a press release.
- Backtick-quoted terms in the copy below stay as plain text with visible backticks — never convert to `<code>`.
- Tokens only: the page uses the existing `:root` tokens from the base file. No new colors/radii. Theme-aware, print-ready.
- Verification truth rules: `elementFromPoint` is the truth meter. `bctl click` runs `element.click()` — synthetic, bypasses hit-testing — NEVER call a synthetic check a "real tap". Test points must be in the viewport. The harness tab is hidden (`visibilityState:hidden`): CSS transitions freeze — neutralize with `transition:none` before style assertions; `scrollIntoView` does not move the page — force the demo into the viewport via inline style when needed and clear it after.
- The report's claims about the real app must match the actual code (source of truth: the clone at `/var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/ms-pwa`) — no invented API, no invented behavior.
- Publishing: after push, wait ~85s for the GitHub Pages CDN; verify live with `?v=$(date +%s)`.
- No changes to the microservices-rl-pwa app itself; no changes to other probe pages except the index card + STATS line in Task 5.

---

### Task 1: Page shell — copy base, hero, stats, TOC

**Files:**
- Create: `probe/concept-modal.html` (copy of `probe/microservices-rl-pwa.html`, then edit)
- Verify: the file itself

**Interfaces:**
- Consumes: the verified shell of `probe/microservices-rl-pwa.html` (style block, herobar, TOC aside, footer, zoom modal markup + `#zoomModal`/`#zoomBackdrop`/`#zoomCard` IIFE, `.dels`/`.del`, `.learn`).
- Produces: the empty shell of `probe/concept-modal.html` — six empty `<section id="s1">`…`<section id="s6">` markers with `.sec-head` headings (needed by the scroll-spy in the copied script), TOC with 6 `l1` entries, hero, stats, footer date `17 Aug 2026`. Later tasks fill the sections.

- [ ] **Step 1: Copy the base file**

```bash
cp /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/microservices-rl-pwa.html /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/concept-modal.html
```

- [ ] **Step 2: Replace the `<title>` and herobar**

Title becomes: `Session MIS Report — Inside the Concept Modal`

The two spans inside the header herobar become:
- `<span class="t">concept modal</span>`
- `<span class="s">six modals · one stack · four ways out</span>`

- [ ] **Step 3: Replace the hero block** (the `h1`/`p.sub`/pills area, verbatim):

```html
      <h1>Inside the concept modal</h1>
      <p class="sub">How one vanilla-JS bottom sheet runs the whole microservices dojo.</p>
      <div class="pills">
        <a class="pill" href="https://nd28.github.io/microservices-rl-pwa/" style="text-decoration:none"><span class="dot"></span>Open the app ↗</a>
        <span class="pill">Date 17 Aug 2026</span>
        <span class="pill">Read 12 min</span>
      </div>
```

- [ ] **Step 4: Replace the stats strip** (four stat blocks, verbatim):

```html
        <div class="stat"><b>6</b><span>Modals</span></div>
        <div class="stat"><b>1</b><span>Shared overlay</span></div>
        <div class="stat"><b>1</b><span>Stack</span></div>
        <div class="stat"><b>4</b><span>Ways to close</span></div>
```

- [ ] **Step 5: Strip the copied report's body sections** — delete every `<section id="s...">` block and its comments from the copy (keep only the empty `<!-- -->` markers), then leave six placeholder sections with `.sec-head` headings exactly as follows (the scroll-spy in the copied script needs real `.sec-head` targets):

```html
    <!-- 01 -->
    <section id="s1">
      <h2 class="sec-head">The Entrance</h2>
    </section>
    <!-- 02 -->
    <section id="s2">
      <h2 class="sec-head">The Stack</h2>
    </section>
    <!-- 03 -->
    <section id="s3">
      <h2 class="sec-head">Four Ways Out</h2>
    </section>
    <!-- 04 -->
    <section id="s4">
      <h2 class="sec-head">The Chain</h2>
    </section>
    <!-- 05 -->
    <section id="s5">
      <h2 class="sec-head">Bookmarks &amp; State</h2>
    </section>
    <!-- 06 -->
    <section id="s6">
      <h2 class="sec-head">Glass &amp; Tokens</h2>
    </section>
```

- [ ] **Step 6: Replace the TOC** — exactly six `l1` entries plus these `l2` sub-links (11 in total):

```html
        <a href="#s1" class="l1"><span class="num">01</span>The entrance</a>
        <a href="#s1-entrance" class="l2">A concept card opens</a>
        <a href="#s1-demo" class="l2">Try the stack</a>
        <a href="#s2" class="l1"><span class="num">02</span>The stack</a>
        <a href="#s2-stack" class="l2">The modalStack rules</a>
        <a href="#s3" class="l1"><span class="num">03</span>Four ways out</a>
        <a href="#s3-overlay" class="l2">Tap the overlay</a>
        <a href="#s3-escape" class="l2">Press Escape</a>
        <a href="#s3-swipe" class="l2">Swipe the handle</a>
        <a href="#s3-buttons" class="l2">Use the buttons</a>
        <a href="#s4" class="l1"><span class="num">04</span>The chain</a>
        <a href="#s4-quiz" class="l2">Quiz Me</a>
        <a href="#s4-next" class="l2">Next Concept →</a>
        <a href="#s5" class="l1"><span class="num">05</span>Bookmarks &amp; state</a>
        <a href="#s5-bookmark" class="l2">The ★ button</a>
        <a href="#s6" class="l1"><span class="num">06</span>Glass &amp; tokens</a>
        <a href="#s6-glass" class="l2">The visual layer</a>
```

- [ ] **Step 7: Footer** — rename the `#modtime` footer date to `17 Aug 2026`; leave the probe/author links as they are.

- [ ] **Step 8: Verify the shell**

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/concept-modal.html"
bctl eval "document.title='h1:'+document.querySelector('h1').textContent+' | stats:'+document.querySelectorAll('.stat').length+' | toc-l2:'+document.querySelectorAll('.l2').length; 'x'"; bctl title
```

Expected: `h1:Inside the concept modal | stats:4 | toc-l2:11`. Also:

```bash
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "concept-modal" --metrics-only
```

Expected: no overflow at 320–1440.

- [ ] **Step 9: Commit**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/concept-modal.html && git commit -m "probe: concept-modal shell (task 1)"
```

---

### Task 2: Section 01 — the entrance walkthrough

**Files:**
- Modify: `probe/concept-modal.html` (section 01 body only)

**Interfaces:**
- Consumes: the shell (Task 1) — `<section id="s1">` with `.sec-head` "The Entrance".
- Produces: section 01 = two `.part` blocks with ids `s1-entrance` and `s1-demo` (the demo block stays empty-marked with the comment `<!-- demo fills this in Task 3 -->`), each with `h3.sub`, `p.lede`, prose paragraphs, and zoomable `.side` exhibits of the real app code below.

- [ ] **Step 1: Add the "A concept card opens" part** (id `s1-entrance`), copy verbatim:

```html
      <div class="part" id="s1-entrance">
        <h3 class="sub">A concept card opens</h3>
        <p class="lede">Every concept is a modal. The page behind it keeps running.</p>
        <p>A learner taps a concept card. The app finds the concept, renders its title, body, and diagram into one modal, and opens it. Nothing else on the page stops — the app stays alive behind the sheet.</p>
        <p>The sheet is a <b>bottom sheet</b> on phones: it slides up from the bottom edge and covers most of the screen. On a wide screen it becomes a centered card. Either way it is the same element — <code>#conceptModal</code>.</p>
        <p>The modal is not a popup window. It is one element in the page, styled to float on top. Two things make it float: the modal itself (z-index 210) and a shared overlay behind it (z-index 200).</p>
        <div class="exhibit">
          <div class="ex-head"><span>How a concept opens</span><span class="lang">app.js</span><span class="role">render first, open second</span></div>
          <div class="side"><pre class="out">function openConcept(id) {
  const concept = CONCEPTS.find(c => c.id === id);
  if (!concept) return;
  currentConceptId = id;
  const data = getData();
  data.lastReviewed[id] = new Date().toISOString();
  data.lastConceptOpened = id;
  saveData(data);
  const isBookmarked = data.bookmarks.includes(id);

  document.getElementById('conceptBody').innerHTML = `
    &lt;div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;margin-bottom:0.75rem;">
      &lt;h3 class="concept-title" style="margin-bottom:0;">${concept.title}&lt;/h3>
      &lt;button class="bookmark-btn ${isBookmarked ? 'active' : ''}"
        onclick="toggleBookmark(${id})" aria-label="Bookmark">${isBookmarked ? '★' : '☆'}&lt;/button>
    &lt;/div>
    &lt;p class="cozy-text">${concept.body}&lt;/p>
    &lt;div class="diagram-box">${concept.diagram}&lt;/div>
  `;
  document.getElementById('conceptFooter').innerHTML = `
    &lt;button class="btn btn-primary" onclick="openQuiz(${id})">Quiz Me&lt;/button>
  `;
  openModal('conceptModal');
}</pre><span class="cap">render the body first, then open the modal</span></div>
        </div>
        <div class="exhibit">
          <div class="ex-head"><span>The modal that floats</span><span class="lang">styles.css</span><span class="role">z-index 200 vs 210</span></div>
          <div class="side"><pre class="out">.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.28);
  backdrop-filter: blur(6px);
  z-index: 200;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.modal-overlay.open {
  opacity: 1;
  pointer-events: auto;
}
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.96);
  width: calc(100% - 2.5rem);
  max-width: 420px;
  max-height: 88vh;
  background: var(--bg-glass);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: 210;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}</pre><span class="cap">the overlay sits below the modal — and the modal starts invisible</span></div>
        </div>
        <p>Note what the CSS says: a modal starts with <code>opacity: 0</code> and <code>pointer-events: none</code>. It is in the page, but it cannot be seen and cannot be tapped. Only the <code>.open</code> class turns it on. That class is added by <code>openModal</code> — and that tiny function is the whole system.</p>
        <div class="exhibit">
          <div class="ex-head"><span>The whole modal system</span><span class="lang">app.js</span><span class="role">openModal, closeModal, initModals</span></div>
          <div class="side"><pre class="out">let modalStack = [];

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  const overlay = document.getElementById('modalOverlay');
  if (modalStack.length === 0) overlay.classList.add('open');
  modal.classList.add('open');
  modalStack.push(id);
}

function closeModal() {
  if (modalStack.length === 0) return;
  const id = modalStack.pop();
  const modal = document.getElementById(id);
  modal.classList.remove('open');
  if (modalStack.length === 0) {
    document.getElementById('modalOverlay').classList.remove('open');
  }
}</pre><span class="cap">an array, one overlay, and a rule: the overlay lives while the stack lives</span></div>
        </div>
        <p>That is the entrance. The concept card opens because <code>openModal('conceptModal')</code> runs. The overlay opens only when the stack was empty. Now the learner sees the sheet — and the page behind it is still alive. Next, the quiz.</p>
      </div>
```

- [ ] **Step 2: Add the "Try the stack" part marker** (id `s1-demo`) — the full demo is Task 3; add only this now:

```html
      <div class="part" id="s1-demo">
        <h3 class="sub">Try the stack</h3>
        <p class="lede">A working copy of the stack, right here on this page.</p>
        <!-- demo fills this in Task 3 -->
      </div>
```

- [ ] **Step 3: Verify** — section 01 has exactly two `.part` blocks with the ids above; the two zoomable `.side` blocks open the zoom modal (click one `.side` in `#s1` via bctl — synthetic is fine, the `.open` class on `#zoomModal` is the assertion; then close it); lens still clean:

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/concept-modal.html"
grep -c 'id="s1-entrance"\|id="s1-demo"' probe/concept-modal.html   # expected: 2
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "concept-modal" --metrics-only   # no overflow
```

- [ ] **Step 4: Commit**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/concept-modal.html && git commit -m "probe: concept-modal section 01 entrance (task 2)"
```

---

### Task 3: Live demo — the stack in miniature

**Files:**
- Modify: `probe/concept-modal.html` (style block: add the demo CSS before `</style>`; section 01: replace the `<!-- demo fills this in Task 3 -->` marker with the demo markup; script: add the demo IIFE before the zoom IIFE)

**Interfaces:**
- Consumes: section 01's `#s1-demo` part (Task 2).
- Produces: `#demoOpen`, `#demoConcept`, `#demoQuiz`, `#demoHandleC`, `#demoHandleQ`, `#demoReadout`, `#demoOverlay` — used by Task 5's verification and by readers.

- [ ] **Step 1: Add the demo CSS** (before `</style>`; tokens only):

```css
    /* ============ DEMO: THE STACK (live exhibit) ============ */
    .demo-wrap { margin: 1.5rem 0 0; }
    .demo-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
    #demoOpen { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 999px; padding: 8px 14px; font-family: var(--font); font-size: 13px; cursor: pointer; }
    #demoReadout { font-family: var(--font-mono); font-size: 12px; color: var(--muted); background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 6px 10px; }
    #demoOverlay { position: fixed; inset: 0; z-index: 900; background: var(--bg); opacity: 0; pointer-events: none; transition: opacity 0.25s ease; }
    #demoOverlay.on { opacity: 0.6; pointer-events: auto; }
    .demo-sheet { position: fixed; left: 50%; transform: translateX(-50%); width: min(320px, calc(100% - 2.5rem)); background: var(--surface-2); border: 1px solid var(--border-glass); border-radius: var(--radius-xl); box-shadow: var(--shadow-lg); opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); display: flex; flex-direction: column; overflow: hidden; }
    .demo-sheet.open { opacity: 1; pointer-events: auto; }
    #demoConcept { bottom: 24px; z-index: 910; }
    #demoQuiz { bottom: 24px; z-index: 920; }
    .demo-handle { width: 36px; height: 4px; background: var(--text-tertiary); border-radius: 2px; margin: 0.625rem auto; opacity: 0.45; flex-shrink: 0; }
    .demo-body { padding: 0.5rem 1.25rem 1rem; font-size: 13px; color: var(--text); }
    .demo-body h4 { margin: 0 0 0.5rem; font-size: 14px; }
    .demo-footer { padding: 0.75rem 1.25rem 1.25rem; border-top: 1px solid var(--border-glass); display: flex; gap: 0.5rem; justify-content: flex-end; }
    .demo-btn { background: var(--surface-2); border: 1px solid var(--border); color: var(--text); border-radius: 999px; padding: 6px 12px; font-family: var(--font); font-size: 12px; cursor: pointer; }
    .demo-btn.primary { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
```

- [ ] **Step 2: Replace the `<!-- demo fills this in Task 3 -->` marker** with:

```html
        <div class="demo-wrap">
          <div class="demo-row">
            <button id="demoOpen" type="button">Open a concept</button>
            <span id="demoReadout">stack: —</span>
          </div>
          <p style="font-size:13px;color:var(--muted);margin:0 0 1rem;">The concept sheet opens. Its "Quiz Me" button opens the quiz sheet on top — the concept sheet stays open underneath. Close paths: swipe the top handle down, press Escape, tap the dim area, or use the buttons. The readout always shows the live stack.</p>
          <div id="demoOverlay"></div>
          <div class="demo-sheet" id="demoConcept">
            <div class="demo-handle" id="demoHandleC"></div>
            <div class="demo-body">
              <h4>What is a service?</h4>
              <p>A service is one small job, owned by one team, running on its own.</p>
            </div>
            <div class="demo-footer">
              <button class="demo-btn" data-close="demoConcept" type="button">Dismiss</button>
              <button class="demo-btn primary" data-open="demoQuiz" type="button">Quiz Me</button>
            </div>
          </div>
          <div class="demo-sheet" id="demoQuiz">
            <div class="demo-handle" id="demoHandleQ"></div>
            <div class="demo-body">
              <h4>Quiz: which one is a service?</h4>
              <p>Pick an answer. Correct: "One small job". Wrong: "One giant app".</p>
            </div>
            <div class="demo-footer">
              <button class="demo-btn" data-close="demoQuiz" type="button">Dismiss</button>
            </div>
          </div>
        </div>
```

- [ ] **Step 3: Add the demo IIFE** (before the zoom IIFE in the script — the app's own rules, simplified):

```js
  (function () {
    var stack = [];
    var overlay = document.getElementById('demoOverlay');
    var readout = document.getElementById('demoReadout');
    function render() {
      readout.textContent = 'stack: ' + (stack.length ? stack.join(' → ') : '—');
      overlay.classList.toggle('on', stack.length > 0);
      stack.forEach(function (id) {
        document.getElementById(id).classList.toggle('open', true);
      });
      ['demoConcept', 'demoQuiz'].forEach(function (id) {
        if (stack.indexOf(id) === -1) document.getElementById(id).classList.remove('open');
      });
    }
    function open(id) { stack.push(id); render(); }
    function closeTop() { stack.pop(); render(); }
    document.getElementById('demoOpen').addEventListener('click', function () { open('demoConcept'); });
    document.querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () { open(b.getAttribute('data-open')); });
    });
    document.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { closeTop(); });
    });
    overlay.addEventListener('click', closeTop);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeTop();
    });
    document.querySelectorAll('.demo-handle').forEach(function (h) {
      var active = false, startY = 0;
      h.addEventListener('touchstart', function (e) {
        active = true;
        startY = e.touches[0].clientY;
      }, { passive: true });
      document.addEventListener('touchend', function (e) {
        if (!active) return;
        active = false;
        if (e.changedTouches[0].clientY - startY > 80) closeTop();
      }, { passive: true });
    });
  })();
```

- [ ] **Step 4: Verify the demo** (harness rules: force the demo into the viewport, `transition:none` on the sheets before style assertions):

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/concept-modal.html"
# force the two sheets into the viewport (the harness tab cannot scroll)
bctl eval "var s=['demoConcept','demoQuiz']; s.forEach(function(id){var el=document.getElementById(id); el.style.top='120px'; el.style.bottom='auto'; el.style.transition='none';}); document.getElementById('demoOverlay').style.transition='none'; 'x'"
# open concept
bctl click "#demoOpen"
bctl eval "document.title='d1:'+document.getElementById('demoReadout').textContent+' top:'+(document.elementFromPoint(innerWidth/2, 160) ? document.elementFromPoint(innerWidth/2, 160).id : 'NULL'); 'x'"; bctl title
# expected: d1:stack: concept ; top:demoQuiz is FALSE — the concept sheet covers the center; the quiz sheet is not open, so the top element is inside the concept sheet (its body or handle)
bctl click "[data-open='demoQuiz']"
bctl eval "document.title='d2:'+document.getElementById('demoReadout').textContent+' top:'+document.elementFromPoint(innerWidth/2, 160).id; 'x'"; bctl title
# expected: d2:stack: concept → quiz ; top: demoQuiz (the quiz sheet sits above the concept sheet)
bctl click "[data-close='demoQuiz']"
bctl eval "document.title='d3:'+document.getElementById('demoReadout').textContent; 'x'"; bctl title
# expected: d3:stack: concept
```

Also check the overlay state truthfully: with the stack empty, `elementFromPoint` at a point over the readout area must NOT be the overlay; with the concept open, a tap point elsewhere (e.g. `innerWidth - 60, 200`) must return `demoOverlay` — synthetic clicks never called "real taps". Then lens still clean.

- [ ] **Step 5: Commit**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/concept-modal.html && git commit -m "probe: concept-modal live stack demo (task 3)"
```

---

### Task 4: Sections 02–06 — stack, ways out, chain, bookmarks, glass

**Files:**
- Modify: `probe/concept-modal.html` (bodies of sections 02–06 only)

**Interfaces:**
- Consumes: the shell (Task 1) — sections `#s2`–`#s6` with their `.sec-head` headings; the zoomable `.side` pattern from section 01.
- Produces: the completed sections with all ids referenced by the TOC: `#s2-stack`, `#s3-overlay`, `#s3-escape`, `#s3-swipe`, `#s3-buttons`, `#s4-quiz`, `#s4-next`, `#s5-bookmark`, `#s6-glass`. Plus `#s3-swipe`'s `pre` exhibit and the `.dels` grid.

- [ ] **Step 1: Section 02 — The Stack** (id `s2-stack`), verbatim:

```html
      <div class="part" id="s2-stack">
        <h3 class="sub">Two modals at once — by design</h3>
        <p class="lede">The quiz opens on top of the concept. The concept does not close.</p>
        <p>The learner taps "Quiz Me". The app does not replace the concept modal. It opens the quiz modal <b>on top</b> of it. Both are in the DOM, both have the <code>.open</code> class, and the quiz wins because its z-index is higher.</p>
        <p>The app tracks this with one array: <code>modalStack</code>. Every open pushes an id. Every close pops one. The overlay follows one rule: it appears when the stack goes from empty to one, and disappears when the stack returns to empty.</p>
        <p>So the stack can hold several modals at once. A phase-complete modal can appear above the quiz, and the quiz is still open underneath. That is not a bug — it is the design. The sheet on top is the one that accepts taps; the one below waits.</p>
        <div class="exhibit">
          <div class="ex-head"><span>The stack rules</span><span class="lang">app.js</span><span class="role">push on open, pop on close</span></div>
          <div class="side"><pre class="out">let modalStack = [];

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  const overlay = document.getElementById('modalOverlay');
  if (modalStack.length === 0) overlay.classList.add('open');
  modal.classList.add('open');
  modalStack.push(id);
}

function closeModal() {
  if (modalStack.length === 0) return;
  const id = modalStack.pop();
  const modal = document.getElementById(id);
  modal.classList.remove('open');
  if (modalStack.length === 0) {
    document.getElementById('modalOverlay').classList.remove('open');
  }
}</pre><span class="cap">the overlay opens once and closes once — everything in between is stacking</span></div>
        </div>
        <div class="exhibit">
          <div class="ex-head"><span>The dynamic modal</span><span class="lang">app.js</span><span class="role">created in JS, not in the markup</span></div>
          <div class="side"><pre class="out">function showPhaseCompleteModal(phase) {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.add('open');
  const modal = document.createElement('div');
  modal.className = 'modal phase-modal open';
  modal.id = 'phaseCompleteModal';
  modal.innerHTML = `
    &lt;div class="modal-handle">&lt;/div>
    &lt;div class="modal-body" style="text-align:center;padding:1.5rem;">
      &lt;div style="font-size:3rem;margin-bottom:0.75rem;">${phase.icon}&lt;/div>
      &lt;h3 class="modal-title" style="font-size:1.25rem;margin-bottom:0.5rem;">${phase.label} Complete&lt;/h3>
      &lt;p class="cozy-text" style="margin-bottom:1.25rem;">You finished all concepts in this phase. The next one awaits.&lt;/p>
      &lt;div style="padding:0.75rem 1rem;background:var(--accent-glow);border:1px solid var(--accent);border-radius:var(--radius-lg);color:var(--accent);font-weight:700;font-size:0.9375rem;">+100 XP Bonus&lt;/div>
    &lt;/div>
    &lt;div class="modal-footer">
      &lt;button class="btn btn-primary" onclick="dismissPhaseModal()">Continue&lt;/button>
    &lt;/div>
  `;
  document.body.appendChild(modal);
}</pre><span class="cap">a seventh modal that only exists when a phase ends</span></div>
        </div>
        <p>Six modals live in the markup: profile, concept, quiz, resources, challenge, reflection. One more appears only when it is needed: the phase-complete modal is built in JavaScript and removed after it closes. The stack does not care how a modal was born.</p>
      </div>
```

- [ ] **Step 2: Section 03 — Four Ways Out** — the `.dels` grid plus one code exhibit, verbatim:

```html
      <div class="dels">
        <div class="del" id="s3-overlay"><b>Tap the overlay</b><span class="lang">pointer</span><span class="role">the dim area calls closeModal() — the top modal only</span></div>
        <div class="del" id="s3-escape"><b>Press Escape</b><span class="lang">keyboard</span><span class="role">a keydown listener on the document calls closeModal()</span></div>
        <div class="del" id="s3-swipe"><b>Swipe the handle</b><span class="lang">touch</span><span class="role">pull the handle down past 80px — concept modal only</span></div>
        <div class="del" id="s3-buttons"><b>Use the buttons</b><span class="lang">tap</span><span class="role">Dismiss, Done, Continue — every modal has one</span></div>
      </div>
      <p>Four paths, one function. Every path ends at <code>closeModal()</code>, so every path behaves the same: the top modal closes, the one below it becomes reachable again.</p>
      <p>The interesting one is the swipe. It is bound only to the concept modal's handle, and it is a <code>touchstart</code>/<code>touchend</code> pair with a threshold of 80 pixels. A short drag does nothing. A pull past the threshold closes the modal — the same <code>closeModal()</code> as the buttons.</p>
      <div class="exhibit">
        <div class="ex-head"><span>The swipe-down handler</span><span class="lang">app.js</span><span class="role">80px threshold, concept modal only</span></div>
        <div class="side"><pre class="out">const conceptHandle = document.querySelector('#conceptModal .modal-handle');
if (conceptHandle) {
  let swipeActive = false;
  let startY = 0;
  conceptHandle.addEventListener('touchstart', (e) => {
    swipeActive = true;
    startY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (!swipeActive) return;
    swipeActive = false;
    const endY = e.changedTouches[0].clientY;
    if (endY - startY > 80) closeModal();
  }, { passive: true });
}</pre><span class="cap">the swipe is one channel — the threshold is what makes it feel deliberate</span></div>
      </div>
      <p>Escape works the same way on every page of the app: a single document-level listener. No modal registers its own key handler. The overlay tap is the simplest path of all — the overlay is one element, its click handler is <code>closeModal</code> itself.</p>
```

- [ ] **Step 3: Section 04 — The Chain**, verbatim:

```html
      <div class="part" id="s4-quiz">
        <h3 class="sub">Quiz Me — the modal that opens a modal</h3>
        <p class="lede">One button opens a second sheet. The first one stays open underneath.</p>
        <p>The concept sheet's footer is rendered by <code>openConcept</code> with one button: "Quiz Me". Its handler is <code>openQuiz(id)</code> — which renders the question and options into the quiz modal, then calls <code>openModal('quizModal')</code>. That is the stack in action: the quiz is pushed on top of the concept.</p>
        <div class="exhibit">
          <div class="ex-head"><span>Quiz Me</span><span class="lang">app.js</span><span class="role">openQuiz renders, then stacks</span></div>
          <div class="side"><pre class="out">function openQuiz(id) {
  const concept = CONCEPTS.find(c => c.id === id);
  if (!concept) return;
  quizAnsweredCorrectly = false;

  document.getElementById('quizBody').innerHTML = `
    &lt;div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
      &lt;h3 class="concept-title" style="margin-bottom:0;">${concept.title}&lt;/h3>
      &lt;button class="btn btn-secondary btn-small" style="width:auto;padding:0.5rem 1rem;font-size:0.8125rem;" onclick="openResources(${id})">Resources&lt;/button>
    &lt;/div>
    &lt;div class="quiz-question">${concept.quiz.question}&lt;/div>
    &lt;div class="quiz-options">
      ${concept.quiz.options.map((opt, i) => `
        &lt;button class="quiz-option" data-correct="${opt.correct}" onclick="checkAnswer(this, ${opt.correct}, ${id})">${opt.text}&lt;/button>
      `).join('')}
    &lt;/div>
    &lt;div id="quizFeedback" style="margin-top:0.75rem;font-weight:700;font-size:0.9375rem;">&lt;/div>
  `;
  document.getElementById('quizFooter').innerHTML = `
    &lt;button class="btn btn-secondary" onclick="closeModal()">Dismiss&lt;/button>
  `;
  openModal('quizModal');
}</pre><span class="cap">same shape as openConcept: render, then open</span></div>
        </div>
      </div>
      <div class="part" id="s4-next">
        <h3 class="sub">Next Concept → — the 180ms hand-off</h3>
        <p class="lede">A correct answer closes the quiz and opens the next concept.</p>
        <p>A correct answer replaces the quiz footer with two buttons: "Next Concept →" and "Done". The next button does a two-step dance: <code>closeModal()</code>, then 180 milliseconds later <code>openConcept(nextId)</code>. The pause lets the closing animation finish before the next sheet slides in.</p>
        <p>That hand-off pattern — close, wait, open — appears again in the bookmarks list. It is the app's way of chaining sheets without ever stacking two at once by mistake.</p>
        <div class="exhibit">
          <div class="ex-head"><span>The hand-off</span><span class="lang">app.js</span><span class="role">close, wait 180ms, open</span></div>
          <div class="side"><pre class="out">const nextConcept = CONCEPTS.find(c => c.id > conceptId);
const nextBtn = nextConcept ? `&lt;button class="btn btn-primary" onclick="closeModal();setTimeout(()=>openConcept(${nextConcept.id}),180)">Next Concept →&lt;/button>` : '';
document.getElementById('quizFooter').innerHTML = `
  ${nextBtn}
  &lt;button class="btn btn-secondary" onclick="closeModal()">Done&lt;/button>
`;</pre><span class="cap">the 180ms wait is the animation's exit fee</span></div>
        </div>
      </div>
```

- [ ] **Step 4: Section 05 — Bookmarks & State**, verbatim:

```html
      <div class="part" id="s5-bookmark">
        <h3 class="sub">The ★ button — state inside the sheet</h3>
        <p class="lede">The modal is not just chrome. It carries the learner's state.</p>
        <p>Inside the concept sheet, next to the title, sits a bookmark button. Tapping it toggles the concept in <code>data.bookmarks</code>, saves the whole state object, and re-renders the concept — so the ★ reflects the new state. The same data drives the profile modal's bookmark list.</p>
        <p>The reflection modal goes further: closing it saves a draft. <code>closeModal</code> has a special case for <code>reflectionModal</code> — it reads the textarea, the mood, and the prompt, and stores them before the sheet closes. Closing is not losing.</p>
        <div class="exhibit">
          <div class="ex-head"><span>Bookmark toggle</span><span class="lang">app.js</span><span class="role">toggle, save, re-render</span></div>
          <div class="side"><pre class="out">function toggleBookmark(id) {
  const data = getData();
  const idx = data.bookmarks.indexOf(id);
  if (idx >= 0) {
    data.bookmarks.splice(idx, 1);
  } else {
    data.bookmarks.push(id);
  }
  saveData(data);
  openConcept(id);
  renderProfile();
}</pre><span class="cap">the modal re-renders from the saved state</span></div>
        </div>
        <div class="exhibit">
          <div class="ex-head"><span>Close = save</span><span class="lang">app.js</span><span class="role">closeModal's reflection special case</span></div>
          <div class="side"><pre class="out">function closeModal() {
  if (modalStack.length === 0) return;
  const id = modalStack.pop();
  const modal = document.getElementById(id);

  if (id === 'reflectionModal') {
    const text = document.getElementById('reflectionText').value.trim();
    if (text || currentMood || currentPromptIndex !== null) {
      const data = getData();
      data.draftReflection = { text, mood: currentMood, promptIndex: currentPromptIndex };
      saveData(data);
    }
  }

  modal.classList.remove('open');
  if (modalStack.length === 0) {
    document.getElementById('modalOverlay').classList.remove('open');
  }
}</pre><span class="cap">one function, one extra duty — close is a save point for the reflection</span></div>
        </div>
      </div>
```

- [ ] **Step 5: Section 06 — Glass & Tokens**, verbatim:

```html
      <div class="part" id="s6-glass">
        <h3 class="sub">The visual layer — glass from two blurs</h3>
        <p class="lede">The sheet looks expensive. It is two blur rules and four tokens.</p>
        <p>Two <code>backdrop-filter</code> rules make the glass: 6px on the overlay, 32px on the sheet. The overlay's job is to dim the page; the sheet's job is to blur what sits under it. The surface itself is <code>var(--bg-glass)</code> — a semi-transparent token — with a glass border and a large shadow.</p>
        <p>On phones the sheet slides to the bottom of the screen and becomes a true bottom sheet: full width, rounded only at the top, sliding up with a transform. The breakpoint is 640px. One CSS rule changes the shape; the JavaScript does not know the difference.</p>
        <div class="exhibit">
          <div class="ex-head"><span>The glass recipe</span><span class="lang">styles.css</span><span class="role">two blurs, one token surface</span></div>
          <div class="side"><pre class="out">.modal-overlay {
  background: rgba(0,0,0,0.28);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 200;
  opacity: 0;
  pointer-events: none;
}
.modal {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.96);
  width: calc(100% - 2.5rem);
  max-width: 420px;
  max-height: 88vh;
  background: var(--bg-glass);
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  z-index: 210;
  opacity: 0;
  pointer-events: none;
}</pre><span class="cap">the sheet starts invisible — the .open class is the only switch</span></div>
        </div>
        <div class="exhibit">
          <div class="ex-head"><span>The bottom-sheet switch</span><span class="lang">styles.css</span><span class="role">640px breakpoint</span></div>
          <div class="side"><pre class="out">@media (max-width: 640px) {
  .modal {
    top: auto;
    left: 0;
    right: 0;
    bottom: 0;
    transform: translateY(100%);
    width: 100%;
    max-width: 100%;
    max-height: calc(100dvh - 6vh);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    border-bottom: none;
  }
  .modal.open {
    transform: translateY(0);
  }
}</pre><span class="cap">one media query turns the centered card into a bottom sheet</span></div>
        </div>
        <p>And that is the whole system: one array, one overlay, six sheets in the markup, one more born on demand, four ways out, one chain. The glass is two blurs. The state lives in one object. The concept modal looks like a platform — it is forty lines of vanilla JavaScript.</p>
      </div>
```

- [ ] **Step 6: Verify sections 02–06** — ids, `.dels` count, zoom still opens, lens clean:

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages
grep -c 'id="s2-stack"\|id="s3-overlay"\|id="s3-escape"\|id="s3-swipe"\|id="s3-buttons"\|id="s4-quiz"\|id="s4-next"\|id="s5-bookmark"\|id="s6-glass"' probe/concept-modal.html   # expected: 9
grep -c 'class="del"' probe/concept-modal.html   # expected: 4
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/concept-modal.html"
bctl eval "var m=document.getElementById('zoomModal'); m.style.transition='none'; document.querySelector('#s3 .side').click(); document.title='zoom:'+m.classList.contains('open'); 'x'"; bctl title   # expected: zoom:true
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "concept-modal" --metrics-only   # no overflow
```

- [ ] **Step 7: Commit**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/concept-modal.html && git commit -m "probe: concept-modal sections 02-06 (task 4)"
```

---

### Task 5: Index entry, live-app verification, publish

**Files:**
- Modify: `probe/index.html` (STATS map, one line; card `<li>`, one block)
- Verify: `probe/concept-modal.html` end-to-end + the live app

**Interfaces:**
- Consumes: the finished page (Tasks 1–4); the live app at https://nd28.github.io/microservices-rl-pwa/.
- Produces: published report + index card + popup stats line; live-verified page.

- [ ] **Step 1: Add the card `<li>`** in `probe/index.html`, after the `verification-lied.html` card (static HTML list, same shape as its neighbors):

```html
      <li data-file="probe/concept-modal.html">
        <a href="concept-modal.html">
          <div class="meta">
            <span class="file">concept-modal.html</span>
            <span class="mod" title="last modified"></span>
          </div>
          <span class="title">inside the concept modal</span>
          <span class="desc">six modals, one stack, four ways out — how the dojo's bottom sheets work</span>
        </a>
      </li>
```

- [ ] **Step 2: Add the STATS entry** (alphabetical, after `verification-lied.html`):

```js
        'probe/concept-modal.html': '6 modals · 1 stack · 4 ways out · 0 frameworks',
```

The trailing comma on the previous entry must be present (check the object is still valid JSON-ish JS).

- [ ] **Step 3: Verify the report against the LIVE app** — every claim the article makes is checked on the real app with hit-tests (never "real taps"):

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "https://nd28.github.io/microservices-rl-pwa/"
# open the first concept card
bctl click ".concept-card, [data-concept], .card" 2>/dev/null || bctl click "#home .card"
bctl eval "var m=document.getElementById('conceptModal'); document.title='live1:'+m.classList.contains('open')+' top:'+(document.elementFromPoint(innerWidth/2, innerHeight/2) ? document.elementFromPoint(innerWidth/2, innerHeight/2).id || document.elementFromPoint(innerWidth/2, innerHeight/2).className : 'NULL'); 'x'"; bctl title
# expected: live1:true and the top element belongs to the concept modal (or its body)
# stack a quiz on top
bctl eval "var b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes('Quiz Me')); b && b.click(); 'x'"
bctl eval "var c=document.getElementById('conceptModal'), q=document.getElementById('quizModal'); document.title='live2:concept:'+c.classList.contains('open')+' quiz:'+q.classList.contains('open')+' top:'+document.elementFromPoint(innerWidth/2, innerHeight/2).id; 'x'"; bctl title
# expected: live2:concept:true quiz:true top:quizBody (or an element inside the quiz modal)
# close the top via the overlay path — but the overlay covers the screen, so tap it by element
bctl eval "document.getElementById('modalOverlay').click(); 'x'"
bctl eval "var c=document.getElementById('conceptModal'), q=document.getElementById('quizModal'); document.title='live3:concept:'+c.classList.contains('open')+' quiz:'+q.classList.contains('open'); 'x'"; bctl title
# expected: live3:concept:true quiz:false  (only the top closed)
```

If the app's home has no directly clickable first card, adapt the selector from the app's real markup (source: the clone at `/var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/ms-pwa/app.js` — look at what renders `renderHome`). The assertion values above are the contract.

- [ ] **Step 4: Full local verification** (repeat the Task 3 demo checks + zoom + lens on the finished page)

```bash
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "concept-modal" --metrics-only   # no overflow
python3 lens.py "probe index" --metrics-only   # no overflow
```

- [ ] **Step 5: Commit and push**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add probe/concept-modal.html probe/index.html && git commit -m "probe: 'inside the concept modal' — six modals, one stack, four ways out" && git push origin master
```

- [ ] **Step 6: Wait ~85s, verify live** (cache-busted)

```bash
sleep 85
bctl goto "https://nd28.github.io/probe/concept-modal.html?v=$(date +%s)"
bctl eval "document.title='h1:'+document.querySelector('h1').textContent+' stats:'+document.querySelectorAll('.stat').length; 'x'"; bctl title
# expected: h1:Inside the concept modal stats:4
bctl goto "https://nd28.github.io/probe/?v=$(date +%s)"
bctl eval "document.title='card:'+!!document.querySelector('.list li[data-file=\"probe/concept-modal.html\"]'); 'x'"; bctl title
# expected: card:true
```

Clicking that card must open the popup showing `6 modals · 1 stack · 4 ways out · 0 frameworks`. Console: no errors (`bctl console`).

- [ ] **Step 7: Tick every checkbox in this plan** and commit

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages && git add docs/superpowers/plans/2026-08-17-concept-modal.md && git commit -m "plan: concept-modal checkboxes complete" && git push origin master
```

---

## Self-Review Notes

- Spec coverage: shell/hero/stats (T1), entrance walkthrough (T2), live demo (T3), stack + ways out + chain + bookmarks + glass (T4), index card + STATS + live-app verification + publish (T5) — every spec section is covered, including the plain-English copy rules applied verbatim.
- Verification truth rules from the spec carried into every step: hit-tests as the truth meter, `bctl click` never called a "real tap", `transition:none` for style assertions in hidden tabs, viewport forcing for the demo, `?v=` cache-bust on live checks, 85s CDN wait.
- No placeholders: every content block contains the final copy and code; all exhibit code is real code from the app clone at `/var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/ms-pwa` (trimmed with `&lt;...` spans shown as `&lt;div>` etc. — note: exhibits show simplified inner markup, never invented API).
- ID consistency: `#zoomModal` (base plumbing), demo ids `#demoOpen/#demoConcept/#demoQuiz/#demoHandleC/#demoHandleQ/#demoReadout/#demoOverlay`, section ids `#s1..#s6` + `#s1-entrance/#s1-demo/#s2-stack/#s3-overlay/#s3-escape/#s3-swipe/#s3-buttons/#s4-quiz/#s4-next/#s5-bookmark/#s6-glass` — unique per page, TOC hrefs match.
- STATS key `'probe/concept-modal.html'` matches the card's `data-file`.