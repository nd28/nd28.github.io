# SW7 changelog

## 0.7.0 — 2026-08-27 18:51 IST

New: Weather — keyless Open-Meteo, the day's temperature drawn as a curve round the rim, last reading kept for when the watch is out of range. Stopwatch keeps every lap and the rim walks them. Breathe shows how long you have been at it. The title now sits above the view's own graphic instead of under it.

## 0.6.0 — 2026-08-27 18:30 IST

Hold the home button or the dial and the current app lists its tap, hold and rim. New: Level, reading relative tilt with the number riding inside the bubble. The dial now shows a running app's state instead of 'tap to open'.

## 0.5.0 — 2026-08-27 18:14 IST

Clock gets three faces on the rim — digital, a real analog one with a sweeping second hand, and words. New: Moon, with a properly drawn terminator and a rim that walks the calendar. New: Echo, the memory game, pads on the diagonals so the home button does not sit on one.

## 0.4.2 — 2026-08-27 16:02 IST

Precache with cache:'reload' and register with updateViaCache:'none' — Pages sends max-age=600, so the worker could cache the very build it was replacing.

## 0.4.1 — 2026-08-27 15:59 IST

Take a new build automatically when it is safe to — reload on the dial, toast otherwise, never yank you out of a running timer.

## 0.4.0 — 2026-08-27 15:57 IST

Four more: Intervals (timestamp-driven, keeps running off-screen), Sun (offline NOAA sunrise math on a 24-hour ring), Compass (absolute-orientation rose with a bearing mark), Reaction (see-it or feel-it). Bezel now accelerates when you spin it. Fixed a router race where tapping an app during a back() bounced you to the dial.

## 0.3.1 — 2026-08-27 15:34 IST

bump.sh was prepending the changelog above its own header.

## 0.3.0 — 2026-08-27 15:33 IST

Entrance animation is transform-only — an opacity keyframe could park a whole view at invisible if the browser froze the animation timeline. Lifted the dimmest text for daylight.

## 0.2.0 — 2026-08-27 15:28 IST

Timer keeps its own alarm timeout so it fires from the dial too; dial pulses whichever app is live; breathe orb no longer shrinks under its own label; ?dev hook skips the service worker.

## 0.1.0 — 2026-08-27 15:24 IST

First build: home dial with bezel rotation, eight apps (clock, timer, stopwatch, tally, breathe, decide, metronome, torch), fullscreen + wake lock on first tap, offline shell.
