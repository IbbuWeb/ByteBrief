import { auth, db, recordLoginTime } from './firebase-config.js';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const provider = new GoogleAuthProvider();
const googleSignUpBtn = document.getElementById('googleSignUpBtn');
const googleLoginBtn = document.getElementById('googleLoginBtn');
let isSigningIn = false;

async function handleGoogleAuth(isNewUser) {
  if (isSigningIn) return;
  isSigningIn = true;

  const activeBtn = isNewUser ? googleSignUpBtn : googleLoginBtn;
  const originalHtml = activeBtn.innerHTML;

  try {
    activeBtn.disabled = true;
    activeBtn.textContent = isNewUser ? 'Creating account...' : 'Signing in...';

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    recordLoginTime();

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      window.location.href = 'index.html';
    } else {
      window.location.href = 'onboarding.html';
    }
  } catch (error) {
    console.error('Auth error:', error);
    isSigningIn = false;

    if (error.code === 'auth/popup-closed-by-user') {
      showToast('Sign in cancelled.', 'error');
    } else if (error.code === 'auth/unauthorized-domain') {
      showToast('This domain is not authorized. Add it in Firebase Console > Authentication > Settings.', 'error');
    } else if (error.code !== 'auth/cancelled-popup-request') {
      showToast('Failed to sign in. Please try again.', 'error');
    }

    activeBtn.disabled = false;
    activeBtn.innerHTML = originalHtml;
  }
}

if (googleSignUpBtn) {
  googleSignUpBtn.addEventListener('click', () => handleGoogleAuth(true));
}

if (googleLoginBtn) {
  googleLoginBtn.addEventListener('click', () => handleGoogleAuth(false));
}

onAuthStateChanged(auth, (user) => {
  if (user && !isSigningIn) {
    checkUserProfile(user);
  }
});

async function checkUserProfile(user) {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      window.location.href = 'index.html';
    } else {
      window.location.href = 'onboarding.html';
    }
  } catch (error) {
    console.error('Error checking profile:', error);
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('.toast-message').textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
