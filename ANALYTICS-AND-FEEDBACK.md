# Analytics & Feedback

How we measure adoption and collect feedback **without breaking the apps'
"no tracking, no data collection" promise**. The apps themselves stay 100%
offline — all measurement is either server-side (GitHub) or visitor-only
(website), and all feedback is user-initiated.

## 1. Download counts (zero privacy cost)

GitHub Releases tracks DMG download counts automatically. View them with:

```bash
./scripts/stats.sh
```

Counts live on GitHub's side and contain no user data.

## 2. Web traffic — Cloudflare Web Analytics (cookieless)

Each app page (`voxly.visionion.dev`, `xly.visionion.dev`) includes the
Cloudflare Web Analytics beacon. It is **cookieless, collects no personal data,
and is GDPR-friendly** — it only measures page views and (optionally) button
clicks for the *website*, never the app.

### Status: configured ✅

A single Cloudflare Web Analytics beacon token is used across all three sites
(`visionion.dev`, `voxly.visionion.dev`, `xly.visionion.dev`). Cloudflare's
dashboard breaks traffic down per hostname, so one token covers everything.

- Token: `81cd5e2f2c794625b7c0d4867208548d`
- Embedded in: `visionion/website/index.html`, `visionion/voxly-site/index.html`,
  `visionion/xly-site/index.html`.
- View traffic: https://dash.cloudflare.com → **Analytics & Logs → Web Analytics**
  (filter by hostname to see each site).

Note: `visionion.dev` DNS is **not** on Cloudflare — that's fine. Web Analytics
is a JS beacon and works regardless of where DNS is hosted.

### Optional: track download-button clicks

Cloudflare auto-tracks page views. To also see download conversions, you can
later add a tiny `data-cf-beacon` event on the download buttons — ask and we'll
wire it up.

## 3. Feedback (user-initiated, nothing automatic)

- **Websites:** each app page has a "Feedback & Support" section linking to
  `mailto:info@visionion.dev`.
- **In-app:**
  - **Voxly** — menu-bar dropdown → **Send Feedback…** (opens email with app
    version, macOS version, and selected model pre-filled in the body).
  - **Xly** — **Help** menu → **Send Feedback…** (opens email with app/OS
    version pre-filled).

Nothing is transmitted unless the user reviews and sends the email themselves,
so this preserves the privacy promise.

## Where to look

| Metric | Where |
|--------|-------|
| Downloads per app | `./scripts/stats.sh` (GitHub Releases) |
| Page views / visitors | Cloudflare dashboard (Web Analytics) |
| Feedback | `info@visionion.dev` inbox |
