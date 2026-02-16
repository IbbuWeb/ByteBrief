# ByteBrief

A personalized tech news briefing app that aggregates articles from top tech sources into one clean, readable feed.

## What It Does

ByteBrief pulls articles from 11 major tech publications - TechCrunch, The Verge, Wired, Ars Technica, MIT Technology Review, VentureBeat, ZDNet, Hacker News, DEV Community, 9to5Mac, and Crunchbase - and presents them in a unified interface.

The app automatically categorizes each article into topics: AI, Programming, Hardware, Startups, or Cybersecurity based on its content. You can filter the feed to see only what interests you.

Users sign in with Google, save articles to read later, and customize their interests during onboarding.

## Key Features

- **Unified News Feed** - All your favorite tech sources in one place
- **Smart Categories** - Articles auto-tagged by topic
- **Save for Later** - Bookmark articles with Firestore storage
- **Interest Selection** - Choose topics you care about
- **Dark Theme** - Easy on the eyes
- **Installable** - Works as a PWA on mobile and desktop

## Tech Stack

- Vanilla JavaScript (no framework)
- Firebase Auth + Firestore
- RSS feeds with CORS proxy handling

## Screens

| Page | Purpose |
|------|---------|
| `index.html` | Main feed with category filters |
| `login.html` | Google sign-in |
| `onboarding.html` | Pick your interests |
| `saved.html` | Bookmarked articles |
| `profile.html` | User settings |

## License

MIT
