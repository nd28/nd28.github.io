# Design — Probe article: "Inside the Concept Modal"

Date: 17 Aug 2026 · Repo: nd28/nd28.github.io (working copy: nd28pages) · Status: approved

## Purpose

A new probe article that explains how the concept modal UI of the Microservices Dojo PWA
(`nd28/microservices-rl-pwa`, live at https://nd28.github.io/microservices-rl-pwa/) works.
This is an anatomy deep-dive of a working system — not a bug report. The existing probe
`microservices-rl-pwa.html` already covers the five fixes; this article looks at how the
modal system is built and why it behaves the way it does.

## Decisions (user-approved)

- Angle: anatomy deep-dive.
- Structure: journey walkthrough — follow a learner through the app; each step reveals one mechanic.
- Interactivity: yes — a live demo inside the article that replicates the modal stack behavior.
- Filler level: verbose (explanatory prose per section).
- Audience: non-native English readers — short words, short sentences, no idioms; keep
  technical words (modalStack, elementFromPoint, etc.). Honest, evidence-based, never a press release.
- Everything the article claims about the app must be verified against the real app or its code.

## Page

- File: `probe/concept-modal.html` (new, self-contained, no dependencies).
- Base shell: copy of `probe/microservices-rl-pwa.html` (same tokens, herobar, TOC aside,
  zoom modal CSS + `#zoomModal`/`#zoomBackdrop`/`#zoomCard` IIFE, `.dels`/`.del`, `.learn` with
  `<span class="dot">` + `<b>`, footer). Same constraints as all probe pages: tokens only, no new
  colors/radii, theme-aware, print-ready, backtick-quoted terms stay as plain text with backticks.

## Hero

- Title (h1): `Inside the concept modal`
- Sub: `How one vanilla-JS bottom sheet runs the whole microservices dojo.`
- Pills: `Open the app ↗` → https://nd28.github.io/microservices-rl-pwa/ ; date `17 Aug 2026` ;
  file pill `probe/concept-modal.html`
- Stats strip: `6` Modals · `1` Shared overlay · `1` Stack · `4` Ways to close

## Sections (journey walkthrough)

All exhibits are zoomable `.side` blocks containing real code from the app
(`app.js`, `styles.css`, `index.html`). Every section carries a prose walkthrough.

- **01 The entrance** (`#s1`) — a concept card opens: `openConcept(id)` renders title/body/diagram
  into `#conceptModal`, then `openModal('conceptModal')`. The modal is a bottom sheet with a
  handle; the overlay is a shared element (`#modalOverlay`). Exhibit: the `openConcept` render +
  `openModal` code; the `.modal` / `.modal-overlay` CSS.
- **02 The stack** (`#s2`) — `modalStack` (array): opening adds the id and shows the overlay only
  when the stack was empty; closing pops the top and hides the overlay only when the stack empties.
  Concept → quiz → phase-complete can be open at the same time by design. Exhibit: `openModal` /
  `closeModal` / `initModals` code; `showPhaseCompleteModal` (dynamically created modal).
- **03 Four ways out** (`#s3`) — (1) tap the overlay, (2) Escape key, (3) swipe down on the modal
  handle (threshold 80px, only the concept modal's handle), (4) Dismiss/Done buttons. Each path
  calls the same `closeModal()`. Exhibit: the overlay/Escape listeners + the swipe handler code.
- **04 The chain** (`#s4`) — Quiz Me → `openQuiz` stacks the quiz modal → scoring → "Next Concept →"
  closes and reopens the next concept after 180ms; phase completion appends a dynamic modal.
  The chain is a sequence of `closeModal();setTimeout(open, 180)` hand-offs. Exhibit: the quiz
  footer + `Next Concept →` code.
- **05 Bookmarks & state** (`#s5`) — ★ button inside the concept modal toggles a bookmark in
  localStorage (`data.bookmarks`), re-renders the concept, and appears in the profile modal.
  The modal is not just chrome — it carries state. Exhibit: `toggleBookmark` code.
- **06 Glass & tokens** (`#s6`) — the visual layer: backdrop blur, gradient, rounded sheet,
  `--token` colors, responsive width (bottom sheet on mobile, wider sheet on desktop).
  Exhibit: the modal CSS block with the 560px breakpoint.

## Live demo (inside section 01, after the entrance walkthrough)

A working mini-replica of the stack mechanics, using only the page's tokens.

- IDs: `#demoOpen`, `#demoConcept`, `#demoQuiz`, `#demoHandleC`, `#demoHandleQ`,
  `#demoReadout`, `#demoOverlay`.
- Behavior (the app's own rules, simplified):
  - `#demoOpen` opens the concept sheet; readout: `stack: concept`.
  - The concept sheet's "Quiz Me" opens the quiz sheet ON TOP of it; readout: `stack: concept→quiz`;
    overlay stays visible; the concept sheet stays visible under the quiz sheet.
  - Swipe down on the top sheet's handle (80px) closes only the top sheet; readout back to
    `stack: concept`. Same for Escape and overlay tap: they close only the top sheet.
  - Buttons inside each sheet close that sheet.
  - Opening the quiz while the concept sheet is closed (demo state resets) opens just the quiz.
  - The demo never claims "real taps" for synthetic input.
- Readout is updated by the same logic that runs the demo — `elementFromPoint` is the truth
  meter for verifying the top sheet visually covers the lower one.

## Verification (binding)

- The article's claims about the real app are verified against the live app before publishing:
  open https://nd28.github.io/microservices-rl-pwa/, open a concept, run the quiz chain, and
  check stack depth + close paths with hit-tests (elementFromPoint) at in-viewport points.
  `bctl click` is synthetic — never call it a "real tap".
- The demo is verified locally in the harness: hidden tab freezes CSS transitions —
  `transition:none` before style assertions; test points must be in the viewport
  (force the demo into the viewport via inline style if needed, then clear it).
- lens.py (from `/Users/nileshsuthar/.agents/skills/html-mis/`): no overflow 320→1440.
- Publishing: add the index card `<li>` (static HTML, after the verification-lied card) and the
  STATS entry `'probe/concept-modal.html': '6 modals · 1 stack · 4 ways out · 0 frameworks'`
  (trailing comma valid). Commit both files, push, wait ~85s for the CDN, then verify live with
  `?v=$(date +%s)` cache-busting: h1, card present, popup stats line, console clean.

## Out of scope

- No changes to the microservices-rl-pwa app itself.
- No new CSS tokens or colors in the probe page.
- No new sections beyond the six above; no sub-pages.