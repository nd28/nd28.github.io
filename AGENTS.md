# nd28.github.io

GitHub Pages site, served from the default branch (`master`) at the repo root.
Static pages only — no build step, no framework. Anything in `probe/` is a
one-off report or tool.

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
  drop), field clears for the next keyword, list filters to items matching all
  chips (AND).

## Publishing

1. Keep source files locally; copy into the repo (`probe/<name>.html`,
   `probe/index.html`).
2. Commit to `master` and push — Pages builds from root, ~30s to go live.
3. Verify:
   - `curl -I https://nd28.github.io/probe/<name>.html`
   - `gh api repos/nd28/nd28.github.io/pages/builds/latest`
