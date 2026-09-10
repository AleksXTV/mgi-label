# M.G.I. Records v1.1

Production-oriented Nuxt 4 website for **M.G.I. Records**. The public site is a responsive bilingual editorial experience; mutable content, images, configuration, and messages live in the runtime `data/` directory and do not require a Nuxt rebuild.

## What is included

- Nuxt 4 + Vue 3 + TypeScript + Nitro server API.
- HOME, ARTISTS, MUSIC, VIDEOS, SERVICES, ABOUT.
- ENG/RUS custom dropdown stored in a cookie.
- Dark/Light custom dropdown stored in a cookie.
- Runtime JSON content with a universal block/layout model.
- `/configure` server-authenticated administration area.
- Raw JSON editor with Format, Validate, Save and Paste Text utility.
- Image upload/list/delete with 10 MB limit, file-name normalization, SVG safety screening, and reference warnings.
- Contact requests saved to `data/messages.json` and then delivered to an array of Telegram recipients.
- Admin message list with new/read state, detail view, delete and JSON export.
- YouTube, Vimeo, Spotify, SoundCloud and Bandcamp URL handling. YouTube embeds include explicit origin/referrer identification required by current YouTube player rules.
- Lazy external players; only one managed external player is mounted at a time.
- Fullscreen image viewer with preserved aspect ratio.
- Basic SEO metadata, OpenGraph, `robots.txt` and runtime `sitemap.xml`.
- Responsive editorial design with restrained multi-tone theme accents, rebalanced typography, and `prefers-reduced-motion` support.

## Requirements

Use a Node.js release supported by the installed Nuxt version. For the versions pinned in this project, use **Node.js 22.19+ LTS** (or another version matching `package.json#engines`).

## StackBlitz development

1. Create/import a StackBlitz Node/Nuxt project.
2. Upload/copy the contents of this repository.
3. Run:

```bash
npm install
npm run dev
```

No Node/Nuxt installation is needed on your personal computer when working through StackBlitz; the tooling runs inside its browser-hosted development environment.

The first public login is intentionally the specification default:

```text
Username: Admin
Password: 12345
```

**Change this before exposing `/configure` to the public Internet.** Edit `data/config/admin.json` directly on the server. The password is plaintext by explicit project requirement.

## Runtime data

```text
data/
├── site.json
├── pages/
│   ├── home.json
│   ├── artists.json
│   ├── music.json
│   ├── videos.json
│   ├── services.json
│   └── about.json
├── images/
├── config/
│   ├── admin.json
│   └── telegram.json
└── messages.json
```

At runtime the server resolves `data/` as:

1. `MGI_DATA_DIR` if set, otherwise
2. `<current working directory>/data`.

This resolution occurs **at server runtime**, not during the StackBlitz build. This is important: no StackBlitz filesystem path is compiled into the production application.

## Content JSON

`data/site.json` contains branding, languages, themes and the ordered menu. Menu labels are independent from `route` and `page`.

Branding uses ordinary runtime image filenames:

```json
"branding": {
  "logo": "mgi_logo.svg",
  "favicon": "mgi_favicon.svg"
}
```

Both fields may point to uploaded `PNG`, `JPG/JPEG`, `WebP`, `AVIF`, `GIF/APNG` or `SVG` files in `data/images`. For example, after uploading your real logo through `/configure`, set `"logo": "mgi_logo.png"`. The same runtime mechanism is used for the favicon.

Each page has:

```json
{
  "schemaVersion": 1,
  "id": "home",
  "enabled": true,
  "seo": {},
  "blocks": []
}
```

Supported layouts in v1.1:

```text
hero
statement
editorial
split-left
split-right
media-wide
music-showcase
video-grid
video-list
contact-form
```

Text may be a single string or an array of paragraphs:

```json
"text": {
  "en": "One short paragraph.",
  "ru": [
    "Первый абзац.",
    "Второй абзац."
  ]
}
```

The admin **Paste Text** utility converts blank-line-separated pasted text to this form.

Media types:

```text
image
embed
audio
```

Image JSON stores only the filename, for example:

```json
{
  "type": "image",
  "source": "vitasun.webp"
}
```

Images are served at runtime through `/media/<filename>`.

## `/configure`

Open:

```text
https://your-domain.example/configure
```

Sections:

- **JSON** — edit only `site.json` and page JSON files.
- **Images** — upload, list and delete images.
- **Messages** — view, mark read, delete and download requests.
- **Logout** — terminate the current server session.

`admin.json`, `telegram.json`, and `messages.json` are intentionally not exposed by the raw JSON editor.

The admin login uses a server-side in-memory session token stored in an HttpOnly session cookie. Closing the browser ends the cookie session; restarting the Node server also invalidates in-memory sessions.

## Image upload rules

Maximum upload size: **10 MB**.

Accepted v1.1 formats:

```text
AVIF, WebP, JPEG/JPG, PNG, APNG, GIF, SVG
```

No automatic resize/conversion is performed. Upload production-ready files.

File names are normalized:

```text
My Beautiful PHOTO.WebP
→ my_beautiful_photo.webp
```

Uppercase becomes lowercase; whitespace becomes `_`; unsafe filename characters are normalized. If the final normalized filename already exists, the upload is rejected. Existing files are never silently overwritten.

SVG is accepted, but obvious active content (`script`, inline event handlers, `javascript:`, `foreignObject`, iframe/object/embed) is rejected. This is a deliberately conservative v1 screening layer, not a general-purpose SVG sanitizer.

## Telegram

Edit `data/config/telegram.json` through SSH/server filesystem:

```json
{
  "botToken": "123456:ABC...",
  "recipients": [
    { "chatId": "123456789", "enabled": true },
    { "chatId": "987654321", "enabled": true }
  ]
}
```

Submission flow:

```text
browser
  → POST /api/contact
  → validate + rate limit + honeypot/minimum-time check
  → save to data/messages.json
  → attempt Telegram send to each enabled recipient once
  → save delivery status
```

A locally saved request is considered accepted even if Telegram is temporarily unavailable. Automatic Telegram retries are intentionally outside v1.

## Demo media

`music.json` and `videos.json` include public external embeds as functional placeholders. Replace their URLs in `/configure` when real M.G.I. Records media is ready.

Provider behavior:

- YouTube: standard embedded player loaded after click with `strict-origin-when-cross-origin` and a runtime `origin` parameter so the player receives current API-client identity information.
- Vimeo: iframe after click.
- Spotify: derived official embed URL after click.
- SoundCloud: widget iframe after click.
- Bandcamp: server attempts to resolve a normal Bandcamp track/album URL to its embedded player; if it cannot, the original page opens externally.
- Unknown external URL: opens as an external link.

Only one managed external iframe is mounted at a time, so starting another card removes the previous iframe and stops its playback. Direct HTML audio uses the same global coordinator. The default VIDEOS page uses the vertical `video-list` layout; `video-grid` remains available if a two-column presentation is wanted later.

## Production build

In StackBlitz:

```bash
npm install
npm run check:data
npm run build
```

Nuxt creates:

```text
.output/
```

Run the production server from a directory that also contains `data/`:

```bash
NODE_ENV=production node .output/server/index.mjs
```

By default Nitro listens on port 3000.

Optional explicit data directory:

```bash
MGI_DATA_DIR=/opt/mgi-records/data \
NODE_ENV=production \
node /opt/mgi-records/.output/server/index.mjs
```

Optional canonical URL for SEO:

```bash
NUXT_PUBLIC_SITE_URL=https://mgi.example \
NODE_ENV=production \
node .output/server/index.mjs
```

## Creating a deployment directory

After `npm run build`:

```bash
npm run package:deploy
```

This creates:

```text
.deploy/mgi-records/
├── .output/
├── data/
└── DEPLOY.txt
```

Use this for an **initial** deployment. For subsequent program updates, preserve the production `data/` directory and replace only `.output/` unless you intentionally want to replace content/configuration.

## nginx example

```nginx
server {
    listen 80;
    server_name your-domain.example;

    client_max_body_size 11m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Use HTTPS in production (for example with your normal nginx/ACME setup). `X-Forwarded-Proto` allows the application to mark the admin session cookie `Secure` when HTTPS is used.

## Updating the application

Recommended production layout:

```text
/opt/mgi-records/
├── .output/
└── data/
```

Update process:

1. Build the new version in StackBlitz.
2. Stop/restart the Node service as appropriate.
3. Replace `/opt/mgi-records/.output/`.
4. **Do not overwrite `/opt/mgi-records/data/`.**
5. Start the application again.

Runtime JSON/content changes themselves do **not** require a rebuild or server restart.

## Adding a language

1. Add it to `site.json.languages` with a unique `code` and `order`.
2. Add translations under that code to page fields.
3. Missing translations fall back to `defaultLanguage`.

The current public selector is data-driven.

## Adding a theme

The selector is data-driven, but the visual implementation of a new theme must also be added to the design system CSS. Adding an arbitrary theme ID to JSON alone cannot invent new CSS styling.

## Adding a page/menu item

The public router uses a catch-all route and resolves menu routes through `site.json`, so a new runtime menu route can be added without creating a dedicated Vue page, provided its `page` JSON exists and passes the agreed schema. The current `/configure` raw JSON file list is derived from configured menu page IDs.

## Security notes

This is a small single-admin v1 implementation, not an enterprise CMS.

- Change the default Admin password before public deployment.
- `admin.json` and `telegram.json` must never be served as public static files; they live under runtime `data/` and are accessed only by server code.
- Admin sessions are in memory and are intentionally single-instance/simple.
- Login and contact endpoints use in-memory rate limits. If the service is later scaled to multiple Node processes/servers, move sessions and rate limits to a shared store.
- SVG upload screening is intentionally conservative but not a substitute for a mature sanitizer if untrusted third parties gain upload access.
- Back up `data/` using normal server administration if the content becomes important; automatic CMS backups are intentionally not part of v1.

## Initial content

The HOME, ARTISTS, SERVICES and ABOUT English copy comes from the supplied `Site_content.odt`; a Russian version is included. MUSIC and VIDEOS contain temporary public demo media. Placeholder SVG artwork is intentionally lightweight and can be replaced later.


## Version 1.1 notes

See `CHANGELOG.md` for the complete list of UI, YouTube, branding and typography fixes applied to the supplied GitHub-based v1.0 project. The `.github/workflows/build.yml` workflow is retained.
