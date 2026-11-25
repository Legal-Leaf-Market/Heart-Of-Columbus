# Cisco's Barbershop website draft

Standalone owner review draft for Cisco's Barbershop in Columbus, Indiana.
Heart of Columbus serves it at `/preview/ciscos-barber-shop/` with search indexing
disabled. The source notes in `index.html` document business details and pricing.

The page includes a service menu, crew portfolio and booking links, and a visit
section with hours, a map, and directions. Theme follows the device until the
visitor chooses a setting. Mobile visitors have persistent call and directions
links. The hours indicator uses Columbus time and the schedule on Cisco's site.

## Before standalone publication

- Confirm weekday closing time, service prices, and the crew with Cisco.
- Main booking links call (812) 799-1858. Check that Cisco's Booksy profile shows
  1719 Central Ave before changing these links to online booking.
- Replace the editorial image with a shop photo approved by Cisco.
- Remove the owner review notes, draft banner, noindex meta tag, and robots
  header in `netlify.toml` after approval.

To deploy the standalone draft to Netlify, import this repo and use
`sites/ciscos-barber-shop` as the base directory and `.` as the publish directory.
The page needs no build command.
