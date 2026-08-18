# "A Combo Meter For Writing" (journal-tui article) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a new probe article `probe/journal-tui.go.html` — "A combo meter for writing" — introducing `journal-tui`, a terminal journal that scores you as you type, with every exhibit verbatim from the real repo and four real screenshots inlined as data URIs.

**Architecture:** Journey walkthrough (6 sections) along one spine — each thing that made the app fun forced a second decision to keep it honest: the game → the pace reading → the crash → the key-name bug → the shape of the build → the off switch. Base shell copied from `probe/t3-code.sh.html` (the current One UI 8.5 soft style). Screenshots use the `figure.screenshot` pattern ported from `probe/dir-iter.html`.

**Tech Stack:** Static HTML page (one self-contained file, inline CSS/JS), `bctl` CDP for verification, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-18-journal-tui-design.md`

## Global Constraints

- **Repo root:** `/home/nileshsuthar/nd28.github.io`. Subject repo: `/home/nileshsuthar/journal`.
- **Filler level: verbose** (level 2) — balanced plus short paragraphs of context and methodology. No padding, no repetition, never narrate the obvious.
- **Copy:** short words, short sentences, no idioms (reader may not be a native speaker). Say "very slow", not "brutal"; "happened on its own", not "fell out". Technical words stay.
- **Voice:** human, not polished. Honest, slightly imperfect phrasing over a press release. Flaw is fine; robot is not. Keep every value — drop the polish, never the data.
- **Styling:** only tokens already in the copied `:root` — no new colors, radii or fonts, no inline `style=` attributes, no hex literals in the body.
- **Exhibits:** verbatim from the named file and line range. No edits, no `...` elisions. Where a path contains the username, write `~/` — that is the only permitted change.
- **Zen mode is designed, not shipped.** It must never be described as a feature that exists today. Version shipped today is `0.7.0`.
- **Self-contained file:** inline CSS/JS, Google Fonts link only, screenshots as `data:` URIs. No external assets.
- **Theme-aware:** light-first with the `data-theme` and `prefers-color-scheme` overrides inherited from the base shell. Never force one theme.
- **Tab title must end as** `Session MIS Report — A Combo Meter For Writing`. The lens matches the tab by URL substring `journal-tui`.
- **Commits:** directly on `master`, one commit per task. Do not push until Task 7.

---

### Task 1: Page Shell

**Files:**
- Create: `probe/journal-tui.go.html` (copy of `probe/t3-code.sh.html`)
- Reference: `probe/t3-code.sh.html` (source of the shell, TOC, zoom IIFE, herobar)

**Interfaces:**
- Produces: a page with `#s1`…`#s6` empty sections, hero, stats strip, TOC and `#modtime` footer — consumed by Tasks 2–6.

- [ ] **Step 1: Copy the base**

```bash
cd ~/nd28.github.io && cp probe/t3-code.sh.html probe/journal-tui.go.html
```

- [ ] **Step 2: Replace the `<title>`**

```html
<title>Session MIS Report — A Combo Meter For Writing</title>
```

- [ ] **Step 3: Replace the herobar spans**

Inside `header.herobar > .inner`, keep the `span.t` / `span.s` structure:

```html
<span class="t">A Combo Meter For Writing</span>
<span class="s">a terminal journal that pays you for typing, and what that cost</span>
```

- [ ] **Step 4: Replace the hero h1, sub and meta pills**

```html
<h1>A combo meter for writing</h1>
<p class="sub">A terminal journal that pays ten points a word and multiplies them while you keep going. Every decision that made it fun forced a second one to keep it honest — and the newest design turns the whole game off.</p>
<div class="meta">
  <span class="pill"><span class="dot"></span>Date <b>18 Aug 2026</b></span>
  <span class="pill"><span class="dot"></span>Go 1.25 · Bubble Tea · SQLite</span>
  <span class="pill"><span class="dot"></span>v0.7.0 · 52 commits · 35 days</span>
  <a class="pill" href="https://github.com/nd28/journal-tui"><span class="dot"></span>github.com/nd28/journal-tui</a>
</div>
```

- [ ] **Step 5: Replace the stats strip**

```html
<div class="stats">
  <div class="stat"><div class="n">×5.0</div><div class="l">Combo cap</div></div>
  <div class="stat"><div class="n">15s</div><div class="l">Silence wipes it</div></div>
  <div class="stat"><div class="n">1.7:1</div><div class="l">Test lines to code</div></div>
  <div class="stat"><div class="n">6</div><div class="l">Places the game shows</div></div>
</div>
```

- [ ] **Step 6: Empty the six sections**

Replace the contents of each `<section id="sN">` with only its `.sec-head`, keeping the numbering:

```html
<section id="s1"><div class="sec-head"><div class="sec-num">01</div><h2>The Game</h2></div></section>
<section id="s2"><div class="sec-head"><div class="sec-num">02</div><h2>The Reading</h2></div></section>
<section id="s3"><div class="sec-head"><div class="sec-num">03</div><h2>The Crash</h2></div></section>
<section id="s4"><div class="sec-head"><div class="sec-num">04</div><h2>The Word "up"</h2></div></section>
<section id="s5"><div class="sec-head"><div class="sec-num">05</div><h2>The Shape</h2></div></section>
<section id="s6"><div class="sec-head"><div class="sec-num">06</div><h2>The Off Switch</h2></div></section>
```

- [ ] **Step 7: Replace the TOC**

```html
<div class="toc-title">Contents</div>
<nav>
  <a href="#s1" class="l1"><span class="num">01</span>The Game</a>
  <a href="#s1-loop" class="l2">Ten Points A Word</a>
  <a href="#s1-numbers" class="l2">The Constants</a>
  <a href="#s2" class="l1"><span class="num">02</span>The Reading</a>
  <a href="#s2-window" class="l2">The Spike</a>
  <a href="#s2-median" class="l2">Median, Not Average</a>
  <a href="#s3" class="l1"><span class="num">03</span>The Crash</a>
  <a href="#s3-draft" class="l2">One Row Per Session</a>
  <a href="#s3-restore" class="l2">Back At 1.0</a>
  <a href="#s4" class="l1"><span class="num">04</span>The Word "up"</a>
  <a href="#s4-runs" class="l2">Typed, Not Pressed</a>
  <a href="#s4-paste" class="l2">Words Nobody Typed</a>
  <a href="#s5" class="l1"><span class="num">05</span>The Shape</a>
  <a href="#s6" class="l1"><span class="num">06</span>The Off Switch</a>
  <a href="#s6-zen" class="l2">Designed, Not Shipped</a>
</nav>
```

- [ ] **Step 8: Replace the footer**

```html
<div class="foot-top">
  <a href="https://nd28.github.io/probe/" class="probe">probe</a>
  <span>by <a href="https://nd28.github.io">nilesh suthar</a></span>
  <span>· <a href="https://github.com/nd28/journal-tui">github.com/nd28/journal-tui</a></span>
</div>
<div class="foot-meta">modified <span id="modtime">18 Aug 2026</span> · go · 35 days · 52 commits</div>
```

- [ ] **Step 9: Verify the shell loads**

```bash
bctl open "file:///home/nileshsuthar/nd28.github.io/probe/journal-tui.go.html" --match journal-tui
bctl eval 'document.title + " | sections=" + document.querySelectorAll("section").length + " | toc=" + document.querySelectorAll(".toc a").length' --match journal-tui
```

Expected: `Session MIS Report — A Combo Meter For Writing | sections=6 | toc=15`

- [ ] **Step 10: Commit**

```bash
cd ~/nd28.github.io && git add probe/journal-tui.go.html && git commit -m "probe: journal-tui page shell"
```

---

### Task 2: Screenshot Support

**Files:**
- Modify: `probe/journal-tui.go.html` (add `figure.screenshot` CSS block)
- Reference: `probe/dir-iter.html:448-474` (source of the CSS), `~/journal/docs/screenshots/*.png`

**Interfaces:**
- Produces: `figure.screenshot` styling plus a helper script that emits a complete `<figure>` block for a given PNG — consumed by Tasks 3, 4 and 5.

- [ ] **Step 1: Port the screenshot CSS**

Insert before the `footer {` rule in the `<style>` block, verbatim from `probe/dir-iter.html:448-474`:

```css
    /* ============ FIGURE — embedded screenshot ============ */
    figure.screenshot {
      margin: 32px 0 24px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-1), var(--inner-light);
      overflow: hidden;
      transition: transform .2s ease, box-shadow .2s ease;
    }
    figure.screenshot:hover { transform: translateY(-2px); box-shadow: var(--shadow-2), var(--inner-light); }
    figure.screenshot img {
      display: block; width: 100%; height: auto;
      border-radius: var(--r-lg) var(--r-lg) 0 0;
    }
    figure.screenshot figcaption {
      padding: 14px 20px;
      font-family: var(--mono); font-size: 12.5px; color: var(--muted);
      border-top: 1px solid var(--border);
      display: flex; align-items: center; gap: 10px;
    }
    figure.screenshot figcaption .tag {
      font-family: var(--mono); font-size: 11px; font-weight: 600;
      letter-spacing: 0.06em; text-transform: uppercase;
      color: var(--mint); padding: 3px 8px;
      background: var(--mint-soft); border-radius: 999px;
    }
```

- [ ] **Step 2: Write the figure-block helper**

```bash
cat > /tmp/figblock.py <<'EOF'
import base64, sys
png, alt, tag, cap = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
b64 = base64.b64encode(open(png,'rb').read()).decode()
print(f'''        <figure class="screenshot">
          <img alt="{alt}" src="data:image/png;base64,{b64}">
          <figcaption>
            <span class="tag">{tag}</span>
            <span>{cap}</span>
          </figcaption>
        </figure>''')
EOF
```

- [ ] **Step 3: Verify the helper emits valid markup**

```bash
python3 /tmp/figblock.py ~/journal/docs/screenshots/summary.png "test" "real" "test caption" | head -c 200
```

Expected: a `<figure class="screenshot">` opening tag and an `<img ... src="data:image/png;base64,iVBOR…`

- [ ] **Step 4: Commit**

```bash
cd ~/nd28.github.io && git add probe/journal-tui.go.html && git commit -m "probe: journal-tui screenshot figure styling"
```

---

### Task 3: Section 01 The Game, Section 02 The Reading

**Files:**
- Modify: `probe/journal-tui.go.html` (`#s1`, `#s2`)
- Exhibit sources: `~/journal/internal/scoring/combo.go:8-22`, `~/journal/internal/scoring/intensity.go:12-17`, `~/journal/internal/scoring/intensity.go:66-71`

**Interfaces:**
- Consumes: the shell from Task 1, `figure.screenshot` from Task 2.
- Produces: anchors `#s1-loop`, `#s1-numbers`, `#s2-window`, `#s2-median` referenced by the Task 1 TOC.

- [ ] **Step 1: Write section 01 part one**

Inside `<section id="s1">`, after `.sec-head`:

```html
      <div class="part">
        <h3 class="sub" id="s1-loop">Ten Points A Word</h3>
        <p class="lede">It is a journal that runs in a terminal. You open it, you type, and a number in the header goes up. Every finished word is worth ten points, multiplied by a combo meter that climbs while you keep going and drains when you stop. The session ends with a score, and the score goes into a lifetime total that only ever grows. Text lives in a SQLite file at <code>~/.journal/journal.db</code>.</p>
        <p class="lede">The combo is the whole idea. A word typed in a steady run is worth up to five times a word typed after a long stare at the ceiling. That is a strange thing to do to a journal, and it is the point: the app is trying to buy you a few more minutes of writing before you stop.</p>
      </div>
```

Then the writing-screen screenshot, generated with:

```bash
python3 /tmp/figblock.py ~/journal/docs/screenshots/writing-unsaved.png \
  "The journal writing screen: score, word count, combo bar, pace" \
  "real" "the writing screen — score, words, combo bar, pace word, and the save marker"
```

- [ ] **Step 2: Write section 01 part two with the constants exhibit**

```html
      <div class="part">
        <h3 class="sub" id="s1-numbers">The Constants</h3>
        <p class="lede">The rules of the game are eight numbers in one file. They are worth reading before the rest of the article, because everything that follows is a consequence of them.</p>
        <div class="exhibit">
          <div class="ex-head">the whole rulebook <span class="lang">internal/scoring/combo.go</span></div>
          <div class="side"><pre class="out">const (
	ComboFloor = 1.0
	ComboCap   = 5.0

	ComboBumpPerWords = 3
	ComboBumpAmount   = 0.1
	ComboBumpMaxGap   = 1500 * time.Millisecond

	ComboDecayStartGap      = 2 * time.Second
	ComboDecayRatePerSecond = 0.08

	ComboHardResetGap = 15 * time.Second

	BasePointsPerWord = 10
)</pre></div>
          <div class="cap">Three words in a row, each within 1.5 seconds of the last, buy 0.1 on the multiplier. Stop for two seconds and it starts draining at 0.08 a second. Stop for fifteen and it is back to 1.0 whatever it was before.</div>
        </div>
        <div class="learn"><span class="dot"></span><p><b>The multiplier is not a score of the session.</b> It is a reading of the last few seconds. Getting to 5.0 takes about two minutes of unbroken typing, and losing it takes fifteen seconds of not typing. A streak bonus sits on top at the end — 5% per consecutive day, capped at 50% — and that one <i>is</i> about the long run.</p></div>
      </div>
```

- [ ] **Step 3: Write section 02 part one**

```html
      <div class="part">
        <h3 class="sub" id="s2-window">The Spike</h3>
        <p class="lede">A game that rewards pace needs to know your pace, and the header wants to show it live. The obvious way to measure it is wrong in a way that only shows up in the first few seconds.</p>
        <div class="exhibit">
          <div class="ex-head">why the denominator has a floor <span class="lang">internal/scoring/intensity.go</span></div>
          <div class="side"><pre class="out">// PaceMinElapsed floors the denominator in WPM so the first couple of
// words in a session (or right after a long pause) don't produce a
// spurious spike — e.g. 2 words 1 real second apart would otherwise
// imply 120 WPM.
PaceMinElapsed = 5 * time.Second</pre></div>
          <div class="cap">Two words, one second apart, is a true measurement and a useless one. Without the floor the header opens every session by telling you that you write at 120 words a minute.</div>
        </div>
        <p class="lede">Pace is counted over a sliding sixty second window, kept separately from the combo. The combo is game feel; this is meant to be a fact.</p>
      </div>
```

- [ ] **Step 4: Write section 02 part two**

```html
      <div class="part">
        <h3 class="sub" id="s2-median">Median, Not Average</h3>
        <p class="lede">The app also keeps a personal baseline, so it can say whether today is faster than usual. The number it compares against cannot be total words divided by session length, and the reason is written into the type that fixes it.</p>
        <div class="exhibit">
          <div class="ex-head">the baseline problem <span class="lang">internal/scoring/intensity.go</span></div>
          <div class="side"><pre class="out">// PaceSampler collects live WPM readings taken while the writer is actively
// typing. Its median is the session's representative pace, and unlike a
// wall-clock average (total words ÷ session duration) it isn't dragged
// toward zero by thinking time — which matters because the same readings
// are what the intensity ratio divides by. Comparing a burst-measured live
// reading against a pause-diluted baseline inflates every ratio.</pre></div>
          <div class="cap">A journal session is mostly pauses. Divide by the wall clock and the baseline sinks, and then every live reading looks like a personal best.</div>
        </div>
        <div class="learn"><span class="dot"></span><p><b>An empty string doing real work.</b> The retrospective tag and the live header use two different functions on purpose. <code>IntensityTier</code> returns nothing at ordinary pace, so old sessions written before a baseline existed stay unlabelled instead of carrying a word they never earned. <code>LiveTier</code> always returns a word — Warming, Cruising, Focused, Intense, Frantic — because a header that goes blank is a header you stop trusting.</p></div>
      </div>
```

- [ ] **Step 5: Verify anchors and no overflow**

```bash
bctl reload --match journal-tui
bctl eval '["s1-loop","s1-numbers","s2-window","s2-median"].map(id=>id+":"+!!document.getElementById(id)).join(" ") + " | ovf=" + (document.documentElement.scrollWidth > document.documentElement.clientWidth)' --match journal-tui
```

Expected: all four `:true`, `ovf=false`

- [ ] **Step 6: Diff each exhibit against its source**

```bash
sed -n '8,22p' ~/journal/internal/scoring/combo.go
sed -n '13,17p' ~/journal/internal/scoring/intensity.go
sed -n '66,71p' ~/journal/internal/scoring/intensity.go
```

Compare each against the matching `<pre class="out">` block character by character. Any difference is a bug in the article, not in the repo.

- [ ] **Step 7: Commit**

```bash
cd ~/nd28.github.io && git add probe/journal-tui.go.html && git commit -m "probe: journal-tui sections 01-02 — the game and the pace reading"
```

---

### Task 4: Section 03 The Crash, Section 04 The Word "up"

**Files:**
- Modify: `probe/journal-tui.go.html` (`#s3`, `#s4`)
- Exhibit sources: `~/journal/internal/store/store.go:31-38`, `~/journal/internal/scoring/session.go:34-43`, `~/journal/internal/tui/writing.go:483-497`, commit `30350b3` message

**Interfaces:**
- Consumes: the shell, `figure.screenshot`, `/tmp/figblock.py`.
- Produces: anchors `#s3-draft`, `#s3-restore`, `#s4-runs`, `#s4-paste`.

- [ ] **Step 1: Write section 03 part one**

```html
      <div class="part">
        <h3 class="sub" id="s3-draft">One Row Per Session</h3>
        <p class="lede">A journal you might lose is not a journal. The editor writes what is on screen to disk every five seconds, into a table that holds one row per session and replaces it each time.</p>
        <div class="exhibit">
          <div class="ex-head">the draft table <span class="lang">internal/store/store.go</span></div>
          <div class="side"><pre class="out">CREATE TABLE IF NOT EXISTS drafts (
	session_id INTEGER PRIMARY KEY REFERENCES sessions(id),
	body TEXT NOT NULL,
	body_words INTEGER NOT NULL,
	raw_score INTEGER NOT NULL,
	total_words INTEGER NOT NULL,
	updated_at TEXT NOT NULL
);</pre></div>
          <div class="cap">It mirrors the buffer rather than recording a history, so it stays the size of what you have written no matter how many hours the session runs. The score is stored beside the text because a combo history cannot be rebuilt after the fact.</div>
        </div>
        <p class="lede">The help line at the bottom of the writing screen says <code>saved</code> or <code>unsaved</code>. That is there because the whole value of autosaving is not having to wonder, and a silent autosave gives you no way to tell the difference between working and broken.</p>
      </div>
```

- [ ] **Step 2: Add the recovery screenshot and section 03 part two**

Generate the figure with:

```bash
python3 /tmp/figblock.py ~/journal/docs/screenshots/recovery-home.png \
  "The journal home screen offering an unfinished session back" \
  "real" "the next launch, offering the interrupted session back"
```

Then:

```html
      <div class="part">
        <h3 class="sub" id="s3-restore">Back At 1.0</h3>
        <p class="lede">Resuming puts the text back in the editor and the running score back on the header. It does not put the combo back, and the reason is the most honest line in the codebase.</p>
        <div class="exhibit">
          <div class="ex-head">what a resumed session gets back <span class="lang">internal/scoring/session.go</span></div>
          <div class="side"><pre class="out">// The combo deliberately restarts at the floor. It measures the rhythm of
// the last few seconds of typing, and the interruption ended that rhythm —
// restoring a 4x multiplier would hand out points for momentum that no
// longer exists.</pre></div>
          <div class="cap">Giving the multiplier back would be the friendly choice and the wrong one. The number claims to describe the last few seconds, and the last few seconds were a crash.</div>
        </div>
```

Then the resumed-session figure:

```bash
python3 /tmp/figblock.py ~/journal/docs/screenshots/resumed-session.png \
  "A resumed journal session with its text and score restored" \
  "real" "resumed — text and score back, combo starting again at 1.0"
```

Then close the part:

```html
        <div class="learn"><span class="dot"></span><p><b>Sessions that were opened and never written in are deleted quietly.</b> Offering someone an empty session back is not crash recovery, it is a chore.</p></div>
      </div>
```

- [ ] **Step 3: Write section 04 part one**

```html
      <div class="part">
        <h3 class="sub" id="s4-runs">Typed, Not Pressed</h3>
        <p class="lede">Typing the word "up" did not put "up" on the page. It moved the cursor up a line and the two letters vanished. Typing "esc" in the middle of a sentence ended the session.</p>
        <div class="exhibit">
          <div class="ex-head">captured from a real run <span class="lang">commit 30350b3</span></div>
          <div class="side"><pre class="out">...and ask about the repor exactly where the battery cut me off. ting
deadline before committing to anything else this week.</pre></div>
          <div class="cap">The cursor jumped mid-word, so the rest of the sentence landed inside an earlier paragraph. The text is not dropped, it is rearranged — which is worse, because it survives to be read back later.</div>
        </div>
        <div class="exhibit">
          <div class="ex-head">why it happened <span class="lang">internal/tui/writing.go</span></div>
          <div class="side"><pre class="out">// bubbletea coalesces the runes it reads in one go into a single
// KeyMsg, and Key.String() renders that run as a plain string — so a
// message carrying the typed letters "up" is indistinguishable from
// the up-arrow key, and one carrying "esc" from escape. Both bubbles'
// key bindings and the switch below match on that string, so typing
// "up" moved the cursor instead of writing the word, and typing "esc"
// mid-sentence ended the session. A run of more than one rune is
// always text a person typed, never a key they pressed: insert it
// directly and let no binding look at it.
if keyMsg.Type == tea.KeyRunes && len(keyMsg.Runes) &gt; 1 {
	m.writing.textarea.InsertString(string(keyMsg.Runes))</pre></div>
          <div class="cap">The fix is the rule in the comment: more than one rune at once is always text somebody typed. Insert it directly so no key binding ever looks at it, and match this screen's own keys on the message type rather than its string.</div>
        </div>
        <div class="learn"><span class="dot"></span><p><b>This was not a fast-typing edge case.</b> It reproduced at a deliberate 120 milliseconds per word against the real binary. The words that broke it are ordinary ones — up, down, left, right, home, end, tab, space, delete, esc — and a journal is made of ordinary words.</p></div>
      </div>
```

- [ ] **Step 4: Write section 04 part two**

```html
      <div class="part">
        <h3 class="sub" id="s4-paste">Words Nobody Typed</h3>
        <p class="lede">A score for typing is only worth something if it cannot be bought. Two guards do that job, and the second one exists because the first one is not enough on its own.</p>
        <div class="tools">
          <div class="tool"><span class="name">paste is blocked</span><p>A terminal paste arrives flagged as a paste no matter how many characters it carries, and the writing screen refuses it with a warning line. The line has space reserved even when it is not showing, so a paste attempt never pushes the editor off the bottom of the screen.</p></div>
          <div class="tool"><span class="name">twenty words per update</span><p>A single update can score at most twenty words. If a paste ever gets past the first guard, it cannot award thousands of points and stamp thousands of words at one instant — which would spike the pace reading to an impossible value and poison the personal baseline built from it.</p></div>
        </div>
        <div class="learn"><span class="dot"></span><p><b>The clamp protects the measurement, not the score.</b> Losing points to a bug is annoying. A poisoned baseline quietly changes every intensity reading afterwards, and nothing on screen would say so.</p></div>
      </div>
```

- [ ] **Step 5: Verify anchors, images and no overflow**

```bash
bctl reload --match journal-tui
bctl eval '["s3-draft","s3-restore","s4-runs","s4-paste"].map(id=>id+":"+!!document.getElementById(id)).join(" ") + " | imgs=" + [...document.images].filter(i=>i.naturalWidth>0).length + "/" + document.images.length + " | ovf=" + (document.documentElement.scrollWidth > document.documentElement.clientWidth)' --match journal-tui
```

Expected: all four `:true`, `imgs=3/3`, `ovf=false`

- [ ] **Step 6: Diff each exhibit against its source**

```bash
sed -n '31,38p' ~/journal/internal/store/store.go
sed -n '40,43p' ~/journal/internal/scoring/session.go
sed -n '483,493p' ~/journal/internal/tui/writing.go
cd ~/journal && git show 30350b3 --format=%B --no-patch | grep -A 2 "repor exactly"
```

Compare against the matching `<pre>` blocks. The only permitted difference is `&gt;` for `>` inside HTML.

- [ ] **Step 7: Commit**

```bash
cd ~/nd28.github.io && git add probe/journal-tui.go.html && git commit -m "probe: journal-tui sections 03-04 — crash safety and the key-name bug"
```

---

### Task 5: Section 05 The Shape, Section 06 The Off Switch

**Files:**
- Modify: `probe/journal-tui.go.html` (`#s5`, `#s6`)
- Exhibit sources: `~/journal/docs/superpowers/specs/2026-08-18-journal-zen-mode-design.md`, `~/journal/internal/store/store.go` (`dbFileMode`)

**Interfaces:**
- Consumes: the shell, `/tmp/figblock.py`.
- Produces: anchor `#s6-zen`. Section 05 has no l2 anchor (it is one part), matching the Task 1 TOC.

- [ ] **Step 1: Confirm the build numbers before writing them**

```bash
cd ~/journal && echo "commits: $(git rev-list --count HEAD)" \
  && echo "code: $(find . -name '*.go' -not -name '*_test.go' | xargs cat | wc -l)" \
  && echo "test: $(find . -name '*_test.go' | xargs cat | wc -l)" \
  && echo "testfuncs: $(grep -rh '^func Test' --include='*_test.go' . | wc -l)" \
  && make test
```

Expected at time of writing: 52 / 2449 / 4162 / 170, and `make test` passing. If any number differs, use the new one in Step 3 and update the hero pills and stat tiles from Task 1 to match.

- [ ] **Step 2: Add the summary screenshot**

```bash
python3 /tmp/figblock.py ~/journal/docs/screenshots/summary.png \
  "The journal summary screen at the end of a session" \
  "real" "the summary screen — where a session gets its final score"
```

- [ ] **Step 3: Write section 05**

```html
      <p class="lede">Five weeks, 52 commits, and one binary you run by typing <code>journal</code>. The numbers underneath are lopsided in a way that is worth saying out loud.</p>
      <div class="dels">
        <div class="del"><code>2,449</code><span class="lang">lines</span><span class="role">Go, not counting tests</span></div>
        <div class="del"><code>4,162</code><span class="lang">lines</span><span class="role">tests — nearly two for every line of code</span></div>
        <div class="del"><code>170</code><span class="lang">funcs</span><span class="role">test functions</span></div>
        <div class="del"><code>~/.journal/journal.db</code><span class="lang">sqlite</span><span class="role">created 0600 — SQLite makes it 0644 on its own</span></div>
      </div>
      <div class="learn"><span class="dot"></span><p><b>Scoring rules need tests more than most code does.</b> Every constant in section 01 is an opinion about what writing well looks like, and an opinion you cannot re-check is just a number somebody typed once. The tests are what make it possible to argue with the game and change your mind.</p></div>
```

- [ ] **Step 4: Write section 06**

```html
      <p class="lede">The game shows up in six places: the home screen stats, the writing header, the summary, the score on every history row, the read screen, and the text you get when you copy a session to share it. That is a lot of scoreboard for an app you might open to write something you do not feel good about.</p>
      <div class="part">
        <h3 class="sub" id="s6-zen">Designed, Not Shipped</h3>
        <p class="lede">Zen mode is a design dated 18 August 2026. It is not in v0.7.0 and it is not on disk — this section describes a document, not a feature. It silences all six places with one key, and changes nothing underneath: score, streak and lifetime total keep accruing exactly as they do now.</p>
        <div class="exhibit">
          <div class="ex-head">why ctrl+z is free to bind <span class="lang">journal-zen-mode-design.md</span></div>
          <div class="side"><pre class="out">`ctrl+z` is free to bind. Bubble Tea puts the terminal in raw mode, and raw mode
clears `ISIG` (`charmbracelet/x/term`'s `term_unix.go`), so the terminal never
turns ctrl+z into SIGTSTP — it arrives as an ordinary key.</pre></div>
          <div class="cap">Worth checking rather than assuming. A key that suspends the app instead of toggling a setting is a bad first impression of a feature meant to calm things down.</div>
        </div>
        <div class="learn"><span class="dot"></span><p><b>The save marker stays.</b> Zen drops the header, the score, the combo bar, the pace word and the high-score banner — but not <code>saved</code> / <code>unsaved</code>. Knowing whether your words reached disk is honesty, not a game, and the crash work in section 03 exists precisely so nobody has to wonder.</p></div>
        <div class="learn"><span class="dot"></span><p><b>One test decides whether the feature is trustworthy.</b> A session written from start to finish in zen mode still raises the lifetime score and still advances the streak. That is the guard against zen quietly turning into a mode where writing does not count — which is the one thing that would make it useless to the person who most wants it.</p></div>
      </div>
```

- [ ] **Step 5: Verify the zen exhibit is verbatim**

```bash
grep -n -A 3 "is free to bind" ~/journal/docs/superpowers/specs/2026-08-18-journal-zen-mode-design.md
```

Compare against the `<pre>` block. Backticks stay as plain text — do not convert them to `<code>` inside an exhibit.

- [ ] **Step 6: Check "not shipped" is unambiguous**

```bash
grep -c "not in v0.7.0\|Designed, Not Shipped\|not a feature" ~/nd28.github.io/probe/journal-tui.go.html
```

Expected: at least 2. The claim must survive someone reading only section 06.

- [ ] **Step 7: Commit**

```bash
cd ~/nd28.github.io && git add probe/journal-tui.go.html && git commit -m "probe: journal-tui sections 05-06 — the shape and the off switch"
```

---

### Task 6: The Lens And The Copy Checks

**Files:**
- Create: `/tmp/lens.py` (throwaway — not committed)
- Modify: `probe/journal-tui.go.html` (only if a check fails)

**Interfaces:**
- Consumes: the finished page from Tasks 1–5.
- Produces: a passing pixel-budget table and a clean copy check — the gate before publishing.

- [ ] **Step 1: Rebuild the lens**

The original `lens.py` is gone with the skill. Its measurement is quoted verbatim in `probe/html-mis.html` and is rebuilt here:

```bash
cat > /tmp/lens.py <<'EOF'
import json, subprocess, sys
DEFAULT_VP = [(320, 568), (375, 667), (768, 1024), (1024, 768), (1440, 900)]
METRICS = """(() => {
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
})()"""
match = sys.argv[1] if len(sys.argv) > 1 else "journal-tui"
def sh(*a):
    return subprocess.run(a, capture_output=True, text=True).stdout.strip()
print("W     H     ovf  hero%   contentW  scrollW  sec")
print("-" * 46)
bad = 0
for w, h in DEFAULT_VP:
    sh("bctl", "eval", f"window.resizeTo({w},{h})", "--match", match)
    sh("bctl", "eval", f"document.documentElement.style.width='{w}px'", "--match", match)
    out = sh("bctl", "eval", METRICS, "--match", match)
    try:
        m = json.loads(out)
    except Exception:
        print(f"{w:<5} {h:<5} ERROR: {out[:80]}")
        bad += 1
        continue
    ovf = "yes" if m["overflowX"] else "no"
    if m["overflowX"]:
        bad += 1
    print(f'{w:<5} {h:<5} {ovf:<4} {m["heroPct"]:<5}%  {m["contentW"]:<9} {m["scrollW"]:<8} {m["sections"]}')
print("-" * 46)
sys.exit(1 if bad else 0)
EOF
```

Note: `bctl` has no viewport-resize command, so if `window.resizeTo` does not take effect, use CDP device metrics instead — `bctl eval` cannot set them, so fall back to resizing the browser window by hand at each width and re-running the metrics eval. Record which method was used.

- [ ] **Step 2: Run the lens**

```bash
bctl open "file:///home/nileshsuthar/nd28.github.io/probe/journal-tui.go.html" --match journal-tui
python3 /tmp/lens.py journal-tui
```

Expected: `ovf` is `no` at every width, and `hero%` at 320 and 375 is comfortably under 45. The article this rule came from measured 34% and 24%. If the hero is too tall at 320, shorten the hero `.sub` rather than changing any token.

- [ ] **Step 3: Check both themes**

```bash
bctl eval 'document.documentElement.setAttribute("data-theme","dark"); getComputedStyle(document.body).backgroundColor' --match journal-tui
bctl eval 'document.documentElement.setAttribute("data-theme","light"); getComputedStyle(document.body).backgroundColor' --match journal-tui
bctl eval 'document.documentElement.removeAttribute("data-theme"); "reset"' --match journal-tui
```

Expected: two different background colours, and text readable in both. Look at the page in each — a passing colour value is not the same as a readable page.

- [ ] **Step 4: Check the zoom exhibits and the console**

```bash
bctl eval 'document.querySelectorAll(".side").length' --match journal-tui
bctl click ".side" --match journal-tui
bctl eval 'document.getElementById("zoomModal").classList.contains("open")' --match journal-tui
bctl key Escape --match journal-tui
bctl eval 'document.getElementById("zoomModal").classList.contains("open")' --match journal-tui
bctl console 3 --match journal-tui
```

Expected: a non-zero `.side` count, `true` then `false`, and no console errors. `bctl click` is synthetic — do not describe it as a real tap.

- [ ] **Step 5: Check every TOC anchor resolves**

```bash
bctl eval '[...document.querySelectorAll(".toc a")].filter(a=>!document.querySelector(a.getAttribute("href"))).map(a=>a.getAttribute("href")).join(",") || "all resolve"' --match journal-tui
```

Expected: `all resolve`

- [ ] **Step 6: Run the copy checks**

```bash
cd ~/nd28.github.io
grep -o -i "brutal\|fell out\|wall of\|at the end of the day\|game changer\|deep dive" probe/journal-tui.go.html | sort | uniq -c
grep -o "#[0-9A-Fa-f]\{6\}" probe/journal-tui.go.html | sort -u | head -40
grep -c "style=" probe/journal-tui.go.html
```

Expected: no idiom matches; every hex colour found must also appear inside the `:root` blocks copied from the base shell (check with `grep -n` on each); zero inline `style=` attributes.

- [ ] **Step 7: Re-read against the five common mistakes**

Read the finished article once, start to finish, checking for each:

1. Prose padded beyond verbose — anything that adds words without adding a fact. Cut it.
2. Narrating the obvious — any sentence of the form "this section shows…". Cut it.
3. Invented colours or styles instead of the tokens. Fixed by Step 6.
4. Filler level shipped without asking — was confirmed as verbose before the spec was written.
5. Redundant descriptors under an output preview — a `.cap` that restates what the exhibit already says. Rewrite it to add something, or delete it.

Fix what this finds before committing.

- [ ] **Step 8: Commit any fixes**

```bash
cd ~/nd28.github.io && git add probe/journal-tui.go.html && git commit -m "probe: journal-tui lens and copy pass"
```

If nothing needed fixing, skip this step and say so.

---

### Task 7: Index Card And Publish

**Files:**
- Modify: `probe/index.html` (new `<li>`, new `STATS` entry, static count pill)

**Interfaces:**
- Consumes: the finished `probe/journal-tui.go.html`.
- Produces: the published page.

- [ ] **Step 1: Add the card as the first list item**

Insert immediately after `<ul class="list">`, before the `t3-code.sh.html` card:

```html
      <li data-file="probe/journal-tui.go.html" data-tile="mint">
        <a href="journal-tui.go.html">
          <span class="tile mint" aria-hidden="true"></span>
          <span class="body-col">
            <span class="row-top"><span class="file">journal-tui.go.html</span></span>
            <span class="title">a combo meter for writing</span>
            <span class="desc">a terminal journal that scores you as you type — and every honesty problem that created</span>
          </span>
          <span class="side-col">
            <span class="mod" title="last modified"></span>
            <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </span>
        </a>
      </li>
```

- [ ] **Step 2: Add the STATS entry**

In the `var STATS = {` object, as the first entry:

```javascript
        'probe/journal-tui.go.html': '×5.0 combo · 15s reset · 2,449 lines · 4,162 test lines',
```

- [ ] **Step 3: Fix the stale count pill fallback**

The JS recomputes this on load, but the static text should not be wrong in the source. Change:

```html
<span class="count-pill" id="countPill">7 tools</span>
```

to:

```html
<span class="count-pill" id="countPill">9 tools</span>
```

- [ ] **Step 4: Verify the index locally**

```bash
bctl open "file:///home/nileshsuthar/nd28.github.io/probe/index.html" --match "probe/index"
bctl eval 'document.querySelectorAll(".list li").length + " cards | pill=" + document.getElementById("countPill").textContent' --match "probe/index"
bctl eval 'const li=document.querySelector("[data-file=\"probe/journal-tui.go.html\"]"); li ? li.querySelector(".title").textContent : "MISSING"' --match "probe/index"
```

Expected: `9 cards | pill=9 tools`, and `a combo meter for writing`.

- [ ] **Step 5: Check the search filter finds it**

```bash
bctl type ".search" "journal" --match "probe/index"
bctl key Enter --match "probe/index"
bctl eval '[...document.querySelectorAll(".list li")].filter(l=>l.style.display!=="none").length' --match "probe/index"
```

Expected: 1. Then clear the pinned chip before moving on.

- [ ] **Step 6: Commit**

```bash
cd ~/nd28.github.io && git add probe/index.html && git commit -m "probe: 'a combo meter for writing' — journal-tui, the game and the honesty it forced"
```

- [ ] **Step 7: Confirm the push target, then push**

The GitHub account reverts on its own, so re-check it immediately before pushing rather than trusting an earlier check.

```bash
gh auth status
cd ~/nd28.github.io && git log --oneline -7 && git status --short
```

Confirm the account is `nd28` and the commits are the expected ones. Then:

```bash
cd ~/nd28.github.io && git push origin master
```

- [ ] **Step 8: Verify live**

Pages takes roughly 30–85 seconds to build.

```bash
sleep 85
curl -sI "https://nd28.github.io/probe/journal-tui.go.html" | head -3
gh api repos/nd28/nd28.github.io/pages/builds/latest --jq '.status, .commit'
bctl open "https://nd28.github.io/probe/journal-tui.go.html?v=$(date +%s)" --match journal-tui
bctl eval 'document.title + " | imgs=" + [...document.images].filter(i=>i.naturalWidth>0).length + "/" + document.images.length' --match journal-tui
bctl console 3 --match journal-tui
```

Expected: `HTTP/2 200`, build status `built`, all four images loaded, console clean.

- [ ] **Step 9: Verify the live index card and popup**

```bash
bctl open "https://nd28.github.io/probe/?v=$(date +%s)" --match "probe/"
bctl eval 'document.querySelector("[data-file=\"probe/journal-tui.go.html\"]") ? "card present" : "MISSING"' --match "probe/"
```

Then open the card's detail popup and confirm the STATS line reads `×5.0 combo · 15s reset · 2,449 lines · 4,162 test lines`.

- [ ] **Step 10: Tick this plan's checkboxes and commit it**

```bash
cd ~/nd28.github.io && git add docs/superpowers/plans/2026-08-18-journal-tui.md && git commit -m "plan: journal-tui article complete" && git push origin master
```

---

## Self-Review

**Spec coverage:** page contract → Task 1; screenshots → Tasks 2–5; sections 01–06 → Tasks 3, 4, 5; house rules and the recovered mistakes list → Task 6 Steps 6–7; pixel budget with the recovered `DEFAULT_VP` and `metrics_js()` → Task 6 Steps 1–2; fact-checking exhibits → Task 3 Step 6, Task 4 Step 6, Task 5 Steps 1 and 5; publishing → Task 7. No spec section is unimplemented.

**Known gaps, stated rather than hidden:**

- `bctl` has no viewport-resize command. The original `lens.py` drove CDP device metrics directly; this rebuild uses `window.resizeTo`, which browsers may ignore for a non-scripted window. Task 6 Step 1 names the fallback and requires recording which method was used. If neither works, the pixel budget must be checked by hand at the five widths — it must not be skipped and reported as passing.
- The `1.7:1` stat tile is `4162 ÷ 2449 = 1.70`, rounded. Task 5 Step 1 re-derives all four numbers and requires updating the hero and tiles if the repo has moved.
- Screenshots are from 18 Aug 2026 and show v0.7.0. If the app changes before publishing, they become stale; they are labelled `real`, not `current`.
