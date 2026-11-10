const FIREBASE_AUTH =
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
const FIREBASE_FIRESTORE =
  'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

export const CATEGORY_LABELS = {
  ai: 'AI',
  programming: 'Programming',
  hardware: 'Hardware',
  startups: 'Startups',
  cybersecurity: 'Security',
  tech: 'Tech',
  cloud: 'Cloud',
  mobile: 'Mobile',
  gaming: 'Gaming',
  science: 'Science',
  opensource: 'Open Source',
  privacy: 'Privacy',
  business: 'Business',
  news: 'News',
  security: 'Security',
  apple: 'Apple'
};

export const PRIORITY_SOURCES = [
  'The Verge',
  'TechCrunch',
  'Wired',
  'Ars Technica',
  'MIT Technology Review',
  'The Register',
  'BBC Technology',
  'SiliconANGLE'
];

export const ICONS = {
  sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
  hub: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8"/></svg>',
  repo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 0 2 2h14"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.4"/><path d="m21 15-5-5L5 21"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 12.5 5 5L20 6.5"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
};

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => HTML_ESCAPES[char]);
}

export function safeUrl(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

export function categoryLabel(category) {
  return CATEGORY_LABELS[category] || String(category || 'Tech');
}

export function formatRelative(iso) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const diff = Date.now() - date.getTime();
  if (diff < 0) return formatDate(iso);

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatDate(iso, options = {}) {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    ...(options.year ? { year: 'numeric' } : {})
  });
}

export function formatDay(iso = new Date().toISOString()) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

export function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(number);
}

function currentTheme() {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'dark' || attr === 'light') return attr;
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return 'light';
}

export function initThemeToggle() {
  const apply = (theme) => {
    const next = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    document.documentElement.style.colorScheme = next;
    try { localStorage.setItem('theme', next); } catch {}
    document.querySelectorAll('#themeToggle, [data-theme-toggle]').forEach(button => {
      const dark = next === 'dark';
      button.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      button.setAttribute('title', dark ? 'Switch to light theme' : 'Switch to dark theme');
      button.setAttribute('aria-pressed', dark ? 'true' : 'false');
    });
  };

  apply(currentTheme());
  if (window.__bytebriefThemeInit) return;
  window.__bytebriefThemeInit = true;
  document.addEventListener('click', event => {
    const button = event.target.closest('#themeToggle, [data-theme-toggle]');
    if (!button) return;
    event.preventDefault();
    apply(currentTheme() === 'dark' ? 'light' : 'dark');
  });
}

let toastTimer = null;

export function showToast(message, type = 'info') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = '<span class="toast-message"></span>';
    document.body.appendChild(toast);
  }

  let label = toast.querySelector('.toast-message');
  if (!label) {
    label = document.createElement('span');
    label.className = 'toast-message';
    toast.appendChild(label);
  }

  label.textContent = message;
  toast.className = `toast ${type} show`;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

export function safeRedirect(raw, fallback = 'index.html') {
  if (!raw) return fallback;
  try {
    const url = new URL(raw, window.location.href);
    if (url.origin !== window.location.origin) return fallback;
    const base = new URL('.', window.location.href).pathname;
    if (!url.pathname.startsWith(base)) return fallback;
    return `${url.pathname.slice(base.length)}${url.search}${url.hash}` || fallback;
  } catch {
    return fallback;
  }
}

/* Shell ------------------------------------------------------------------ */

function headerMarkup(page) {
  const nav = [
    ['index.html', 'home', 'Feed'],
    ['byteHub.html', 'hub', 'Hub'],
    ['saved.html', 'saved', 'Saved']
  ];

  return `
    <div class="shell masthead">
      <div class="masthead-top">
        <span class="mast-edition">Digital Tech Edition</span>
        <span class="mast-date">${formatDay()}</span>
        <span class="mast-url">ibbuweb.github.io/ByteBrief</span>
      </div>
      <div class="mast-rule mast-rule--thick"></div>
      <div class="mast-brand-row">
        <a class="brand brand-mast" href="index.html" aria-label="ByteBrief home">ByteBrief</a>
        <span class="mast-tagline">Today's tech, without the noise</span>
      </div>
      <div class="mast-rule"></div>
      <div class="mast-nav-row">
        <nav class="primary-nav" aria-label="Primary">
          ${nav
            .map(
              ([href, key, label]) =>
                `<a href="${href}" data-nav="${key}"${
                  page === key ? ' aria-current="page"' : ''
                }>${label}</a>`
            )
            .join('')}
        </nav>
        <div class="nav-actions">
          <button class="icon-btn" id="themeToggle" type="button" aria-label="Switch theme">
            ${ICONS.sun}${ICONS.moon}
          </button>
          <a class="signin-link" id="navAuth" href="login.html">Sign in</a>
        </div>
      </div>
      <div class="mast-rule mast-rule--double"></div>
    </div>
  `;
}

function footerMarkup() {
  return `
    <div class="shell footer-grid">
      <div class="footer-brand">
        <a class="footer-nameplate" href="index.html">ByteBrief</a>
        <p>One clean brief for the parts of tech that matter. Headlines from 26 publications, refreshed every three hours, with no invented numbers.</p>
      </div>
      <div class="footer-col">
        <h3>Explore</h3>
        <a href="index.html">Today's brief</a>
        <a href="byteHub.html">ByteHub</a>
        <a href="saved.html">Saved reading</a>
        <a href="profile.html">Your profile</a>
      </div>
      <div class="footer-col">
        <h3>About</h3>
        <a href="about.html">About ByteBrief</a>
        <a href="privacy.html">Privacy</a>
        <a href="terms.html">Terms</a>
        <a href="https://github.com/IbbuWeb/ByteBrief" target="_blank" rel="noopener noreferrer">Source on GitHub</a>
      </div>
      <div class="footer-col">
        <h3>Data</h3>
        <a href="byteHub.html#sources">All sources</a>
        <a href="https://github.com/IbbuWeb/ByteBrief/actions/workflows/update-data.yml" target="_blank" rel="noopener noreferrer">Refresh log</a>
        <a href="https://github.com/IbbuWeb/ByteBrief/issues" target="_blank" rel="noopener noreferrer">Report an issue</a>
      </div>
      <p class="footer-fine">© <span id="footerYear">${new Date().getFullYear()}</span> ByteBrief. Headlines and images belong to their publishers. Built as a public reading project.</p>
    </div>
  `;
}

function bottomNavMarkup(page) {
  const items = [
    ['index.html', 'home', 'Feed', ICONS.home],
    ['byteHub.html', 'hub', 'Hub', ICONS.hub],
    ['saved.html', 'saved', 'Saved', ICONS.bookmark],
    ['profile.html', 'profile', 'Profile', ICONS.user]
  ];

  return items
    .map(
      ([href, key, label, icon]) =>
        `<a class="bottom-link" href="${href}"${
          page === key ? ' aria-current="page"' : ''
        }>${icon}<span>${label}</span></a>`
    )
    .join('');
}

const UPDATE_DISMISS_KEY = 'bytebrief_update_alerts_v1_dismissed';
const UPDATE_SUBSCRIBED_KEY = 'bytebrief_update_alerts_v1_subscribed';

function initUpdateBanner() {
  let dismissed = false;
  let subscribed = false;
  try {
    dismissed = localStorage.getItem(UPDATE_DISMISS_KEY) === 'true';
    subscribed = localStorage.getItem(UPDATE_SUBSCRIBED_KEY) === 'true';
  } catch {
    return;
  }

  if (dismissed) return;
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }
  if (window.Notification.permission === 'denied') return;
  if (window.Notification.permission === 'granted' && subscribed) return;

  const skipLink = document.querySelector('.skip-link');
  if (!skipLink || document.getElementById('appUpdateBanner')) return;

  const banner = document.createElement('aside');
  banner.id = 'appUpdateBanner';
  banner.className = 'app-update';
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <div class="shell app-update__inner">
      <span class="app-update__label">Update</span>
      <div class="app-update__copy">
        <p><strong>ByteBrief got an update.</strong> The new newspaper edition is live: newsprint theme, masthead, and page-turn sound.</p>
        <p class="app-update__status" id="updateAlertsStatus"></p>
      </div>
      <button class="app-update__action" id="updateAlertsEnable" type="button">Turn on alerts</button>
      <button class="app-update__close" type="button" aria-label="Dismiss update notice">
        ${ICONS.close}
      </button>
    </div>
  `;

  const status = banner.querySelector('#updateAlertsStatus');
  const enableButton = banner.querySelector('#updateAlertsEnable');
  const closeButton = banner.querySelector('.app-update__close');

  enableButton.addEventListener('click', async () => {
    enableButton.disabled = true;
    enableButton.textContent = 'Turning on...';
    if (status) status.textContent = '';

    try {
      const { enableUpdateAlerts } = await import('./update-alerts.js?v=20261107-3');
      const result = await enableUpdateAlerts();

      if (result.subscribed) {
        if (status) status.textContent = 'Update alerts are on.';
        try {
          localStorage.setItem(UPDATE_DISMISS_KEY, 'true');
          localStorage.setItem(UPDATE_SUBSCRIBED_KEY, 'true');
        } catch {}
        window.setTimeout(() => banner.remove(), 1600);
        return;
      }

      if (result.permission === 'denied') {
        if (status) status.textContent = 'Notifications are blocked in browser settings.';
        enableButton.remove();
        try {
          localStorage.setItem(UPDATE_DISMISS_KEY, 'true');
        } catch {}
        return;
      }

      if (status) status.textContent = 'Notifications were not enabled.';
      enableButton.disabled = false;
      enableButton.textContent = 'Turn on alerts';
    } catch (error) {
      console.warn('Could not enable update alerts:', error);
      if (status) {
        status.textContent = error.message || 'Could not enable update alerts.';
      }
      enableButton.disabled = false;
      enableButton.textContent = 'Turn on alerts';
    }
  });

  closeButton.addEventListener('click', () => {
    try {
      localStorage.setItem(UPDATE_DISMISS_KEY, 'true');
    } catch {}
    banner.remove();
  });

  skipLink.insertAdjacentElement('afterend', banner);
}


export function initShell(page = '') {
  const header = document.getElementById('siteHeader');
  if (header) header.innerHTML = headerMarkup(page);

  const footer = document.getElementById('siteFooter');
  if (footer) footer.innerHTML = footerMarkup();

  const bottom = document.getElementById('bottomNav');
  if (bottom) bottom.innerHTML = bottomNavMarkup(page);

  initUpdateBanner();
  initThemeToggle();
  registerAppServiceWorker();

  return initAuth().then(async ctx => {
    updateNavAuth(ctx?.user || null);
    if (ctx?.user) await flushPendingSave(ctx);
    return ctx;
  });
}

function registerAppServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (window.__bytebriefSwInit) return;
  window.__bytebriefSwInit = true;

  const reloadOnce = () => {
    if (window.__bytebriefSwReloading) return;
    try {
      if (sessionStorage.getItem('bytebrief_sw_reload') === '1') return;
      sessionStorage.setItem('bytebrief_sw_reload', '1');
    } catch {}
    window.__bytebriefSwReloading = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'BYTEBRIEF_APP_UPDATED') reloadOnce();
  });

  const checkRegistration = reg => {
    try { reg.update(); } catch {}
    if (reg.waiting && navigator.serviceWorker.controller) reloadOnce();
    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) reloadOnce();
      });
    });
  };

  const doRegister = async () => {
    try {
      const reg = await navigator.serviceWorker.register(
        new URL('sw.js', document.baseURI).toString(),
        { scope: new URL('./', document.baseURI).pathname, updateViaCache: 'none' }
      );
      checkRegistration(reg);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkRegistration(reg);
      });
      window.setInterval(() => checkRegistration(reg), 5 * 60 * 1000);
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  };

  if (document.readyState === 'complete') doRegister();
  else window.addEventListener('load', doRegister, { once: true });
}

function updateNavAuth(user) {
  const link = document.getElementById('navAuth');
  if (!link) return;

  if (!user) {
    link.className = 'signin-link';
    link.href = 'login.html';
    link.textContent = 'Sign in';
    link.removeAttribute('aria-label');
    return;
  }

  const name = user.displayName || user.email?.split('@')[0] || 'You';
  const photo = safeUrl(user.photoURL);
  link.className = 'nav-user';
  link.href = 'profile.html';
  link.setAttribute('aria-label', `Open ${name}'s profile`);
  link.innerHTML = photo
    ? `<img src="${escapeHtml(photo)}" alt=""><span>${escapeHtml(name)}</span>`
    : `<span class="avatar" aria-hidden="true">${escapeHtml(name.charAt(0).toUpperCase())}</span><span>${escapeHtml(name)}</span>`;
}

/* Data ------------------------------------------------------------------- */

let dataPromise = null;

export function loadData() {
  if (!dataPromise) {
    dataPromise = fetch(`js/data.json?v=${Date.now()}`, { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data.articles) || data.articles.length === 0) {
          throw new Error('Data file is empty or malformed');
        }
        return data;
      })
      .catch(error => {
        dataPromise = null;
        throw error;
      });
  }
  return dataPromise;
}

/* Firebase --------------------------------------------------------------- */

let authPromise = null;
const profileCache = new Map();

export function initAuth() {
  if (authPromise) return authPromise;

  authPromise = Promise.all([
    import('./firebase-config.js?v=20261110-4'),
    import(FIREBASE_AUTH),
    import(FIREBASE_FIRESTORE)
  ])
    .then(
      ([firebase, authApi, dbApi]) =>
        new Promise(resolve => {
          let settled = false;
          const finish = user => {
            if (settled) return;
            settled = true;
            resolve({ user, firebase, authApi, dbApi, db: firebase.db });
          };

          try {
            authApi.onAuthStateChanged(firebase.auth, finish, error => {
              console.warn('Auth state check failed:', error);
              // A failed auth check must never block public reading.
              if (!settled) {
                settled = true;
                resolve(null);
              }
            });
          } catch (error) {
            console.warn('Firebase auth unavailable:', error);
            resolve(null);
          }
        })
    )
    .catch(error => {
      console.warn('Firebase is unavailable; public reading continues:', error);
      return null;
    });

  return authPromise;
}

export async function getUserProfile(ctx, { fresh = false } = {}) {
  if (!ctx?.user) return null;
  const uid = ctx.user.uid;

  if (!fresh && profileCache.has(uid)) return profileCache.get(uid);

  const reference = ctx.dbApi.doc(ctx.db, 'users', uid);
  const snapshot = await ctx.dbApi.getDoc(reference);
  const profile = snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  profileCache.set(uid, profile);
  return profile;
}

export function invalidateUserProfile(ctx) {
  if (ctx?.user) profileCache.delete(ctx.user.uid);
}

async function getSavedDocs(ctx) {
  const reference = ctx.dbApi.collection(ctx.db, 'savedArticles');
  const q = ctx.dbApi.query(reference, ctx.dbApi.where('userId', '==', ctx.user.uid));
  return ctx.dbApi.getDocs(q);
}

export async function getSavedArticles(ctx) {
  if (!ctx?.user) return [];
  const snapshot = await getSavedDocs(ctx);

  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => new Date(b.savedAt || 0) - new Date(a.savedAt || 0));
}

export function savedLinkSet(savedArticles) {
  return new Set(
    savedArticles
      .map(article => safeUrl(article.link))
      .filter(Boolean)
  );
}

function articleToSave(article) {
  const link = safeUrl(article.link);
  if (!link) throw new Error('This story does not have a valid link');

  return {
    userId: '',
    title: String(article.title || 'Untitled').slice(0, 300),
    link,
    image: safeUrl(article.thumbnail || article.image) || '',
    source: String(article.source || 'Unknown').slice(0, 80),
    category: String(article.categories?.[0] || article.category || 'tech').slice(0, 40),
    savedAt: new Date().toISOString()
  };
}

const SAVED_STORAGE_CAP_BYTES = 100 * 1024 * 1024;

function estimateSavedBytes(record) {
  try {
    return new TextEncoder().encode(JSON.stringify(record)).length;
  } catch {
    return 1024;
  }
}

export async function addSavedArticle(ctx, article) {
  if (!ctx?.user) throw new Error('Sign in to save stories');
  const record = articleToSave(article);
  const sizeBytes = estimateSavedBytes(record);
  const uid = ctx.user.uid;
  const savedCollection = ctx.dbApi.collection(ctx.db, 'savedArticles');
  const userQuery = ctx.dbApi.query(
    savedCollection,
    ctx.dbApi.where('userId', '==', uid)
  );
  const newRef = ctx.dbApi.doc(savedCollection);

  return ctx.dbApi.runTransaction(ctx.db, async transaction => {
    const snapshot = await transaction.get(userQuery);
    const exists = snapshot.docs.some(
      doc => safeUrl(doc.data().link) === record.link
    );
    if (exists) return false;

    const usedBytes = snapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      const size =
        typeof data.sizeBytes === 'number' ? data.sizeBytes : estimateSavedBytes(data);
      return sum + size;
    }, 0);

    if (usedBytes + sizeBytes > SAVED_STORAGE_CAP_BYTES) {
      throw new Error('You can save up to 100 MB of stories.');
    }

    transaction.set(newRef, {
      ...record,
      userId: uid,
      sizeBytes
    });
    return true;
  });
}

export async function removeSavedArticle(ctx, article) {
  if (!ctx?.user) throw new Error('Sign in to manage saved stories');
  const link = safeUrl(article.link);
  if (!link) return false;

  const savedCollection = ctx.dbApi.collection(ctx.db, 'savedArticles');
  const userQuery = ctx.dbApi.query(
    savedCollection,
    ctx.dbApi.where('userId', '==', ctx.user.uid)
  );

  let removed = false;
  await ctx.dbApi.runTransaction(ctx.db, async transaction => {
    const snapshot = await transaction.get(userQuery);
    const matches = snapshot.docs.filter(
      doc => safeUrl(doc.data().link) === link
    );
    if (matches.length === 0) return;

    matches.forEach(doc => transaction.delete(doc.ref));
    removed = true;
  });

  return removed;
}

export async function toggleSaved(ctx, article, savedSet) {
  if (!ctx?.user) throw new Error('Sign in to save stories');
  const link = safeUrl(article.link);
  if (!link) throw new Error('This story does not have a valid link');

  if (savedSet.has(link)) {
    const removed = await removeSavedArticle(ctx, article);
    if (removed) savedSet.delete(link);
    return removed ? 'removed' : 'saved';
  }

  await addSavedArticle(ctx, article);
  savedSet.add(link);
  return 'saved';
}

export function stashPendingSave(article) {
  const record = {
    title: article.title,
    link: article.link,
    thumbnail: article.thumbnail,
    source: article.source,
    categories: article.categories
  };

  try {
    sessionStorage.setItem('bytebrief_pending_save', JSON.stringify(record));
  } catch {
    /* ignore storage failures; sign-in still works */
  }

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const target = `${page}${window.location.search}${window.location.hash}`;
  window.location.href = `login.html?redirect=${encodeURIComponent(target)}`;
}

export async function flushPendingSave(ctx) {
  if (!ctx?.user) return;

  let raw = null;
  try {
    raw = sessionStorage.getItem('bytebrief_pending_save');
    if (raw) sessionStorage.removeItem('bytebrief_pending_save');
  } catch {
    return;
  }
  if (!raw) return;

  try {
    const article = JSON.parse(raw);
    const added = await addSavedArticle(ctx, article);
    if (added) showToast('Story saved to your reading list.', 'success');
    else showToast('Already saved.', 'info');
  } catch (error) {
    console.warn('Could not finish the pending save:', error);
    showToast(error.message || 'Signed in, but the story could not be saved.', 'error');
  }
}

export async function shareArticle(article) {
  const link = safeUrl(article.link);
  if (!link) {
    showToast('This story does not have a shareable link.', 'error');
    return;
  }

  const shareUrl = new URL('index.html', document.baseURI);
  shareUrl.searchParams.set('article', link);

  const payload = {
    title: `${article.title || 'Tech story'} — ByteBrief`,
    text: article.description || 'A tech story worth reading.',
    url: shareUrl.href
  };

  if (navigator.share) {
    try {
      await navigator.share(payload);
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareUrl.href);
    showToast('Share link copied to clipboard.', 'success');
  } catch {
    const helper = document.createElement('textarea');
    helper.value = shareUrl.href;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    try {
      document.execCommand('copy');
      showToast('Share link copied to clipboard.', 'success');
    } catch {
      showToast('Could not copy the link.', 'error');
    }
    helper.remove();
  }
}

/* Cards ------------------------------------------------------------------ */

function titleMarkup(article) {
  const title = escapeHtml(article.title || 'Untitled');
  const link = escapeHtml(safeUrl(article.link) || '#');
  return `<button type="button" class="link-button" data-action="open" data-link="${link}">${title}</button>`;
}

export function renderStoryCard(article, options = {}) {
  const {
    span = 4,
    saved = false,
    savedAt = null,
    showExcerpt = true
  } = options;

  const link = escapeHtml(safeUrl(article.link) || '#');
  const title = article.title || 'Untitled';
  const category = categoryLabel(article.categories?.[0] || article.category);
  const published = article.publishedAt || article.savedAt;
  const excerpt = article.description || '';
  const image = article.thumbnail || article.image;
  const imageUrl = safeUrl(image);
  const isVideo = article.video === true;
  const videoBadges = isVideo
    ? `<span class="video-channel">${escapeHtml(article.source || 'YouTube')}</span>
        <span class="video-badge-yt" aria-label="YouTube video">YT</span>`
    : '';
  const imageMarkup = imageUrl
    ? `
      <button type="button" class="story-media${isVideo ? ' story-media--video' : ''}" data-action="open" data-link="${link}" aria-label="${isVideo ? 'Play' : 'Preview'} ${escapeHtml(title)}">
        <img class="js-img" src="${escapeHtml(imageUrl)}" alt="" loading="lazy" decoding="async">
        ${videoBadges}
        ${isVideo ? '' : `<span class="story-source">${escapeHtml(article.source || 'Unknown')}</span>`}
      </button>`
    : '';
  const cardClass = imageUrl ? `story-card${isVideo ? ' story-card--video' : ''}` : 'story-card story-card--text';

  return `
    <article class="${cardClass} card span-${span}" data-link="${link}">
      ${imageMarkup}
      <div class="story-content">
        <div class="story-kicker">
          <span class="eyebrow">${escapeHtml(category)}</span>
          <span class="dot"></span>
          <time datetime="${escapeHtml(published || '')}">${published ? formatRelative(published) : '—'}</time>
        </div>
        <h3 class="story-title">${titleMarkup(article)}</h3>
        ${
          showExcerpt && excerpt
            ? `<p class="story-excerpt">${escapeHtml(excerpt)}</p>`
            : ''
        }
        ${imageUrl ? '' : `<div class="story-source-line">From ${escapeHtml(article.source || 'Unknown')}</div>`}
        <div class="story-actions">
          <button type="button" class="js-save-btn${saved ? ' is-saved' : ''}" data-action="save" data-link="${link}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save story'}">
            ${ICONS.bookmark}<span class="js-save-label">${saved ? 'Saved' : 'Save'}</span>
          </button>
          <button type="button" data-action="share" data-link="${link}" aria-label="Share story">
            ${ICONS.share}<span>Share</span>
          </button>
          <a class="story-read" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="Read ${escapeHtml(title)}">
            Read ${ICONS.arrow}
          </a>
        </div>
        ${
          savedAt
            ? `<p class="story-saved-at">Saved ${escapeHtml(formatRelative(savedAt))}</p>`
            : ''
        }
      </div>
    </article>
  `;
}

function languageClass(language) {
  const key = String(language || '')
    .toLowerCase()
    .replace(/\+\+/g, 'pp')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]/g, '');
  return key ? `lang-${key}` : 'lang-unknown';
}

export function renderRepoCard(repo, options = {}) {
  const { rank = null, span = 3 } = options;
  const url = safeUrl(repo.url) || '#';
  const stars = Number(repo.stars) || 0;
  const today = Number(repo.starsToday) || 0;

  return `
    <article class="repo-card card span-${span}">
      <div class="repo-top">
        ${rank ? `<span class="repo-rank">${String(rank).padStart(2, '0')}</span>` : ''}
        <a class="repo-name" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name || 'Unknown repo')}</a>
      </div>
      <p class="repo-desc">${escapeHtml(repo.description || 'No description provided.')}</p>
      <div class="repo-meta">
        <span class="repo-lang"><i class="lang-dot ${languageClass(repo.language)}"></i>${escapeHtml(repo.language || 'Unknown')}</span>
        <span class="repo-stars" title="${escapeHtml(stars.toLocaleString())} stars">${ICONS.star}${escapeHtml(formatNumber(stars))}</span>
        ${today > 0 ? `<span class="repo-today">+${escapeHtml(formatNumber(today))} today</span>` : ''}
      </div>
    </article>
  `;
}

export function renderEventCard(event, options = {}) {
  const { span = 4 } = options;
  const url = safeUrl(event.link) || '#';
  const tba = event.status === 'tba';

  return `
    <article class="event-card card span-${span}">
      <div class="cluster">
        <span class="pill ${tba ? 'pill-tba' : 'pill-success'}">${tba ? 'Date TBA' : 'Confirmed'}</span>
        <span class="pill">${escapeHtml(event.dateLabel || 'Date TBA')}</span>
      </div>
      <h3>${escapeHtml(event.title || 'Tech event')}</h3>
      <p class="event-location">${ICONS.pin}${escapeHtml(event.location || 'Location TBA')}</p>
      <p class="event-desc">${escapeHtml(event.description || '')}</p>
      <a class="text-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Event details ${ICONS.arrow}</a>
    </article>
  `;
}

export function renderPodcastCard(podcast, options = {}) {
  const { span = 4 } = options;
  const url = safeUrl(podcast.link) || '#';
  const artwork = safeUrl(podcast.artwork);
  const episode = podcast.latestEpisode;
  const episodeUrl = safeUrl(episode?.link) || url;

  return `
    <article class="podcast-card card span-${span}">
      ${
        artwork
          ? `<img class="podcast-art js-img" src="${escapeHtml(artwork)}" alt="" loading="lazy" decoding="async">`
          : `<span class="podcast-art podcast-placeholder" aria-hidden="true">${ICONS.mic}</span>`
      }
      <div class="podcast-body">
        <span class="eyebrow">${escapeHtml(categoryLabel(podcast.category))}</span>
        <h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(podcast.name || 'Podcast')}</a></h3>
        <p class="podcast-host">${escapeHtml(podcast.host || '')}</p>
        ${
          episode
            ? `<a class="podcast-episode" href="${escapeHtml(episodeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(episode.title || 'Latest episode')}</a>
               <span class="podcast-date">${escapeHtml(formatRelative(episode.publishedAt))}</span>`
            : '<p class="podcast-episode">No recent episode found.</p>'
        }
      </div>
    </article>
  `;
}

export function renderSourceCard(source, options = {}) {
  const { span = 3 } = options;
  const url = safeUrl(source.url) || '#';

  return `
    <a class="source-card card span-${span}" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
      <strong>${escapeHtml(source.name || 'Source')}</strong>
      <span class="pill">${escapeHtml(categoryLabel(source.category))}</span>
      <span class="source-foot"><span>Visit source</span>${ICONS.arrow}</span>
    </a>
  `;
}

/* Image fallback --------------------------------------------------------- */

document.addEventListener(
  'error',
  event => {
    if (event.target instanceof HTMLImageElement && event.target.classList.contains('js-img')) {
      event.target.classList.add('is-hidden');
    }
  },
  true
);

