import { auth, signOut, onAuthStateChanged } from './firebase-config.js';

const TAB_DATA = {
  events: {
    events: [
      { title: 'Apple WWDC 2025', date: 'June 9-13, 2025', description: 'Apple Worldwide Developers Conference', link: 'https://developer.apple.com/wwdc/', category: 'conference', icon: 'apple' },
      { title: 'Google I/O 2025', date: 'May 14-15, 2025', description: 'Google Annual Developer Conference', link: 'https://io.google/', category: 'conference', icon: 'google' },
      { title: 'Microsoft Build 2025', date: 'May 19-22, 2025', description: 'Microsoft Developer Conference', link: 'https://build.microsoft.com/', category: 'conference', icon: 'microsoft' },
      { title: 'NVIDIA GTC 2025', date: 'March 17-21, 2025', description: 'GPU Technology Conference', link: 'https://www.nvidia.com/gtc/', category: 'conference', icon: 'nvidia' },
      { title: 'React Conf 2025', date: 'May 2025', description: 'React Conference', link: 'https://reactconf.com/', category: 'conference', icon: 'react' },
      { title: 'Black Hat 2025', date: 'August 2-7, 2025', description: 'Security Conference', link: 'https://www.blackhat.com/', category: 'conference', icon: 'security' },
      { title: 'Tesla AI Day', date: 'TBA 2025', description: 'Tesla AI & Robotics Event', link: 'https://tesla.com/ai', category: 'event', icon: 'tesla' },
      { title: 'Meta Connect 2025', date: 'September 2025', description: 'Meta AR/VR Conference', link: 'https://connect.facebook.com/', category: 'conference', icon: 'meta' },
      { title: 'AWS re:Invent 2025', date: 'December 1-5, 2025', description: 'Amazon Web Services Conference', link: 'https://reinvent.awsevents.com/', category: 'conference', icon: 'aws' },
      { title: 'GitHub Universe 2025', date: 'October 2025', description: 'GitHub Developer Conference', link: 'https://githubuniverse.com/', category: 'conference', icon: 'github' },
    ],
    filters: ['all', 'conference', 'event', 'hackathon', 'launch', 'startups']
  },

  github: {
    repos: [
      { name: 'oven-sh/bun', description: 'Incredibly fast JavaScript runtime', stars: 98000, language: 'Zig', url: 'https://github.com/oven-sh/bun', trending: 'hot' },
      { name: 'github/docs', description: 'Documentation website for GitHub', stars: 16000, language: 'CSS', url: 'https://github.com/github/docs', trending: '' },
      { name: 'oven-sh/winter', description: 'Universal rendering framework', stars: 45000, language: 'TypeScript', url: 'https://github.com/oven-sh/winter', trending: 'hot' },
      { name: 'vercel/ai', description: 'Build AI-powered applications with Svelte, Vue, React, Solid', stars: 25000, language: 'TypeScript', url: 'https://github.com/vercel/ai', trending: '' },
      { name: 'anthropics/claude-code', description: 'Claude Code CLI and SDK', stars: 22000, language: 'TypeScript', url: 'https://github.com/anthropics/claude-code', trending: 'hot' },
      { name: 'openrouter/openrouter', description: 'Unified API for LLMs', stars: 8500, language: 'TypeScript', url: 'https://github.com/openrouter/openrouter', trending: '' },
      { name: 'shadcn-ui/ui', description: 'Beautifully designed components', stars: 75000, language: 'TypeScript', url: 'https://github.com/shadcn-ui/ui', trending: 'hot' },
      { name: 'mickael-kerjean/links', description: 'Your self-hosted shareboard', stars: 3200, language: 'TypeScript', url: 'https://github.com/mickael-kerjean/links', trending: '' },
      { name: 'gpt-4o/canvas', description: 'AI-powered code editor', stars: 15000, language: 'TypeScript', url: 'https://github.com/gpt-4o/canvas', trending: '' },
      { name: 'vlang/v', description: 'Simple, fast, safe compiled language', stars: 30000, language: 'V', url: 'https://github.com/vlang/v', trending: '' },
      { name: 'n8n-io/n8n', description: 'Free and open workflow automation', stars: 38000, language: 'TypeScript', url: 'https://github.com/n8n-io/n8n', trending: '' },
      { name: 'supabase/supabase', description: 'Open source Firebase alternative', stars: 115000, language: 'TypeScript', url: 'https://github.com/supabase/supabase', trending: '' },
      { name: 'denoland/deno', description: 'Modern JavaScript runtime', stars: 95000, language: 'Rust', url: 'https://github.com/denoland/deno', trending: '' },
      { name: 'flutter/flutter', description: 'Cross-platform UI toolkit', stars: 165000, language: 'Dart', url: 'https://github.com/flutter/flutter', trending: '' },
      { name: 'rust-lang/rust', description: 'Empowering everyone to build reliable software', stars: 95000, language: 'Rust', url: 'https://github.com/rust-lang/rust', trending: '' },
    ],
    filters: ['all', 'hot', 'new', 'top']
  },

  podcasts: {
    podcasts: [
      { name: 'Acquired', host: 'Ben & David', description: 'Tech company deep dives', image: 'acquired', link: 'https://www.acquired.fm/', category: 'business' },
      { name: 'Lex Fridman', host: 'Lex Fridman', description: 'AI, consciousness, future', image: 'lex', link: 'https://lexfridman.com/podcast/', category: 'ai' },
      { name: 'The Vergecast', host: 'The Verge Team', description: 'Weekly tech news', image: 'vergecast', link: 'https://www.theverge.com/', category: 'news' },
      { name: 'Accidental Tech Podcast', host: 'Marco & Casey', description: 'Apple, tech, programming', image: 'atp', link: 'https://atp.fm/', category: 'apple' },
      { name: 'Hard Fork', host: 'Casey & Kevin', description: 'Tech news and culture', image: 'hardfork', link: 'https://podcasts.apple.com/us/podcast/hard-fork/id1521431123', category: 'news' },
      { name: 'Syntax', host: 'Wes & Scott', description: 'Web development tips', image: 'syntax', link: 'https://syntax.fm/', category: 'programming' },
      { name: 'Changelog', host: 'Changelog Media', description: 'Open source & software', image: 'changelog', link: 'https://changelog.com/', category: 'programming' },
      { name: 'Planet Money', host: 'NPR', description: 'Economics & business', image: 'planetmoney', link: 'https://www.npr.org/planetmoney/', category: 'business' },
      { name: 'Waveform', host: 'MKBHD & Andrew', description: 'Tech reviews & deep dives', image: 'waveform', link: 'https://www.youtube.com/playlist?list=PLH9cR-NVtXBcxLmlS2J8a2VWGwR5H0tS', category: 'tech' },
      { name: 'Darknet Diaries', host: 'Jack Rhysider', description: 'True hacker stories', image: 'darknet', link: 'https://darknetdiaries.com/', category: 'security' },
      { name: 'Decoder', host: 'Nilay Patel', description: 'Big tech & business', image: 'decoder', link: 'https://www.theverge.com/decoder-podcast', category: 'business' },
    ],
    filters: ['all', 'news', 'programming', 'ai', 'business', 'security', 'apple']
  },

  twitch: {
    streams: [
      { name: 'Linus Tech Tips', game: 'Technology', viewers: 15000, live: true, avatar: 'linus', url: 'https://twitch.tv/linustechtips' },
      { name: 'mkbhd', game: 'Tech', viewers: 8500, live: true, avatar: 'mkbhd', url: 'https://twitch.tv/mkbhd' },
      { name: 'Fireship', game: 'Programming', viewers: 5200, live: true, avatar: 'fireship', url: 'https://twitch.tv/fireship_dev' },
      { name: 'ThePrimeagen', game: 'Programming', viewers: 4800, live: true, avatar: 'prime', url: 'https://twitch.tv/theprimeagen' },
      { name: 'Traversy Media', game: 'Web Development', viewers: 3200, live: true, avatar: 'traversy', url: 'https://twitch.tv/traversymedia' },
      { name: 'TechGuy', game: 'Technology', viewers: 2800, live: true, avatar: 'techguy', url: 'https://twitch.tv/techguy' },
      { name: 'DevEd', game: 'Programming', viewers: 2100, live: true, avatar: 'deved', url: 'https://twitch.tv/deved' },
      { name: 'CodingGarden', game: 'Coding', viewers: 1800, live: true, avatar: 'codinggarden', url: 'https://twitch.tv/codinggarden' },
    ],
    filters: ['all', 'programming', 'tech', 'gaming', 'security']
  },

  deals: {
    deals: [
      { title: 'MacBook Pro M4', store: 'Apple', price: 1299, originalPrice: 1499, discount: '13%', link: '#', category: 'laptop', expires: 'Feb 28' },
      { title: 'RTX 5080', store: 'NVIDIA', price: 999, originalPrice: 1199, discount: '17%', link: '#', category: 'gpu', expires: 'Mar 1' },
      { title: 'Samsung 990 Pro 2TB', store: 'Amazon', price: 149, originalPrice: 199, discount: '25%', link: '#', category: 'storage', expires: 'Feb 25' },
      { title: 'Sony WH-1000XM5', store: 'Amazon', price: 279, originalPrice: 399, discount: '30%', link: '#', category: 'audio', expires: 'Feb 23' },
      { title: 'LG UltraGear 27" 4K', store: 'Best Buy', price: 399, originalPrice: 549, discount: '27%', link: '#', category: 'monitor', expires: 'Feb 28' },
      { title: 'Keychron Q1 Pro', store: 'Amazon', price: 159, originalPrice: 199, discount: '20%', link: '#', category: 'keyboard', expires: 'Mar 5' },
      { title: 'iPad Pro M4 11"', store: 'Apple', price: 799, originalPrice: 899, discount: '11%', link: '#', category: 'tablet', expires: 'Feb 28' },
      { title: 'Razer Blade 16', store: 'Razer', price: 1999, originalPrice: 2499, discount: '20%', link: '#', category: 'laptop', expires: 'Mar 10' },
      { title: 'Steam Deck OLED', store: 'Valve', price: 499, originalPrice: 549, discount: '9%', link: '#', category: 'gaming', expires: 'Mar 15' },
      { title: 'Dell XPS 15', store: 'Dell', price: 1299, originalPrice: 1699, discount: '24%', link: '#', category: 'laptop', expires: 'Feb 28' },
      { title: 'Corsair K100 RGB', store: 'Corsair', price: 169, originalPrice: 229, discount: '26%', link: '#', category: 'keyboard', expires: 'Mar 1' },
      { title: 'Sony A7 IV', store: 'B&H Photo', price: 2098, originalPrice: 2498, discount: '16%', link: '#', category: 'camera', expires: 'Mar 5' },
    ],
    filters: ['all', 'laptop', 'gpu', 'monitor', 'keyboard', 'audio', 'storage', 'gaming', 'tablet', 'camera']
  }
};

const CATEGORY_LABELS = {
  events: { all: 'All', conference: 'Conferences', event: 'Events', hackathon: 'Hackathons', launch: 'Launches', startups: 'Startups' },
  github: { all: 'All', hot: 'Hot', new: 'New', top: 'Top' },
  podcasts: { all: 'All', news: 'News', programming: 'Programming', ai: 'AI', business: 'Business', security: 'Security', apple: 'Apple' },
  twitch: { all: 'All', programming: 'Programming', tech: 'Tech', gaming: 'Gaming', security: 'Security' },
  deals: { all: 'All', laptop: 'Laptops', gpu: 'GPUs', monitor: 'Monitors', keyboard: 'Keyboards', audio: 'Audio', storage: 'Storage', gaming: 'Gaming', tablet: 'Tablets', camera: 'Cameras' }
};

let currentUser = null;
let currentTab = 'events';
let currentCategory = 'all';
let currentSearch = '';
let allData = [];
let filteredData = [];
let isLoading = false;
let currentPage = 0;
const ITEMS_PER_PAGE = 12;

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const toastMessage = toast.querySelector('.toast-message');
  if (toastMessage) toastMessage.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function renderEventCard(event) {
  const article = document.createElement('article');
  article.className = 'event-card';
  
  article.innerHTML = `
    <div class="event-date">
      <span class="event-date-text">${escapeHtml(event.date)}</span>
    </div>
    <div class="event-info">
      <span class="event-category">${escapeHtml(event.category)}</span>
      <h3 class="event-title">${escapeHtml(event.title)}</h3>
      <p class="event-description">${escapeHtml(event.description)}</p>
      <a href="${escapeHtml(event.link)}" target="_blank" rel="noopener" class="event-link">Learn More →</a>
    </div>
  `;
  
  return article;
}

function renderRepoCard(repo) {
  const article = document.createElement('article');
  article.className = 'repo-card';
  
  const langColors = {
    'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'Rust': '#dea584', 'Go': '#00ADD8', 'Java': '#b07219', 'CSS': '#563d7c', 'HTML': '#e34c26', 'Dart': '#00B4AB', 'V': '#4d1e79', 'Zig': '#ec915c', 'Ruby': '#701516', 'C++': '#f34b7d', 'C': '#555555'
  };
  
  article.innerHTML = `
    <div class="repo-header">
      <svg class="repo-icon" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
      <a href="${escapeHtml(repo.url)}" target="_blank" rel="noopener" class="repo-name">${escapeHtml(repo.name)}</a>
      ${repo.trending ? '<span class="repo-hot">🔥 Hot</span>' : ''}
    </div>
    <p class="repo-description">${escapeHtml(repo.description || '')}</p>
    <div class="repo-meta">
      <span class="repo-language">
        <span class="language-dot" style="background: ${langColors[repo.language] || '#8b8b8b'}"></span>
        ${escapeHtml(repo.language || 'Unknown')}
      </span>
      <span class="repo-stars">⭐ ${(repo.stars || 0).toLocaleString()}</span>
    </div>
  `;
  
  return article;
}

function renderPodcastCard(podcast) {
  const article = document.createElement('article');
  article.className = 'podcast-card';
  
  const colors = {
    acquired: '#FF6B35', lex: '#8B5CF6', vergecast: '#FF4444', atp: '#FF9500', 
    hardfork: '#00D4FF', syntax: '#4A90D9', changelog: '#10B981', planetmoney: '#F59E0B',
    waveform: '#6366F1', darknet: '#EF4444', decoder: '#3B82F6'
  };
  
  article.innerHTML = `
    <div class="podcast-avatar" style="background: ${colors[podcast.image] || '#6366F1'}">
      <span>${podcast.name.charAt(0)}</span>
    </div>
    <div class="podcast-info">
      <h3 class="podcast-name">${escapeHtml(podcast.name)}</h3>
      <p class="podcast-host">${escapeHtml(podcast.host)}</p>
      <p class="podcast-description">${escapeHtml(podcast.description)}</p>
      <span class="podcast-category">${escapeHtml(podcast.category)}</span>
    </div>
    <a href="${escapeHtml(podcast.link)}" target="_blank" rel="noopener" class="podcast-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
    </a>
  `;
  
  return article;
}

function renderStreamCard(stream) {
  const article = document.createElement('article');
  article.className = 'stream-card';
  
  article.innerHTML = `
    <div class="stream-avatar">
      <span>${stream.name.charAt(0)}</span>
      <span class="live-indicator">🔴 LIVE</span>
    </div>
    <div class="stream-info">
      <h3 class="stream-name">${escapeHtml(stream.name)}</h3>
      <p class="stream-game">${escapeHtml(stream.game)}</p>
      <p class="stream-viewers">👁 ${stream.viewers.toLocaleString()} viewers</p>
    </div>
    <a href="${escapeHtml(stream.url)}" target="_blank" rel="noopener" class="stream-watch-btn">Watch</a>
  `;
  
  return article;
}

function renderDealCard(deal) {
  const article = document.createElement('article');
  article.className = 'deal-card';
  
  article.innerHTML = `
    <div class="deal-badge">-${escapeHtml(deal.discount)}</div>
    <div class="deal-info">
      <h3 class="deal-title">${escapeHtml(deal.title)}</h3>
      <p class="deal-store">${escapeHtml(deal.store)}</p>
      <div class="deal-price">
        <span class="deal-current">$${deal.price}</span>
        <span class="deal-original">$${deal.originalPrice}</span>
      </div>
      <p class="deal-expires">Expires: ${escapeHtml(deal.expires)}</p>
    </div>
    <a href="${escapeHtml(deal.link)}" target="_blank" rel="noopener" class="deal-btn">View Deal</a>
  `;
  
  return article;
}

function getRenderer(tab) {
  const renderers = {
    events: renderEventCard,
    github: renderRepoCard,
    podcasts: renderPodcastCard,
    twitch: renderStreamCard,
    deals: renderDealCard
  };
  return renderers[tab] || renderEventCard;
}

function getDataKey(tab) {
  const keys = {
    events: 'events',
    github: 'repos',
    podcasts: 'podcasts',
    twitch: 'streams',
    deals: 'deals'
  };
  return keys[tab] || 'events';
}

function applyFilters() {
  let filtered = allData;
  const searchLower = currentSearch.toLowerCase();

  if (currentSearch) {
    if (currentTab === 'events') {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchLower) || 
        item.description?.toLowerCase().includes(searchLower)
      );
    } else if (currentTab === 'github') {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchLower) || 
        item.description?.toLowerCase().includes(searchLower) ||
        item.language?.toLowerCase().includes(searchLower)
      );
    } else if (currentTab === 'podcasts') {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchLower) || 
        item.host?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower)
      );
    } else if (currentTab === 'twitch') {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchLower) || 
        item.game?.toLowerCase().includes(searchLower)
      );
    } else if (currentTab === 'deals') {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchLower) || 
        item.store?.toLowerCase().includes(searchLower)
      );
    }
  }

  if (currentCategory !== 'all') {
    if (currentTab === 'github' && currentCategory === 'hot') {
      filtered = filtered.filter(item => item.trending === 'hot');
    } else if (currentTab === 'podcasts') {
      filtered = filtered.filter(item => item.category === currentCategory);
    } else if (currentTab === 'twitch') {
      filtered = filtered.filter(item => item.game?.toLowerCase().includes(currentCategory));
    } else if (currentTab === 'deals') {
      filtered = filtered.filter(item => item.category === currentCategory);
    } else if (currentTab === 'events') {
      filtered = filtered.filter(item => item.category === currentCategory);
    }
  }

  filteredData = filtered;
  currentPage = 0;
  renderPage(true);
  setupInfiniteScroll();
}

function renderPage(reset = false) {
  const contentArea = document.getElementById('contentArea');
  if (!contentArea) return;

  if (reset) {
    contentArea.innerHTML = '';
    currentPage = 0;
  }

  const startIdx = currentPage * ITEMS_PER_PAGE;
  const endIdx = startIdx + ITEMS_PER_PAGE;
  const pageData = filteredData.slice(startIdx, endIdx);
  const hasMore = endIdx < filteredData.length;
  const renderer = getRenderer(currentTab);

  if (pageData.length === 0 && reset) {
    contentArea.innerHTML = `<div class="empty-state"><h2>No results</h2><p>Try adjusting your filters</p></div>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = currentTab === 'events' || currentTab === 'podcasts' || currentTab === 'twitch' || currentTab === 'deals' ? 
    `${currentTab}-grid` : 'video-grid';
  
  pageData.forEach(item => {
    grid.appendChild(renderer(item));
  });

  contentArea.appendChild(grid);

  if (hasMore) {
    const loader = document.createElement('div');
    loader.className = 'loading-more';
    loader.innerHTML = '<div class="spinner"></div>';
    contentArea.appendChild(loader);
  }
}

function loadMore() {
  if (isLoading) return;
  const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < filteredData.length;
  if (!hasMore) return;
  
  isLoading = true;
  currentPage++;
  renderPage(false);
  isLoading = false;
}

function setupInfiniteScroll() {
  if (window.scrollHandler) {
    window.removeEventListener('scroll', window.scrollHandler);
  }

  const handleScroll = () => {
    const hasMore = (currentPage + 1) * ITEMS_PER_PAGE < filteredData.length;
    if (isLoading || !hasMore) return;
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 500) {
      loadMore();
    }
  };

  window.scrollHandler = handleScroll;
  window.addEventListener('scroll', handleScroll, { passive: true });
}

function initFilters() {
  const filtersContainer = document.getElementById('filters');
  if (!filtersContainer) return;

  const filters = TAB_DATA[currentTab]?.filters || ['all'];
  const labels = CATEGORY_LABELS[currentTab] || {};

  filtersContainer.innerHTML = filters.map(f => `
    <button class="filter-btn ${f === 'all' ? 'active' : ''}" data-category="${f}" aria-pressed="${f === 'all'}">
      ${labels[f] || f.charAt(0).toUpperCase() + f.slice(1)}
    </button>
  `).join('');

  const filterBtns = filtersContainer.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      applyFilters();
    });
  });
}

function switchTab(tabName) {
  currentTab = tabName;
  currentCategory = 'all';
  currentSearch = '';
  currentPage = 0;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
    btn.setAttribute('aria-selected', btn.dataset.tab === tabName);
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  const clearSearch = document.getElementById('clearSearch');
  if (clearSearch) clearSearch.style.display = 'none';

  const searchContainer = document.getElementById('tabSearchContainer');
  if (searchContainer) {
    const placeholder = tabName === 'events' ? 'Search events...' :
                       tabName === 'github' ? 'Search repos...' :
                       tabName === 'podcasts' ? 'Search podcasts...' :
                       tabName === 'twitch' ? 'Search streams...' : 'Search deals...';
    searchInput.placeholder = placeholder;
  }

  initFilters();

  const dataKey = getDataKey(currentTab);
  const tabData = TAB_DATA[currentTab]?.[dataKey] || [];
  allData = shuffleArray(tabData);
  filteredData = allData;

  renderPage(true);
  setupInfiniteScroll();
}

async function initVideos() {
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const contentArea = document.getElementById('contentArea');

  if (contentArea) {
    contentArea.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  await new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = 'login.html';
      } else {
        currentUser = user;
        resolve();
      }
    });
  });

  const dataKey = getDataKey(currentTab);
  const tabData = TAB_DATA[currentTab]?.[dataKey] || [];
  allData = shuffleArray(tabData);
  filteredData = allData;

  renderPage(true);
  setupInfiniteScroll();
  initFilters();

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      if (clearSearch) clearSearch.style.display = currentSearch ? 'block' : 'none';
      applyFilters();
    });
  }

  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      currentSearch = '';
      clearSearch.style.display = 'none';
      applyFilters();
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);

  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileNav.classList.toggle('active');
    });
  }

  const themeToggle = document.getElementById('themeToggle');
  const mobileThemeToggle = document.getElementById('mobileThemeToggle');

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  }

  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  if (mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);
}

async function handleLogout() {
  try {
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Failed to logout');
  }
}

document.addEventListener('DOMContentLoaded', initVideos);
