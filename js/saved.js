import {
  ICONS,
  categoryLabel,
  escapeHtml,
  formatDate,
  formatRelative,
  getSavedArticles,
  initShell,
  removeSavedArticle,
  renderStoryCard,
  safeUrl,
  shareArticle,
  showToast
} from './shared.js?v=20261107-1';

const root = document.getElementById('savedRoot');
const SPANS = [6, 3, 3, 4, 4, 4];

const els = {
  modal: document.getElementById('articleModal'),
  media: document.getElementById('modalMedia'),
  category: document.getElementById('modalCategory'),
  source: document.getElementById('modalSource'),
  title: document.getElementById('modalTitle'),
  meta: document.getElementById('modalMeta'),
  description: document.getElementById('modalDescription'),
  read: document.getElementById('modalRead'),
  save: document.getElementById('modalSave'),
  share: document.getElementById('modalShare')
};

let ctx = null;
let saved = [];
let lastFocused = null;

boot();

function boot() {
  initShell('saved').then(authContext => {
    if (!authContext?.user) {
      renderSignedOut();
      return;
    }

    ctx = authContext;
    loadSaved();
  });
}

function renderLoading() {
  root.innerHTML =
    '<div class="loading-panel"><span class="spinner" aria-hidden="true"></span> Checking your reading list…</div>';
}

async function loadSaved() {
  renderLoading();

  try {
    saved = await getSavedArticles(ctx);
    renderSaved();
  } catch (error) {
    console.error('Could not load saved articles:', error);
    root.innerHTML = `
      <div class="empty-state">
        <h3>Could not load your reading list</h3>
        <p>Your account is signed in, but the saved-articles query failed. Check your connection and try again.</p>
        <button type="button" class="btn btn-primary" id="retrySaved">Retry</button>
      </div>
    `;
    document.getElementById('retrySaved')?.addEventListener('click', loadSaved);
  }
}

function renderSignedOut() {
  root.innerHTML = `
    <div class="bento">
      <article class="card card-pad span-7 saved-intro">
        <span class="eyebrow">Why sign in</span>
        <h2>Save now, read when you have time.</h2>
        <p>Reading ByteBrief never requires an account. Sign in only when you want a reading list that follows you between devices.</p>
        <div class="cluster">
          <a class="btn btn-primary" href="login.html?redirect=saved.html">Continue with Google</a>
          <a class="btn btn-ghost" href="index.html">Keep browsing</a>
        </div>
      </article>
      <article class="card card-pad span-5">
        <span class="eyebrow">What you get</span>
        <ul class="benefit-list">
          <li class="benefit">${ICONS.bookmark}<span><strong>One reading list.</strong> Saved stories stay in sync through Firestore.</span></li>
          <li class="benefit">${ICONS.user}<span><strong>A quieter profile.</strong> Topics you pick power the For you filter, nothing else.</span></li>
          <li class="benefit">${ICONS.check}<span><strong>No tracking pitch.</strong> No ads, no analytics scripts, no third-party pixels.</span></li>
        </ul>
      </article>
    </div>
  `;
}

function renderSaved() {
  if (saved.length === 0) {
    root.innerHTML = `
      <div class="empty-state">
        ${ICONS.bookmark}
        <h3>Your reading list is empty</h3>
        <p>Open a story on the feed and press Save. It will show up here on every signed-in device.</p>
        <a class="btn btn-primary" href="index.html">Find something to read</a>
      </div>
    `;
    return;
  }

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

  root.innerHTML = `
    <section class="bento stats-strip" aria-label="Reading list stats">
      <article class="mini-stat card span-4">
        <strong>${escapeHtml(String(total))}</strong>
        <span>${total === 1 ? 'Story saved' : 'Stories saved'}</span>
      </article>
      <article class="mini-stat card span-4">
        <strong>${escapeHtml(String(thisWeek))}</strong>
        <span>Saved in the last 7 days</span>
      </article>
      <article class="mini-stat card span-4">
        <strong>${escapeHtml(top ? categoryLabel(top[0]) : '—')}</strong>
        <span>Your top topic</span>
      </article>
    </section>
    <div class="bento" id="savedGrid">
      ${saved
        .map((article, index) =>
          renderStoryCard(article, {
            span: SPANS[index % SPANS.length],
            saved: true,
            savedAt: article.savedAt
          })
        )
        .join('')}
    </div>
  `;

  root.querySelector('#savedGrid')?.addEventListener('click', handleGridClick);
}

// Open/remove actions can come from a card, the modal, or #modalRead.
async function handleGridClick(event) {
  const actionEl = event.target.closest('[data-action]');
  if (!actionEl) return;

  const link = actionEl.dataset.link;
  const target = saved.find(article => safeUrl(article.link) === link);
  if (!target) return;

  if (actionEl.dataset.action === 'open') {
    event.preventDefault();
    openPreview(target);
    return;
  }

  if (actionEl.dataset.action === 'share') {
    event.preventDefault();
    await shareArticle(target);
    return;
  }

  if (actionEl.dataset.action !== 'save') return;

  const closeModal = Boolean(actionEl.closest('#articleModal'));
  event.preventDefault();
  await removeSaved(target, { closeModal });
}

async function removeSaved(target, { closeModal = false } = {}) {
  const previous = saved;
  const link = safeUrl(target.link);
  saved = saved.filter(article => safeUrl(article.link) !== link);
  renderSaved();
  showToast('Removed from your reading list.');
  if (closeModal) closePreview();

  try {
    await removeSavedArticle(ctx, target);
  } catch (error) {
    console.error('Could not remove the saved story:', error);
    saved = previous;
    renderSaved();
    showToast(error.message || 'Could not remove that story. Try again.', 'error');
  }
}

function openPreview(article) {
  if (!els.modal) return;
  lastFocused = document.activeElement;
  const image = safeUrl(article.thumbnail || article.image);
  const link = safeUrl(article.link) || '#';
  els.media.innerHTML = image
    ? `<img class="js-img" src="${escapeHtml(image)}" alt="" decoding="async">`
    : `<div class="media-placeholder" aria-hidden="true">${ICONS.image}</div>`;
  els.category.textContent = categoryLabel(article.categories?.[0] || article.category);
  els.source.textContent = article.source || 'Unknown';
  els.title.textContent = article.title || 'Story';
  const date = article.publishedAt || article.savedAt;
  els.meta.textContent = [
    article.author || null,
    date ? formatDate(date, { year: true }) : 'Date unavailable'
  ].filter(Boolean).join(' · ');
  els.description.textContent = article.description || 'The publisher did not provide a summary for this story.';
  els.read.href = link;
  els.save.dataset.link = link;
  els.save.querySelector('.js-save-label').textContent = 'Saved';
  els.save.classList.add('is-saved');
  els.save.setAttribute('aria-pressed', 'true');
  els.share.dataset.link = link;

  els.modal.classList.add('is-open');
  els.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  els.modal.querySelector('.modal-close')?.focus();
}

function closePreview() {
  if (!els.modal) return;
  els.modal.classList.remove('is-open');
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  lastFocused?.focus?.();
  lastFocused = null;
}

document.addEventListener('click', event => {
  if (event.target.closest('[data-close-modal]')) {
    closePreview();
    return;
  }

  if (event.target.closest('#articleModal')?.querySelector('[data-action]')) {
    void handleGridClick(event);
  }
});

document.addEventListener('keydown', event => {
  if (!els.modal?.classList.contains('is-open')) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closePreview();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...els.modal.querySelectorAll('a[href], button:not([disabled])')]
    .filter(el => el.offsetParent !== null);
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
