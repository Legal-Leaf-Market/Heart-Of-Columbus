# Cisco's Barbershop website (draft)

A standalone one page site for Cisco's Barbershop, Columbus, Indiana, for
Francisco "Cisco" Jimenez to review. Separate from the Heart of Columbus
directory pages, but served with the other drafts at
`/preview/ciscos-barber-shop/` (build.mjs `DRAFTS`), noindex like all of them.

Sources for every fact are at the top of `index.html`: his Wix site
(ciscos.site) for the words, hours, address, crew and portfolio pages, and his
own Booksy page for current prices and payment methods. Nothing is invented.

## What is on it

* Barber pole band across the top (still when the visitor asks for reduced
  motion), gold leaf script with a red shade, navy, pole red and brass. Light
  and dark follow the device; the moon button switches and remembers.
* Hero: "Welcome, my friend, to Cisco's", his tagline, and a live Open now /
  Closed badge on Columbus time (America/Indiana/Indianapolis). The same clock
  highlights today in the hours table.
* Three ways in (appointments, everyday walk ins, private event makeup and
  hairstyle), a price board, the crew with Booksy and portfolio links, the visit
  panel with directions, phone, email, payment and a map, and a newsletter
  sign up.

## Open questions for Cisco (tagged on the page)

1. **Address.** His Booksy page ("Cisco's Barbershop", staff Francisco Jimenez
   De Dios) now lists 1521 17th St, as do Jose's and Dariel's. His website,
   Google and the Chamber still say 1719 Central Ave. 1521 17th St is also the
   address on the TJ's ChopShop draft. The page keeps 1719 Central Ave until he
   answers. If he has moved, change the address in the hero line, the visit
   panel, the directions link, the map and the footer.
2. **Prices.** The board follows Booksy (haircut $35). His website still shows
   2023 prices (haircut $30).
3. **Hours.** His website says weekdays 9 AM to 8 PM; Google says until 7 PM.
   Change the table and the `HOURS` line in the script together.
4. **Crew.** Taken from his Our Barbers page. Demetreus Weiler's Booksy page
   lists 3335 Marilyn St, so his card has no booking button. Each barber's own
   cell number is on his site; the draft leaves them off until he says which
   to show.
5. **Tattoos.** His Wix site has a hidden "Tattoo Booking" page. Left out until
   he says it is current.
6. **Photo.** See `img/README.md`.

## Booking

Every "Book a cut" button points at `BOOK_URL` near the bottom of `index.html`,
set to his own Booksy page. Paste a different link there and they all follow.
The same link is also written into each button so the page works without
JavaScript; update those too if the link changes for good.

## Newsletter

The form checks the address and tells the visitor nothing was sent. Before it
goes live, connect a list. On its own Netlify site the simplest is Netlify
Forms: add `name="newsletter" data-netlify="true" method="POST"` to the form,
remove `novalidate` and the submit handler's `preventDefault`, and Netlify
collects the addresses. Do not switch it on while the page is served under
Heart of Columbus, or the addresses would land in Heart of Columbus's forms.

## Deploy on Netlify

1. Netlify: Add new site, Import an existing project, pick this repo.
2. Base directory: `sites/ciscos-barber-shop`. Build command: empty. Publish directory: `.`
3. Deploy.

Faster, no Git: drag the `sites/ciscos-barber-shop` folder onto https://app.netlify.com/drop

## Going live

When Cisco approves: answer the tagged questions, add his photo, remove the
draft bar, the `noindex` meta tag and the `X-Robots-Tag` line in
`netlify.toml`, connect the newsletter, then point his domain (ciscos.site is
on Wix today) at the new site.
