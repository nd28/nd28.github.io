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
  touch bezel because that is just touch input near the rim. Spin it fast and
  each detent counts for up to five, the way a digital crown behaves —
  otherwise 5:00 to 45:00 is forty separate detents.
- **The middle is a button.** Tap to act, hold ~0.6 s to reset.
- **The first tap** requests fullscreen, takes a screen wake lock, and unlocks
  audio. A watch screen sleeps in about 15 seconds otherwise, which makes a
  timer useless. The dot next to the clock on the dial is lit while the lock
  holds.
- **The system back swipe** pops to the dial instead of leaving the page — each
  app pushes a history entry.

## The fifteen

| app | tap | hold | bezel |
| --- | --- | --- | --- |
| Clock | 12 h ⇄ 24 h | — | face: digital / analog / words |
| Timer | start / pause | reset | ±10 s / 30 s / 60 s, or shift a running timer |
| Intervals | start / stop | stop | pick a set (tabata, 30/15, 40/20, 45/15, 60/30, 60/60) |
| Stopwatch | start / stop | lap while running, reset while stopped | — |
| Tally | +1 | reset | ±1, for fixing a miscount |
| Breathe | start / stop | stop | switch pattern (Box, 4-7-8, Calm, Deep) |
| Sun | refresh location | forget location | next / sunrise / sunset / golden hour / daylight |
| Moon | cycle the readout, or jump back to tonight | back to tonight | walk the calendar a day at a time |
| Compass | drop or clear a bearing | clear the bearing | nudge the bearing ±1° |
| Level | zero it where it sits | clear the zero | range ±5° / 15° / 45° |
| Reaction | arm, then tap on the cue | clear the best | see it ⇄ feel it |
| Echo | start, then tap the pads back | clear the best | easy / brisk / sharp |
| Decide | roll | roll | d6 / d20 / d100 / coin / yes-no |
| Metronome | start / stop | back to 96 bpm | ±2 bpm |
| Torch | light on / off | off | five brightness steps |

**Hold the home button — or the dial — and the app tells you what it answers
to.** Fifteen apps times three gestures is more than anyone will hold in their
head, and there is no room on a 44 mm screen to label anything. The card lists
tap, hold and rim for whatever is on screen, plus the build stamp. It clears on
a tap, or by itself after seven seconds.

**The dial says what is happening.** If the selected app is doing something —
a timer counting down, an interval set running, a stopwatch going — the line
under its name is that, live, in the app's colour, rather than *tap to open*.
Their icons pulse on the dial at the same time.

**Timer and Intervals keep running when you leave them.** Both derive their
state from a timestamp rather than from frame counting, and both arm a real
timeout for the next cue — `frame()` only ticks for whichever app is on screen,
so a countdown that relied on it would go quiet the moment you went back to the
dial. Their icons pulse there while they run.

**Sun** works out sunrise, solar noon, sunset and the golden hours from the
NOAA sunrise equation — pure arithmetic, so it needs the network exactly never.
It asks for a location once and caches it; the ring is a 24-hour dial with
midnight at the bottom, the lit arc is daylight, the pale caps are the golden
hours, and the dot is now. Accurate to a couple of minutes, which is all a
wrist needs. Polar day and night are handled rather than dividing by nothing.

**Compass** wants `deviceorientationabsolute` (Android) or
`webkitCompassHeading` (iOS). Plain relative `deviceorientation` is ignored
because it is not a compass. If nothing arrives in 2.2 s it says so instead of
sitting on a dead rose.

**Reaction** in *feel it* mode gives no visual cue at all — only the haptic. It
is a genuinely different reflex, and a good use of a thing strapped to you.

**Clock** has three faces on the rim. The analog one has a real sweeping second
hand — sub-second precision every frame, not a tick — because that is the whole
point of putting hands on a round screen. The words face reads the time out:
*quarter past / six*.

**Moon** draws the terminator properly: the lit face is a semicircular limb
closed by a half-ellipse whose width collapses to nothing at the quarters and
bulges the other way past half. Phase comes from Meeus' low-precision series,
which puts the new moon of 6 January 2000 at 0.00000 lit — the mean-lunation
shortcut most code uses is a day out near the quarters. Turn the rim and it
walks the calendar a day at a time, filling and emptying as it goes.

**Level** reads `deviceorientation`'s relative tilt, so unlike the compass it
needs no absolute orientation and works in far more browsers. The reading rides
inside the bubble — anywhere else on a round face and the bubble ends up
sitting on top of it at some tilt. Tap zeroes it wherever it is, for a surface
that is not itself flat. Axes follow the W3C convention; the bubble rides to
the high side.

**Echo** is the memory game, with a tone and a haptic per pad. The pads sit on
the diagonals rather than the axes, because bottom-centre belongs to the home
button and a pad hiding underneath it would be unhittable.

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
`CHANGELOG.md`, commits and pushes. It refuses to start if `gh` is on the wrong
account, because otherwise it fails at the push, after the commit is made.

The cache rename is the part that matters: without it a watch happily runs
yesterday's build forever. Even with it, the page already running keeps its old
assets — so when the new worker takes over, SW7 reloads itself if it is sitting
on the dial with nothing counting down, and toasts *update ready · reload* if
it isn't.
