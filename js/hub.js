import {
  ICONS,
  categoryLabel,
  escapeHtml,
  formatNumber,
  formatRelative,
  initShell,
  loadData,
  renderEventCard,
  renderPodcastCard,
  renderRepoCard,
  renderSourceCard,
  safeUrl
} from './shared.js?v=20261110-8';

const SECTIONS = [
  { key: 'trending', label: 'Trending' },
  { key: 'events', label: 'Events' },
  { key: 'podcasts', label: 'Podcasts' },
  { key: 'sources', label: 'Sources' },
  { key: 'youtube', label: 'YouTube' }
];

const state = {
  data: null,
  section: 'trending',
  query: ''
};

const els = {
  updated: document.getElementById('hubUpdated'),
  pulse: document.getElementById('pulseGrid'),
  tabs: document.getElementById('hubTabs'),
  search: document.getElementById('hubSearch'),
  clearSearch: document.getElementById('hubClearSearch'),
  panel: document.getElementById('hubPanel'),
  empty: document.getElementById('hubEmpty'),
  videoModal: document.getElementById('videoModal'),
  videoModalMedia: document.getElementById('videoModalMedia'),
  videoModalCategory: document.getElementById('videoModalCategory'),
  videoModalSource: document.getElementById('videoModalSource'),
  videoModalTitle: document.getElementById('videoModalTitle'),
  videoModalMeta: document.getElementById('videoModalMeta'),
  videoModalLink: document.getElementById('videoModalLink')
};

let searchTimer = null;
let lastFocused = null;

boot();

function boot() {
  const hash = window.location.hash.slice(1);
  if (SECTIONS.some(section => section.key === hash)) state.section = hash;

  initShell('hub');
  bindEvents();

  loadData()
    .then(data => {
      state.data = data;
      renderPage();
    })
    .catch(error => {
      console.warn('Could not load the hub data:', error);
      renderDataError();
    });
}

function bindEvents() {
  els.tabs?.addEventListener('click', event => {
    const tab = event.target.closest('[data-section]');
    if (!tab) return;
    selectSection(tab.dataset.section);
  });

  els.tabs?.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...els.tabs.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;

    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;

    event.preventDefault();
    tabs[next].focus();
    tabs[next].click();
  });

  els.search?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = els.search.value.trim();
      els.clearSearch?.classList.toggle('is-hidden', !state.query);
      renderPanel();
    }, 150);
  });

  els.clearSearch?.addEventListener('click', clearSearch);

  els.panel?.addEventListener('click', event => {
    const trigger = event.target.closest('[data-video-id]');
    if (!trigger) return;
    event.preventDefault();
    openVideo(trigger.dataset);
  });

  document.addEventListener('click', event => {
    if (event.target.closest('[data-close-video]')) {
      closeVideo();
      return;
    }
    if (event.target.closest('#retryHubData')) {
      window.location.reload();
      return;
    }
    if (event.target.closest('#clearHubSearch')) {
      clearSearch();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && els.videoModal?.classList.contains('is-open')) {
      event.preventDefault();
      closeVideo();
    }
  });
}

function selectSection(key) {
  if (!SECTIONS.some(section => section.key === key)) return;
  state.section = key;
  state.query = '';
  if (els.search) els.search.value = '';
  els.clearSearch?.classList.add('is-hidden');
  window.history.replaceState({}, '', `#${key}`);
  renderTabs();
  renderPanel();
  els.panel?.focus?.();
}

function clearSearch() {
  state.query = '';
  if (els.search) els.search.value = '';
  els.clearSearch?.classList.add('is-hidden');
  renderPanel();
  els.search?.focus();
}

function openVideo(data) {
  if (!els.videoModal) return;
  const videoId = String(data.videoId || '');
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) return;

  lastFocused = document.activeElement;
  els.videoModalMedia.innerHTML = `<iframe class="js-iframe" width="100%" height="100%" style="aspect-ratio:16/9" src="https://www.youtube.com/embed/${videoId}?modestbranding=1&controls=1&showinfo=0&rel=0" frameborder="0" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" title="YouTube video player"></iframe>`;
  els.videoModalCategory.textContent = categoryLabel(data.videoCategory);
  els.videoModalSource.textContent = data.videoSource || 'YouTube';
  els.videoModalTitle.textContent = data.videoTitle || 'Video';
  const views = Number(data.videoViews);
  els.videoModalMeta.textContent = [
    data.videoDate ? formatRelative(data.videoDate) : null,
    views > 0 ? `${formatNumber(views)} views` : null
  ].filter(Boolean).join(' · ');
  els.videoModalLink.href = safeUrl(data.videoLink) || '#';

  els.videoModal.classList.add('is-open');
  els.videoModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  els.videoModal.querySelector('.modal-close')?.focus();
}

function closeVideo() {
  if (!els.videoModal) return;
  els.videoModalMedia.innerHTML = '';
  els.videoModal.classList.remove('is-open');
  els.videoModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  lastFocused?.focus?.();
  lastFocused = null;
}

function renderPage() {
  const generated = state.data.generatedAt;
  els.updated.textContent = generated
    ? `Data refreshed ${formatRelative(generated)}`
    : 'Refresh time unavailable';
  els.updated.title = generated ? new Date(generated).toLocaleString() : '';

  renderPulse();
  renderTabs();
  renderPanel();
}

function sectionCount(key) {
  if (!state.data) return 0;
  if (key === 'trending') return state.data.github?.length || 0;
  if (key === 'events') return state.data.events?.length || 0;
  if (key === 'podcasts') return state.data.podcasts?.length || 0;
  if (key === 'youtube') return state.data.articles?.filter(article => article.video).length || 0;
  return state.data.sources?.length || 0;
}

function renderTabs() {
  els.tabs.innerHTML = SECTIONS.map(
    section => `
      <button type="button" class="tab" role="tab" id="tab-${section.key}" aria-selected="${state.section === section.key}" aria-controls="hubPanel" data-section="${section.key}">
        ${section.label}
        <span class="tab-count">${sectionCount(section.key)}</span>
      </button>
    `
  ).join('');

  els.panel.setAttribute('role', 'tabpanel');
  els.panel.setAttribute('aria-labelledby', `tab-${state.section}`);
  els.panel.tabIndex = -1;
  els.panel.setAttribute('aria-busy', 'false');
}

function latestPodcast() {
  const podcasts = state.data?.podcasts || [];
  return (
    podcasts
      .filter(show => show.latestEpisode?.publishedAt)
      .sort(
        (a, b) =>
          Date.parse(b.latestEpisode.publishedAt) -
          Date.parse(a.latestEpisode.publishedAt)
      )[0] || podcasts[0]
  );
}

function renderPulse() {
  const repo = state.data?.github?.[0];
  const event = state.data?.events?.[0];
  const podcast = latestPodcast();

  els.pulse.innerHTML = [
    repo ? repoPulse(repo) : emptyPulse('Trending repo', ICONS.repo),
    event ? eventPulse(event) : emptyPulse('Next event', ICONS.calendar),
    podcast ? podcastPulse(podcast) : emptyPulse('Latest episode', ICONS.mic)
  ].join('');
}

function emptyPulse(label, icon) {
  return `
    <article class="pulse-card card span-4">
      <div class="stat-top"><span class="stat-icon">${icon}</span><span class="pill">${label}</span></div>
      <h3>Nothing to show yet</h3>
      <p>The next refresh will try again.</p>
    </article>
  `;
}

function repoPulse(repo) {
  const url = safeUrl(repo.url) || '#';
  const today = Number(repo.starsToday) || 0;

  return `
    <article class="pulse-card card span-4">
      <div class="stat-top">
        <span class="stat-icon">${ICONS.repo}</span>
        <span class="pill pill-accent">Trending repo</span>
      </div>
      <h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a></h3>
      <p>${escapeHtml(repo.description || 'No description provided.')}</p>
      <div class="stat-foot">
        <span title="${escapeHtml(String(repo.stars || 0))} stars">${ICONS.star} ${escapeHtml(formatNumber(repo.stars))}</span>
        ${today > 0 ? `<span class="dot"></span><span>+${escapeHtml(formatNumber(today))} today</span>` : ''}
      </div>
    </article>
  `;
}

function eventPulse(event) {
  const url = safeUrl(event.link) || '#';
  const tba = event.status === 'tba';

  return `
    <article class="pulse-card card span-4">
      <div class="stat-top">
        <span class="stat-icon">${ICONS.calendar}</span>
        <span class="pill ${tba ? 'pill-tba' : 'pill-success'}">${tba ? 'Date TBA' : 'Confirmed'}</span>
      </div>
      <h3><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.title)}</a></h3>
      <p>${escapeHtml(event.location || 'Location TBA')}</p>
      <div class="stat-foot">${escapeHtml(event.dateLabel || 'Date TBA')}</div>
    </article>
  `;
}

function podcastPulse(podcast) {
  const artwork = safeUrl(podcast.artwork);
  const url = safeUrl(podcast.link) || '#';
  const episode = podcast.latestEpisode;

  return `
    <article class="pulse-card card span-4">
      <div class="stat-top">
        <span class="stat-icon">${ICONS.mic}</span>
        <span class="pill">Latest episode</span>
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
              ? `<a href="${escapeHtml(safeUrl(episode.link) || url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(episode.title)}</span></a>
                 <span>${escapeHtml(formatRelative(episode.publishedAt))}</span>`
              : '<span>No recent episode</span>'
          }
        </div>
      </div>
      <div class="stat-foot">${escapeHtml(podcast.host || '')}</div>
    </article>
  `;
}

function renderPanel() {
  if (!state.data) return;

  const query = state.query.toLowerCase();
  let html = '';
  let count = 0;

  if (state.section === 'trending') {
    const repos = (state.data.github || []).filter(repo =>
      [repo.name, repo.description, repo.language]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
    count = repos.length;
    html = `
      <p class="hub-section-note">Ranked from GitHub's public daily trending page. Stars are cumulative; the daily gain is GitHub's own number.</p>
      <div class="bento">
        ${repos
          .map((repo, index) =>
            renderRepoCard(repo, {
              rank: index + 1,
              span: index === 0 ? 6 : 3
            })
          )
          .join('')}
      </div>
    `;
  }

  if (state.section === 'events') {
    const events = (state.data.events || []).filter(event =>
      [
        event.title,
        event.location,
        event.description,
        event.dateLabel,
        event.status
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
    count = events.length;
    html = `
      <p class="hub-section-note">Confirmed dates come from official event pages. Cards marked TBA have a month and venue, but no announced exact date.</p>
      <div class="bento">
        ${events
          .map((event, index) =>
            renderEventCard(event, { span: index === 0 ? 6 : 4 })
          )
          .join('')}
      </div>
    `;
  }

  if (state.section === 'podcasts') {
    const podcasts = (state.data.podcasts || []).filter(podcast =>
      [
        podcast.name,
        podcast.host,
        podcast.description,
        podcast.category,
        podcast.latestEpisode?.title
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
    count = podcasts.length;
    html = `
      <p class="hub-section-note">Latest episodes from Apple Podcasts. Show artwork and episode dates come from Apple's public lookup API.</p>
      <div class="bento">
        ${podcasts.map(podcast => renderPodcastCard(podcast, { span: 4 })).join('')}
      </div>
    `;
  }

  if (state.section === 'sources') {
    const sources = (state.data.sources || []).filter(source =>
      [source.name, source.url, categoryLabel(source.category)]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
    count = sources.length;
    html = `
      <p class="hub-section-note">Every feed is fetched directly by the refresh job. No third-party feed proxy sits between ByteBrief and the publisher.</p>
      <div class="bento">
        ${sources.map(source => renderSourceCard(source, { span: 3 })).join('')}
      </div>
    `;
  }

  if (state.section === 'youtube') {
    const videos = (state.data.articles || []).filter(article => article.video);
    count = videos.length;
    html = `
      <p class="hub-section-note">New videos from verified tech YouTube channels, highest views first. Playback stays inside ByteBrief.</p>
      <div class="bento">
        ${videos.map(video => {
          const views = Number(video.views);
          const videoCategory = video.categories?.[0] || video.category || 'tech';
          const dataAttrs = [
            `data-video-id="${escapeHtml(video.videoId || '')}"`,
            `data-video-title="${escapeHtml(video.title || 'Video')}"`,
            `data-video-source="${escapeHtml(video.source || 'YouTube')}"`,
            `data-video-category="${escapeHtml(videoCategory)}"`,
            `data-video-date="${escapeHtml(video.publishedAt || '')}"`,
            `data-video-views="${Number.isFinite(views) && views > 0 ? views : ''}"`,
            `data-video-link="${escapeHtml(safeUrl(video.link) || '')}"`
          ].join(' ');
          return `
          <article class="card span-4">
            <div class="story-media" style="aspect-ratio: 16/9;">
              <img class="js-img" src="${safeUrl(video.thumbnail)}" alt="" loading="lazy" decoding="async">
              <span class="play-badge" style="top: 8px; right: 8px;"></span>
              <span class="story-source" style="margin-top: 8px;">${escapeHtml(video.source)}</span>
            </div>
            <div class="story-content">
              <div class="story-kicker">
                <span class="eyebrow">YouTube</span>
                <span class="dot"></span>
                <time datetime="${escapeHtml(video.publishedAt || '')}">${video.publishedAt ? formatRelative(video.publishedAt) : '—'}</time>
                ${Number.isFinite(views) && views > 0 ? `<span class="dot"></span><span class="story-views">${formatNumber(views)} views</span>` : ''}
              </div>
              <h3 class="story-title">${escapeHtml(video.title || 'Video')}</h3>
              <div class="story-actions">
                <button type="button" class="story-read" ${dataAttrs}>
                  ${ICONS.arrow} Play in app
                </button>
              </div>
            </div>
          </article>
        `;
        }).join('')}
      </div>
    `;
  }

  els.panel.setAttribute('aria-busy', 'false');
  els.panel.innerHTML = html;

  if (count === 0) {
    els.panel.innerHTML = `
      <div class="empty-state">
        ${ICONS.search}
        <h3>No matches in ${escapeHtml(
          SECTIONS.find(section => section.key === state.section)?.label || 'this section'
        )}</h3>
        <p>Try a different word, or clear the search to see everything.</p>
        <button type="button" class="btn btn-outline" id="clearHubSearch">Clear search</button>
      </div>
    `;
  }
}

function renderDataError() {
  els.updated.textContent = 'Data unavailable';
  els.pulse.innerHTML = '';
  els.tabs.innerHTML = '';
  els.panel.setAttribute('aria-busy', 'false');
  els.panel.innerHTML = `
    <div class="empty-state">
      <h3>Could not load ByteHub</h3>
      <p>The data file may be temporarily unavailable. Retry once your connection is back.</p>
      <button type="button" class="btn btn-primary" id="retryHubData">Retry</button>
    </div>
  `;
}

