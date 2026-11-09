import {
  getUserProfile,
  initAuth,
  initThemeToggle,
  safeRedirect,
  showToast
} from './shared.js?v=20261107-2';

const button = document.getElementById('googleSignInBtn');
const label = document.getElementById('googleSignInLabel');
const status = document.getElementById('authStatus');

const redirectParam = new URLSearchParams(window.location.search).get('redirect');
let isSigningIn = false;
let authContext = null;

initThemeToggle();
boot();

function destination() {
  const target = safeRedirect(redirectParam, 'index.html');
  if (/^(login|onboarding)\.html(?:[?#]|$)/.test(target)) return 'index.html';
  return target;
}

async function boot() {
  button.disabled = true;
  authContext = await initAuth();

  if (!authContext) {
    status.textContent =
      'Google sign-in is unavailable right now. You can still read the public brief.';
    label.textContent = 'Sign-in unavailable';
    return;
  }

  button.disabled = false;

  if (authContext.user) {
    status.textContent = 'You are already signed in. Taking you back…';
    await route();
    return;
  }

  status.textContent = '';
  button.addEventListener('click', signIn);
}

async function signIn() {
  if (isSigningIn || !authContext) return;
  isSigningIn = true;
  button.disabled = true;
  label.textContent = 'Opening Google…';
  status.textContent = '';

  try {
    const provider = new authContext.authApi.GoogleAuthProvider();
    await authContext.authApi.signInWithPopup(authContext.firebase.auth, provider);
    status.textContent = 'Signed in. Loading your account…';
    await route();
  } catch (error) {
    console.warn('Google sign-in failed:', error);
    status.textContent = messageFor(error);
    label.textContent = 'Continue with Google';
    button.disabled = false;
    isSigningIn = false;

    if (!['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes(error.code)) {
      showToast(messageFor(error), 'error');
    }
  }
}

async function route() {
  try {
    const profile = await getUserProfile(authContext, { fresh: true });
    if (profile) {
      window.location.replace(destination());
      return;
    }

    window.location.replace(
      `onboarding.html?redirect=${encodeURIComponent(destination())}`
    );
  } catch (error) {
    console.warn('Could not check the account profile:', error);
    status.textContent =
      'Signed in, but your profile could not be checked. Check your connection and try again.';
    label.textContent = 'Retry';
    button.disabled = false;
    isSigningIn = false;
    button.removeEventListener('click', signIn);
    button.onclick = retryRoute;
  }
}

function retryRoute() {
  if (isSigningIn) return;
  isSigningIn = true;
  button.disabled = true;
  route();
}

function messageFor(error) {
  if (error.code === 'auth/popup-closed-by-user') return 'Sign-in was cancelled.';
  if (error.code === 'auth/popup-blocked') {
    return 'Your browser blocked the popup. Allow popups for this site and try again.';
  }
  if (error.code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized in the Firebase project yet.';
  }
  if (error.code === 'auth/cancelled-popup-request') return '';
  return 'Sign-in failed. Please try again.';
}
