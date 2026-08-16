# "The Verification Lied" — Probe Design

**Date:** 16 Aug 2026
**Status:** Approved

## Goal

A new self-contained probe report, `probe/verification-lied.html`, telling the moodie
invisible-modal story as a catalog-first report: five ways automated checks called a
dead app "working", then the one real bug, then the method that does not lie.

**Audience:** non-native English readers. Plain copy rules below are binding.

## Hard copy rules (non-native readers)

- Short words, short sentences. No idioms, no metaphors ("punchline", "mirror", "thumbs").
- Simple verbs: "returns nothing", "sits on top", "serves the old page", "fools you".
- Keep technical words as-is (elementFromPoint, pointer-events, cache) — they are the domain.
- Voice: honest, slightly imperfect — never a press release. Drop the polish, never the data.

## File & format

- `probe/verification-lied.html`, self-contained (inline CSS/JS, no CDN for logic).
- Same page system as the other reports: herobar, numbered sections (01–05) with `.sec-head`,
  TOC aside, zoomable exhibits (`.side` blocks + the safe-modal zoom IIFE from the other reports),
  footer with probe link + modified date.
- iMac-pink tokens only (`--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--muted`,
  `--pink-bold`, `--mint`, `--r-lg/--r-md/--r-sm`, `--font`, `--mono`). No new colors/radii.
- Theme-aware: `color-scheme: light dark`, light overrides only color tokens.
- Print-ready (`print-color-adjust: exact`, `break-inside: avoid` on cards).
- Title: "Session MIS Report — The Verification Lied". Date pill: 16 Aug 2026.
- Index: new card auto-lists via the GitHub API; add STATS map entry in `probe/index.html`:
  `'probe/verification-lied.html': '1 invisible modal · 5 lies · 0 caught by .click()'`.

## Structure

### Hero

- h1: The verification lied
- sub: Five ways automated checks said a dead app was working — and the one check that told the truth.
- Meta pills: Date 16 Aug 2026 · Vanilla JS · HTML · CSS · Open the app ↗ (moodie)

### Stats strip (4)

- `5` verification lies
- `1` real bug
- `2` CSS lines fixed
- `1` human report that caught it

### 01 The five lies (catalog)

Five cards. Each card: number + name, then three labeled lines — **The trap** (1 line),
**The sign** (1 line), **How to catch it** (1 line). Each card carries a zoomable `.side`
exhibit with the raw session evidence (real output lines).

1. **The programmatic click** — `.click()` fires the handler without a real pointer; it skips hit-testing.
   - Trap: a closed invisible layer on top still lets `.click()` "work".
   - Sign: `elementFromPoint` shows a different element on top.
   - Catch: hit-test every spot, never trust `.click()` alone.
   - Exhibit: the `MODAL:true, PANEL:3` line that "proved" the app worked.

2. **The off-screen probe** — `elementFromPoint` returns null below the fold.
   - Trap: a scroll mismatch reads as "blocked".
   - Sign: the result is `NULL` and the test point is outside the viewport.
   - Catch: scroll the element into view first, then hit-test.
   - Exhibit: `TOP:NULL chain: rect:(47,2048)` — point at y=2048 on an 800px viewport.

3. **The frozen tab** — a hidden or occluded tab freezes CSS transitions.
   - Trap: computed styles stay at their start values — `visibility` stuck `hidden`, `opacity` 0.
   - Sign: `document.visibilityState` is `hidden`.
   - Catch: check visibilityState; if hidden, neutralize transitions (`transition:none`) before asserting.
   - Exhibit: `vs:hidden tElapsed:1071ms vis:hidden opacity:0` — open modal reading hidden.

4. **The missing key** — remote key events do not deliver to real https pages.
   - Trap: a working Escape handler looks dead; the harness lies, not the code.
   - Sign: `bctl key Escape` does nothing on https, works on file://.
   - Catch: dispatch a synthetic `keydown` to test the handler; use a real tap for the UI path.
   - Exhibit: `state open:true` after two Escape presses — then `syntheticEsc open:false`.

5. **The stale page** — GitHub Pages CDN lags ~85s and service workers serve old shells.
   - Trap: you verify yesterday's app and call it done.
   - Sign: a fix "does nothing" until you cache-bust; the SW version is old.
   - Catch: cache-bust with `?v=$(date +%s)`, check the SW cache name.
   - Exhibit: `moodie-v1` serving the broken shell; `moodie-v3` network-first shipping the fix.

### Live demo (inside 01, after the catalog): "Lie #1 — try it"

A small interactive exhibit: a fake button, a toggleable invisible full-screen layer
(deliberately the wrong pattern: `position:fixed; inset:0; z-index:101; pointer-events:auto`,
opacity 0 only), and an `elementFromPoint` readout `<pre>`.

- Toggle button switches the layer on/off; the readout shows what is on top of the fake
  button (the layer vs the button itself).
- Own inline IIFE, unique IDs (`demoLayer`, `demoBtn`, `demoReadout`, `demoToggle`),
  zero effect on the rest of the page, no CSS collisions (no `.modal` reuse).
- Copy: two lines — "This layer is invisible. It blocks every tap." / readout label "What is on top of the button:".

### 02 The one bug (case study)

The moodie invisible modal, deep story. Parts:

1. **The symptom** — "nothing works and makes me feel sick." Every real tap dead: header buttons, garden, everything.
2. **The first lie in action** — our check ran `.click()` on the theme button and got `MODAL:true, PANEL:3` — "works!" It was lie #1.
3. **The reveal** — `elementFromPoint(theme-button)` returned `DIV#pageMood` *inside the closed* `#checkinModal` — `position:fixed; inset:0; z-index:101; pointer-events:auto`. The closed modal was a full-screen tap trap.
4. **The fix** — 2 CSS rules: closed `.modal` gets `visibility:hidden` + `pointer-events:none`; `.modal.open` gets `visible` + `auto`.
5. **The proof** — hit-test after the fix: `BUTTON` on top. Full real-tap flow verified: garden → mood → emotion → plant → entry saved.
6. **The last lesson** — the user's tap on a real phone caught what every browser check missed. Their tap was real. Ours was not.

### 03 The method that doesn't lie (checklist)

- Hit-test every interactive spot (`elementFromPoint`) — a closed modal must never be on top.
- Use real input events, not `.click()`.
- Scroll into view first; test points inside the viewport.
- Check `document.visibilityState`; neutralize transitions when the tab is hidden.
- Cache-bust with `?v=` and check the SW version.
- Last check: a human's device.

### 04 Key learnings (5 one-liners)

- `.click()` proves the handler runs. It says nothing about what a tap hits.
- `elementFromPoint` is the truth meter for invisible layers.
- A hidden tab's computed styles are frozen — read them with care.
- Keys, clicks and network all have delivery layers that can lie to you.
- The user's device is the final oracle.

### 05 Probes & tools

- `bctl` — real taps + hit-testing on a controlled browser.
- `elementFromPoint` — the lie detector.
- `lens.py` — overflow check 320→1440.
- `node --check` — syntax gate for inline scripts.
- `?v=` cache-bust — never verify yesterday's page.

## Zoom exhibits

All `.side` exhibits use the safe-modal zoom pattern already shipped in the other reports
(inline CSS + zoom IIFE with `#zoomModal`/`#zoomBackdrop`/`#zoomCard`).

## Verification

- `python3 lens.py "verification-lied" --metrics-only` → no overflow 320→1440.
- Local: `bctl goto file:///.../verification-lied.html` → hit-test fake button (layer off →
  HITS_BTN; layer on → the demo layer is on top); toggle works; readout updates; zoom opens/closes.
- Commit + push master; sleep ~85s; verify live with `?v=$(date +%s)` (hit-test, toggle, readout,
  zoom, console clean).
- Update `probe/index.html` STATS map in the same commit.