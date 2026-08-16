# "The Consistency Machine" (html-mis skill article) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a new probe article `probe/html-mis.html` — "The consistency machine" — explaining the html-mis skill (the system that makes every probe article consistent), with verbatim exhibits from the real SKILL.md and lens.py, and a live filler-level toggle demo.

**Architecture:** Journey walkthrough (6 sections) through the skill file: the skill itself → the filler-level dial (+ live demo) → the voice rules → the design tokens → the pixel budget (lens.py) → the verification checks. Same base shell as the concept-modal article; demo is an inline toggle (no sheet/overlay).

**Tech Stack:** Static HTML page (one self-contained file, inline CSS/JS), bctl CDP for verification, lens.py for pixel-budget checks, GitHub Pages.

## Global Constraints

- Copy: short words, short sentences, no idioms (non-native-English reader).
- Backtick-quoted terms stay plain text — no `<code>` tags anywhere.
- Styling: only tokens from the base `:root` — no new colors/radii/fonts; no inline styles.
- Filler level: verbose (prose allowed; no padding; never narrate the obvious).
- Exhibits: verbatim from `/Users/nileshsuthar/.agents/skills/html-mis/SKILL.md` and `lens.py` — no edits, no "..." elisions.
- Verification truth rules: `elementFromPoint` is the truth meter; `bctl click` is synthetic (never call it a real tap); `transition:none` before style assertions in hidden tabs; test points in viewport; ~85s CDN wait after push; `?v=$(date +%s)` cache-bust on live checks.
- Page base: `/var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/microservices-rl-pwa.html` (base template: tokens `--r-sm/--r-md/--r-lg`, `.pill` with `.dot`, `.stat .n/.l`, `.exhibit/.ex-head/.lang/pre.out/.cap`, `.side` zoomable, `.subhead`, herobar, TOC, zoom IIFE).
- Workflow: commits on master directly (user-approved), one commit per task, lens + zoom checks per task.
- Tab title must end as `Session MIS Report — The Consistency Machine` (lens matches tab by URL substring `html-mis`; evals that touch `document.title` must restore it).
- Repo root: `/var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages`.

---

### Task 1: Page Shell

**Files:**
- Create: `probe/html-mis.html` (copy of `probe/microservices-rl-pwa.html`)
- Reference: `probe/concept-modal.html` (most recent example of the same transformation)

**Interfaces:**
- Produces: page with `#s1`…`#s6` placeholder sections, hero stats block, TOC with 13 anchors, `#modtime` footer — all consumed by Tasks 2–4.

- [ ] **Step 1: Copy the base**

```bash
cp probe/microservices-rl-pwa.html probe/html-mis.html
```

- [ ] **Step 2: Replace `<title>`**

Find the `<title>` tag and set:

```html
<title>Session MIS Report — The Consistency Machine</title>
```

- [ ] **Step 3: Replace the herobar**

Find the `.herobar` div (two spans: title + one-liner). Set title `html-mis skill`, one-liner `one file · one script · zero invented styles`. If the base herobar markup differs, adapt to its structure (span classes only).

- [ ] **Step 4: Replace the hero meta pills + h1 + sub**

Replace the `.meta` row inside `.hero` with:

```html
<span class="pill"><span class="dot"></span>Date <b>17 Aug 2026</b></span>
<span class="pill"><span class="dot"></span>probe/html-mis.html</span>
<span class="pill"><span class="dot"></span>Read <b>12 min</b></span>
<span class="pill"><span class="dot"></span>skill: html-mis</span>
```

Set `h1`: `The consistency machine`
Set `.sub`: `How one markdown file makes every probe article read the same.`

- [ ] **Step 5: Replace the stats strip**

```html
<div class="stat"><div class="n">566</div><div class="l">Skill lines</div></div>
<div class="stat"><div class="n">119</div><div class="l">Lens lines</div></div>
<div class="stat"><div class="n">3</div><div class="l">Filler levels</div></div>
<div class="stat"><div class="n">5</div><div class="l">Check lies</div></div>
```

- [ ] **Step 6: Replace section heads + empty the six sections**

Each section keeps its sec-head structure. Set the six heads and make each section body empty:

| id | number | title |
|---|---|---|
| `#s1` | 01 | The Skill |
| `#s2` | 02 | The Dial |
| `#s3` | 03 | The Voice |
| `#s4` | 04 | The Design System |
| `#s5` | 05 | The Budget |
| `#s6` | 06 | The Checks |

```html
<section id="s1">
  <div class="sec-head"><div class="sec-num">01</div><h2>The Skill</h2></div>
</section>
```

(same pattern for s2–s6 with their numbers/titles)

- [ ] **Step 7: Replace the TOC**

```html
<a href="#s1" class="l1"><span class="num">01</span>The Skill</a>
<a href="#s1-skill" class="l2">Two files</a>
<a href="#s2" class="l1"><span class="num">02</span>The Dial</a>
<a href="#s2-dial" class="l2">Three levels</a>
<a href="#s2-demo" class="l2">Try the dial</a>
<a href="#s3" class="l1"><span class="num">03</span>The Voice</a>
<a href="#s3-voice" class="l2">Human, not polished</a>
<a href="#s4" class="l1"><span class="num">04</span>The Design System</a>
<a href="#s4-tokens" class="l2">Sixteen tokens</a>
<a href="#s5" class="l1"><span class="num">05</span>The Budget</a>
<a href="#s5-budget" class="l2">The lens</a>
<a href="#s6" class="l1"><span class="num">06</span>The Checks</a>
<a href="#s6-checks" class="l2">Five lies, one truth meter</a>
```

- [ ] **Step 8: Set the footer date**

In `#modtime`'s initial content (before the JS fills it), set `17 Aug 2026`.

- [ ] **Step 9: Verify**

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/html-mis.html"
sleep 2
bctl eval "document.title='h1:'+document.querySelector('h1').textContent+' stats:'+document.querySelectorAll('.stat').length+' toc:'+document.querySelectorAll('.toc a').length+' s6:'+!!document.getElementById('s6'); 'x'"
sleep 1
bctl title
```

Expected: `h1:The consistency machine stats:4 toc:13 s6:true`

Then restore title and run lens:

```bash
bctl eval "document.title='Session MIS Report — The Consistency Machine'; 'x'"
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "html-mis" --metrics-only
```

Expected: `ovf` column `no` at every row (320/375/768/1024/1440).

- [ ] **Step 10: Commit**

```bash
git add probe/html-mis.html
git commit -m "probe: html-mis page shell (task 1)"
```

---

### Task 2: Sections 01–06 (Prose + Exhibits)

**Files:**
- Modify: `probe/html-mis.html` (fill the six empty sections)

**Interfaces:**
- Consumes: empty sections + TOC from Task 1.
- Produces: all 12 exhibits + section prose + `#s2-demo` marker (filled by Task 3).

- [ ] **Step 1: Section 01 — The Skill** (`#s1`)

```html
<div class="part" id="s1-skill">
  <h3 class="sub">Two files</h3>
  <p class="lede">Two files write every article on this site. One holds the rules. The other checks them.</p>
  <p>The first file is SKILL.md. It lives in the html-mis skill folder. It is 566 lines of rules about one job: turn data into a clean HTML report. Before any article starts, the agent loads this file. The rules come first — the writing comes after.</p>
  <p>The second file is lens.py. It is 119 lines of Python. It opens the finished page at five screen widths and measures it. If a rule is broken — a line that sticks out, a hero that eats the screen — the lens prints it.</p>
  <div class="exhibit">
    <div class="ex-head"><span>The front matter</span><span class="lang">SKILL.md</span><span class="role">the door the agent enters through</span></div>
    <div class="side"><pre class="out">---
name: html-mis
description: Use when the user asks for an MIS (Management Information System) report, session/activity report, or build summary as HTML — especially when they want to control how much explanatory prose is included. Supports a per-request filler-prose level (minimal / balanced / verbose).
---</pre><span class="cap">the trigger is a request for a report — and the last line names the special part</span></div>
  </div>
  <p>The front matter is the door. The description names the trigger: when the user asks for a report, this skill loads. And the last line names the defining feature — a prose level the user picks per report. That dial is section 02.</p>
</div>
```

- [ ] **Step 2: Section 02 — The Dial** (`#s2`) — prose part + demo marker

```html
<div class="part" id="s2-dial">
  <h3 class="sub">Three levels</h3>
  <p class="lede">Three levels. Same data. The words change, never the numbers.</p>
  <p>The filler-prose level is the skill's defining feature. Before a report starts, the skill says: confirm the level — never assume. The user picks how much talking the page is allowed. The data stays the same at every level. Only the sentences around it shrink or grow.</p>
  <div class="exhibit">
    <div class="ex-head"><span>The level table</span><span class="lang">SKILL.md</span><span class="role">0, 1, 2 — a word budget</span></div>
    <div class="side"><pre class="out">| Level | Code | What's allowed |
|-------|------|----------------|
| **minimal** | 0 | Facts, data, tables, checklists, code/previews only. No sentences explaining what the data means. Scannable. |
| **balanced** | 1 | Minimal + one short sentence per section stating the key takeaway. No paragraphs. |
| **verbose** | 2 | Balanced + short paragraphs of context/methodology. Still no padding or repetition. |</pre><span class="cap">the same report can be a dashboard or a brief — the data never moves</span></div>
  </div>
  <p>One rule sits under the table: prose may never exceed the chosen level. When in doubt, drop words. A report at minimal should feel like a dashboard; at verbose like a brief. The dial is a word budget — and budgets are what make output consistent.</p>
</div>
<div class="part" id="s2-demo">
  <h3 class="sub">Try the dial</h3>
  <!-- DEMO MARKER — Task 3 fills this part -->
</div>
```

- [ ] **Step 3: Section 03 — The Voice** (`#s3`)

```html
<div class="part" id="s3-voice">
  <h3 class="sub">Human, not polished</h3>
  <p class="lede">The skill also picks the writer's voice — human, not polished.</p>
  <p>Two rules. The first: write like the person who did the work talking to you. Intentionally imperfect beats sterile. The skill even quotes the phrasing it wants.</p>
  <div class="exhibit">
    <div class="ex-head"><span>Rule one</span><span class="lang">SKILL.md</span><span class="role">flaw is fine; robot is not</span></div>
    <div class="side"><pre class="out">A good read is human-centric, not perfect — intentionally flawed beats sterile.
Write like the person who did the work talking to you, not a press release:
honest, slightly imperfect phrasing ("wrote it twice and they agree", "turned
out", "good enough") over robotic parallel prose. Flaw is fine; robot is not.
Keep every value — drop the polish, never the data.</pre><span class="cap">the skill prefers a real sentence over a clean one</span></div>
  </div>
  <p>The second rule: plain English. The skill assumes the reader is not a native speaker. Short words, short sentences, no idioms. It names the banned moves with before-and-after pairs.</p>
  <div class="exhibit">
    <div class="ex-head"><span>Rule two</span><span class="lang">SKILL.md</span><span class="role">say it the short way</span></div>
    <div class="side"><pre class="out">- **Plain, simple English.** Assume the reader is not a native speaker. Short
  words, short sentences. Drop idioms and fancy verbs — say "very slow", not
  "brutal"; "a long number", not "a wall of digits"; "happened on its own",
  not "fell out". Keep the technical words (they're the domain), but everything
  around them stays simple.</pre><span class="cap">the banned idioms are quoted only to be banned</span></div>
  </div>
  <p>Voice is a consistency lever most writers treat as a mood. Here it is a spec. That is why every article on this site sounds like the same person wrote it — one person did: the skill.</p>
</div>
```

- [ ] **Step 4: Section 04 — The Design System** (`#s4`)

```html
<div class="part" id="s4-tokens">
  <h3 class="sub">Sixteen tokens</h3>
  <p class="lede">Sixteen tokens. Nothing else is allowed.</p>
  <p>The design rules start with a hard line: do not invent new styles. One color block sits at the top of every page. Every surface, border, text color and radius on this site is a variable from that block. A new shade of pink is a rule break — the palette is the palette.</p>
  <div class="exhibit">
    <div class="ex-head"><span>The palette</span><span class="lang">SKILL.md</span><span class="role">the only colors that exist</span></div>
    <div class="side"><pre class="out">:root{
  --pink-soft:#FBD6E6; --pink:#F7B8D2; --pink-bold:#F06FA3; /* iMac pink: soft front / bold rear */
  --mint:#5FD3C4;        /* calm "value" highlight (checkmarks, key terms) */
  --bg:#15131C; --bg-2:#1B1726; --surface:#211C2E; --surface-2:#2A2438;
  --border:#342C45; --text:#ECE7F4; --muted:#9C93AE;
  --r-lg:24px; --r-md:16px; --r-sm:12px;   /* radii: 24 sections, 16 cards, 12 pills */
  --font:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'Geist Mono','JetBrains Mono',ui-monospace,monospace;
}</pre><span class="cap">sixteen tokens — color, radius, and font are all here</span></div>
  </div>
  <p>Then a type ladder: biggest and brightest to smallest and muted. Headings and body stay in the brightest token; only secondary text drops to muted. Accents mark labels and key terms — never whole paragraphs.</p>
  <div class="exhibit">
    <div class="ex-head"><span>The type ladder</span><span class="lang">SKILL.md</span><span class="role">one clear hierarchy</span></div>
    <div class="side"><pre class="out">| Level | Size | Color |
|---|---|---|
| `h1` (hero) | `clamp(32px, 6vw, 60px)` | `--text` |
| `h2` (section) | `--fs-h2` 30px | `--text` |
| `h3` (sub-section, `.sub`) | `--fs-h3` 20px | `--text` |
| body / prose | `--fs-base` 15.5px | `--text` |
| secondary (`.lede`/`.note`/`.cap`) | 13–14px | `--muted` |
| mono labels (`.tag`/`.aspect`/`.subhead`) | 11–12px | `--mint`/`--pink`/`--muted` |</pre><span class="cap">brightest is for reading; accents are for labels and key terms only</span></div>
  </div>
  <p>One odd rule stands out: monospace is always smaller. Code sits a step or two below the prose around it, so a code word never shouts over the sentence. And the pages follow the OS theme — the dark palette is the default, a light block overrides only the colors, never the sizes.</p>
  <div class="exhibit">
    <div class="ex-head"><span>The light side</span><span class="lang">SKILL.md</span><span class="role">colors flip, sizes never</span></div>
    <div class="side"><pre class="out">:root { color-scheme: light dark; /* dark tokens live here */ }
@media (prefers-color-scheme: light){
  :root{
    --pink:#D34F8A; --pink-bold:#C43E7C; --mint:#2E9E8F;
    --bg:#FBF6F0; --surface:#FFFFFF; --surface-2:#F1EAE0;
    --border:#E6DDD0; --text:#2A2333; --muted:#84798E;
    --code:#B63A74; --glass:rgba(251, 246, 240, 0.82);
  }
}</pre><span class="cap">the same neon hex cannot serve both themes — so it doesn't have to</span></div>
  </div>
  <p>Three contrast traps come with the theming: accent tokens color text and decoration at once, so they must get darker in light mode. Code needs its own token — a light pink in dark, a deep pink in light. And translucent chrome needs a glass token, or a sticky bar smears. The skill names all three traps before the writer can fall in.</p>
</div>
```

- [ ] **Step 5: Section 05 — The Budget** (`#s5`)

```html
<div class="part" id="s5-budget">
  <h3 class="sub">The lens</h3>
  <p class="lede">Every pixel is a budget. The lens shows the spend.</p>
  <p>Three rules. Tokens scale with width — generous at desktop, shrunk at narrow breakpoints, grown again at wide ones. The hero pays the highest rent: it is the first screen, so it must stay lean — at most about 45% of a phone viewport. And overflow is a budget violation: horizontal scroll on a phone means you spent pixels you did not have.</p>
  <p>To enforce this, the lens re-opens the page at five widths — small phone to large desktop — and measures three things: overflow, hero footprint, and content width.</p>
  <div class="exhibit">
    <div class="ex-head"><span>The spectrum</span><span class="lang">lens.py</span><span class="role">five widths, small phone to desktop</span></div>
    <div class="side"><pre class="out"># default spectrum: small phone -> large desktop
DEFAULT_VP = [(320, 568), (375, 667), (768, 1024), (1024, 768), (1440, 900)]</pre><span class="cap">320 is the smallest budget; 1440 is the largest</span></div>
  </div>
  <div class="exhibit">
    <div class="ex-head"><span>What the lens measures</span><span class="lang">lens.py</span><span class="role">overflow, hero percent, content width</span></div>
    <div class="side"><pre class="out">def metrics_js():
    return """(() => {
      const de = document.documentElement;
      const sw = de.scrollWidth, cw = de.clientWidth;
      const hero = document.querySelector('.hero');
      const hr = hero ? hero.getBoundingClientRect() : {height:0};
      const wrap = document.querySelector('.wrap') || document.body;
      const wr = wrap.getBoundingClientRect();
      return {
        overflowX: sw > cw,
        scrollW: sw, clientW: cw,
        heroH: Math.round(hr.height),
        heroPct: Math.round(hr.height / window.innerHeight * 100),
        contentW: Math.round(wr.width),
        innerW: window.innerWidth,
        sections: document.querySelectorAll('section, .stats, footer').length
      };
    })()"""</pre><span class="cap">overflow is the question — a scrollbar wider than the screen means the budget broke</span></div>
  </div>
  <div class="exhibit">
    <div class="ex-head"><span>A real run</span><span class="lang">lens output</span><span class="role">this article's own check, before publish</span></div>
    <div class="side"><pre class="out">W     H     ovf  hero%   contentW  scrollW  sec
----------------------------------------------
320   568   no   34    % 280       320      8
375   667   no   29    % 335       375      8
768   1024  no   15    % 696       768      8
1024  768   no   30    % 672       1024     8
1440  900   no   19    % 908       1440     8
----------------------------------------------</pre><span class="cap">a no in every ovf row means the budget held at every width</span></div>
  </div>
  <p>The output row is the receipt: width, height, overflow, hero percent, content width. The lens is why no probe article has ever shipped with a phone-side scroll — the check runs before the push, every time.</p>
</div>
```

- [ ] **Step 6: Section 06 — The Checks** (`#s6`)

```html
<div class="part" id="s6-checks">
  <h3 class="sub">Five lies, one truth meter</h3>
  <p class="lede">The skill knows automated checks lie. Five ways, with fixes.</p>
  <p>The last part of the skill is a warning about verification itself. A green check can call a broken page working. The skill names the five classic lies and the fix for each.</p>
  <div class="exhibit">
    <div class="ex-head"><span>The five lies</span><span class="lang">SKILL.md</span><span class="role">what breaks, and what fixes it</span></div>
    <div class="side"><pre class="out">| The lie | What happens | The fix |
|---|---|---|
| Synthetic clicks | `element.click()` (and `bctl click`) fires the handler without a real pointer — it skips hit-testing entirely | Never rely on it alone. Prove what a tap would hit |
| Off-screen probes | `elementFromPoint` returns `NULL` below the fold; a scroll mismatch reads as "blocked" | Scroll the element into view first, then hit-test |
| Frozen tabs | A hidden/occluded tab freezes CSS transitions — computed styles stay at start values (`visibility` stuck `hidden`) | Check `document.visibilityState`; neutralize transitions (`transition:none`) before asserting |
| Missing keys | Remote key events don't deliver to real https pages — a working Escape handler looks dead | Test handlers with a synthetic `keydown`; test the UI path with real input |
| Stale pages | Pages CDN lags ~85s and service workers serve old shells — you verify yesterday's build | Cache-bust with `?v=$(date +%s)`; check the SW cache name |</pre><span class="cap">a green check can call a broken page working — here are the five ways</span></div>
  </div>
  <p>The truth meter behind all five fixes is one DOM call: elementFromPoint(x, y). Ask the browser what a tap at that point would actually hit. Synthetic clicks skip that question. Hit-testing answers it.</p>
  <div class="exhibit">
    <div class="ex-head"><span>The method</span><span class="lang">SKILL.md</span><span class="role">six rules that outrank every check</span></div>
    <div class="side"><pre class="out">1. **Hit-test every interactive spot** with `document.elementFromPoint(x, y)` —
   a closed modal/overlay must never be on top. This is the truth meter.
2. **Use real input events**, not synthetic clicks. `bctl click` runs
   `element.click()` via Runtime.evaluate — it bypasses hit-testing, so it
   "works" even when an invisible layer swallows every real tap. Real taps
   need CDP `Input.dispatchMouseEvent` (mousePressed + mouseReleased).
3. **Keep test points in the viewport** — `elementFromPoint` returns `NULL`
   off-screen.
4. **Read computed styles with the tab state in mind** — in a hidden tab,
   transitions are frozen at their start values.
5. **Never verify yesterday's page** — cache-bust, check the SW version.
6. **The human's device is the final oracle** — a real tap on a real phone
   outranks every automated check.</pre><span class="cap">the checks can lie — these six rules are what actually count</span></div>
  </div>
  <p>That is the whole machine: one file of rules, one script of checks, a word budget, a color budget, a pixel budget, and a truth meter. None of it is talent. All of it is constraints. The articles look the same because the rules are the same — the creativity goes into what to say, never into how to say it.</p>
</div>
```

- [ ] **Step 7: Verify greps**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages
grep -c 'class="exhibit"' probe/html-mis.html     # expect 12
grep -c 'id="s[0-9]-[a-z]*"' probe/html-mis.html  # expect 7 (s1-skill s2-dial s2-demo s3-voice s4-tokens s5-budget s6-checks)
grep -c 'DEMO MARKER' probe/html-mis.html         # expect 1
```

- [ ] **Step 8: Verify zoom**

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/html-mis.html"
sleep 2
bctl eval "var m=document.getElementById('zoomModal'); document.querySelector('#s5 .side').click(); 'zoom:'+m.classList.contains('open')"
# expect zoom:true — then close it:
bctl eval "var m=document.getElementById('zoomModal'); m.classList.remove('open'); document.getElementById('zoomBackdrop').classList.remove('open'); 'x'"
```

- [ ] **Step 9: Verify lens**

```bash
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "html-mis" --metrics-only
```

Expected: `ovf` = `no` at every row.

- [ ] **Step 10: Commit**

```bash
git add probe/html-mis.html
git commit -m "probe: html-mis sections 01-06 (task 2)"
```

---

### Task 3: The Live Demo (Filler Dial)

**Files:**
- Modify: `probe/html-mis.html` (add demo CSS before `</style>`, replace the `<!-- DEMO MARKER -->` line, add demo IIFE before the zoom IIFE)

**Interfaces:**
- Consumes: `#s2-demo` marker from Task 2.
- Produces: ids `#demoMin`, `#demoBal`, `#demoVerb`, `#demoBody`; verified by Task 4's live checks.

- [ ] **Step 1: Add demo CSS before `</style>`** (tokens only — `--surface`, `--surface-2`, `--border`, `--pink-bold`, `--pink`, `--muted`, `--text`, `--r-sm`, `--r-md`, `--mono`)

```css
.demo-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 14px 0 16px; }
.demo-row .pill-btn {
  padding: 8px 14px; border-radius: var(--r-sm);
  border: 1px solid var(--border); background: var(--surface-2);
  color: var(--muted); font-family: var(--mono); font-size: 12px; cursor: pointer;
}
.demo-row .pill-btn.active { border-color: var(--pink-bold); color: var(--pink); }
.demo-frame {
  border: 1px solid var(--border); border-radius: var(--r-md);
  background: var(--surface); padding: 18px 18px 20px;
}
.demo-frame .subhead { margin: 0 0 12px; }
.demo-stats { display: flex; gap: 24px; margin-bottom: 14px; flex-wrap: wrap; }
.demo-stats span { color: var(--muted); font-size: 13px; }
.demo-stats b { color: var(--pink); font-size: 22px; font-weight: 700; margin-right: 4px; }
.demo-checks { margin: 0; padding-left: 18px; color: var(--text); font-size: 14px; }
.demo-checks li { margin-bottom: 6px; }
.demo-note { margin: 12px 0 0; color: var(--muted); font-size: 13.5px; }
```

- [ ] **Step 2: Replace the `<!-- DEMO MARKER — Task 3 fills this part -->` line** with:

```html
<p class="lede">One sample section, three levels. Same data, different word budget.</p>
<div class="demo-row">
  <button class="pill-btn active" id="demoMin">minimal · 0</button>
  <button class="pill-btn" id="demoBal">balanced · 1</button>
  <button class="pill-btn" id="demoVerb">verbose · 2</button>
</div>
<div class="demo-frame" id="demoBody" aria-live="polite"></div>
```

- [ ] **Step 3: Add the demo IIFE before the zoom IIFE**

Find the zoom IIFE (`zoomModal` / `querySelectorAll('.side')` block). Insert before it:

```html
<script>
(function () {
  var versions = {
    min: '<h4 class="subhead">today\'s build</h4><div class="demo-stats"><span><b>3</b> articles</span><span><b>2</b> demos</span><span><b>1</b> bug</span></div><ul class="demo-checks"><li>concept-modal published</li><li>verification-lied published</li><li>html-mis article written</li></ul>',
    bal: '<h4 class="subhead">today\'s build</h4><div class="demo-stats"><span><b>3</b> articles</span><span><b>2</b> demos</span><span><b>1</b> bug</span></div><ul class="demo-checks"><li>concept-modal published</li><li>verification-lied published</li><li>html-mis article written</li></ul><p class="demo-note">Three articles shipped; the lens caught one overflow bug.</p>',
    verb: '<h4 class="subhead">today\'s build</h4><div class="demo-stats"><span><b>3</b> articles</span><span><b>2</b> demos</span><span><b>1</b> bug</span></div><ul class="demo-checks"><li>concept-modal published</li><li>verification-lied published</li><li>html-mis article written</li></ul><p class="demo-note">Three articles shipped today. Two carried live demos — a modal stack and a filler dial. The lens caught one overflow bug at 320px before it reached a phone; the fix took two minutes. Both demos were hit-tested at every width, then published after the 85-second CDN wait.</p>'
  };
  var btns = {
    min: document.getElementById('demoMin'),
    bal: document.getElementById('demoBal'),
    verb: document.getElementById('demoVerb')
  };
  var body = document.getElementById('demoBody');
  function set(level) {
    body.innerHTML = versions[level];
    Object.keys(btns).forEach(function (k) {
      btns[k].classList.toggle('active', k === level);
    });
  }
  btns.min.addEventListener('click', function () { set('min'); });
  btns.bal.addEventListener('click', function () { set('bal'); });
  btns.verb.addEventListener('click', function () { set('verb'); });
  set('min');
})();
</script>
```

- [ ] **Step 4: Verify the demo (truth meter + level swaps)**

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/html-mis.html"
sleep 2
# 1. truth meter: what would a real tap at each pill hit? (must be the pill itself — no overlay)
bctl eval "var p=document.getElementById('demoBal'); var r=p.getBoundingClientRect(); var el=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); document.title='d1:'+(el===p||p.contains(el)); 'x'"
sleep 1
bctl title    # expect d1:true
# 2. minimal is the start state: no sentences
bctl eval "document.title='d2:'+(document.getElementById('demoBody').querySelector('.demo-note')===null); 'x'"
sleep 1
bctl title    # expect d2:true
# 3. balanced: one sentence (synthetic bctl click — labelled as such, not a real tap)
bctl click "#demoBal"
sleep 1
bctl eval "var n=document.getElementById('demoBody').querySelector('.demo-note'); document.title='d3:'+(n&&n.textContent==='Three articles shipped; the lens caught one overflow bug.'); 'x'"
sleep 1
bctl title    # expect d3:true
# 4. verbose: the paragraph
bctl click "#demoVerb"
sleep 1
bctl eval "var n=document.getElementById('demoBody').querySelector('.demo-note'); document.title='d4:'+(n&&n.textContent.indexOf('85-second CDN wait')>-1); 'x'"
sleep 1
bctl title    # expect d4:true
# 5. active class moves
bctl eval "document.title='d5:'+(document.getElementById('demoVerb').classList.contains('active')&&!document.getElementById('demoMin').classList.contains('active')); 'x'"
sleep 1
bctl title    # expect d5:true
# restore
bctl eval "document.title='Session MIS Report — The Consistency Machine'; 'x'"
```

- [ ] **Step 5: Lens + console**

```bash
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "html-mis" --metrics-only   # ovf no at every row
bctl console   # expect: nothing
```

- [ ] **Step 6: Commit**

```bash
git add probe/html-mis.html
git commit -m "probe: html-mis filler dial demo (task 3)"
```

---

### Task 4: Index Entry, Meta-Checks, Publish

**Files:**
- Modify: `probe/index.html` (card + STATS entry)
- Modify: `docs/superpowers/plans/2026-08-17-html-mis-skill.md` (tick checkboxes at the end)

**Interfaces:**
- Consumes: finished page from Task 3.

- [ ] **Step 1: Add the index card** — after the concept-modal card (`</li>` of `data-file="probe/concept-modal.html"`), before `</ul>`:

```html
<li data-file="probe/html-mis.html">
  <a href="html-mis.html">
    <div class="meta">
      <span class="file">html-mis.html</span>
      <span class="mod" title="last modified"></span>
    </div>
    <span class="title">the consistency machine</span>
    <span class="desc">one markdown file + one script — how every probe page reads the same</span>
  </a>
</li>
```

- [ ] **Step 2: Add the STATS entry** — after the concept-modal line:

```js
'probe/html-mis.html': '566 lines · 3 levels · 16 tokens · 1 lens',
```

- [ ] **Step 3: Meta-check — the article must obey the skill it describes**

Banned idioms (quoted in exhibits are fine — the check excludes `<pre>` and `<style>` content):

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages
sed '/<pre/,/<\/pre>/d; /<style/,/<\/style>/d' probe/html-mis.html > /tmp/htmlmis-prose.txt
grep -iE 'brutal|wall of|fell out|piece of cake|rabbit hole|boils down|silver bullet|low-hanging fruit|ballpark|cut corners|on the fly|bite the bullet|hit the ground running' /tmp/htmlmis-prose.txt
# expect: NO output
# and no invented hex colors outside :root and pre:
grep -oE '#[0-9a-fA-F]{3,6}' /tmp/htmlmis-prose.txt
# expect: NO output
```

- [ ] **Step 4: Final local pass**

```bash
export PATH="$HOME/.local/bin:$PATH"
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/index.html"
sleep 2
bctl eval "document.title='card:'+!!document.querySelector('.list li[data-file=\"probe/html-mis.html\"]'); 'x'"
sleep 1
bctl title    # expect card:true
bctl goto "file:///var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages/probe/html-mis.html"
sleep 2
cd /Users/nileshsuthar/.agents/skills/html-mis && python3 lens.py "html-mis" --metrics-only   # ovf no everywhere
bctl console   # expect: nothing
```

- [ ] **Step 5: Commit + push**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages
git add probe/html-mis.html probe/index.html
git commit -m "probe: 'the consistency machine' — how the html-mis skill writes every article the same way"
git push origin master
```

- [ ] **Step 6: Live verification (after 85s CDN wait)**

```bash
sleep 85
export PATH="$HOME/.local/bin:$PATH"
bctl goto "https://nd28.github.io/probe/html-mis.html?v=$(date +%s)"
sleep 3
bctl eval "document.title='live1:h1:'+document.querySelector('h1').textContent+' stats:'+document.querySelectorAll('.stat').length+' demo:'+!!document.getElementById('demoBody'); 'x'"
sleep 1
bctl title    # expect live1:h1:The consistency machine stats:4 demo:true
# live demo toggle (synthetic click — labelled):
bctl click "#demoVerb"
sleep 1
bctl eval "var n=document.getElementById('demoBody').querySelector('.demo-note'); document.title='live2:'+(n&&n.textContent.indexOf('85-second CDN wait')>-1); 'x'"
sleep 1
bctl title    # expect live2:true
bctl goto "https://nd28.github.io/probe/?v=$(date +%s)"
sleep 3
bctl eval "document.title='live3:'+!!document.querySelector('.list li[data-file=\"probe/html-mis.html\"]'); 'x'"
sleep 1
bctl title    # expect live3:true
bctl click "li[data-file='probe/html-mis.html'] a"
sleep 1
bctl eval "var p=document.getElementById('popModal'); document.title='live4:'+p.classList.contains('open')+' statsline:'+p.textContent.includes('566 lines · 3 levels · 16 tokens · 1 lens'); 'x'"
sleep 1
bctl title    # expect live4:true statsline:true
bctl console  # expect: nothing
```

- [ ] **Step 7: Tick the plan checkboxes + commit**

```bash
cd /var/folders/r8/rb3ht9r54wsdtnkdc8ctr8bc0000gn/T/opencode/nd28pages
sed -i '' 's/^- \[ \]/- [x]/' docs/superpowers/plans/2026-08-17-html-mis-skill.md
git add docs/superpowers/plans/2026-08-17-html-mis-skill.md
git commit -m "plan: html-mis checkboxes complete"
git push origin master
```

- [ ] **Step 8: Report** — final summary to the user: commits, live URL, verification evidence, and the meta-check results (article passes its own skill's rules).
