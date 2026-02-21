import { auth, signOut, onAuthStateChanged } from './firebase-config.js';

let REMOTE_DATA = null;

async function fetchRemoteData() {
  try {
    const response = await fetch('js/data.json');
    if (response.ok) {
      const data = await response.json();
      console.log('Loaded remote data:', data.lastUpdated);
      return data;
    }
  } catch (e) {
    console.log('Using fallback data');
  }
  return null;
}

const TAB_DATA = {
  events: {
    events: [
      { title: 'NVIDIA GTC 2026', date: 'March 16-19, 2026', description: 'Premier AI conference in San Jose, CA', link: 'https://www.nvidia.com/gtc/', category: 'conference', icon: 'nvidia' },
      { title: 'DeveloperWeek 2026', date: 'February 18-20, 2026', description: 'Largest developer conference & expo', link: 'https://www.developerweek.com/', category: 'conference', icon: 'developer' },
      { title: 'Google I/O 2026', date: 'May 20-21, 2026', description: 'Google Annual Developer Conference', link: 'https://io.google/', category: 'conference', icon: 'google' },
      { title: 'Apple WWDC 2026', date: 'June 2026', description: 'Apple Worldwide Developers Conference', link: 'https://developer.apple.com/wwdc/', category: 'conference', icon: 'apple' },
      { title: 'Microsoft Build 2026', date: 'May 2026', description: 'Microsoft Developer Conference', link: 'https://build.microsoft.com/', category: 'conference', icon: 'microsoft' },
      { title: 'NDC London 2026', date: 'January 26-30, 2026', description: 'Premier software development conference', link: 'https://ndc-london.com/', category: 'conference', icon: 'ndc' },
      { title: 'Black Hat 2026', date: 'August 2026', description: 'Security Conference', link: 'https://www.blackhat.com/', category: 'conference', icon: 'security' },
      { title: 'AWS re:Invent 2026', date: 'December 2026', description: 'Amazon Web Services Conference', link: 'https://reinvent.awsevents.com/', category: 'conference', icon: 'aws' },
      { title: 'React Conf 2026', date: 'May 2026', description: 'React Conference', link: 'https://reactconf.com/', category: 'conference', icon: 'react' },
      { title: 'FOSDEM 2026', date: 'January 31 - February 1, 2026', description: 'Free and Open Source Developers European Meeting', link: 'https://fosdem.org/', category: 'conference', icon: 'fosdem' },
    ],
    filters: ['all', 'conference', 'event', 'hackathon', 'launch', 'startups']
  },

  github: {
    repos: [
      { name: 'openclaw/openclaw', description: 'Your own personal AI assistant. Any OS. Any Platform.', stars: 194404, language: 'TypeScript', url: 'https://github.com/openclaw/openclaw', trending: 'hot' },
      { name: 'anomalyco/opencode', description: 'The open source coding agent', stars: 104616, language: 'TypeScript', url: 'https://github.com/anomalyco/opencode', trending: 'hot' },
      { name: 'anthropics/skills', description: 'Public repository for Agent Skills', stars: 69855, language: 'Python', url: 'https://github.com/anthropics/skills', trending: 'hot' },
      { name: 'obra/superpowers', description: 'An agentic skills framework & software development methodology', stars: 51597, language: 'Shell', url: 'https://github.com/obra/superpowers', trending: 'hot' },
      { name: 'remotion-dev/remotion', description: 'Make videos programmatically with React', stars: 36594, language: 'TypeScript', url: 'https://github.com/remotion-dev/remotion', trending: 'hot' },
      { name: 'asgeirtj/system_prompts_leaks', description: 'Collection of extracted System Prompts from popular chatbots', stars: 31485, language: 'HTML', url: 'https://github.com/asgeirtj/system_prompts_leaks', trending: '' },
      { name: 'thedotmack/claude-mem', description: 'Claude Code plugin that captures and compresses coding sessions', stars: 28205, language: 'TypeScript', url: 'https://github.com/thedotmack/claude-mem', trending: '' },
      { name: 'KeygraphHQ/shannon', description: 'Fully autonomous AI hacker to find exploits in web apps', stars: 22021, language: 'TypeScript', url: 'https://github.com/KeygraphHQ/shannon', trending: 'hot' },
      { name: 'vercel-labs/agent-skills', description: 'Vercel\'s official collection of agent skills', stars: 20357, language: 'JavaScript', url: 'https://github.com/vercel-labs/agent-skills', trending: 'hot' },
      { name: 'badlogic/pi-mono', description: 'AI agent toolkit: coding agent CLI, unified LLM API, TUI & web UI', stars: 12072, language: 'TypeScript', url: 'https://github.com/badlogic/pi-mono', trending: '' },
      { name: 'gsd-build/get-shit-done', description: 'Meta-prompting, context engineering and spec-driven development system', stars: 14055, language: 'JavaScript', url: 'https://github.com/gsd-build/get-shit-done', trending: '' },
      { name: 'iOfficeAI/AionUi', description: 'Free, local, open-source 24/7 Cowork for Gemini CLI, Claude Code', stars: 15847, language: 'TypeScript', url: 'https://github.com/iOfficeAI/AionUi', trending: '' },
      { name: 'VectifyAI/PageIndex', description: 'Document Index for Vectorless, Reasoning-based RAG', stars: 15104, language: 'Python', url: 'https://github.com/VectifyAI/PageIndex', trending: '' },
      { name: 'virattt/dexter', description: 'An autonomous agent for deep financial research', stars: 15139, language: 'TypeScript', url: 'https://github.com/virattt/dexter', trending: '' },
      { name: 'openai/skills', description: 'Skills Catalog for Codex', stars: 8504, language: 'Python', url: 'https://github.com/openai/skills', trending: '' },
    ],
    filters: ['all', 'hot', 'new', 'top']
  },

  podcasts: {
    podcasts: [
      { name: 'Acquired', host: 'Ben Thompson & David Perrett', description: 'Deep dives on great tech companies & business strategy', image: 'acquired', link: 'https://www.acquired.fm/', category: 'business' },
      { name: 'The Stack Overflow Podcast', host: 'Stack Overflow', description: 'Conversations about code, development, and the future of tech', image: 'stackoverflow', link: 'https://stackoverflow.blog/podcast/', category: 'programming' },
      { name: 'Lex Fridman Podcast', host: 'Lex Fridman', description: 'AI, robotics, neuroscience, and the future of humanity', image: 'lex', link: 'https://lexfridman.com/podcast/', category: 'ai' },
      { name: 'Changelog', host: 'Jerod Santo & Adam Stacoviak', description: 'Open source, software, and web development', image: 'changelog', link: 'https://changelog.com/podcast', category: 'programming' },
      { name: 'Hard Fork', host: 'Casey Newton & Kevin Roose', description: 'Tech news, culture, and where it all goes next', image: 'hardfork', link: 'https://podcasts.apple.com/us/podcast/hard-fork/id1521431123', category: 'news' },
      { name: 'Waveform', host: 'MKBHD & Andrew', description: 'Tech reviews, deep dives, and behind the scenes', image: 'waveform', link: 'https://www.youtube.com/playlist?list=PLH9cR-NVtXBcxLmlS2J8a2VWGwR5H0tS', category: 'tech' },
      { name: 'Decoder', host: 'Nilay Patel', description: 'Big tech, business, and power', image: 'decoder', link: 'https://www.theverge.com/decoder-podcast', category: 'business' },
      { name: 'Darknet Diaries', host: 'Jack Rhysider', description: 'True stories from the dark side of the internet', image: 'darknet', link: 'https://darknetdiaries.com/', category: 'security' },
      { name: 'Accidental Tech Podcast', host: 'Marco Arment & Casey Liss', description: 'Apple, tech, programming, and coffee', image: 'atp', link: 'https://atp.fm/', category: 'apple' },
      { name: 'Syntax', host: 'Wes Bos & Scott Tolinski', description: 'Web development tips, tutorials, and advice', image: 'syntax', link: 'https://syntax.fm/', category: 'programming' },
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
      { title: 'Apple MacBook Pro M5', store: 'B&H Photo', price: 1549, originalPrice: 1799, discount: '14%', link: 'https://www.bhphotovideo.com/', category: 'laptop', expires: 'Feb 28' },
      { title: 'Alienware 16 Area-51 RTX 5070 Ti', store: 'Woot', price: 1999, originalPrice: 3100, discount: '35%', link: 'https://www.woot.com/', category: 'laptop', expires: 'Feb 23' },
      { title: 'Lenovo ThinkPad X1 Carbon', store: 'Lenovo', price: 1299, originalPrice: 1919, discount: '32%', link: 'https://www.lenovo.com/', category: 'laptop', expires: 'Feb 24' },
      { title: 'Acer Nitro V RTX 4050', store: 'Amazon', price: 649, originalPrice: 899, discount: '28%', link: 'https://www.amazon.com/', category: 'laptop', expires: 'Feb 25' },
      { title: 'MSI Thin RTX 4060', store: 'Best Buy', price: 829, originalPrice: 1099, discount: '25%', link: 'https://www.bestbuy.com/', category: 'laptop', expires: 'Feb 26' },
      { title: 'ASUS ROG Strix G16 RTX 5060', store: 'Amazon', price: 1399, originalPrice: 1799, discount: '22%', link: 'https://www.amazon.com/', category: 'laptop', expires: 'Feb 28' },
      { title: 'Samsung 990 Pro 2TB', store: 'Amazon', price: 149, originalPrice: 199, discount: '25%', link: 'https://www.amazon.com/', category: 'storage', expires: 'Feb 25' },
      { title: 'Sony WH-1000XM5', store: 'Amazon', price: 279, originalPrice: 399, discount: '30%', link: 'https://www.amazon.com/', category: 'audio', expires: 'Feb 23' },
      { title: 'LG UltraGear 27" 4K', store: 'Best Buy', price: 399, originalPrice: 549, discount: '27%', link: 'https://www.bestbuy.com/', category: 'monitor', expires: 'Feb 28' },
      { title: 'Keychron Q1 Pro', store: 'Amazon', price: 159, originalPrice: 199, discount: '20%', link: 'https://www.amazon.com/', category: 'keyboard', expires: 'Mar 5' },
      { title: 'Steam Deck OLED', store: 'Valve', price: 499, originalPrice: 549, discount: '9%', link: 'https://store.steampowered.com/', category: 'gaming', expires: 'Mar 15' },
      { title: 'Corsair K100 RGB', store: 'Amazon', price: 169, originalPrice: 229, discount: '26%', link: 'https://www.amazon.com/', category: 'keyboard', expires: 'Mar 1' },
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
const ITEMS_PER_PAGE = 6;

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
    contentArea.innerHTML = '';
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

  REMOTE_DATA = await fetchRemoteData();
  if (REMOTE_DATA) {
    TAB_DATA.events.events = REMOTE_DATA.events || TAB_DATA.events.events;
    TAB_DATA.github.repos = REMOTE_DATA.github || TAB_DATA.github.repos;
    TAB_DATA.podcasts.podcasts = REMOTE_DATA.podcasts || TAB_DATA.podcasts.podcasts;
    TAB_DATA.deals.deals = REMOTE_DATA.deals || TAB_DATA.deals.deals;
  }

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
