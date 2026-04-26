# Changelog

All notable changes to Ad Arma. Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Self-hosted PeerJS 1.5.4 (`/vendor/peerjs-1.5.4.min.js`) — eliminates the unpkg.com runtime dependency.
- Self-hosted Cinzel + Source Sans 3 (`/fonts/`) — eliminates Google Fonts runtime dependency and the user-tracking surface that came with it.
- `<link rel="preload">` hints for fonts, main.js, and PeerJS so they parse during the intro overlay.
- Featured-battles strip in the intro overlay (Marathon, Cannae, Pharsalus, etc.).
- GitHub Actions CI (`.github/workflows/ci.yml`) — runs sanity-checks and HTML smoke test on every push and PR.
- `CHANGELOG.md` (this file).

### Changed
- Repo split from museum-style monorepo (`never-nude/ad-arma-site`) into focused `never-nude/ad-arma-2`.

## [20260317-augustus-cleanup-v2] — 2026-03-17 (forked from)

The build deployed at <https://ad-arma.com/> at the time of fork.

### Added (vs. live, in this fork)
- Real `<title>`, `<meta name="description">`, OpenGraph, Twitter Card, canonical, and theme-color metadata.
- Favicon (SVG + 32×32 PNG fallback), Apple touch icon, web manifest.
- Subresource Integrity hash on the PeerJS `<script>` (later superseded by self-hosting).
- Visible footer in the intro overlay linking back to source and disclosing PeerJS multiplayer relay.
- `robots.txt`, `sitemap.xml`.
- `README.md` documenting structure, run-locally, and deploy.

### Removed
- Leftover `window.POLEMO_BUILD_ID` / `window.POLEMO_BUILD` aliases from the prior project rename.
