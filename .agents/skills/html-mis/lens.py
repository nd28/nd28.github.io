#!/usr/bin/env python3
"""
mis_lens — view an MIS report across the pixel-budget spectrum.

Reuses bctl's CDP client to drive the already-open Brave tab. For each
viewport it sets device metrics, reloads (so media queries recompute),
captures a screenshot, and reports layout health: horizontal overflow,
hero footprint (% of first screen), and content-width utilization.

Philosophy: every pixel is a budget. Smaller screens get less; larger get
more. The lens shows you the budget being spent at each width.

Usage:
  python lens.py [URL-SUBSTRING] [--viewports W,H;W,H;...]
                 [--out DIR] [--metrics-only]

Requires the report tab to already be open in Brave, e.g.:
  bctl open file:///Users/nileshsuthar/mis_report.html
"""
import argparse, base64, importlib.machinery, importlib.util, sys, time

BCTL = "/Users/nileshsuthar/.local/bin/bctl"

# default spectrum: small phone -> large desktop
DEFAULT_VP = [(320, 568), (375, 667), (768, 1024), (1024, 768), (1440, 900)]
RESTORE = (1280, 800)

loader = importlib.machinery.SourceFileLoader("bctl", BCTL)
spec = importlib.util.spec_from_loader("bctl", loader)
bctl = importlib.util.module_from_spec(spec)
loader.exec_module(bctl)


def metrics_js():
    return """(() => {
      const de = document.documentElement;
      const sw = de.scrollWidth, cw = de.clientWidth;
      const hero = document.querySelector('.hero');
      const hr = hero ? hero.getBoundingClientRect() : {height:0};
      const wrap = document.querySelector('.wrap') || document.body;
      const wr = wrap.getBoundingClientRect();
      return {
        overflowX: sw > cw,
        scrollW: sw, clientW: cw,
        heroH: Math.round(hr.height),
        heroPct: Math.round(hr.height / window.innerHeight * 100),
        contentW: Math.round(wr.width),
        innerW: window.innerWidth,
        sections: document.querySelectorAll('section, .stats, footer').length
      };
    })()"""


def find_tab(match):
    ps = bctl.pages()
    return next((t for t in ps if match in t.get("url", "")), None)


def main():
    ap = argparse.ArgumentParser(description="MIS pixel-budget lens")
    ap.add_argument("match", nargs="?", default="mis_report",
                    help="substring to match the open tab's url")
    ap.add_argument("--viewports", default=None,
                    help="semicolon-separated W,H pairs, e.g. 320,568;375,667")
    ap.add_argument("--out", default="/Users/nileshsuthar",
                    help="directory for screenshots")
    ap.add_argument("--metrics-only", action="store_true",
                    help="skip screenshots, print the health table only")
    args = ap.parse_args()

    if args.viewports:
        vps = []
        for pair in args.viewports.split(";"):
            w, h = pair.split(",")
            vps.append((int(w), int(h)))
    else:
        vps = list(DEFAULT_VP)

    tab = find_tab(args.match)
    if not tab:
        sys.exit("tab matching '%s' not found.\n"
                 "open it first: bctl open file:///Users/nileshsuthar/mis_report.html"
                 % args.match)
    cdp = bctl.CDP(tab["webSocketDebuggerUrl"])

    print("%-5s %-5s %-4s %-7s %-9s %-8s %-4s" %
          ("W", "H", "ovf", "hero%", "contentW", "scrollW", "sec"))
    print("-" * 46)

    for (w, h) in vps:
        cdp.call("Emulation.setDeviceMetricsOverride",
                 width=w, height=h, deviceScaleFactor=1,
                 mobile=w < 600, screenWidth=w, screenHeight=h)
        cdp.call("Page.reload")
        time.sleep(0.7)
        res = cdp.call("Runtime.evaluate",
                       expression=metrics_js(), returnByValue=True)
        m = res["result"]["value"]
        flag = "YES" if m["overflowX"] else "no"
        print("%-5d %-5d %-4s %-6s%% %-9d %-8d %-4d" %
              (w, h, flag, m["heroPct"], m["contentW"], m["scrollW"], m["sections"]))
        if not args.metrics_only:
            r = cdp.call("Page.captureScreenshot",
                         format="png", captureBeyondViewport=False)
            out = "%s/mis_report_%dx%d.png" % (args.out, w, h)
            open(out, "wb").write(base64.b64decode(r["data"]))
            print("      shot -> %s" % out)

    cdp.call("Emulation.setDeviceMetricsOverride",
             width=RESTORE[0], height=RESTORE[1], deviceScaleFactor=1,
             mobile=False, screenWidth=RESTORE[0], screenHeight=RESTORE[1])
    cdp.call("Page.reload")
    cdp.close()
    print("-" * 46)
    print("restored tab to %dx%d" % RESTORE)


if __name__ == "__main__":
    main()
