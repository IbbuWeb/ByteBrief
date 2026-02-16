import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyAXV-jo4Us5DAmDiJvIl6cS6tI498HF2C8",
  authDomain: "bytebrief-19bc3.firebaseapp.com",
  projectId: "bytebrief-19bc3",
  storageBucket: "bytebrief-19bc3.firebasestorage.app",
  messagingSenderId: "1020083480761",
  appId: "1:1020083480761:web:6f4c8be02b9385b1f3d368",
  measurementId: "G-YGLN28M9GS"
};

const SESSION_MAX_DAYS = 7;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function recordLoginTime() {
  localStorage.setItem('bytebrief_login_time', Date.now().toString());
}

function isSessionExpired() {
  const loginTime = localStorage.getItem('bytebrief_login_time');
  if (!loginTime) return false;
  const elapsed = Date.now() - parseInt(loginTime, 10);
  const maxMs = SESSION_MAX_DAYS * 24 * 60 * 60 * 1000;
  return elapsed > maxMs;
}

function clearSession() {
  localStorage.removeItem('bytebrief_login_time');
}

export { auth, db, recordLoginTime, isSessionExpired, clearSession, SESSION_MAX_DAYS };
