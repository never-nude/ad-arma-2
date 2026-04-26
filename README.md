# Ad Arma

Classical-era hex tactics in the browser. Solo or online. No install.

Live: <https://ad-arma.com/> (note: this repo is a refactor of the deployed site — see *Deploy* below).

## What it is

A free, browser-based tactics game built around three ideas:

- **Command** — generals project a quality-dependent radius; units out of command suffer restrictions.
- **Cohesion** — formations either hold or fall apart; "disarray" is a real state, not just hit points.
- **Collapse** — three victory modes (proportional, annihilation, decapitation) all hinge on breaking the enemy's organization, not just chipping HP.

12+ historical scenarios (Marathon, Granicus, Cannae, Pharsalus, Zama, Ilipa, Carrhae, Thapsus, Philippi, Thermopylae, Tuderberg/Teutoburg), demo battles, terrain editor, AI opponent, online multiplayer via PeerJS, draft mode, doctrine builder ("War Council 3/3/3").

## Run locally

It is a static site — no build step, no dependencies to install.

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/
```

Or any other static server.

## Project layout

```
.
├── index.html               # SPA shell + intro/UI markup
├── build.js                 # Build identity (window.AD_ARMA_BUILD_ID)
├── app/
│   ├── main.js              # Game engine, rendering, networking, AI (~740 KB unminified)
│   ├── style.css            # All styling
│   ├── data/
│   │   └── scenario-meta.js # Historical scenarios, objectives, side labels
│   ├── rules/
│   │   ├── doctrine-effects.js
│   │   ├── doctrine-utils.js
│   │   └── objectives.js
│   ├── ui/
│   │   └── icons.js         # Unit-icon SVG helpers
│   └── tests/
│       └── sanity-checks.cjs
├── assets/                  # Unit icon PNGs, favicon, OG share image
├── site.webmanifest
├── robots.txt
└── sitemap.xml
```

## Third-party dependencies

- **PeerJS 1.5.4** — WebRTC signaling for online play, loaded from `unpkg.com` with SRI hash pinned. Multiplayer connection metadata is relayed via PeerJS's public broker; no game state is sent to any other server.
- **Google Fonts** — Cinzel and Source Sans 3, loaded from `fonts.googleapis.com`.

There are no analytics, no tracking, no cookies set by this site.

## Deploy

Hosted on GitHub Pages from the repo root.

To point `ad-arma.com` at this repo:

1. Settings → Pages → Source: `main` branch, `/ (root)`.
2. Settings → Pages → Custom domain: `ad-arma.com`.
3. Add a `CNAME` file containing `ad-arma.com` to the repo root.
4. Remove the custom-domain claim from the previous repo (`never-nude/ad-arma-site`).

DNS already resolves; the cutover only requires the CNAME swap on GitHub's side.

## Changes vs. `never-nude/ad-arma-site`

This is a focused, audit-fixed extraction of the game from the museum-style monorepo:

- Real `<title>`, OpenGraph, Twitter Card, canonical, theme-color metadata.
- Favicon (SVG + PNG fallbacks), apple-touch-icon, web manifest.
- SRI hash on the PeerJS `<script>` (subresource integrity).
- Removed leftover `POLEMO_*` aliases from previous project rename.
- `robots.txt` and `sitemap.xml`.
- Visible footer linking back to source.

The game engine is byte-identical to what was deployed at the time of fork.

## License

No license declared yet. All rights reserved by the author until a license is added.
