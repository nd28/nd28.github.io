# nd28.github.io

GitHub Pages site, served from the default branch (`master`) at the repo root.
Static pages only — no build step, no framework. Anything in `probe/` is a
one-off report or tool.

## Root homepage

- `index.html` is a minimal personal landing page — monogram, name, one-line
  blurb, a short link list, one-line footer. Same design system, single
  self-contained file, theme-aware.

## probe/ — one-off reports & tools

- Every probe is a **single self-contained HTML file** in `probe/` (inline CSS
  and JS; Google Fonts with a system fallback). No external assets.
- Filenames may carry a playful language hint, e.g. `diskvis.rb.html`.
- `probe/index.html` is the index: one card per probe + tag-based search.

## Conventions (apply to every probe)

- **Theme-aware, always.** `color-scheme: light dark;` on `:root`, dark tokens
  as the default, and a `@media (prefers-color-scheme: light)` block overriding
  only the *color* tokens. Never force a single theme.
- **Design system** (iMac-pink two-tone): tokens `--pink` / `--pink-bold` /
  `--mint` / `--bg` / `--surface` / `--surface-2` / `--border` / `--text` /
  `--muted`, radii 24 / 16 / 12, Geist + Geist Mono. Don't invent new colors.
- **Human voice.** Honest, slightly imperfect phrasing over polished prose —
  "flaw is fine; robot is not." Keep every value; drop the polish, never data.
- **One-hand mode.** Index content starts lower (`padding-top: clamp(110px,
  20vh, 180px)`) so search + cards sit in thumb reach on a phone.
- **Tag-based search** on the index: type → Enter pins a removable chip (× to
  drop), field clears for the next keyword, list filters by those chips. Capped
  at 3 keywords; an AND/OR toggle (default AND) switches match-all to match-any.

## sw7/ — the watch deck

- `https://nd28.github.io/sw7/`, a round-first micro-app deck for a Galaxy
  Watch 7 browser. See `sw7/README.md` for the interaction model.
- **The only place in this repo that is not theme-aware, on purpose.** It is a
  device app for an AMOLED panel worn outdoors: pure black background, no light
  mode. It still uses the house tokens (`--pink`, `--pink-bold`, `--mint`).
- **Not a single self-contained file, also on purpose** — a service worker has
  to be its own file at its own scope, and the manifest has to be fetchable.
- Publish with `sw7/bump.sh <version> "<message>"`, never by hand. It keeps the
  version the app shows, the service-worker cache name, and `CHANGELOG.md` in
  lockstep; a stale cache is the one way the watch runs an old build.

## Publishing

1. Keep source files locally; copy into the repo (`probe/<name>.html`,
   `probe/index.html`).
2. Commit to `master` and push — Pages builds from root, ~30s to go live.
3. Verify:
   - `curl -I https://nd28.github.io/probe/<name>.html`
   - `gh api repos/nd28/nd28.github.io/pages/builds/latest`
