# ByteBrief Development Guide

## Stack

Static HTML, CSS, and native ES modules. No framework, bundler, package dependency, or build step. Node.js 20+ is used only to generate `js/data.json`.

## Commands

```bash
npm test          # node --test scripts/lib/parse-feed.test.js
npm run update    # node scripts/fetch-data.js
```

To view the site, serve the directory **that contains** the `ByteBrief` folder:

```bash
python -m http.server 8000
# http://localhost:8000/ByteBrief/
```

`file://` will not load ES modules or `fetch('js/data.json')`. `404.html` uses `<base href="/ByteBrief/">` because GitHub Pages serves it from arbitrary nested paths.

## Architecture

- `css/styles.css` is the only stylesheet. It contains tokens for dark/light, the 12-column bento grid, cards, navigation, auth/onboarding, prose pages, modal, skeletons, and breakpoints at 1100px, 720px, and 420px.
- `js/shared.js` owns the repeated shell: header/footer/bottom nav injection, theme, lazy Firebase loading, safe URLs, escaping, data loading, saved-article helpers, sharing, and card renderers.
- Each page has one controller: `home.js`, `hub.js`, `saved.js`, `profile.js`, `auth.js`, `onboarding.js`.
- Static pages (`about`, `privacy`, `terms`, `404`) inject the shell with an inline module import of `initShell`.
- Public rendering must never wait for Firebase. `initShell` renders the page and then resolves auth; if Firebase fails, reading continues.
- There is one shared `js/data.json`; do not add per-page data files.

## Data pipeline

`scripts/fetch-data.js`:

1. Parses every RSS/Atom feed with `scripts/lib/parse-feed.js`.
2. Scrapes GitHub's public trending page.
3. Queries Apple's iTunes lookup API for each podcast ID.
4. Reads confirmed/TBA events from `scripts/events.json`.
5. Sorts articles by publication date, caps at 240 (`BYTEBRIEF_MAX_ARTICLES`), deduplicates by link, and filters invalid dates/links.
6. Writes `js/data.json` atomically.

If a feed request or parse fails, keep that source's previous items and continue with the healthy feeds. Never abort the whole refresh because one publisher is down. Reddit rate-limits periodically; fallback is expected.

`.github/workflows/update-data.yml` runs every three hours at minute 17, runs the parser tests, generates data, and commits only if the file changed. It has `contents: write` and a concurrency group.

### Adding a source

Add `{ name, url, category }` to `SOURCES` in `scripts/fetch-data.js`. Use an official RSS/Atom URL and verify it returns items. Categories must be one of: `ai`, `programming`, `hardware`, `startups`, `cybersecurity`, `tech`.

### Events

`scripts/events.json` fields:

- Confirmed: `status: "confirmed"`, real `startDate` (and optional `endDate`), ISO `YYYY-MM-DD`, `link` to the official page.
- TBA: `status: "tba"`, `startDate: null`, `endDate: null`, `startMonth: "YYYY-MM"`, `dateLabel: "May 2027 (TBA)"`.

Do not anchor a TBA event to the first of the month and present it as an exact date. Sorting and filtering use `startMonth` for TBA entries.

## Accuracy rules

These are product requirements, not suggestions:

- Do not invent dates, prices, discounts, viewer counts, durations, hosts, or live status.
- Hide a metric when the source does not supply it. GitHub `starsToday` is optional.
- Link every item to the publisher's own page.
- Keep the `generatedAt` label honest: it marks the refresh run, not per-source success.
- Cap article descriptions to publisher-provided text. Do not generate summaries.

## Firebase model

`js/firebase-config.js` initializes Auth and Firestore. The web config is public; security lives in `firestore.rules`.

- `users/{uid}`: `name`, `email`, `photoURL`, `interests` (array), `createdAt` (ISO string).
- `savedArticles/{id}`: `userId`, `title`, `link`, `image`, `source`, `category`, `savedAt`.

Saving flow:

1. Anonymous click stores the pending article in `sessionStorage` under `bytebrief_pending_save` and redirects to `login.html?redirect=...`.
2. After auth, `initShell` flushes the pending save on any shared-shell page.
3. Saved state is deduplicated by normalized `http(s)` link.
4. Removing a saved story deletes its Firestore document.

Redirects use `safeRedirect()` in `shared.js`. Do not send users to a raw `redirect` query value.

`profile.html` requires a profile document. New accounts are sent to `onboarding.html`; the redirect target is preserved through both steps.

## Conventions

- Escape every dynamic string with `escapeHtml`; validate every URL with `safeUrl`.
- Keep Firestore field names unchanged for compatibility with existing documents.
- Use event delegation for dynamic cards; the grid is re-rendered often.
- Preserve keyboard support: modal focus trap and Escape, tab arrow keys, visible focus rings, skip link.
- No analytics, ads, tracking pixels, or third-party UI libraries.
- Keep all eight public page files listed in `sitemap.xml` that are meant to be indexed; private pages (`login`, `onboarding`, `saved`, `profile`) are `noindex`.

## Before committing

```bash
node --test scripts/lib/parse-feed.test.js
node scripts/fetch-data.js
```

Then verify `js/data.json`:

- non-empty `articles`, `github`, `podcasts`, `events`, `sources`
- all links pass `/^https?:\/\//`
- every article has `publishedAt`
- TBA events have `startDate: null` and a `startMonth`

Serve locally and check the home feed, filters, search, modal, save/share, Hub tabs, sources, dark/light theme, login, onboarding, and 404 at 1440px and 390px.

## Deployment owner actions

- Enable Google auth and add authorized domains in Firebase.
- Deploy `firestore.rules`.
- Set GitHub Pages to `main` root.
- Confirm Actions has write permission.
