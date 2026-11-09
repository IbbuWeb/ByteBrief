import {
  ICONS,
  categoryLabel,
  escapeHtml,
  formatDate,
  getSavedArticles,
  getUserProfile,
  initShell,
  invalidateUserProfile,
  safeUrl,
  showToast
} from './shared.js?v=20261109-7';

const INTEREST_OPTIONS = [
  ['ai', 'AI'],
  ['programming', 'Programming'],
  ['hardware', 'Hardware'],
  ['startups', 'Startups'],
  ['cybersecurity', 'Cybersecurity'],
  ['cloud', 'Cloud'],
  ['mobile', 'Mobile'],
  ['gaming', 'Gaming'],
  ['science', 'Science'],
  ['opensource', 'Open Source'],
  ['privacy', 'Privacy'],
  ['business', 'Business']
];

const root = document.getElementById('profileRoot');

let ctx = null;
let profile = null;
let saved = [];
let savedError = false;

boot();

function boot() {
  initShell('profile').then(async authContext => {
    if (!authContext) {
      renderUnavailable(
        'Sign-in is unavailable right now. You can keep reading the public brief and try again later.'
      );
      return;
    }

    if (!authContext.user) {
      window.location.replace('login.html?redirect=profile.html');
      return;
    }

    ctx = authContext;
    await loadProfile();
  });
}

async function loadProfile() {
  root.innerHTML =
    '<div class="loading-panel"><span class="spinner" aria-hidden="true"></span> Loading your profile…</div>';

  try {
    profile = await getUserProfile(ctx);
  } catch (error) {
    console.error('Could not load the user profile:', error);
    renderUnavailable(
      'Your account is signed in, but the profile record could not be loaded. Check your connection and retry.'
    );
    return;
  }

  if (!profile) {
    window.location.replace('onboarding.html?redirect=profile.html');
    return;
  }

  savedError = false;
  try {
    saved = await getSavedArticles(ctx);
  } catch (error) {
    console.warn('Could not load saved stories for stats:', error);
    saved = [];
    savedError = true;
  }

  render();
}

function render() {
  const user = ctx.user;
  const name = profile.name || user.displayName || 'ByteBrief reader';
  const email = profile.email || user.email || '';
  const photo = safeUrl(profile.photoURL || user.photoURL);
  const initial = name.charAt(0).toUpperCase();
  const interests = Array.isArray(profile.interests) ? profile.interests : [];
  const joined = toDate(profile.createdAt);

  const total = saved.length;
  const thisWeek = saved.filter(article => {
    const time = Date.parse(article.savedAt || 0);
    return Number.isFinite(time) && time >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;

  const categoryCounts = new Map();
  for (const article of saved) {
    const category = article.category || 'tech';
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  }
  const top = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const breakdown = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]);

  root.innerHTML = `
    <div class="profile-grid">
      <div class="stack">
        <article class="identity-card card">
          <div class="identity-avatar" aria-hidden="true">
            <span>${escapeHtml(initial)}</span>
            ${photo ? `<img class="js-img" src="${escapeHtml(photo)}" alt="">` : ''}
          </div>
          <div class="identity-text">
            <h2>${escapeHtml(name)}</h2>
            <p>${escapeHtml(email)}</p>
            <p class="identity-meta">${joined ? `Joined ${escapeHtml(formatDate(joined, { year: true }))}` : 'Join date unavailable'} · Google account</p>
          </div>
        </article>

        <article class="panel card">
          <div class="panel-head">
            <h2>Your topics</h2>
            <button type="button" class="btn btn-ghost btn-sm" id="editInterestsBtn">Edit</button>
          </div>
          <div class="interest-tags">
            ${
              interests.length > 0
                ? interests
                    .map(
                      interest =>
                        `<span class="interest-tag">${escapeHtml(categoryLabel(interest))}</span>`
                    )
                    .join('')
                : '<span class="pill">No topics chosen yet</span>'
            }
          </div>
          <p class="muted" style="margin-top:12px;font-size:12px;">Topics power the For you filter on the feed. They are stored on your account and nowhere else.</p>

          <div id="editInterestsPanel" class="is-hidden">
            <div class="interest-edit-grid">
              ${INTEREST_OPTIONS.map(
                ([value, label]) => `
                  <label class="interest-option">
                    <input type="checkbox" name="profileInterests" value="${value}">
                    <span class="interest-content">${escapeHtml(label)}</span>
                  </label>
                `
              ).join('')}
            </div>
            <div class="edit-actions">
              <button type="button" class="btn btn-primary btn-sm" id="saveInterestsBtn">Save changes</button>
              <button type="button" class="btn btn-ghost btn-sm" id="cancelInterestsBtn">Cancel</button>
            </div>
          </div>
        </article>

        <article class="panel card">
          <div class="panel-head">
            <h2>Where your reading goes</h2>
          </div>
          ${
            breakdown.length > 0
              ? `<div class="breakdown">
                  ${breakdown
                    .map(([category, count]) => {
                      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                      return `
                        <div class="breakdown-row">
                          <span>${escapeHtml(categoryLabel(category))}</span>
                          <progress max="100" value="${percent}" aria-label="${escapeHtml(categoryLabel(category))}: ${percent}%"></progress>
                          <span class="breakdown-count">${count}</span>
                        </div>
                      `;
                    })
                    .join('')}
                </div>`
              : '<p class="muted">No saved stories yet. Your topic split will appear here once you save a few.</p>'
          }
        </article>
      </div>

      <aside class="profile-side">
        <article class="panel card">
          <div class="panel-head">
            <h2>Reading stats</h2>
            <a class="text-link" href="saved.html">Open list ${ICONS.arrow}</a>
          </div>
          <div class="stat-line"><span>Stories saved</span><strong>${total}</strong></div>
          <div class="stat-line"><span>Saved this week</span><strong>${thisWeek}</strong></div>
          <div class="stat-line"><span>Top topic</span><strong>${escapeHtml(top ? categoryLabel(top[0]) : '—')}</strong></div>
          ${savedError ? '<p class="muted" style="margin-top:10px;font-size:12px;">Saved-story stats could not be loaded.</p>' : ''}
        </article>

        <article class="panel card">
          <div class="panel-head">
            <h2>Account</h2>
          </div>
          <div class="stat-line"><span>Sign-in method</span><strong>Google</strong></div>
          <div class="stat-line"><span>Member since</span><strong>${joined ? escapeHtml(formatDate(joined, { year: true })) : '—'}</strong></div>
          <button type="button" class="btn btn-outline btn-full" id="signOutBtn" style="margin-top:16px;">Sign out</button>
          <p class="faint" style="margin-top:12px;font-size:11px;line-height:1.5;">Want your data removed? Open an issue on the <a class="text-link" href="https://github.com/IbbuWeb/ByteBrief/issues" target="_blank" rel="noopener noreferrer">project repository</a>.</p>
        </article>
      </aside>
    </div>
  `;

  bindProfileActions();
}

function bindProfileActions() {
  document.getElementById('editInterestsBtn')?.addEventListener('click', openEdit);
  document.getElementById('cancelInterestsBtn')?.addEventListener('click', closeEdit);
  document.getElementById('saveInterestsBtn')?.addEventListener('click', saveInterests);
  document.getElementById('signOutBtn')?.addEventListener('click', signOut);
}

function openEdit() {
  const panel = document.getElementById('editInterestsPanel');
  const interests = Array.isArray(profile.interests) ? profile.interests : [];

  panel?.querySelectorAll('input[name="profileInterests"]').forEach(input => {
    input.checked = interests.includes(input.value);
  });

  panel?.classList.remove('is-hidden');
  document.getElementById('editInterestsBtn')?.classList.add('is-hidden');
  panel?.querySelector('input')?.focus();
}

function closeEdit() {
  document.getElementById('editInterestsPanel')?.classList.add('is-hidden');
  document.getElementById('editInterestsBtn')?.classList.remove('is-hidden');
  document.getElementById('editInterestsBtn')?.focus();
}

async function saveInterests() {
  const button = document.getElementById('saveInterestsBtn');
  const selected = [
    ...document.querySelectorAll('input[name="profileInterests"]:checked')
  ].map(input => input.value);

  if (button) {
    button.disabled = true;
    button.textContent = 'Saving…';
  }

  try {
    await ctx.dbApi.setDoc(
      ctx.dbApi.doc(ctx.db, 'users', ctx.user.uid),
      {
        name: profile.name || ctx.user.displayName || '',
        email: profile.email || ctx.user.email || '',
        photoURL: profile.photoURL || ctx.user.photoURL || '',
        interests: selected
      },
      { merge: true }
    );

    profile = { ...profile, interests: selected };
    invalidateUserProfile(ctx);
    render();
    showToast('Topics updated.', 'success');
  } catch (error) {
    console.error('Could not save interests:', error);
    showToast('Could not save your topics. Try again.', 'error');
    if (button) {
      button.disabled = false;
      button.textContent = 'Save changes';
    }
  }
}

async function signOut() {
  const button = document.getElementById('signOutBtn');
  if (button) button.disabled = true;

  try {
    await ctx.authApi.signOut(ctx.firebase.auth);
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Could not sign out:', error);
    showToast('Could not sign out. Try again.', 'error');
    if (button) button.disabled = false;
  }
}

function renderUnavailable(message) {
  root.innerHTML = `
    <div class="empty-state">
      ${ICONS.user}
      <h3>Profile unavailable</h3>
      <p>${escapeHtml(message)}</p>
      <div class="cluster">
        <button type="button" class="btn btn-primary" id="retryProfile">Retry</button>
        <a class="btn btn-outline" href="index.html">Back to the brief</a>
      </div>
    </div>
  `;
  document.getElementById('retryProfile')?.addEventListener('click', loadProfile);
}

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

