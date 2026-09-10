# Changelog

## 1.1.0 — 2026-09-10

- Removed decorative numeric prefixes from the side menu.
- Removed per-block numeric markers; each page now shows one localized page label from `site.json`.
- Reworked menu hover so it no longer changes padding/layout; hover is now color/underline based and the full-screen menu blur was removed to reduce compositor cost.
- Replaced browser-native public theme/language `<select>` elements with lightweight accessible custom dropdowns so Dark theme colors are fully controlled.
- Added the `video-list` layout and switched the default VIDEOS library to a spacious vertical presentation; `video-grid` remains available in JSON.
- Updated YouTube embeds for current client-identification requirements: standard `youtube.com/embed`, `strict-origin-when-cross-origin` iframe referrer policy, explicit runtime `origin`, `playsinline`, and `enablejsapi`.
- Expanded both themes with restrained warm/cool/sage/plum surface accents and subtle per-section variation while keeping the neutral editorial identity.
- Rebalanced public typography to reduce the gap between oversized headings and body/supporting text, especially on phones.
- Added runtime `branding.logo` and `branding.favicon` fields in `site.json`; brand assets can now be PNG/JPG/JPEG/WebP/AVIF/GIF/APNG/SVG files from `data/images`.
- Moved the placeholder logo/favicon into `data/images` while retaining the old `public/brand/*.svg` files as fallback assets.
- Updated runtime validation/check-data support for `branding` and `video-list`.
- Preserved the GitHub Actions build/smoke-test/deployment workflow from the supplied GitHub version.
