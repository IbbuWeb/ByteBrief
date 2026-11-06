# ByteBrief

A public tech brief with an editorial grid and real, automatically refreshed data. No invented deals, viewer counts, prices, or dates.

**Live site:** https://ibbuweb.github.io/ByteBrief/

## What is here

| Page | Purpose |
| --- | --- |
| `index.html` | Today's brief, featured story, topic filters, search, save/share, infinite scroll |
| `byteHub.html` | GitHub trending, curated events, podcast episodes, full source directory |
| `saved.html` | Google-signed-in reading list backed by Firestore |
| `profile.html` | Account identity, topics, reading stats, sign-out |
| `login.html` | Single Google sign-in flow |
| `onboarding.html` | Topic selection for a new account |
| `about.html`, `privacy.html`, `terms.html` | Project, data, and privacy notes |
| `404.html` | GitHub Pages not-found page |

Reading is public. Firebase loads only after the public page has rendered, and Google sign-in is required only for saving, topics, and the profile.

## Real data only

A scheduled GitHub Action runs `scripts/fetch-data.js` every three hours and commits `js/data.json`.

- **Articles:** parsed directly from 26 RSS/Atom feeds — TechCrunch, The Verge, Wired, Ars Technica, MIT Technology Review, VentureBeat, ZDNet, The Register, Hacker News, Ars Gadgets, 9to5Mac, TC Startups, Crunchbase News, BBC Technology, BleepingComputer, Threatpost, CNET, Engadget, CSS-Tricks, Stack Overflow Blog, GitHub Blog, The New Stack, Tom's Hardware, SiliconANGLE, Tech.eu, and Reddit Technology.
- **Repositories:** GitHub's public daily trending page. Stars are cumulative; the daily gain is shown only when GitHub publishes it.
- **Podcasts:** Apple's public iTunes lookup API for show metadata and latest episodes.
- **Events:** curated in `scripts/events.json`. Confirmed dates link to official pages. Events without an announced exact date store `startDate: null` and a `startMonth`, so the UI can say "May 2027 (TBA)" without inventing a day.
- **Sources:** emitted into the data file and listed on the Hub.

If a feed fails, that publisher's previous stories are kept while the other feeds refresh. The timestamp on the site is the last refresh run, not a guarantee that every publisher answered.

## Run locally

ES modules and JSON fetching need an HTTP server; `file://` will not work. The 404 page also expects the `/ByteBrief/` base path.

```bash
# From the directory that contains the ByteBrief folder
python -m http.server 8000
# Open http://localhost:8000/ByteBrief/
```

PowerShell:

```powershell
Set-Location ..
python -m http.server 8000
```

There is no build step and no runtime dependency to install.

## Refresh data

Requires Node.js 20 or newer (the script uses the built-in `fetch`).

```bash
npm test          # parser unit tests
npm run update    # regenerate js/data.json
```

`npm test` runs `node --test scripts/lib/parse-feed.test.js`. The generator reads the public feeds, GitHub trending, Apple's lookup API, and the curated event file. It keeps the most recent 240 articles.

Optional environment variables:

- `GITHUB_TOKEN` raises GitHub API limits in Actions.
- `BYTEBRIEF_MAX_ARTICLES` overrides the 240-article cap.

## Firebase

Sign-in and saving use the existing Firebase project configured in `js/firebase-config.js`. The web API key is public by design; access control belongs in Firestore rules.

1. Enable Google as a sign-in provider in Firebase Authentication.
2. Create a Firestore database.
3. Add every deployment host (including `localhost` and `ibbuweb.github.io`) to Authentication → Settings → Authorized domains.
4. Deploy the rules:

```bash
firebase deploy --only firestore:rules
```

`firestore.rules` restricts each account to its own `users/{uid}` document and its own `savedArticles` records. The app stores:

- `users/{uid}`: `name`, `email`, `photoURL`, `interests`, `createdAt`
- `savedArticles/{id}`: `userId`, `title`, `link`, `image`, `source`, `category`, `savedAt`

No Firebase SDK is loaded for anonymous reading.

## Update alerts

ByteBrief can show a one-time in-app banner asking users to turn on update alerts. If they agree, their browser push subscription is stored in the `pushSubscriptions` Firestore collection.

To send the one-time notice later:

```bash
npm install --no-save firebase-admin web-push
WEBPUSH_VAPID_PRIVATE_KEY=<private key> npm run send:update:dry
WEBPUSH_VAPID_PRIVATE_KEY=<private key> npm run send:update
```

The private VAPID key is stored outside the repository at `%LOCALAPPDATA%\\ByteBrief\\vapid-private-key.txt`. The public key lives in `js/vapid.js`. The service worker is `sw.js`.

8. Update alerts use a service worker (`sw.js`) and a public Firestore collection named `pushSubscriptions`. Deploy the rules, then generate or reuse the VAPID key pair. The public key is in `js/vapid.js`; the private key is kept outside the repository at `%LOCALAPPDATA%\\ByteBrief\\vapid-private-key.txt`. To send the one-time notice later, install `firebase-admin` and `web-push`, set `WEBPUSH_VAPID_PRIVATE_KEY`, then run `npm run send:update:dry` followed by `npm run send:update`.

## Deployment

The site is built for GitHub Pages at `/ByteBrief/`.

1. Push to `main`.
2. In the repository settings, set Pages to deploy from the `main` branch root.
3. Allow GitHub Actions to write to the repository (the workflow declares `contents: write`).
4. Optionally trigger **Refresh data** manually from the Actions tab.

The workflow runs at `17 */3 * * *` (every three hours, minute 17), tests the parser first, and commits only when `js/data.json` changes.

## Project structure

```text
ByteBrief/
├── index.html, byteHub.html, saved.html, profile.html
├── login.html, onboarding.html
├── about.html, privacy.html, terms.html, 404.html
├── manifest.json, robots.txt, sitemap.xml, firestore.rules
├── css/styles.css                 # full design system and responsive layout
├── js/
│   ├── shared.js                  # shell, auth, data, saving, cards, utilities
│   ├── home.js                    # feed, filters, modal, save/share
│   ├── hub.js                     # trending/events/podcasts/sources tabs
│   ├── saved.js                   # reading list
│   ├── profile.js                 # profile and interests
│   ├── auth.js                    # Google sign-in and safe redirects
│   ├── onboarding.js              # first-run topics
│   ├── firebase-config.js         # Firebase app initialization
│   └── data.json                  # generated data consumed by the pages
├── scripts/
│   ├── fetch-data.js              # generator
│   ├── events.json                # curated conference calendar
│   └── lib/parse-feed.js          # testable feed parser
└── .github/workflows/update-data.yml
```

## Data contract

`js/data.json` contains:

```json
{
  "generatedAt": "ISO timestamp",
  "articles": [],
  "github": [],
  "podcasts": [],
  "events": [],
  "sources": []
}
```

Every `link`, `url`, `thumbnail`, and `artwork` that reaches the DOM is validated as `http(s)` before rendering. Text is HTML-escaped. Shared-story links are built from the article URL rather than trusting a raw query string.

## Corrections

Open an issue at https://github.com/IbbuWeb/ByteBrief/issues with the source, the item, and what is wrong. Data errors can usually be fixed in `scripts/fetch-data.js` or `scripts/events.json`.
