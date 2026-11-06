import {
  ICONS,
  categoryLabel,
  escapeHtml,
  formatRelative,
  getSavedArticles,
  initShell,
  renderStoryCard,
  safeUrl,
  showToast
} from './shared.js';

const root = document.getElementById('savedRoot');
const SPANS = [6, 3, 3, 4, 4, 4];

let ctx = null;
let saved = [];

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
            savedAt: article.savedAt,
            linkTitles: true
          })
        )
        .join('')}
    </div>
  `;

  root.querySelector('#savedGrid')?.addEventListener('click', handleGridClick);
}

async function handleGridClick(event) {
  const button = event.target.closest('[data-action="save"]');
  if (!button) return;
  event.preventDefault();

  const link = button.dataset.link;
  const target = saved.find(article => safeUrl(article.link) === link);
  if (!target) return;

  const previous = saved;
  saved = saved.filter(article => article !== target);
  renderSaved();
  showToast('Removed from your reading list.');

  try {
    await ctx.dbApi.deleteDoc(
      ctx.dbApi.doc(ctx.db, 'savedArticles', target.id)
    );
  } catch (error) {
    console.error('Could not remove the saved story:', error);
    saved = previous;
    renderSaved();
    showToast('Could not remove that story. Try again.', 'error');
  }
}
