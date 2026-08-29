#!/usr/bin/env python3
"""Render the SW7 launcher icons from the same shapes as icon.svg.

A one-off asset step, not a build step: run it only when the mark changes.

    python3 make-icons.py

Writes icon-192.png, icon-512.png and icon-maskable-512.png. The maskable one
keeps the artwork inside the central 78% and bleeds the background to the edge,
because Android crops it to whatever shape the launcher feels like.
"""
from PIL import Image, ImageDraw

BG     = (7, 7, 10, 255)
TRACK  = (34, 28, 48, 255)
MINT   = (95, 211, 196, 255)
PINK   = (240, 111, 163, 255)
DOT    = (236, 231, 244, 255)
SS     = 4                      # supersample, then downscale for clean edges


def draw(size, scale, rounded):
    n = size * SS
    im = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    if rounded:
        d.rounded_rectangle([0, 0, n - 1, n - 1], radius=int(n * 0.219), fill=BG)
    else:
        d.rectangle([0, 0, n - 1, n - 1], fill=BG)

    c = n / 2
    r = n * 0.344 * scale           # 176/512 in the source
    w = int(n * 0.0508 * scale)     # stroke 26/512
    box = [c - r, c - r, c + r, c + r]

    d.arc(box, 0, 360, fill=TRACK, width=w)
    d.arc(box, -90, 144.4, fill=MINT, width=w)     # 720 of 1106 circumference
    d.arc(box, 160, 205.6, fill=PINK, width=w)     # 140 of 1106, rotated 160
    rd = n * 0.0664 * scale                        # centre dot 34/512
    d.ellipse([c - rd, c - rd, c + rd, c + rd], fill=DOT)

    return im.resize((size, size), Image.LANCZOS)


for name, size, scale, rounded in [
    ('icon-192.png', 192, 1.0, True),
    ('icon-512.png', 512, 1.0, True),
    ('icon-maskable-512.png', 512, 0.78, False),
]:
    draw(size, scale, rounded).save(name)
    print('wrote', name)
