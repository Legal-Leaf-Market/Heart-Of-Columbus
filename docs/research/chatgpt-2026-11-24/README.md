# ChatGPT research pass, 2026-11-24

Answers to `docs/research/scraping-brief.md`, kept as research, not as facts
for the site. Reviewed by Claude Code the same day:

- **platform-playbook.md:** per-platform notes. Main finding: Square, Toast
  and Clover menus sit behind authenticated APIs and terms that limit
  scraping, so they stay links. The open gap is restaurant menus published as
  PDFs or plain HTML on a restaurant's own site (Amazing Joe's PDF, Black
  Sheep Pizza's menu page): a menu reader for those is the next crawler step.
- **business-audit.csv:** one row per site. 258 of 317 rows are
  "unverified"; its own live_check column shows its browsing was blocked
  (ProxyError, ReadTimeout). The 59 confirmed rows match what the daily
  crawl already reads. Useful mainly for the menu URLs it found.
- **independent-additions.csv:** 8 candidates. Outcome:
  - Added (src/data/added.mjs, each checked against the page named there):
    PAQ'D Meats (own site), Max's Jewelry (YellowPages listing).
  - Already listed: Wild Bramble Catering. Apna Bazaar shares Apna Kitchen's
    address (needs a person to decide if it's a separate shop).
  - Not added: M&M Sportscards (Google marks it permanently closed);
    Blessing International Market (bim-shop.com did not answer); High Heat
    Cards (site returns 404); Gold Nugget Pawn (Hope, outside Columbus).
