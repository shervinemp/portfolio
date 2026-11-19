"""Render src/resume.html to resume.pdf (A4, print CSS, one page).

Usage: python scripts/build_resume.py
Requires: playwright with chromium installed.
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "resume.html"
OUT = ROOT / "resume.pdf"

# A4 is 297mm tall, the page CSS uses 9mm margins top and bottom.
PAGE_PX = (297 - 18) / 25.4 * 96
PRINT_WIDTH_PX = round((210 - 24) / 25.4 * 96)


def main() -> int:
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": PRINT_WIDTH_PX, "height": round(PAGE_PX)})
        page.emulate_media(media="print")
        page.goto(SRC.as_uri(), wait_until="load")
        page.evaluate("document.fonts.ready.then(() => true)")
        page.wait_for_timeout(800)

        height = page.evaluate("document.body.scrollHeight")
        if height > PAGE_PX:
            print(
                f"warning: content is {height:.0f}px and the page holds {PAGE_PX:.0f}px; "
                "trim content or the PDF will spill to a second page",
                file=sys.stderr,
            )

        page.pdf(path=str(OUT), format="A4", print_background=True, prefer_css_page_size=True)
        browser.close()

    print(f"wrote {OUT} ({height:.0f}px of {PAGE_PX:.0f}px)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
