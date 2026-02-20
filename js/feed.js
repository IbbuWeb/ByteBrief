import { auth, db, isSessionExpired, clearSession } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { fetchFeedsByCategory, fetchOgImage } from './rss.js';

let currentUser = null;
let currentCategory = 'all';
let allArticles = [];
let displayedCount = 0;
let savedLinks = new Set();
let isLoadingMore = false;
let allLoaded = false;

const BATCH_SIZE = 9;

const feedGrid = document.getElementById('feedGrid');
const filters = document.getElementById('filters');
const logoutBtn = document.getElementById('logoutBtn');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');

let searchQuery = '';

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener('click', toggleTheme);
}

onAuthStateChanged(auth, async (user) => {
  initTheme();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (isSessionExpired()) {
    clearSession();
    await signOut(auth);
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  setupEventListeners();
  setupInfiniteScroll();
  setupPullToRefresh();

  try {
    await loadSavedArticles();
  } catch (e) {
    console.error('Error loading saved articles:', e);
  }

  await loadFeed();
});

async function loadFeed() {
  if (!feedGrid) return;

  displayedCount = 0;
  allLoaded = false;

  feedGrid.innerHTML = createSkeletonCards(6);

  try {
    allArticles = await fetchFeedsByCategory(currentCategory);
    filteredArticles = [...allArticles];

    if (allArticles.length === 0) {
      feedGrid.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <h2>No articles found</h2>
          <p>Try selecting a different category or check back later</p>
        </div>
      `;
      return;
    }

    feedGrid.innerHTML = '';
    showNextBatch();
    loadMissingThumbnails(allArticles);
  } catch (error) {
    console.error('Error loading feed:', error);
    feedGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2>Failed to load feed</h2>
        <p>Please check your connection and try again</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

let filteredArticles = [];

function filterArticles() {
  if (!feedGrid) return;
  
  const endMarker = feedGrid.querySelector('.load-more-container, .feed-end');
  if (endMarker) endMarker.remove();
  
  if (!searchQuery) {
    filteredArticles = [...allArticles];
  } else {
    filteredArticles = allArticles.filter(article => {
      const title = article.title?.toLowerCase() || '';
      const description = article.description?.toLowerCase() || '';
      const source = article.source?.toLowerCase() || '';
      const category = article.categories?.[0]?.toLowerCase() || '';
      
      return title.includes(searchQuery) || 
             description.includes(searchQuery) || 
             source.includes(searchQuery) ||
             category.includes(searchQuery);
    });
  }
  
  displayedCount = 0;
  allLoaded = false;
  
  feedGrid.innerHTML = '';
  
  if (filteredArticles.length === 0) {
    feedGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h2>No articles found</h2>
        <p>Try a different search term</p>
      </div>
    `;
    return;
  }
  
  showNextBatch(true);
}

function showNextBatch(isFilter = false) {
  if (!feedGrid || allLoaded) return;

  const endMarker = feedGrid.querySelector('.load-more-container, .feed-end');
  if (endMarker) endMarker.remove();

  const articlesToShow = searchQuery ? filteredArticles : allArticles;
  const nextBatch = articlesToShow.slice(displayedCount, displayedCount + BATCH_SIZE);

  nextBatch.forEach((article, i) => {
    const card = createArticleCardElement(article);
    card.style.animationDelay = `${i * 0.05}s`;
    feedGrid.appendChild(card);
  });

  displayedCount += nextBatch.length;

  if (displayedCount >= articlesToShow.length) {
    allLoaded = true;
    const endEl = document.createElement('div');
    endEl.className = 'feed-end';
    endEl.textContent = searchQuery ? "No more results" : "You're all caught up";
    feedGrid.appendChild(endEl);
  }
}

function loadMoreArticles() {
  if (isLoadingMore || allLoaded) return;
  isLoadingMore = true;

  const loader = document.createElement('div');
  loader.className = 'load-more-container';
  loader.innerHTML = `
    <div class="load-more-spinner">
      <div class="spinner"></div>
      <span>Loading more...</span>
    </div>
  `;
  feedGrid.appendChild(loader);

  setTimeout(() => {
    loader.remove();
    showNextBatch();
    isLoadingMore = false;
  }, 400);
}

function setupInfiniteScroll() {
  window.addEventListener('scroll', () => {
    if (allLoaded || isLoadingMore || allArticles.length === 0) return;

    const scrollPos = window.innerHeight + window.scrollY;
    const threshold = document.body.offsetHeight - 600;

    if (scrollPos >= threshold) {
      loadMoreArticles();
    }
  });
}

function setupPullToRefresh() {
  let startY = 0;
  let currentY = 0;
  let isPulling = false;
  let pullStartTime = 0;
  const PULL_THRESHOLD = 80;
  const MIN_PULL_TIME = 500;

  const navbar = document.getElementById('navbar');
  
  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0 && !isPulling) {
      startY = e.touches[0].clientY;
      pullStartTime = Date.now();
      isPulling = true;
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    
    currentY = e.touches[0].clientY;
    const diff = startY - currentY;
    
    if (diff > 0) {
      const pullProgress = Math.min(diff / PULL_THRESHOLD, 1);
      if (navbar) {
        navbar.style.transform = `translateY(${-diff}px)`;
        navbar.style.transition = 'none';
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', async () => {
    if (!isPulling) return;
    
    const pullDuration = Date.now() - pullStartTime;
    const diff = startY - currentY;
    
    if (navbar) {
      navbar.style.transform = '';
      navbar.style.transition = '';
    }
    
    if (diff >= PULL_THRESHOLD && pullDuration >= MIN_PULL_TIME) {
      await loadFeed();
    }
    
    isPulling = false;
    startY = 0;
    currentY = 0;
  }, { passive: true });
}

async function loadSavedArticles() {
  const savedRef = collection(db, 'savedArticles');
  const q = query(savedRef, where('userId', '==', currentUser.uid));
  const snapshot = await getDocs(q);

  savedLinks.clear();
  snapshot.forEach(docSnap => {
    savedLinks.add(docSnap.data().link);
  });
}

async function loadMissingThumbnails(articles) {
  const missing = articles.filter(a => !a.thumbnail && a.link && a.link !== '#').slice(0, 10);
  const promises = missing.map(async (article) => {
    const ogImage = await fetchOgImage(article.link);
    if (ogImage) {
      article.thumbnail = ogImage;
      const cards = feedGrid.querySelectorAll('.article-card');
      for (const card of cards) {
        const readMoreLink = card.querySelector('.read-more');
        if (readMoreLink && readMoreLink.getAttribute('href') === article.link) {
          const imageContainer = card.querySelector('.card-image');
          if (imageContainer) {
            const placeholder = imageContainer.querySelector('.placeholder');
            if (placeholder) {
              const img = document.createElement('img');
              img.src = ogImage;
              img.alt = article.title;
              img.loading = 'lazy';
              img.decoding = 'async';
              img.onload = () => img.classList.add('loaded');
              img.onerror = () => { img.remove(); imageContainer.prepend(placeholder); };
              placeholder.replaceWith(img);
            }
          }
          break;
        }
      }
    }
  });
  await Promise.allSettled(promises);
}

function createArticleCardElement(article) {
  const isSaved = savedLinks.has(article.link);
  const formattedDate = formatDate(article.pubDate);

  const card = document.createElement('article');
  card.className = 'article-card';

  const thumbnailHtml = article.thumbnail
    ? `<img src="${escapeHtml(article.thumbnail)}" alt="${escapeHtml(article.title)}" loading="lazy" decoding="async" onload="this.classList.add('loaded')" onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'><svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'M21 15l-5-5L5 21\\'/></svg></div>'">`
    : `<div class="placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`;

  const category = article.categories[0];
  const categoryLabel = category && category !== 'tech' ? category.toUpperCase() : '';

  card.innerHTML = `
    <div class="card-image">
      ${thumbnailHtml}
      <span class="card-source">${escapeHtml(article.source)}</span>
      ${categoryLabel ? `<span class="card-category">${categoryLabel}</span>` : ''}
    </div>
    <div class="card-content">
      <h3 class="card-title"><a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}</a></h3>
      ${article.author ? `<p class="card-author">By ${escapeHtml(article.author)}</p>` : ''}
      <p class="card-excerpt">${escapeHtml(article.description)}</p>
      <div class="card-meta">
        <span class="card-date">${formattedDate}</span>
        <div class="card-actions">
          <button class="action-btn share-btn"
                  data-link="${escapeHtml(article.link)}"
                  data-title="${escapeHtml(article.title)}"
                  data-image="${escapeHtml(article.thumbnail || '')}"
                  data-source="${escapeHtml(article.source)}"
                  title="Share article"
                  aria-label="Share article">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <button class="action-btn save-btn ${isSaved ? 'saved' : ''}"
                  data-link="${escapeHtml(article.link)}"
                  data-title="${escapeHtml(article.title)}"
                  data-image="${escapeHtml(article.thumbnail || '')}"
                  data-source="${escapeHtml(article.source)}"
                  data-category="${escapeHtml(article.categories?.[0] || 'tech')}"
                  title="${isSaved ? 'Remove from saved' : 'Save article'}"
                  aria-label="${isSaved ? 'Remove from saved' : 'Save article'}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="action-btn read-more" title="Read more" aria-label="Read full article">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  `;

  return card;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function createSkeletonCards(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="article-card skeleton">
        <div class="card-image">
          <div class="skeleton-image"></div>
        </div>
        <div class="card-content">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-title short"></div>
          <div class="skeleton-line skeleton-excerpt"></div>
          <div class="skeleton-line skeleton-excerpt"></div>
          <div class="skeleton-line skeleton-excerpt short"></div>
          <div class="card-meta">
            <div class="skeleton-line skeleton-date"></div>
            <div class="skeleton-actions">
              <div class="skeleton-btn"></div>
              <div class="skeleton-btn"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  return html;
}

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

let listenersSetup = false;
function setupEventListeners() {
  if (listenersSetup) return;
  listenersSetup = true;

  if (filters) {
    filters.addEventListener('click', async (e) => {
      if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-pressed', 'true');
        currentCategory = e.target.dataset.category;
        await loadFeed();
      }
    });
  }

  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchQuery = e.target.value.trim().toLowerCase();
      
      if (searchQuery) {
        clearSearchBtn.classList.add('visible');
      } else {
        clearSearchBtn.classList.remove('visible');
      }
      
      searchTimeout = setTimeout(() => {
        filterArticles();
      }, 300);
    });
    
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.remove('visible');
      filterArticles();
    });
  }

  if (feedGrid) {
    feedGrid.addEventListener('click', async (e) => {
      const saveBtn = e.target.closest('.save-btn');
      if (saveBtn) {
        await toggleSaveArticle(saveBtn);
        return;
      }
      
      const shareBtn = e.target.closest('.share-btn');
      if (shareBtn) {
        await shareArticle(shareBtn);
        return;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', handleLogout);
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileNav.classList.toggle('active');
    });
  }
}

async function toggleSaveArticle(btn) {
  const link = btn.dataset.link;
  const title = btn.dataset.title;
  const image = btn.dataset.image;
  const source = btn.dataset.source;
  const category = btn.dataset.category;

  try {
    if (savedLinks.has(link)) {
      const savedRef = collection(db, 'savedArticles');
      const q = query(savedRef, where('link', '==', link), where('userId', '==', currentUser.uid));
      const snapshot = await getDocs(q);

      for (const docSnap of snapshot.docs) {
        await deleteDoc(docSnap.ref);
      }

      savedLinks.delete(link);
      btn.classList.remove('saved');
      btn.querySelector('svg').setAttribute('fill', 'none');
      showToast('Article removed from saved');
    } else {
      await addDoc(collection(db, 'savedArticles'), {
        userId: currentUser.uid,
        title,
        link,
        image,
        source,
        category,
        savedAt: new Date().toISOString()
      });

      savedLinks.add(link);
      btn.classList.add('saved');
      btn.querySelector('svg').setAttribute('fill', 'currentColor');
      showToast('Article saved!');
    }
  } catch (error) {
    console.error('Error toggling save:', error);
    showToast('Failed to save article', 'error');
  }
}

async function shareArticle(btn) {
  const link = btn.dataset.link;
  const title = btn.dataset.title;
  const source = btn.dataset.source;
  const shareText = `Check out this article on ByteBrief: ${title}`;
  const shareUrl = window.location.origin + '/?ref=shared&utm_source=shared&utm_medium=share&utm_campaign=bytebrief';

  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: shareText,
        url: link
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        copyToClipboard(link);
      }
    }
  } else {
    copyToClipboard(link);
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Link copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy link', 'error');
  });
}

async function handleLogout() {
  try {
    clearSession();
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Failed to logout', 'error');
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.querySelector('.toast-message').textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
