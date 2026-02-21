# ByteBrief

A personalized tech news and video aggregator that consolidates content from 25+ tech publications and 50+ YouTube channels into one unified experience.

## Overview

ByteBrief solves the problem of scattered tech content by aggregating articles and videos from multiple sources into a single, clean interface. It automatically categorizes content by topic and lets users save articles for later reading.

### What's Inside

**News Feed** (`index.html`)
- Aggregates articles from TechCrunch, The Verge, Wired, Ars Technica, MIT Technology Review, VentureBeat, ZDNet, Hacker News, DEV Community, 9to5Mac, Crunchbase, BBC Tech, BleepingComputer, Threatpost, CNET, Engadget, CSS-Tricks, Stack Overflow Blog, GitHub Blog, TechRadar, Tom's Hardware, SiliconANGLE, and Tech.eu
- Smart categorization: AI, Programming, Hardware, Startups, Cybersecurity
- Real-time search across titles, descriptions, and sources
- Article saving with Firestore persistence
- Share functionality with Web Share API

**ByteTV** (`videos.html`)
- Curated YouTube feeds from 50+ tech channels including Linus Tech Tips, Marques Brownlee, freeCodeCamp, Fireship, NetworkChuck, Google DeepMind, OpenAI, and more
- In-app video playback via embedded YouTube player
- Category filtering and search
- Optional YouTube Data API v3 integration for enhanced results

**User Features**
- Google Sign-In authentication
- Personalized onboarding with interest selection
- Saved articles page with Firestore sync
- User profile management
- Dark/Light theme with persistence

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Backend**: Firebase Authentication, Cloud Firestore
- **Data Sources**: RSS/Atom feeds with CORS proxy handling
- **PWA**: Service Worker ready with manifest.json

## Architecture

```
/ByteBrief
├── index.html          # Main news feed
├── videos.html         # ByteTV video section
├── login.html          # Google authentication
├── onboarding.html     # Interest selection flow
├── saved.html          # Bookmarked articles
├── profile.html        # User settings
├── manifest.json       # PWA configuration
├── /css
│   ├── styles.css      # Global styles
│   └── videos.css      # Video-specific styles
├── /js
│   ├── firebase-config.js  # Firebase initialization
│   ├── auth.js             # Authentication logic
│   ├── rss.js              # RSS fetching & parsing
│   ├── feed.js             # Feed display & interactions
│   ├── videos.js           # YouTube feed handling
│   ├── save.js             # Bookmark functionality
│   ├── profile.js          # Profile management
│   └── onboarding.js       # Onboarding flow
└── /assets
    └── bytebrief-logo.png
```

## Key Implementation Details

### RSS Feed Processing
- Dual CORS proxy fallback (corsproxy.io, allorigins)
- XML parsing with DOMParser
- Media thumbnail extraction from multiple formats (media:thumbnail, media:content, enclosure, embedded HTML)
- Keyword-based category detection
- Content deduplication by URL/title

### Video Integration
- Multi-method YouTube data fetching: YouTube Data API, rss2json, Invidious instances, CORS proxy
- Intelligent video shuffling to distribute categories and sources
- Lazy-loaded thumbnails with fallback

### Performance
- Infinite scroll with batch loading (9 articles / 20 videos per batch)
- Skeleton loading states
- Pull-to-refresh on mobile
- Image lazy loading with decode async

### Responsive Design
- Mobile-first CSS with breakpoints
- Bottom navigation bar for mobile
- Touch-optimized interactions

## Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Google Authentication
3. Create a Firestore database
4. Update `js/firebase-config.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. (Optional) Set a YouTube Data API v3 key in localStorage for enhanced video fetching

## Deployment

Works as a static site. Deploy to GitHub Pages, Netlify, Vercel, or any static host.

```bash
# Local testing
python3 -m http.server 8000
```

## License

MIT
