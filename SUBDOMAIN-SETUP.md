# Subdomain & App Distribution Setup

This documents the architecture for `visionion.dev` and per-app subdomains, and the
**one manual step you must do** (add DNS records).

## Architecture

| Site | Repo | Hosting | Custom domain |
|------|------|---------|---------------|
| Main landing page | `visionion/website` | GitHub Pages | `visionion.dev` |
| Voxly | `visionion/voxly-site` | GitHub Pages | `voxly.visionion.dev` |
| Xly | `visionion/xly-site` | GitHub Pages | `xly.visionion.dev` |

Each app gets its **own public repo + subdomain** for clean SEO. Add future apps the
same way: create `visionion/<app>-site`, add a `CNAME` file with `<app>.visionion.dev`,
enable Pages, and add the DNS record below.

## DNS records to add (manual)

At whatever manages DNS for `visionion.dev` (registrar / Cloudflare / Route 53), add a
`CNAME` record per subdomain pointing to the GitHub Pages host:

```
Type   Name    Value                    TTL
CNAME  voxly   visionion.github.io      3600
CNAME  xly     visionion.github.io      3600
```

> The apex `visionion.dev` keeps its existing records (A records to GitHub Pages IPs
> or its current setup). Only the two subdomain CNAMEs are new.

After DNS propagates (minutes to a few hours), GitHub auto-provisions HTTPS. You can
then enable **"Enforce HTTPS"** in each repo's Settings → Pages.

## Downloads (DMGs)

Free DMGs are published as **GitHub Releases on the public site repos** (the app source
repos are private, so their release assets aren't publicly downloadable):

- Voxly: https://github.com/visionion/voxly-site/releases/latest/download/Voxly.dmg
- Xly:   https://github.com/visionion/xly-site/releases/latest/download/Xly.dmg

To ship an update: build a new DMG, create a new release (e.g. `v1.1.0`) on the
corresponding `*-site` repo, and upload the DMG with the same asset name. The
`/releases/latest/download/<Name>.dmg` link auto-resolves to the newest release.

## Gatekeeper note (current builds)

The DMGs are **ad-hoc signed**. On other Macs, Gatekeeper shows "unidentified
developer" — users must right-click → Open on first launch. For a frictionless
experience, sign with a **Developer ID Application** certificate and **notarize**
(`xcrun notarytool submit ... && xcrun stapler staple`). You have the Apple Developer
account; see Apple's notarization docs.

## SEO

- Each subdomain has canonical URLs, OpenGraph/Twitter cards, JSON-LD
  `SoftwareApplication` (price 0), `robots.txt`, and `sitemap.xml`.
- The old `visionion.dev/voxly/` and `visionion.dev/xly/` paths now serve redirect
  stubs (`noindex, follow` + canonical + meta-refresh) to the subdomains, preserving
  any existing inbound links and consolidating ranking signals.
