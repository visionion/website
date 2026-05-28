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

Each site has its own dedicated Cloudflare Web Analytics beacon token, so they
are tracked independently in the dashboard.

| Site | Repo | Beacon token |
|------|------|--------------|
| visionion.dev | `visionion/website` | `81cd5e2f2c794625b7c0d4867208548d` |
| voxly.visionion.dev | `visionion/voxly-site` | `98fffaa4caee42f7ad769147ef4cd9d4` |
| xly.visionion.dev | `visionion/xly-site` | `11608d0167ea4527a78e1bbecdcd3f57` |
| devinspector.visionion.dev | `visionion/devinspector-site` | `ce184bd0e081451ab49d55dccf247430` |
| snapp.visionion.dev | `visionion/snapp-site` | `fab40f263af34cd7bab8c7928971e197` |
| focusguard.visionion.dev | `visionion/focusguard-site` | `0fb8a7ea8df846ac9b497b494a709847` |

- View traffic: https://dash.cloudflare.com → **Analytics & Logs → Web Analytics**.

Note: `visionion.dev` DNS is **not** on Cloudflare — that's fine. Web Analytics
is a JS beacon and works regardless of where DNS is hosted.

### Download conversion tracking (visit → download)

Cloudflare Web Analytics tracks page views (not arbitrary click events). To
measure how many visitors actually download, the "Download" buttons point to a
lightweight **`/download.html`** page instead of linking the DMG directly. That
page:
1. is recorded by the beacon as a pageview for the `/download.html` path, then
2. auto-redirects to the DMG (`/Voxly.dmg` or `/Xly.dmg`) after ~0.8s.

**To read the conversion rate** in the Cloudflare dashboard (Web Analytics →
the relevant site):
- Look at pageviews for `/` (visits) vs `/download.html` (download intents).
- `conversion ≈ /download.html views ÷ / views`.

For raw completed-download counts (not just intent), use `./scripts/stats.sh`
(GitHub Releases). Comparing the two also reveals how many download-page hits
turn into actual file downloads.

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
