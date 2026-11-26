# Hero image

`cisco-at-work.webp` comes from the homepage at https://www.ciscos.site/.
The hero crops the image to a square on desktop and slightly wider on phones.
When replacing it, update the source, dimensions and alternative text in
`../index.html`.

The room backdrop and floating barber tools are original illustrations for the draft.

The build copies this folder's assets to `/preview/ciscos-barber-shop/img/`.

# Prior cuts gallery

`gallery/` holds the Prior cuts photos: 90 photos from the eight barber
portfolio pages on https://www.ciscos.site/ (Francisco, Enrique, Marisela,
Klenny, Daniel, Dariel, Jose, Demetreus), shown for owner review. Each is
cropped square and lightly graded by `scripts/ciscos-gallery.py` from the list in
`scripts/data/ciscos-gallery.json`, which also names the style of each post.
`<id>.webp` is 1080 square for the viewer, `<id>-s.webp` is 480 square for the
grid. To redo them, fetch the raw downloads from the `checks/ciscos-gallery-raw`
branch (the "Fetch Cisco's gallery" workflow refreshes it) and run the script.
