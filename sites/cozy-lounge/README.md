# Cozy Lounge website (draft)

A standalone one page site for Cozy Lounge, 3870 E 25th St, Columbus, IN 47203.
Separate from Heart of Columbus: nothing here is built or tested by the main site.

Sources for every fact are listed at the top of `index.html`. Anything tagged
"placeholder" or "please confirm" waits on the owners.

## Deploy on Netlify

1. Netlify: Add new site, Import an existing project, pick this repo.
2. Base directory: `sites/cozy-lounge`. Build command: empty. Publish directory: `.`
3. Deploy. Netlify gives a `something.netlify.app` link right away.

Faster, no Git: drag the `sites/cozy-lounge` folder onto https://app.netlify.com/drop

## Point a domain at it

In Netlify: Domain management, Add a domain, type the domain you bought.
Then at the registrar either:

* switch nameservers to the four Netlify DNS nameservers Netlify shows you, or
* keep the registrar's DNS and add
  * `A` record for `@` pointing to `75.2.60.5`
  * `CNAME` record for `www` pointing to `your-site.netlify.app`

Netlify issues the HTTPS certificate on its own once DNS resolves.

## Going live

When the owners approve: remove the `draft` bar in `index.html`, the
`noindex` meta tag, and the `X-Robots-Tag` line in `netlify.toml`, fill in the
placeholders, and wire the party form (Netlify Forms works: add
`data-netlify="true"` and `name` attributes).
