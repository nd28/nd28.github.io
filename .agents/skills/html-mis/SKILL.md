---
name: html-mis
description: Use when the user asks for an MIS (Management Information System) report, session/activity report, or build summary as HTML — especially when they want to control how much explanatory prose is included. Supports a per-request filler-prose level (minimal / balanced / verbose).
---

# HTML MIS Report

Generate a self-contained HTML **MIS / session report** from structured data
or a conversation summary. The defining feature: a **filler-prose level**
the user picks per report, so output stays as lean or as narrated as they want.

## Before you start

1. **Confirm the filler-prose level.** This is required — never assume.
   - Ask if the user didn't state it: *"Filler prose level — minimal, balanced, or verbose?"*
   - If they give a number (e.g. 0/1/2) or a phrase ("tight", "no fluff",
     "explain everything"), map it to a level.
   - **Default to `minimal`** when they say nothing and you must proceed.
2. Confirm **purpose/audience** (exec one-pager vs. technical deep-dive) and
   **scope** (which sections / which data).
3. State the **output path** (default `mis_report.html` in cwd).

## Filler-prose levels (the core option)

| Level | Code | What's allowed |
|-------|------|----------------|
| **minimal** | 0 | Facts, data, tables, checklists, code/previews only. No sentences explaining what the data means. Scannable. |
| **balanced** | 1 | Minimal + one short sentence per section stating the key takeaway. No paragraphs. |
| **verbose** | 2 | Balanced + short paragraphs of context/methodology. Still no padding or repetition. |

**Rule:** prose may never exceed the chosen level. When in doubt, drop words.
A report at `minimal` should feel like a dashboard; at `verbose` like a brief.

## Voice — human, not polished

A good read is human-centric, not perfect — intentionally flawed beats sterile.
Write like the person who did the work talking to you, not a press release:
honest, slightly imperfect phrasing ("wrote it twice and they agree", "turned
out", "good enough") over robotic parallel prose. Flaw is fine; robot is not.
Keep every value — drop the polish, never the data.

## Hard requirements

- **One self-contained `.html` file.** Inline CSS in `<style>`. No CDN for
  logic; fonts may use a `<link>` with a system fallback stack.
- **Print-ready.** `@media print` keeps backgrounds (`print-color-adjust:
  exact`) and uses `break-inside: avoid` on cards/tables.
- **Accessible & responsive.** Semantic tags, one `<h1>`, logical heading
  order, `auto-fit`/`minmax()` grids, horizontal-scroll wrapper on tables.
- **No data loss.** Reproduce every requested value; label any rounding.
- **Theme-aware.** Follow the OS light/dark scheme (see *Theme-aware* below);
  never force a single theme.
- **Output the complete file**, not a fragment.

## Design system (do not invent new styles)

iMac-Pink two-tone, relaxing genz — muted warm-dark base, neon only as accent.

```css
:root{
  --pink-soft:#FBD6E6; --pink:#F7B8D2; --pink-bold:#F06FA3; /* iMac pink: soft front / bold rear */
  --mint:#5FD3C4;        /* calm "value" highlight (checkmarks, key terms) */
  --bg:#15131C; --bg-2:#1B1726; --surface:#211C2E; --surface-2:#2A2438;
  --border:#342C45; --text:#ECE7F4; --muted:#9C93AE;
  --r-lg:24px; --r-md:16px; --r-sm:12px;   /* radii: 24 sections, 16 cards, 12 pills */
  --font:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;
  --mono:'Geist Mono','JetBrains Mono',ui-monospace,monospace;
}
```

- Background gets faint radial glows (pink + mint) for depth, not flat black.
- **Eye flow:** numbered section heads (01–0n) → left-accented items that
  nudge right on hover → consistent 8px spacing scale.
  - Neon used **sparingly** as highlight only; muted base carries the page.

## Theme-aware (light & dark)

Pages follow the OS theme — they don't force dark. Add `color-scheme: light
dark;` to `:root`, keep the dark palette as the `:root` default, and override
only the **color** tokens (never spacing/size) in a light block.

```css
:root { color-scheme: light dark; /* dark tokens live here */ }
@media (prefers-color-scheme: light){
  :root{
    --pink:#D34F8A; --pink-bold:#C43E7C; --mint:#2E9E8F;
    --bg:#FBF6F0; --surface:#FFFFFF; --surface-2:#F1EAE0;
    --border:#E6DDD0; --text:#2A2333; --muted:#84798E;
    --code:#B63A74; --glass:rgba(251, 246, 240, 0.82);
  }
}
```

Contrast traps (this is where theming breaks):

- **Accent tokens are text *and* decoration.** `--pink`/`--mint` color big
  numbers *and* gradients, so they must get **darker** in light mode to stay
  readable on white — the same neon hex can't serve both themes.
- **`code` needs its own token (`--code`).** It's a light pink in dark but must
  flip to a *deep* pink in light. A single token can't do both — add `--code`,
  don't reuse `--pink-soft`.
- **Translucent chrome needs a token (`--glass`).** Sticky bars are
  `rgba(21,19,28,0.78)` in dark; in light that's a dark smear — tokenize it and
  flip to `rgba(251,246,240,0.82)`.

## Pixel budget (the core constraint)

Every pixel is a budget. Smaller screens get a **smaller** budget; larger
screens get a **larger** one. Design so the report spends its budget where it
earns attention and stops spending where it doesn't.

- **Tokens scale with width.** Define generous values at the desktop `:root`,
  then **shrink** spacing/type/radii at narrow breakpoints
  (`@media (max-width:760px)`, `@media (max-width:380px)`) and **grow** them
  again at wide ones. Never hardcode one size for every screen — that either
  wastes a big budget or busts a small one.
- **Hero pays the highest rent** (it's the first screen). Keep it lean: a
  monogram mark, one `h1`, one sub line, 2–3 meta pills. Target **≤ ~45%** of
  a phone viewport; on desktop it may take more because the budget is bigger.
- **Overflow is a budget violation.** Horizontal scroll on a phone means you
  spent pixels you didn't have. Fix with `min-width:0` on grid/flex children
  and `max-width:100%` on `pre`.
- **Columns are a budget.** `auto-fit`/`minmax()` is the default; a 4-up
  metric band is a desktop luxury that must collapse to 2-up then 1-up as the
  budget shrinks.

Verify with the bundled **lens** (`lens.py`): it renders the report at several
widths (320 → 1440), screenshots each, and prints overflow / hero-footprint /
content-width so you can watch the budget being spent.

## Sticky hero summary (collapsing hero)

The hero pays the highest rent, but once the reader scrolls past it they still
want context. Pattern: a slim fixed bar slides in from the top **after** the
hero leaves the viewport, carrying a condensed one-liner (title + a compact
summary of the meta), and slides away at the top. This keeps the hero lean
without losing identity mid-scroll.

```css
.herobar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 55;
  height: var(--herobar-h, 48px);
  background: var(--glass);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border);
  transform: translateY(-100%);
  transition: transform .25s ease;
}
.herobar.show { transform: translateY(0); }
.herobar .inner {
  height: 100%; max-width: 1000px; margin: 0 auto; padding: 0 var(--bar-x);
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
@media (max-width: 760px){ .herobar .s { display: none; } }
```

```js
var bar = document.getElementById('herobar');
var hero = document.querySelector('.hero');
if (bar && hero && 'IntersectionObserver' in window) {
  new IntersectionObserver(function (e) {
    bar.classList.toggle('show', !e[0].isIntersecting);
  }, { threshold: 0 }).observe(hero);
} else if (bar) bar.classList.add('show');
```

Rules:

- **`position: fixed`, not `sticky`** — it must take no layout space, so it
  slides cleanly without leaving a gap above the hero.
- **Bump `--scroll-offset`** to `--herobar-h` + ~8px so bottom-nav anchor jumps
  land *below* the bar instead of under it.
- **Keep the one-liner desktop-only** (title only on phones) — the full
  summary is a larger-budget luxury.
- If a scroll-progress line also exists, keep it *above* the bar in z-order
  (progress `z-index: 60` > bar `z-index: 55`).

### Sticky section headers

Each `.sec-head` can stick the same way, so the section you're in stays
labelled while you scroll. Pin it just below the herobar with the same glass
chrome:

```css
.sec-head {
  position: sticky; top: var(--herobar-h, 48px); z-index: 40;
  background: var(--glass);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  padding: 12px 0 18px; border-bottom: 1px solid var(--border);
}
```

- `top` = the herobar height, so the header tucks *under* the bar instead of
  colliding with it.
- `z-index` sits below the herobar (55) and progress line (60) — the header
  must never cover the bar.
- Add a little top padding (`12px`) so the number/title isn't flush against the
  bar when stuck.

## Probe index page (directory listing)

Reports usually live in a `probe/` folder served by GitHub Pages. That folder
needs an `index.html` listing every probe, same design system:

- **A card per probe** — mono filename (pink) + title + one-line description.
- **Tag-based search** (not live-type). Type a keyword, press Enter → it
  becomes a removable chip (`×` drops it), the field clears for the next
  keyword, and the list filters to items matching **all** chips (AND logic).
  Dedupe tags (same keyword won't stack); show a "nothing matches" line when
  zero remain.

```js
var active = [];
search.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    var v = search.value.trim().toLowerCase();
    if (v && active.indexOf(v) === -1) { active.push(v); render(); filter(); }
    search.value = '';
  }
});
// filter(): item visible iff active.every(t => item.text.includes(t))
```

- **One-hand mode** — content starts lower, `padding-top: clamp(110px, 20vh,
  180px)`, so on a phone the search + cards land in thumb reach instead of the
  top edge.

## Structure

```
<header>   eyebrow · h1 · one-line sub · meta pills (date, langs, deps)   </header>
<section>  stat strip (≤4 key metrics)                                   </section>
<section>  what was done (output previews / artifacts first)              </section>
<section>  comparison table (high signal, low noise)                     </section>
<section>  key learnings (topic — detail one-liners)                     </section>
<section>  probes & tools (title + one short phrase each)                </section>
<section>  spec coverage / checklist                                     </section>
<footer>   source note                                                   </footer>
```

Keep sections data-first. At `minimal`, delete every sentence that merely
restates what the data already shows.

## Common mistakes

- **Padding with prose** beyond the chosen filler level (the #1 failure — cut it).
- **Narrating the obvious** ("This section shows the languages used.").
- **Inventing colors/styles** instead of using the token system above.
- **Forgetting to ask the filler level** and silently shipping verbose.
- **Redundant descriptors** under output previews — the artifact speaks for itself.

## Publishing (GitHub Pages)

- Serve reports from the user's Pages repo at
  `<user>.github.io/probe/<name>.html`. A filename like `diskvis.rb.html`
  (`.rb`/`.pl`) is a playful hint that it's a Ruby/Perl artifact — keep it.
- `probe/` needs an `index.html` (the probe index above), or `/probe/` 404s.
- Pages builds from the default branch root; a push takes ~30s to go live.
  Verify with `curl` and
  `gh api repos/<user>/<repo>.github.io/pages/builds/latest`.
- Keep source files locally (`mis_report.html`, `probe-index.html`) and copy
  them into the repo; commit + push to publish.

## Workflow

1. Confirm filler level + scope.
2. Gather/compute the data (read files if needed).
3. Write the complete `mis_report.html`.
4. Open/verify it renders, fits, and respects the filler level.
5. Run `lens.py` to view the report across the pixel-budget spectrum
   (320 → 1440); confirm no overflow and a lean hero at phone widths.
6. Make it theme-aware (light + dark) and, if it's a probe, add a card to
   `probe/index.html` with a search tag.
7. Publish to GitHub Pages and verify the live URL (see *Publishing*).
8. Report any uncertainty rather than dropping data.
