# Research: independent businesses in Columbus, Indiana

`columbus-independents.csv` is the working list of every locally owned business
found so far, gathered October 2026 to decide who goes in the directory next.
It is research, not site data: nothing here is published, and a row moves into
`src/data/businesses.mjs` only after its facts are checked against the
business's own listing (see CLAUDE.md, "Never invent facts").

## Columns

| Column | Meaning |
| --- | --- |
| `category` | food, retail, service, trades |
| `address` | Columbus, IN 47201 unless the ZIP is noted. Blank means no address was found yet |
| `independent` | `yes`: a source says locally or family owned. `likely`: one location, no chain found. `check`: regional chain, franchise, or multi-store; decide before listing. `n/a`: nonprofit or public |
| `status` | `listed`: an active listing exists. `check`: conflicting address, old listing, or a closed flag somewhere. `CLOSED`: kept only so nobody re-adds it |
| `in_directory` | `yes` for the 16 businesses already on the hub |
| `source` | Where the row came from. VC = Visit Columbus (columbus.in.us, comeseecolumbus.com, visitcolumbusindiana.com); YP = Yellow Pages; MQ = MapQuest; CH = Columbus Area Chamber directory; DG = the 2020 local dining guide PDF; IDOC list = the state's restaurants-in-Columbus PDF; IN WIC 2018 = the state's 2018 farm market list |

## What it doesn't cover yet

- National chains and franchises are left out on purpose (Kroger, Walmart,
  Starbucks, Supercuts, Midas and so on).
- Excluded because they turned out to be elsewhere: results from Columbus, Ohio
  and Georgia, plus Nashville IN (Fallen Leaf Books, Weed Patch Music),
  Edinburgh (Exit 76 Antique Mall, Hickory Hillz BBQ), Hope, Seymour and
  Indianapolis addresses.
- Thin categories that need a second pass: food trucks, electricians,
  daycares, photographers, professional offices (law, accounting, insurance),
  churches and nonprofits.
- 76 rows have no address yet. Fill them before they go anywhere public.
