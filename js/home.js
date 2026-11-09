import {
  ICONS,
  PRIORITY_SOURCES,
  categoryLabel,
  escapeHtml,
  formatDate,
  formatDay,
  formatNumber,
  formatRelative,
  getSavedArticles,
  getUserProfile,
  initAuth,
  initShell,
  loadData,
  renderStoryCard,
  safeUrl,
  shareArticle,
  showToast,
  stashPendingSave,
  toggleSaved
} from './shared.js?v=20261109-9';

const PAGE_SIZE = 18;
const STORY_SPANS = [6, 3, 3, 4, 4, 4];
const CATEGORY_ORDER = ['ai', 'programming', 'hardware', 'startups', 'cybersecurity', 'tech', 'cloud', 'mobile', 'gaming', 'science', 'opensource', 'privacy', 'business'];
const DAILY_TOP_KEY = 'bytebrief_daily_top';
const DAILY_TOP_COUNT = 3;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function shuffleArticles(articles) {
  const copy = [...articles];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function interleaveVideos(articles, { minGap = 2, maxGap = 6 } = {}) {
  const videos = shuffleArticles(articles.filter(article => article.video === true));
  const rest = articles.filter(article => article.video !== true);
  if (videos.length === 0 || rest.length === 0) return [...videos, ...rest];

  const out = [];
  let vi = 0;
  let untilVideo = 1 + Math.floor(Math.random() * Math.max(1, minGap));
  for (let i = 0; i < rest.length; i += 1) {
    out.push(rest[i]);
    untilVideo -= 1;
    if (untilVideo <= 0 && vi < videos.length) {
      out.push(videos[vi++]);
      untilVideo = minGap + Math.floor(Math.random() * (maxGap - minGap + 1));
    }
  }
  while (vi < videos.length) out.push(videos[vi++]);
  return out;
}

// The top 3 stay put all day; videos are spread through the rest of the feed.
function orderForToday(articles) {
  const byLink = new Map(articles.map(article => [safeUrl(article.link), article]));

  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(DAILY_TOP_KEY) || 'null');
  } catch {
    saved = null;
  }

  const top = saved?.date === todayKey() && Array.isArray(saved.links)
    ? saved.links.map(link => byLink.get(link)).filter(Boolean).slice(0, DAILY_TOP_COUNT)
    : [];

  const used = new Set(top.map(article => safeUrl(article.link)));
  for (const article of articles) {
    if (top.length === DAILY_TOP_COUNT) break;
    if (article.video === true) continue;
    const link = safeUrl(article.link);
    if (!link || used.has(link)) continue;
    top.push(article);
    used.add(link);
  }
  for (const article of articles) {
    if (top.length === DAILY_TOP_COUNT) break;
    const link = safeUrl(article.link);
    if (!link || used.has(link)) continue;
    top.push(article);
    used.add(link);
  }

  try {
    localStorage.setItem(
      DAILY_TOP_KEY,
      JSON.stringify({ date: todayKey(), links: top.map(article => safeUrl(article.link)) })
    );
  } catch {
    /* storage can be unavailable; the feed still works */
  }

  const rest = articles.filter(article => !used.has(safeUrl(article.link)));
  return [...top, ...interleaveVideos(shuffleArticles(rest), { minGap: 2, maxGap: 6 })];
}

const state = {
  data: null,
  ctx: null,
  authReady: false,
  savedSet: new Set(),
  savedCount: 0,
  savedCategoryCounts: new Map(),
  interests: [],
  topCategory: '—',
  filter: 'all',
  query: '',
  visible: PAGE_SIZE,
  sharedTarget: null
};

const els = {
  briefDate: document.getElementById('briefDate'),
  updatedNote: document.getElementById('updatedNote'),
  briefList: document.getElementById('briefList'),
  briefFoot: document.getElementById('briefFoot'),
  featured: document.getElementById('featuredCard'),
  statRepo: document.getElementById('statRepo'),
  statEvent: document.getElementById('statEvent'),
  statPodcast: document.getElementById('statPodcast'),
  statSaved: document.getElementById('statSaved'),
  storyCount: document.getElementById('storyCount'),
  search: document.getElementById('searchInput'),
  clearSearch: document.getElementById('clearSearch'),
  homeTitle: document.getElementById('homeTitle'),
  chips: document.getElementById('filterChips'),
  grid: document.getElementById('storyGrid'),
  empty: document.getElementById('storyEmpty'),
  loadMore: document.getElementById('loadMore'),
  sharedNotice: document.getElementById('sharedNotice'),
  modal: document.getElementById('articleModal'),
  modalMedia: document.getElementById('modalMedia'),
  modalCategory: document.getElementById('modalCategory'),
  modalSource: document.getElementById('modalSource'),
  modalTitle: document.getElementById('modalTitle'),
  modalMeta: document.getElementById('modalMeta'),
  modalDescription: document.getElementById('modalDescription'),
  modalRead: document.getElementById('modalRead'),
  modalSave: document.getElementById('modalSave'),
  modalShare: document.getElementById('modalShare')
};

let lastFocused = null;
let searchTimer = null;
let loadObserver = null;

function linkKey(value) {
  return safeUrl(value) || '';
}

function isSaved(article) {
  return state.savedSet.has(linkKey(article.link));
}

boot();

function boot() {
  bindEvents();

  const dataPromise = loadData();
  const authPromise = initShell('home');

  const installId = (() => {
    try {
      let value = localStorage.getItem('bytebrief_install_id');
      if (!value) {
        value = crypto.randomUUID();
        localStorage.setItem('bytebrief_install_id', value);
      }
      return value;
    } catch {
      return 'local';
    }
  })();

  const dailyHeadlines = [
    "Today's tech, without the noise.",
    "The day's signal, not the feed's static.",
    "Fewer tabs. Better tech.",
    "What matters in tech today.",
    "The useful version of today's internet.",
    "Tech news, trimmed to the point.",
    "Today's useful tech, nothing extra.",
    "The brief your browser wishes it wrote.",
    "Fresh tech, less scrolling.",
    "The tech worth opening today.",
    "A sharper read on today's tech.",
    "Today's tech, edited down.",
    "What shipped. What matters.",
    "The day's tech, in plain sight.",
    "Good tech stories. No filler.",
    "Today's internet, made readable.",
    "Tech headlines with the noise removed.",
    "A clean pass through today's tech.",
    "The tech news that actually matters.",
    "Today's best tech, one page deep.",
    "Less hype. More useful tech.",
    "Today's tech, cut to the signal.",
    "The day's tech moves, clearly told.",
    "A quick read on real tech news.",
    "Tech worth your attention today.",
    "Today's tech, minus the clutter.",
    "What changed in tech today.",
    "The useful side of today's tech.",
    "Today's tech brief, no rabbit holes.",
    "Smart tech reading, zero noise."
  ];

  function pickDailyHeadline(userKey) {
    const date = new Date().toISOString().slice(0, 10);
    const storageKey = 'bytebrief_daily_headline_v2';
    const memoryWindow = 14;

    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (stored?.date === date && dailyHeadlines[stored.index]) {
        if (els.homeTitle) els.homeTitle.textContent = dailyHeadlines[stored.index];
        return;
      }

      const history = Array.isArray(stored?.history) ? stored.history.filter(Boolean) : [];
      const recent = new Set(history.slice(-memoryWindow));
      let pool = dailyHeadlines.map((_, i) => i).filter(i => !recent.has(i));
      if (pool.length === 0) pool = dailyHeadlines.map((_, i) => i);

      // Mix date/user into selection so devices differ, but avoid recent repeats.
      const seed = `${date}:${userKey}:${history.length}`;
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      const index = pool[hash % pool.length];

      const nextHistory = [...history.filter(i => i !== index), index].slice(-memoryWindow);
      localStorage.setItem(storageKey, JSON.stringify({ date, index, history: nextHistory }));
      if (els.homeTitle) els.homeTitle.textContent = dailyHeadlines[index];
      return;
    } catch {
      const seed = `${date}:${userKey}`;
      let hash = 0;
      for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
      if (els.homeTitle) els.homeTitle.textContent = dailyHeadlines[hash % dailyHeadlines.length];
    }
  }

  authPromise.then(ctx => {
    pickDailyHeadline(ctx?.user?.uid || installId);
  });

  dataPromise
    .then(data => {
      state.data = data;
      state.data.articles = orderForToday(state.data.articles);
      prepareShared();
      renderPage();
    })
    .catch(error => {
      console.warn('Could not load the data file:', error);
      renderDataError();
    });

  authPromise.then(async ctx => {
    state.ctx = ctx;
    state.authReady = true;

    if (!ctx?.user) {
      renderStats();
      return;
    }

    try {
      const [saved, profile] = await Promise.all([
        getSavedArticles(ctx),
        getUserProfile(ctx)
      ]);

      state.savedSet = new Set(
        saved.map(article => safeUrl(article.link)).filter(Boolean)
      );
      state.savedCount = saved.length;
      state.savedCategoryCounts = countCategories(saved);
      state.topCategory = topCategory(state.savedCategoryCounts);
      state.interests = Array.isArray(profile?.interests) ? profile.interests : [];

      if (state.data) {
        renderStats();
        renderChips();
        renderStories();
      }
    } catch (error) {
      console.warn('Could not load the reading list:', error);
      renderStats();
    }
  });
}

function bindEvents() {
  els.search?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = els.search.value.trim();
      els.clearSearch?.classList.toggle('is-hidden', !state.query);
      state.visible = PAGE_SIZE;
      renderStories();
    }, 160);
  });

  els.clearSearch?.addEventListener('click', () => {
    if (!els.search) return;
    els.search.value = '';
    state.query = '';
    els.clearSearch.classList.add('is-hidden');
    state.visible = PAGE_SIZE;
    renderStories();
    els.search.focus();
  });

  els.chips?.addEventListener('click', event => {
    const chip = event.target.closest('[data-filter]');
    if (!chip) return;
    state.filter = chip.dataset.filter;
    state.visible = PAGE_SIZE;
    renderChips();
    renderStories();
  });

  els.loadMore?.addEventListener('click', () => {
    state.visible += PAGE_SIZE;
    renderStories();
  });

  document.addEventListener('click', async event => {
    if (event.target.closest('[data-close-modal]')) {
      closeModal();
      return;
    }

    if (event.target.closest('#retryData')) {
      window.location.reload();
      return;
    }

    const actionEl = event.target.closest('[data-action]');
    if (!actionEl) return;

    const article = findArticle(actionEl.dataset.link);
    if (!article) return;

    const action = actionEl.dataset.action;
    if (action === 'open') {
      event.preventDefault();
      openModal(article);
    } else if (action === 'save') {
      event.preventDefault();
      await handleSave(article, actionEl);
    } else if (action === 'share') {
      event.preventDefault();
      await shareArticle(article);
    }
  });

  document.addEventListener('keydown', event => {
    if (!els.modal?.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      closeModal();
      return;
    }
    if (event.key === 'Tab') trapFocus(event);
  });

  const loadWrap = document.querySelector('.load-more-wrap');
  if (loadWrap && 'IntersectionObserver' in window) {
    loadObserver = new IntersectionObserver(
      entries => {
        if (!entries[0]?.isIntersecting || !hasMoreStories() || !state.data) return;
        state.visible += PAGE_SIZE;
        renderStories();
      },
      { rootMargin: '560px' }
    );
    loadObserver.observe(loadWrap);
  }
}

function renderPage() {
  if (!state.data) return;

  const generated = state.data.generatedAt;
  els.briefDate.textContent = formatDay(generated);
  els.updatedNote.textContent = generated
    ? `Data refreshed ${formatRelative(generated)}`
    : 'Refresh time unavailable';
  els.updatedNote.title = generated ? new Date(generated).toLocaleString() : '';

  renderBrief();
  renderFeatured();
  renderStats();
  renderChips();
  renderStories();
}

function sortedArticles() {
  return [...state.data.articles];
}

function pickBriefStories() {
  const priority = new Set(PRIORITY_SOURCES);
  const articles = sortedArticles();
  const picks = [];
  const usedSources = new Set();

  for (const article of articles) {
    if (!priority.has(article.source) || usedSources.has(article.source)) continue;
    picks.push(article);
    usedSources.add(article.source);
    if (picks.length === 3) break;
  }

  if (picks.length < 3) {
    for (const article of articles) {
      if (picks.includes(article) || usedSources.has(article.source)) continue;
      picks.push(article);
      usedSources.add(article.source);
      if (picks.length === 3) break;
    }
  }

  return picks;
}

function renderBrief() {
  const picks = pickBriefStories();

  els.briefList.innerHTML = picks
    .map(
      (article, index) => `
        <button type="button" class="brief-item" data-action="open" data-link="${escapeHtml(article.link)}">
          <span class="brief-rank">${String(index + 1).padStart(2, '0')}</span>
          <span class="brief-item-text">
            <span class="brief-item-title">${escapeHtml(article.title)}</span>
            <span class="brief-item-meta">${escapeHtml(article.source)} · ${escapeHtml(formatRelative(article.publishedAt))}</span>
          </span>
          ${ICONS.arrow}
        </button>
      `
    )
    .join('');

  const data = state.data;
  els.briefFoot.innerHTML = `
    <span>${escapeHtml(String(data.articles.length))} stories</span>
    <span class="dot"></span>
    <span>${escapeHtml(String(data.sources.length))} sources</span>
    <span class="dot"></span>
    <span>${escapeHtml(String(data.github.length))} repos trending</span>
  `;
}

function pickFeatured(briefStories) {
  const priority = new Set(PRIORITY_SOURCES);
  const withImages = state.data.articles.filter(
    article => safeUrl(article.thumbnail) && !briefStories.includes(article)
  );

  return (
    withImages.find(article => priority.has(article.source)) ||
    withImages[0] ||
    state.data.articles.find(article => !briefStories.includes(article)) ||
    state.data.articles[0]
  );
}

function renderFeatured() {
  if (!state.data) return;
  const article = pickFeatured(pickBriefStories());
  if (!article) return;

  const image = safeUrl(article.thumbnail);
  const category = categoryLabel(articleCategories(article)[0]);
  const saved = isSaved(article);
  const link = escapeHtml(article.link);

  els.featured.innerHTML = `
    <div class="featured-media">
      ${image ? `<img class="js-img" src="${escapeHtml(image)}" alt="" loading="eager" decoding="async">` : ''}
      <div class="featured-body">
        <span class="eyebrow">${escapeHtml(category)} · ${escapeHtml(article.source)}</span>
        <h2><button type="button" class="link-button" data-action="open" data-link="${link}">${escapeHtml(article.title)}</button></h2>
        ${article.description ? `<p>${escapeHtml(article.description)}</p>` : ''}
        <div class="featured-actions">
          <span class="pill">${escapeHtml(formatRelative(article.publishedAt))}</span>
          <button type="button" class="round-btn js-save-btn${saved ? ' is-saved' : ''}" data-action="save" data-link="${link}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save story'}">
            ${ICONS.bookmark}
          </button>
          <button type="button" class="round-btn" data-action="share" data-link="${link}" aria-label="Share story">
            ${ICONS.share}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderStats() {
  renderRepoStat();
  renderEventStat();
  renderPodcastStat();
  renderSavedStat();
}

function renderRepoStat() {
  const repo = state.data?.github?.[0];
  if (!repo) {
    els.statRepo.innerHTML = `
      <div class="stat-top"><span class="stat-icon">${ICONS.repo}</span><span class="pill">GitHub</span></div>
      <h3>No trending repos right now</h3>
      <p>The next refresh will try again.</p>
    `;
    return;
  }

  const url = safeUrl(repo.url) || '#';
  const today = Number(repo.starsToday) || 0;

  els.statRepo.innerHTML = `
    <div class="stat-top">
      <span class="stat-icon">${ICONS.repo}</span>
      <span class="pill pill-accent">Trending</span>
    </div>
    <h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a></h3>
    <p>${escapeHtml(repo.description || 'No description provided.')}</p>
    <div class="stat-foot">
      <span title="${escapeHtml(String(repo.stars || 0))} stars">${ICONS.star} ${escapeHtml(formatNumber(repo.stars))}</span>
      ${today > 0 ? `<span class="dot"></span><span>+${escapeHtml(formatNumber(today))} today</span>` : ''}
    </div>
  `;
}

function renderEventStat() {
  const event = state.data?.events?.[0];
  if (!event) {
    els.statEvent.innerHTML = `
      <div class="stat-top"><span class="stat-icon">${ICONS.calendar}</span><span class="pill">Events</span></div>
      <h3>No upcoming events listed</h3>
      <p>The curated calendar is empty this cycle.</p>
    `;
    return;
  }

  const url = safeUrl(event.link) || 'byteHub.html#events';
  const tba = event.status === 'tba';

  els.statEvent.innerHTML = `
    <div class="stat-top">
      <span class="stat-icon">${ICONS.calendar}</span>
      <span class="pill ${tba ? 'pill-tba' : 'pill-success'}">${tba ? 'Date TBA' : 'Next up'}</span>
    </div>
    <h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.title)}</a></h3>
    <p>${escapeHtml(event.location || 'Location TBA')}</p>
    <div class="stat-foot">
      <span>${escapeHtml(event.dateLabel || 'Date TBA')}</span>
    </div>
  `;
}

function renderPodcastStat() {
  const podcasts = state.data?.podcasts || [];
  const podcast =
    podcasts
      .filter(show => show.latestEpisode?.publishedAt)
      .sort(
        (a, b) =>
          Date.parse(b.latestEpisode.publishedAt) -
          Date.parse(a.latestEpisode.publishedAt)
      )[0] || podcasts[0];

  if (!podcast) {
    els.statPodcast.innerHTML = `
      <div class="stat-top"><span class="stat-icon">${ICONS.mic}</span><span class="pill">Podcasts</span></div>
      <h3>No podcast episodes found</h3>
      <p>The next refresh will try again.</p>
    `;
    return;
  }

  const artwork = safeUrl(podcast.artwork);
  const episode = podcast.latestEpisode;
  const url = safeUrl(podcast.link) || '#';
  const episodeUrl = safeUrl(episode?.link) || url;

  els.statPodcast.innerHTML = `
    <div class="stat-top">
      <span class="stat-icon">${ICONS.mic}</span>
      <span class="pill">Podcast</span>
    </div>
    <div class="podcast-mini">
      ${
        artwork
          ? `<img class="js-img" src="${escapeHtml(artwork)}" alt="" loading="lazy" decoding="async">`
          : `<span class="podcast-placeholder" aria-hidden="true">${ICONS.mic}</span>`
      }
      <div class="podcast-mini-text">
        <strong><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(podcast.name)}</a></strong>
        ${
          episode
            ? `<a href="${escapeHtml(episodeUrl)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(episode.title)}</span></a>
               <span>${escapeHtml(formatRelative(episode.publishedAt))}</span>`
            : '<span>No recent episode</span>'
        }
      </div>
    </div>
    <div class="stat-foot">
      <a class="text-link" href="byteHub.html#podcasts">All podcasts ${ICONS.arrow}</a>
    </div>
  `;
}

function renderSavedStat() {
  if (!state.authReady) {
    els.statSaved.innerHTML = `
      <div class="stat-top"><span class="stat-icon">${ICONS.bookmark}</span><span class="pill">Reading list</span></div>
      <h3>Your reading list</h3>
      <p>Checking your session…</p>
    `;
    return;
  }

  if (!state.ctx?.user) {
    els.statSaved.innerHTML = `
      <div class="stat-top"><span class="stat-icon">${ICONS.bookmark}</span><span class="pill">Reading list</span></div>
      <h3>Keep a reading list.</h3>
      <p>Sign in with Google to save stories across devices.</p>
      <div class="stat-foot">
        <a class="text-link" href="login.html?redirect=index.html">Sign in ${ICONS.arrow}</a>
      </div>
    `;
    return;
  }

  els.statSaved.innerHTML = `
    <div class="stat-top"><span class="stat-icon">${ICONS.bookmark}</span><span class="pill pill-accent">Saved</span></div>
    <span class="stat-value">${escapeHtml(String(state.savedCount))}</span>
    <p>${state.savedCount === 0 ? 'Stories you save will appear here.' : `Top topic: ${escapeHtml(state.topCategory)}`}</p>
    <div class="stat-foot">
      <a class="text-link" href="saved.html">Open reading list ${ICONS.arrow}</a>
    </div>
  `;
}

function renderChips() {
  if (!state.data || !els.chips) return;

  const counts = new Map();
  for (const article of state.data.articles) {
    for (const category of article.categories || (article.category ? [article.category] : [])) {
      counts.set(category, (counts.get(category) || 0) + 1);
    }
  }

  const chips = [{ key: 'all', label: 'All', count: state.data.articles.length }];

  if (state.interests.length > 0) {
    const forYou = state.data.articles.filter(article =>
      (article.categories || (article.category ? [article.category] : [])).some(category => state.interests.includes(category))
    ).length;
    chips.push({ key: 'for-you', label: 'For you', count: forYou });
  }

  for (const category of CATEGORY_ORDER) {
    if (counts.get(category)) {
      chips.push({
        key: category,
        label: categoryLabel(category),
        count: counts.get(category)
      });
    }
  }

  if (!chips.some(chip => chip.key === state.filter)) state.filter = 'all';

  els.chips.innerHTML = chips
    .map(
      chip => `
        <button type="button" class="chip" data-filter="${chip.key}" aria-pressed="${state.filter === chip.key}">
          ${escapeHtml(chip.label)}
          <span class="chip-count">${escapeHtml(String(chip.count))}</span>
        </button>
      `
    )
    .join('');
}

function articleCategories(article) {
  return article?.categories?.length
    ? article.categories
    : article?.category
      ? [article.category]
      : [];
}

function interestScore(article) {
  if (state.interests.length === 0) return 0;
  return articleCategories(article).filter(category =>
    state.interests.includes(category)
  ).length;
}

function filteredArticles() {
  if (!state.data) return [];
  let articles = [...state.data.articles];

  if (state.filter === 'for-you') {
    articles = articles.filter(article => interestScore(article) > 0);
    articles.sort(
      (a, b) =>
        interestScore(b) - interestScore(a) ||
        Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0)
    );
  } else if (state.filter !== 'all') {
    articles = articles.filter(article =>
      articleCategories(article).includes(state.filter)
    );
  }

  if (state.query) {
    const needle = state.query.toLowerCase();
    articles = articles.filter(article => {
      const haystack = [
        article.title,
        article.description,
        article.source,
        ...articleCategories(article).map(categoryLabel)
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  return articles;
}

function renderStories() {
  if (!state.data || !els.grid) return;

  const articles = filteredArticles();
  const slice = articles.slice(0, state.visible);

  els.storyCount.textContent = `${articles.length} ${
    articles.length === 1 ? 'story' : 'stories'
  }`;
  els.grid.setAttribute('aria-busy', 'false');
  els.empty.innerHTML = '';

  if (articles.length === 0) {
    els.grid.innerHTML = '';
    els.loadMore.classList.add('is-hidden');
    els.empty.innerHTML = `
      <div class="empty-state">
        ${ICONS.search}
        <h3>No stories match that search</h3>
        <p>Try a different word or clear the topic filter.</p>
        <button type="button" class="btn btn-outline" id="resetFilters">Clear filters</button>
      </div>
    `;
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    return;
  }

  els.grid.innerHTML = slice
    .map((article, index) =>
      renderStoryCard(article, {
        span: STORY_SPANS[index % STORY_SPANS.length],
        saved: isSaved(article)
      })
    )
    .join('');

  const remaining = articles.length - slice.length;
  els.loadMore.classList.toggle('is-hidden', remaining <= 0);
  if (remaining > 0) {
    els.loadMore.textContent = `Load ${Math.min(PAGE_SIZE, remaining)} more stories`;
  }

  if (state.sharedTarget) {
    const target = state.sharedTarget;
    state.sharedTarget = null;
    const card = [...els.grid.querySelectorAll('.story-card')].find(
      element => element.dataset.link === target
    );

    if (card) {
      card.classList.add('is-highlighted');
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth';
      setTimeout(() => card.scrollIntoView({ behavior, block: 'center' }), 120);
      showToast('Opening the shared story.');
      removeArticleParam();
    }
  }
}

function resetFilters() {
  state.filter = 'all';
  state.query = '';
  state.visible = PAGE_SIZE;
  if (els.search) els.search.value = '';
  els.clearSearch?.classList.add('is-hidden');
  renderChips();
  renderStories();
}

function prepareShared() {
  const raw = new URLSearchParams(window.location.search).get('article');
  const target = safeUrl(raw);
  if (!target) return;

  const index = state.data.articles.findIndex(
    article => linkKey(article.link) === target
  );
  if (index === -1) {
    els.sharedNotice.innerHTML = `
      <div class="notice-line">
        <span>That shared story has rolled out of the current feed.</span>
        <a class="text-link" href="${escapeHtml(target)}" target="_blank" rel="noopener noreferrer">Read it at the source ${ICONS.arrow}</a>
      </div>
    `;
    return;
  }

  state.sharedTarget = target;
  state.visible = Math.max(
    state.visible,
    Math.min(index + 6, state.data.articles.length)
  );
}

function removeArticleParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has('article')) return;
  url.searchParams.delete('article');
  window.history.replaceState({}, '', url);
}

function findArticle(link) {
  if (!link || !state.data) return null;
  const key = linkKey(link);
  if (!key) return null;
  return state.data.articles.find(article => linkKey(article.link) === key) || null;
}

async function handleSave(article, button) {
  const ctx = state.ctx || (await initAuth());

  if (!ctx?.user) {
    stashPendingSave(article);
    return;
  }

  state.ctx = ctx;
  button.disabled = true;

  try {
    const result = await toggleSaved(ctx, article, state.savedSet);
    const saved = result === 'saved';

    state.savedCount = state.savedSet.size;
    updateCategoryCount(article, saved ? 1 : -1);
    state.topCategory = topCategory(state.savedCategoryCounts);

    updateSaveButtons(article.link, saved);
    renderStats();
    showToast(
      saved ? 'Saved to your reading list.' : 'Removed from your reading list.',
      saved ? 'success' : 'info'
    );
  } catch (error) {
    console.error('Could not update saved stories:', error);
    showToast(error.message || 'Could not update your reading list.', 'error');
  } finally {
    button.disabled = false;
  }
}

function updateCategoryCount(article, delta) {
  const category = articleCategories(article)[0] || 'tech';
  const next = Math.max(0, (state.savedCategoryCounts.get(category) || 0) + delta);
  if (next === 0) state.savedCategoryCounts.delete(category);
  else state.savedCategoryCounts.set(category, next);
}

function countCategories(articles) {
  const counts = new Map();
  for (const article of articles) {
    const category = article.category || 'tech';
    counts.set(category, (counts.get(category) || 0) + 1);
  }
  return counts;
}

function topCategory(counts) {
  let best = '—';
  let max = 0;
  for (const [category, count] of counts) {
    if (count > max) {
      best = categoryLabel(category);
      max = count;
    }
  }
  return best;
}

function updateSaveButtons(link, saved) {
  const key = linkKey(link);
  document.querySelectorAll('.js-save-btn').forEach(button => {
    if (button.dataset.link !== key) return;
    button.classList.toggle('is-saved', saved);
    button.setAttribute('aria-pressed', String(saved));
    button.setAttribute(
      'aria-label',
      saved ? 'Remove from saved' : 'Save story'
    );
    const label = button.querySelector('.js-save-label');
    if (label) label.textContent = saved ? 'Saved' : 'Save';
  });
}

function openModal(article) {
  if (!els.modal) return;

  lastFocused = document.activeElement;
  const isVideo = article.video === true;
  const link = safeUrl(article.link) || '#';
  const saved = isSaved(article);

  // YouTube iframe for video articles
  if (isVideo) {
    const videoId = article.videoId || 'iw9SZgyahqg';
    els.modalMedia.innerHTML = `<iframe class="js-iframe" width="100%" height="100%" style="aspect-ratio:16/9" src="https://www.youtube.com/embed/${videoId}?modestbranding=1&controls=1&showinfo=0&rel=0" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="YouTube video player"></iframe>`;
    els.modalTitle.textContent = article.title || 'Video';
    els.modalRead.textContent = 'Watch in app';
    els.modalRead.href = '#';
    els.modalRead.target = '';
    els.modalRead.rel = '';
  } else {
    const image = safeUrl(article.thumbnail);
    els.modalMedia.innerHTML = image
      ? `<img class="js-img" src="${escapeHtml(image)}" alt="" decoding="async">`
      : `<div class="media-placeholder">${ICONS.image}</div>`;
    els.modalCategory.textContent = categoryLabel(articleCategories(article)[0]);
    els.modalSource.textContent = article.source || 'Unknown';
    els.modalTitle.textContent = article.title || 'Story';
    els.modalMeta.textContent = [
      article.author || null,
      article.publishedAt ? formatDate(article.publishedAt, { year: true }) : 'Date unavailable'
    ]
      .filter(Boolean)
      .join(' · ');
    els.modalDescription.textContent = article.description || 'No summary was provided by the publisher.';
    els.modalRead.href = link;
    els.modalRead.textContent = 'Read full story';
    els.modalRead.target = '_blank';
    els.modalRead.rel = 'noopener noreferrer';
  }

  els.modalSave.dataset.link = link;
  els.modalSave.classList.toggle('is-saved', saved);
  els.modalSave.setAttribute('aria-pressed', String(saved));
  els.modalSave.querySelector('.js-save-label').textContent = saved ? 'Saved' : 'Save';

  els.modal.classList.add('is-open');
  els.modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  els.modal.querySelector('.modal-close')?.focus();
}

function closeModal() {
  if (!els.modal) return;
  els.modal.classList.remove('is-open');
  els.modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  lastFocused?.focus?.();
  lastFocused = null;
}

function trapFocus(event) {
  const focusable = [
    ...els.modal.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ].filter(element => element.offsetParent !== null);

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
}

function hasMoreStories() {
  return filteredArticles().length > state.visible;
}

function renderDataError() {
  els.updatedNote.textContent = 'Data unavailable';
  els.briefList.innerHTML =
    '<p class="muted">Today\'s data could not be loaded. Check your connection and retry.</p>';
  els.briefFoot.innerHTML = '';
  els.featured.innerHTML = `
    <div class="featured-media">
      <div class="featured-body">
        <span class="eyebrow">Offline</span>
        <h2>The brief is temporarily unavailable.</h2>
        <p>The rest of the site still works, but the data file did not load.</p>
      </div>
    </div>
  `;
  els.grid.innerHTML = '';
  els.grid.setAttribute('aria-busy', 'false');
  els.storyCount.textContent = '—';
  els.empty.innerHTML = `
    <div class="empty-state">
      <h3>Could not load the feed</h3>
      <p>The data file may be temporarily unavailable. Retry once your connection is back.</p>
      <button type="button" class="btn btn-primary" id="retryData">Retry</button>
    </div>
  `;
}

