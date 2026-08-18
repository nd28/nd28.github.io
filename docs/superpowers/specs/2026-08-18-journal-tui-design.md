# Probe Article: "A Combo Meter For Writing" — journal-tui

Date: 18 Aug 2026
Status: draft — awaiting approval
Filler level: verbose (asked, not assumed — level 2: balanced plus short
paragraphs of context and methodology, no padding, no repetition)

## House rules this article obeys

The `html-mis` skill it names is no longer on this machine. Its rules are
recovered verbatim from `probe/html-mis.html`, which quotes `SKILL.md` and
`lens.py` directly, and they are binding here:

- **Plain, simple English.** Reader may not be a native speaker. Short words,
  short sentences. No idioms, no fancy verbs — "very slow", not "brutal";
  "happened on its own", not "fell out". Technical words stay; everything
  around them stays simple.
- **Human, not polished.** Write like the person who did the work talking to
  you. Honest, slightly imperfect phrasing beats a press release. Flaw is fine;
  robot is not. Keep every value — drop the polish, never the data.
- **The five common mistakes**, checked before publish: padding with prose
  beyond the filler level (the #1 failure); narrating the obvious ("this
  section shows…"); inventing colors or styles instead of using the tokens;
  silently shipping verbose without asking; redundant descriptors under an
  output preview, which speaks for itself.
- **Report uncertainty rather than dropping data.**

## Goal

A probe article introducing `journal-tui`, a terminal journaling app that scores
you while you type. Angle: **the game, then the honesty** — every decision that
made the app fun forced a second decision to keep it truthful, and the newest
design turns the whole game off. Structure: **journey through the build**, same
shape as `t3-code.sh.html`.

## Subject facts (source of truth)

Repo: `~/journal` → `github.com/nd28/journal-tui`, Go 1.25, Bubble Tea + bubbles
+ SQLite. Version `0.7.0` (`internal/tui/model.go:9`). 52 commits, 14 Jul → 18
Aug 2026 (35 days). 2,449 lines of Go excluding tests; 4,162 lines of test; 170
test functions. `make test` = build + vet + test, passing at time of writing.

Every exhibit below is verbatim from the repo — source, commit message, or
schema. No invented output.

- `internal/scoring/combo.go` — the constants block; `decay`; `CompleteWord`
- `internal/scoring/session.go` — `RestoreSession` and its comment; `StreakBonus`
- `internal/scoring/intensity.go` — `PaceTracker`, `PaceSampler`, `IntensityTier`,
  `LiveTier`
- `internal/store/store.go` — the `schema` const; `dbFileMode = 0o600`
- `internal/store/drafts.go` — `Draft`, `SaveDraft`, `UnfinishedSession`
- `internal/tui/writing.go` — `autosaveInterval`, `maxWordsPerUpdate`,
  `writingSaveStatus`, the typed-run guard
- commit `30350b3` — "Write typed runs as text instead of matching them as key names"
- `~/journal/docs/superpowers/specs/2026-08-18-journal-zen-mode-design.md` — zen mode

## Page contract

- File: `probe/journal-tui.go.html`, copied from the `probe/t3-code.sh.html` shell
  (One UI 8.5 soft, pink/mint, light-first, `data-theme` override).
- Title: `Session MIS Report — A Combo Meter For Writing`
- Herobar: `journal-tui` / `a terminal journal that scores you as you type`
- Hero h1: `A combo meter for writing`
- Sub: `A terminal journal that pays you ten points a word and multiplies them
  while you keep going. Every decision that made it fun forced a second one to
  keep it honest.`
- Pills: Date `18 Aug 2026` · `Go 1.25 · Bubble Tea · SQLite` · `v0.7.0 · 52 commits`
  · link `github.com/nd28/journal-tui`
- Stats (4): `×5.0` combo cap · `15s` wipes it · `1.7:1` test lines to code ·
  `6` places the game shows
- Footer `#modtime`: 18 Aug 2026 · go · 35 days · 52 commits

## Screenshots

Four real PNGs from `~/journal/docs/screenshots/`, inlined base64 in
`figure.screenshot` (the `dir-iter.html` pattern — probes stay self-contained):
`writing-unsaved.png` (§01), `recovery-home.png` + `resumed-session.png` (§03),
`summary.png` (§05). Total added weight ~160 KB.

## Sections (6) + TOC

### 01 The Game — `#s1-loop`, `#s1-numbers`
What the app is and what the loop feels like. Ten points a word, multiplied by a
live combo that climbs while you keep typing. Screenshot of the writing screen.
Exhibit: the `combo.go` constants block verbatim. Prose: the multiplier is not a
score of the session, it is a reading of the last few seconds — bump `+0.1` per
3 words while gaps stay under `1.5s`, drain `0.08` a second after a `2s` pause,
floor at `1.0` after `15s`. Streak bonus is `+5%` a day, capped at `+50%`.
l2: `#s1-loop` (what it does), `#s1-numbers` (the constants).

### 02 The Reading — `#s2-window`, `#s2-median`
The game needs a pace number, and the obvious pace number lies. Exhibit:
`PaceMinElapsed` and its comment (two words a second apart imply 120 WPM).
Exhibit: the `PaceSampler` doc comment — median of live readings, not total words
÷ wall-clock, because thinking time drags an average toward zero, and the same readings are
what the intensity ratio divides by. Prose: `IntensityTier` returns
an empty string on purpose and `LiveTier` never does — a retrospective tag on an
old session must stay silent, a live header must always say something.

### 03 The Crash — `#s3-draft`, `#s3-restore`
Autosave every `5s` into a `drafts` table that holds one row per session and
mirrors the buffer instead of recording history. Exhibit: the `drafts` table from
the `schema` const. Screenshot: the home screen offering an unfinished session
back; the resumed session. Exhibit: `RestoreSession`'s comment verbatim — the
combo restarts at `1.0`, because restoring a 4× multiplier would pay out for
momentum that no longer exists. Prose: `saved` / `unsaved` sits on screen because
the point of autosave is that you never wonder. Sessions opened but never written
in are cleaned up silently.

### 04 The Word "up" — `#s4-runs`, `#s4-paste`
The bug worth reading the repo for. Typing "up" moved the cursor and ate the letters;
typing "esc" mid-sentence ended the session. Exhibit: the corrupted sentence from
commit `30350b3` verbatim. Cause: bubbletea coalesces a read into one `KeyMsg`
and `Key.String()` renders it as the run itself, so typed letters are
byte-for-byte identical to the arrow key. Fix: a run of more than one rune is
always text — insert it directly, match keys on `Type` not `String()`. Reproduced
at a deliberate 120 ms per word against the real binary, not a fast-typing edge
case. Second half: the two guards that stop the game paying for words nobody
typed — the paste block, and `maxWordsPerUpdate = 20` so a bypass cannot poison
the pace baseline.

### 05 The Shape — `#s5-shape`
Summary screenshot. The numbers of the build: 2,449 lines of Go, 4,162 lines of
test, 170 test functions, 52 commits over 35 days, a database at `~/.journal/`
created `0600` because SQLite makes it `0644`. Prose: nearly two lines of test
per line of code is what it costs to make a scoring rule you can argue about.

### 06 The Off Switch — `#s6-zen`
Zen mode: **designed 18 Aug 2026, not shipped** — labelled as such, in the prose
and in the section. The game shows in six places; zen silences all six and
changes nothing underneath. `ctrl+z` is free to bind because raw mode clears
`ISIG`, so it never becomes SIGTSTP. The `saved`/`unsaved` marker survives zen —
honesty is not gamification. Closing beat: the guard test that a session written
start to finish in zen still advances the streak, so zen can never quietly become
a mode where writing does not count.

## Copy rules

- Short words, short sentences, no idioms. Human voice, not polished.
- Only tokens from the base `:root` — no new colors, radii or fonts.
- Every number in the article traceable to the repo.
- Zen mode never described as shipped.

## Verification

**1. The pixel budget.** `lens.py` is gone with the skill, but the measurement
it ran is quoted verbatim in `probe/html-mis.html` and gets rebuilt as a
throwaway check: drive `bctl` across the recovered spectrum

```
DEFAULT_VP = [(320, 568), (375, 667), (768, 1024), (1024, 768), (1440, 900)]
```

evaluating the recovered `metrics_js()` at each width — `overflowX`, `scrollW`,
`clientW`, `heroH`, `heroPct`, `contentW`, section count — and print the same
table the original did (`W H ovf hero% contentW scrollW sec`). Pass = no
overflow at any width and a lean hero at phone widths; the article this rule
came from measured 34% at 320 and 24% at 375. Checked in light and dark.

**2. The page itself.** Every TOC anchor resolves; `.side` exhibits zoom open
and close; console clean.

**3. The mistakes list + copy rules.** Re-read against the five common mistakes.
Grep the finished file for the banned idioms ("brutal", "fell out", "wall of")
— must be zero. Grep for hex colors outside the base `:root` — must be zero.

**4. Facts.** Every exhibit diffed against its source file; `make test` passing
in `~/journal` before publishing (build + vet + test).

**5. Publish.** Commit + push to `master`; `curl -I` the live URL; index card
and STATS popup checked live.

## Publishing

- Index: new `<li data-file="probe/journal-tui.go.html" data-tile="mint">` first
  in the list (newest first). Title `a combo meter for writing`; desc
  `a terminal journal that scores you as you type — and every honesty problem
  that created`. Static count pill text `7 tools` → `9 tools` (JS recomputes it,
  but the fallback should not be stale).
- STATS: `'probe/journal-tui.go.html': '×5.0 combo · 15s reset · 2,449 lines · 4,162 test lines'`
- Commit: `probe: 'a combo meter for writing' — journal-tui, the game and the honesty it forced`
