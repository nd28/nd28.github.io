# Probe Article: "The Consistency Machine" — the html-mis Skill

Date: 17 Aug 2026
Status: approved
Filler level: verbose

## Goal

A new probe article that explains the `html-mis` skill — the system that lets us
generate probe articles consistently. Angle: **the consistency system** — the
rules inside the skill that force every article to look and read the same.
Structure: **journey through the skill** (same shape as concept-modal).

## Subject facts (source of truth)

- Skill folder: `~/.agents/skills/html-mis/`
- `SKILL.md` — 566 lines of rules (filler levels, voice, design system, pixel
  budget, verification table, publishing, workflow)
- `lens.py` — 119 lines, the pixel-budget verifier (drives bctl CDP, 5 default
  viewports 320→1440, prints overflow/hero%/contentW table)
- All exhibits are verbatim from these two real files.

## Page contract

- File: `probe/html-mis.html` (copied from base `probe/microservices-rl-pwa.html` shell)
- Title: `Session MIS Report — The Consistency Machine`
- Hero title: `html-mis skill`, h1: `The consistency machine`
- Sub: `How one markdown file makes every probe article read the same.`
- Pills: Date 17 Aug 2026 · `probe/html-mis.html` · Read 12 min · `skill: html-mis`
- Stats (4): `415` skill lines · `119` lens lines · `3` filler levels · `16` tokens
- Footer `#modtime`: 17 Aug 2026

## Sections (6) + TOC (7 l2)

### 01 The skill — `#s1-skill`
One folder, two files: `SKILL.md` (the rules) and `lens.py` (the verifier).
Exhibit: the front matter verbatim (name + description trigger). Prose point:
the skill loads before work starts — rules come first, not after. l2: `#s1-skill`.

### 02 The dial — `#s2-dial` + `#s2-demo`
Filler-prose table verbatim (minimal 0 / balanced 1 / verbose 2). The rule:
"never assume — ask". Prose: the level is a budget for words; the same data
stays at every level. **Live demo** in `#s2-demo`: inline toggle, three pill
buttons (`#demoMin`, `#demoBal`, `#demoVerb`), one sample report section
(`#demoBody`) re-rendered per level — no sheet, no overlay, own IIFE, unique
IDs, token-only styling.

### 03 The voice — `#s3-voice`
Plain-English rules verbatim ("very slow", not "brutal"; "a long number", not
"a wall of digits"). Human-not-polished quote verbatim ("wrote it twice and
they agree"). Prose: consistent voice is a rule, not a mood.

### 04 The design system — `#s4-tokens`
The `:root` token block verbatim (16 tokens). "Do not invent new styles." The
type hierarchy table verbatim. Mono-always-smaller rule. Theme-aware light
block + the three contrast traps (accent tokens, `--code`, `--glass`).

### 05 The budget — `#s5-budget`
Pixel-budget rules (tokens scale with width, hero ≤ ~45% phone viewport,
overflow is a budget violation). Exhibit: real `lens.py` output table verbatim
(from this session's runs) + `DEFAULT_VP` list. Prose: the lens shows the
budget being spent.

### 06 The mistakes list — `#s6-checks`
The Common mistakes list verbatim (5 items) + the 8-step workflow verbatim.
Closing meta point: consistency comes from constraints, not talent.

Note (17 Aug): the skill was revised mid-build — the old "Verifying the
report" section (five-lies table) was removed by the author; the article
describes the skill as it exists now.

## Live demo spec (02)

- Markup: `.demo-row` with three `button.pill` elements + `#demoBody` holding a
  sample section (heading + stats strip + prose).
- JS (inline IIFE before zoom IIFE): click sets active pill (token classes
  only) and swaps `#demoBody.innerHTML` to the matching version.
- Three versions written at the three levels for the same sample content
  (e.g. "what we did today: wrote two probe articles"). Same numbers in all
  three; only prose changes — that is the point of the demo.
- Verification: bctl click each pill (synthetic — labelled as such), assert
  `#demoBody` content matches the level; elementFromPoint on a pill returns
  the pill (no overlay swallowing taps).

## Copy rules (self-imposed, from the skill itself)

- Short words, short sentences, no idioms (reader may not be a native speaker).
- Backtick-quoted terms stay plain text — no `<code>`.
- Only tokens from the base `:root` — no new colors/radii/fonts.
- Verbose filler level: prose allowed, no padding, no narrating the obvious.
- The article must obey the skill it describes — that is part of the point.

## Verification (truth rules — same as prior reports)

1. Local: zoom opens/closes on `.side` exhibits; lens clean at 320→1440;
   demo toggle works (elementFromPoint truth meter); console clean.
2. Meta-check: grep the article for banned idiom list (e.g. "brutal", "fell
   out", "wall of") — must be zero; grep for inline hex colors outside the
   base `:root` — must be zero.
3. Publish: commit + push; sleep 85; live check with `?v=$(date +%s)`;
   live demo toggle hit-tested on the published page; index card + STATS
   popup verified live; console clean.

## Publishing

- Index: card `<li data-file="probe/html-mis.html">` after the concept-modal
  card; title `the consistency machine`; desc `one markdown file + one script —
  how every probe page reads the same`.
- STATS entry: `'probe/html-mis.html': '566 lines · 3 levels · 16 tokens · 1 lens'`.
- Commit message: `probe: 'the consistency machine' — how the html-mis skill
  writes every article the same way`.
- Plan checkboxes ticked at the end (same workflow as concept-modal).
