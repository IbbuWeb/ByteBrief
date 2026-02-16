# ByteBrief Development Guide

## Project Setup

### Firebase Configuration

Before running the app, you need to set up a Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Google" provider
4. Enable **Firestore Database**:
   - Go to Firestore Database > Create database
   - Start in test mode (or set proper security rules)
5. Get your Firebase config:
   - Go to Project Settings > General
   - Copy the firebaseConfig values

### Configure Firebase in the App

Edit `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Deploy to GitHub Pages

1. Create a GitHub repository
2. Push all files to the repository
3. Go to Repository Settings > Pages
4. Select "main" branch as source
5. Save and wait for deployment

## Development Commands

No build step required - this is a pure static site.

To test locally:
- Use a local server (e.g., `python3 -m http.server 8000`)
- Or use VS Code Live Server extension

## Project Structure

```
/bytebrief
  index.html          - Home feed with articles
  login.html          - Google sign-in page
  onboarding.html    - Interest selection
  saved.html         - User's saved articles
  profile.html       - User profile & settings
  /css
    styles.css       - All styling
  /js
    firebase-config.js  - Firebase initialization
    auth.js           - Authentication logic
    rss.js            - RSS feed fetching & parsing
    feed.js           - Home feed display
    save.js           - Save/bookmark functionality
    profile.js        - Profile management
  /assets
    logo.svg          - App logo
```

## Key Features

- **RSS Aggregation**: Fetches from TechCrunch, The Verge, and Wired
- **Google Authentication**: Using Firebase Auth
- **Article Saving**: Firestore-backed bookmarking
- **Interest Filtering**: Filter articles by category
- **Dark Mode**: Modern dark theme by default

## Security Rules (Firestore)

For production, add these rules in Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /savedArticles/{articleId} {
      allow read, write: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```
