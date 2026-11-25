# Cisco's Barbershop website (draft)

A standalone one page site for Cisco's Barbershop, Columbus, Indiana, for
Francisco "Cisco" Jimenez to review. Separate from the Heart of Columbus
directory pages, but served with the other drafts at
`/preview/ciscos-barber-shop/` (build.mjs `DRAFTS`), noindex like all of them.

Sources for every fact are at the top of `index.html`: his Wix site
(ciscos.site) for the words, hours, address, crew and portfolio pages, and his
own Booksy page for current prices and payment methods. Jake confirmed the
address on 2026-11-25: Cisco's has always been at 1719 Central Ave. Nothing is
invented.

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

1. **Booksy address.** His Booksy page ("Cisco's Barbershop", staff Francisco
   Jimenez De Dios) lists 1521 17th St, which is TJ's ChopShop. Until he fixes
   it there, "Book a cut" calls the shop (see Booking below). Jose's and
   Dariel's Booksy pages list 1521 17th St too, so their cards have no booking
   link.
2. **Prices.** The board follows Booksy (haircut $35). His website still shows
   2023 prices (haircut $30).
3. **Hours.** His website says weekdays 9 AM to 8 PM; Google says until 7 PM.
   Change the table and the `HOURS` line in the script together.
4. **Crew.** Taken from his Our Barbers page. Demetreus Weiler's Booksy page
   lists 3335 Marilyn St, so his card has no booking link. Each barber's own
   cell number is on his site; the draft leaves them off until he says which
   to show.
5. **Tattoos.** His Wix site has a hidden "Tattoo Booking" page. Left out until
   he says it is current.
6. **Photo.** See `img/README.md`.

## Booking

Every "Book a cut" button points at `BOOK_URL` near the bottom of `index.html`.
It calls the shop for now. Once Cisco's Booksy page shows 1719 Central Ave,
paste his Booksy link (it is in the comment above that line) and every button
follows, opening in a new tab. The phone link is also written into each button
so the page works without JavaScript; swap those too when the change is for
good. Francisco's and Enrique's crew cards say "Call to book" and call the shop
directly.

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
