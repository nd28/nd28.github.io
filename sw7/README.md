# SW7

A round-first micro-app deck for a Galaxy Watch 7 browser. No build step, no
framework, no network once it has loaded.

**https://nd28.github.io/sw7/**

## Getting it onto the watch

Typing a URL on a 44 mm keyboard is miserable, so don't. Open the link on the
phone, then use the browser's *send to watch* / *continue on* handoff — or add
it once and let the launcher keep it. Add to Home Screen gives it a real icon
and drops the URL bar.

## How it works on the wrist

- **The outer 40% of the glass is a bezel.** Drag around it and the selection
  ticks every 18°, with a haptic detent on each step. Works with the Watch 7's
  touch bezel because that is just touch input near the rim.
- **The middle is a button.** Tap to act, hold ~0.6 s to reset.
- **The first tap** requests fullscreen, takes a screen wake lock, and unlocks
  audio. A watch screen sleeps in about 15 seconds otherwise, which makes a
  timer useless. The dot next to the clock on the dial is lit while the lock
  holds.
- **The system back swipe** pops to the dial instead of leaving the page — each
  app pushes a history entry.

## The eight

| app | tap | hold | bezel |
| --- | --- | --- | --- |
| Clock | 12 h ⇄ 24 h | — | — |
| Timer | start / pause | reset | ±10 s / 30 s / 60 s, or shift a running timer |
| Stopwatch | start / stop | lap while running, reset while stopped | — |
| Tally | +1 | reset | ±1, for fixing a miscount |
| Breathe | start / stop | stop | switch pattern (Box, 4-7-8, Calm, Deep) |
| Decide | roll | roll | d6 / d20 / d100 / coin / yes-no |
| Metronome | start / stop | back to 96 bpm | ±2 bpm |
| Torch | light on / off | off | five brightness steps |

Holding the dial itself shows the build stamp.

## Layout

Every length is `calc(var(--u) * n)`, where `--u` is 1% of the watch diameter,
set from JS on resize. One number changes and the whole face scales — 480 px on
a wrist, 420 px in a desktop preview, identical geometry. Nothing is in `px`,
`vmin` or a media query.

On a desktop the page draws a watch case around the glass so the round crop
reads as intentional. Keyboard stands in for the bezel: arrows rotate, Enter
taps, `r` holds, Escape goes home.

## Files

    index.html   the shell — one section per app
    style.css    tokens + round layout
    app.js       gesture engine, router, the eight apps
    sw.js        offline cache (cache-first, refreshes in the background)
    bump.sh      stamp a version + publish

`?dev` exposes `window.SW7` (`open`, `home`, `cur`) and skips the service
worker, so an edit shows up on plain reload.

## Publishing

    ./bump.sh 0.2.0 "what changed"

Stamps `VERSION`/`BUILD` in `app.js`, renames the service-worker cache, writes
`CHANGELOG.md`, commits and pushes. The cache rename is the part that matters:
without it a watch happily runs yesterday's build forever.
