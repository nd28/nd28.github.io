# Probe pages — Safe Modal (design)

Date: 2026-08-16
Status: approved (user picked: popup on card click, moodie report gets the modal finding)

## Context

moodie's real tap-killer was closed modals being invisible full-screen tap blockers
(`.modal` had `inset:0; z-index:101` with `pointer-events:auto` while closed).
The fix — `pointer-events:none` + `visibility:hidden` when closed, `auto`/`visible`
when `.open` — solved it. We now apply the same safe modal concept to the nd28pages
probe pages: card details popup, exhibit zoom in reports, and a skill recipe so
future pages inherit the pattern.

## The safe modal pattern (canonical)

```css
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(12px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .5s,visibility .5s;z-index:100}
.modal-backdrop.open{opacity:1;visibility:visible;pointer-events:auto}
.modal{position:fixed;inset:0;background:var(--bg-deep);z-index:101;opacity:0;visibility:hidden;pointer-events:none;transition:opacity .5s,visibility .5s;overflow:hidden}
.modal.open{opacity:1;visibility:visible;pointer-events:auto}
```

Rules:
- A closed modal/backdrop must NEVER receive pointer events or be focusable
  (opacity alone is not enough).
- ESC, ✕ button, and backdrop click all close.
- `role="dialog" aria-modal="true"` + `aria-label` on the modal.
- Focus moves to the modal (first focusable) on open, returns to the trigger on close.

## Feature 1 — Card details popup (`probe/index.html`)

- Clicking a card (`li[data-file] > a`) is intercepted: `preventDefault` on the link
  click, open the popup instead. No navigation on card click.
- Popup shows: file name (mono), title, description, "modified <date>"
  (reuse the per-card date already fetched into `li.dataset.mtime` / `.mod` text),
  a stats line, and an "Open probe →" link whose href is the card's original href.
- Stats map (hardcoded in the script):
  - `probe/diskvis.rb.html` → "written twice — Ruby and Perl"
  - `probe/microservices-rl-pwa.html` → "5 fixes: glass, modal, swipe, stats, no greeting"
  - `probe/moodie-fix.html` → "1 misplaced quote · 3 lines · 1 invisible tap-blocking modal"
- Missing date or stats must degrade silently (omit the line).
- Card click still filters/search works; sorting by date unchanged.

## Feature 2 — Exhibit zoom (3 report pages)

`probe/moodie-fix.html`, `probe/microservices-rl-pwa.html`, `probe/diskvis.rb.html`:

- Clicking any `.side` panel inside `.ex` opens the zoom modal.
- Modal shows a clone of the panel at readable size: same `.tag` (before/after color
  preserved), `.note` text, `code`/`pre` content; font-size scaled up (~1.6–2×),
  max-width ~560px, scrollable if taller than viewport.
- Same close behaviors (✕ / backdrop / ESC), same focus handling.
- Reports stay self-contained: the snippet is inlined per page, no shared JS file.

## Feature 3 — moodie-fix report update

`probe/moodie-fix.html` currently tells only the quote-bug story. Add the real
root cause: closed modals were invisible full-screen tap blockers
(`pointer-events:auto` on `.modal` while closed), fixed by the safe pattern
(commit `408ce0c`). Concretely:
- Update "What Broke" to name both layers (script parse error AND invisible modal).
- Add one before/after exhibit pair for the `.modal` CSS fix.
- Update stats: "1 misplaced quote · 3 lines · 1 invisible tap-blocking modal".

## Feature 4 — Skill recipe

Add a "Safe modal (never blocks taps)" entry to
`/Users/nileshsuthar/.agents/skills/html-mis/SKILL.md`, same style as the
"Sticky search row" entry: canonical CSS, the pointer-events rule, close behaviors,
focus handling.

## Verification

- `python3 lens.py "<page>" --metrics-only` after each change (no overflow 320→1440).
- bctl real-tap tests (never programmatic `.click()` alone):
  - `document.elementFromPoint` at button/panel coords shows the real target
    (closed modal must NOT be on top).
  - Real click opens popup/zoom; real click on backdrop closes; ESC closes.
  - Focus lands in the modal, returns to the trigger.
- Git: commit per feature, push `origin master` (nd28pages), re-verify live
  (allow ~85s CDN lag, use `?v=` cache buster).

## Non-goals

- No shared/external JS file for reports (must stay self-contained/offline-openable).
- No changes to moodie itself, the search filter, or card sort logic.