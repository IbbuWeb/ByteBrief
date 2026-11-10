import {
  getUserProfile,
  initAuth,
  initThemeToggle,
  safeRedirect,
  showToast
} from './shared.js?v=20261110-1';

const continueBtn = document.getElementById('continueBtn');
const countLabel = document.getElementById('selectedCount');
const stateLabel = document.getElementById('onboardingState');
const inputs = [...document.querySelectorAll('input[name="interests"]')];

const redirectParam = new URLSearchParams(window.location.search).get('redirect');
let ctx = null;
let busy = false;

initThemeToggle();
boot();

function destination() {
  const target = safeRedirect(redirectParam, 'index.html');
  if (/^(login|onboarding)\.html(?:[?#]|$)/.test(target)) return 'index.html';
  return target;
}

async function boot() {
  inputs.forEach(input => input.addEventListener('change', updateCount));
  continueBtn.addEventListener('click', save);
  updateCount();

  ctx = await initAuth();

  if (!ctx) {
    stateLabel.textContent = 'Sign-in unavailable';
    stateLabel.className = 'pill pill-tba';
    setDisabled(true);
    return;
  }

  if (!ctx.user) {
    window.location.replace(
      `login.html?redirect=${encodeURIComponent(`onboarding.html?redirect=${destination()}`)}`
    );
    return;
  }

  try {
    const profile = await getUserProfile(ctx, { fresh: true });
    if (profile) {
      window.location.replace(destination());
      return;
    }
  } catch (error) {
    console.warn('Could not check the existing profile:', error);
    stateLabel.textContent = 'Could not check your account';
    stateLabel.className = 'pill pill-tba';
    showToast('Could not check your account. Check your connection and retry.', 'error');
    setDisabled(false);
    return;
  }

  stateLabel.textContent = 'Google account connected';
  stateLabel.className = 'pill pill-success';
}

function updateCount() {
  const count = selected().length;
  countLabel.textContent =
    count === 0
      ? 'No topics selected yet'
      : `${count} ${count === 1 ? 'topic' : 'topics'} selected`;
  setDisabled(count === 0 || busy);
}

function selected() {
  return inputs.filter(input => input.checked).map(input => input.value);
}

function setDisabled(disabled) {
  continueBtn.disabled = disabled;
}

async function save() {
  if (busy || !ctx?.user) return;
  const interests = selected();
  if (interests.length === 0) return;

  busy = true;
  setDisabled(true);
  continueBtn.textContent = 'Saving…';

  try {
    const user = ctx.user;
    await ctx.dbApi.setDoc(
      ctx.dbApi.doc(ctx.db, 'users', user.uid),
      {
        name: user.displayName || '',
        email: user.email || '',
        photoURL: user.photoURL || '',
        interests,
        createdAt: new Date().toISOString()
      },
      { merge: true }
    );

    window.location.replace(destination());
  } catch (error) {
    console.error('Could not save interests:', error);
    showToast('Could not save your topics. Check your connection and retry.', 'error');
    busy = false;
    continueBtn.textContent = 'Save and continue';
    updateCount();
  }
}

