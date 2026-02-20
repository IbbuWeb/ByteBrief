import { auth, db } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

let currentUser = null;

const VIDEO_FEEDS = [
  // AI
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJ6tdC0FhM25mT3b6YcT1_g', source: 'Two Minute Papers', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC2nK9jQmr_ZMq7bZ8XrL8Vw', source: 'DeepLearningAI', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBfedjw19b84G9gA0u3hdkw', source: 'Yannic Kilcher', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC2uE_Hm2gS_p4Lf9IofCJ9w', source: 'Lex Fridman', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCYO_jab_esuFRV4b17AJtAw', source: '3Blue1Brown', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCfzlCWGWYyIQ0aLC5w48gBQ', source: 'Sentdex', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCotAW4t2ooE4A4gKzmHfi8g', source: 'AssemblyAI', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'OpenAI', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCn4v8J1Z6hKl50sQ3YJJcpQ', source: 'Google DeepMind', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCC552SD-2Wx4LvwLk1oK2w', source: 'Fireship', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCv73rnwKs8Iz-DG4sX9uXpw', source: 'AI Explained', category: 'ai' },

  // Programming
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8XnLlnLnpStdAiY2V6p9Xw', source: 'freeCodeCamp', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCW5YeuER8j8Z8Y6xX5W4Z9w', source: 'Traversy Media', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC1sQwG6xX5W4Z9w', source: 'The Net Ninja', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCWv7vMbMWH4-V0ZXdmDpPBA', source: 'Programming with Mosh', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCkw4ejtrw5X5W4Z9w', source: 'Academind', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'CodeWithHarry', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'CS Dojo', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQ1n5nk5N7v7xX5W4Z9w', source: 'Corey Schafer', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4sS8l8Z6xX5W4Z9w', source: 'Tech With Tim', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCKR16D1y6T4HRBNL4y3K6gA', source: 'Web Dev Simplified', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7jx0A27mGA3b5LdS5W4cbQ', source: 'The Coding Train', category: 'programming' },

  // Hardware
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXuqSBlHAE6Msr3c8SzAOVA', source: 'Linus Tech Tips', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwWW_sKp_0pA8X5W4Z9w', source: 'Gamers Nexus', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6i48JD8N8Ij1JbL3qQS0JQ', source: 'Hardware Unboxed', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCV9X5l5X5W4Z9w', source: 'JayzTwoCents', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6pX5klQC2q2J1bVBCb66BA', source: 'Paul\'s Hardware', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6i48JD8N8Ij1JbL3qQS0JQ', source: 'Tech YES City', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'ETA PRIME', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwWW_sKp_0pA8X5W4Z9w', source: 'Digital Foundry', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCW4ixgmlFL51Gj6sX3XkJ9w', source: 'ShortCircuit', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCX7Y2guXyKeJAC3WpTp3vXg', source: 'Austin Evans', category: 'hardware' },

  // Startups
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4sS8l8Z6xX5W4Z9w', source: 'Y Combinator', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCX7Y2guXyKeJAC3WpTp3vXg', source: 'Stanford eCorner', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'Slidebean', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCW5YeuER8j8Z8Y6xX5W4Z9w', source: 'Startup Grind', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8XnLlnLnpStdAiY2V6p9Xw', source: 'GaryVee', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4sS8l8Z6xX5W4Z9w', source: 'Alex Hormozi', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCW5YeuER8j8Z8Y6xX5W4Z9w', source: 'My First Million', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXgGY0wkgOzynnHvSEVmE3A', source: 'This Week in Startups', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'Forbes', category: 'startups' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6pX5klQC2q2J1bVBCb66BA', source: 'TechCrunch', category: 'startups' },

  // Cybersecurity
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0ZTPmqX4CVLrW73cW86K9Q', source: 'NetworkChuck', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC1sQwG6xX5W4Z9w', source: 'John Hammond', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'The Cyber Mentor', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwX6rVkOq0mN4Rzig9aLMdQ', source: 'HackerSploit', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'LiveOverflow', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCMak3RJdN2rWdK1T4JCEjA', source: 'David Bombal', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCs6hQhm8P4H4YjKHC9G5p3w', source: 'Null Byte', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXgGY0wkgOzynnHvSEVmE3A', source: 'Computerphile', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBInGjN7pRlqJ4-eYrtpBcw', source: 'Black Hills InfoSec', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCctX8C9FSCxHDCjDcdK4g9Q', source: 'IppSec', category: 'cybersecurity' },

  // PC Building
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXuqSBlHAE6Msr3c8SzAOVA', source: 'Linus Tech Tips', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCV9X5l5X5W4Z9w', source: 'JayzTwoCents', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6pX5klQC2q2J1bVBCb66BA', source: 'Paul\'s Hardware', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'Bitwit', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwWW_sKp_0pA8X5W4Z9w', source: 'Gamers Nexus', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCvTFLYX5jCwxeo97D3d0yHA', source: 'Hardware Canucks', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCW5YeuER8j8Z8Y6xX5W4Z9w', source: 'TechSource', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'ScatterVolt', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6i48JD8N8Ij1JbL3qQS0JQ', source: 'Tech YES City', category: 'pcbuilding' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'Toasty Bros', category: 'pcbuilding' },

  // Tech
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ', source: 'Marques Brownlee', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6mAx5osIE5R8x0X5W4Z9w', source: 'Unbox Therapy', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsP8hVqS5k-8v6A2R5V3U8w', source: 'The Verge', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'CNET', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCX7Y2guXyKeJAC3WpTp3vXg', source: 'Austin Evans', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCW4ixgmlFL51Gj6sX3XkJ9w', source: 'ShortCircuit', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQfwfsi5VrQ8yKZ-UWmAEFg', source: 'Dave2D', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'UrAvgConsumer', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4RqR8Z6xX5W4Z9w', source: 'TechLinked', category: 'tech' }
];

const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`
];

const INVIDIOUS_INSTANCES = [
  'https://invidious.fdn.fr',
  'https://invidious.snopyta.org',
  'https://yewtu.be',
  'https://yewtu.be'
];

const BLOCKED_VIDEO_SOURCES = ['france 24', 'france24', 'france.tv', 'francetv'];

function isVideoBlocked(video) {
  const text = `${video.title} ${video.source} ${video.author}`.toLowerCase();
  return BLOCKED_VIDEO_SOURCES.some(blocked => text.includes(blocked));
}

function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

async function fetchWithProxy(url) {
  for (const proxyFn of CORS_PROXIES) {
    try {
      const proxyUrl = proxyFn(url);
      const response = await fetchWithTimeout(proxyUrl);
      if (!response.ok) continue;
      const text = await response.text();
      if (text && text.trim().length > 0) return text;
    } catch (e) {
      continue;
    }
  }
  throw new Error(`All proxies failed for ${url}`);
}

async function fetchVideoFeed(feedConfig) {
  const proxies = [
    (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
  ];
  
  for (const proxyFn of proxies) {
    try {
      const channelId = feedConfig.url.split('channel_id=')[1];
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const proxyUrl = proxyFn(rssUrl);
      
      const response = await fetchWithTimeout(proxyUrl, 12000);
      if (!response.ok) continue;
      
      let xmlText;
      try {
        const data = await response.json();
        xmlText = data.contents || data;
      } catch {
        xmlText = await response.text();
      }
      
      if (!xmlText || typeof xmlText !== 'string') continue;
      
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'text/xml');
      const entries = xml.querySelectorAll('entry');
      if (entries.length === 0) continue;
      
      const videos = [];
      entries.forEach(entry => {
        const entryId = entry.querySelector('id')?.textContent || '';
        const videoId = entryId.includes('video:') ? entryId.split('video:')[1] : null;
        if (!videoId) return;
        
        videos.push({
          title: entry.querySelector('title')?.textContent || 'Untitled',
          videoId: videoId,
          link: entry.querySelector('link')?.getAttribute('href') || `https://youtube.com/watch?v=${videoId}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          description: entry.querySelector('summary')?.textContent || entry.querySelector('content')?.textContent || '',
          source: feedConfig.source,
          author: entry.querySelector('author > name')?.textContent || feedConfig.source,
          pubDate: new Date(entry.querySelector('published')?.textContent || new Date()),
          categories: [feedConfig.category]
        });
      });
      
      if (videos.length > 0) return videos.slice(0, 10);
    } catch (e) {
      continue;
    }
  }
  
  console.error(`All proxies failed for ${feedConfig.source}`);
  return [];
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
}

function parseDate(dateString) {
  if (!dateString) return new Date();
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
}

async function fetchAllVideoFeeds() {
  const batches = [];
  for (let i = 0; i < VIDEO_FEEDS.length; i += 5) {
    batches.push(VIDEO_FEEDS.slice(i, i + 5));
  }
  
  const allResults = [];
  for (const batch of batches) {
    const results = await Promise.allSettled(batch.map(feed => fetchVideoFeed(feed)));
    const batchVideos = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)
      .filter(video => !isVideoBlocked(video) && video.videoId);
    allResults.push(...batchVideos);
    await new Promise(r => setTimeout(r, 500));
  }

  if (allResults.length === 0) {
    return getSampleVideos();
  }

  const seen = new Set();
  const unique = allResults.filter(video => {
    if (seen.has(video.videoId)) return false;
    seen.add(video.videoId);
    return true;
  });

function shuffleVideosIntelligently(videos) {
  if (videos.length <= 1) return videos;
  
  const result = [];
  const remaining = [...videos];
  let lastCategory = null;
  let lastSource = null;
  
  const getAvailableVideos = () => {
    return remaining.filter(v => {
      const sameCategory = v.categories[0] === lastCategory;
      const sameSource = v.source === lastSource;
      return !sameCategory || !sameSource;
    });
  };
  
  while (remaining.length > 0) {
    let available = getAvailableVideos();
    
    if (available.length === 0) {
      available = remaining;
    }
    
    const sourceGroups = {};
    available.forEach(v => {
      const key = `${v.categories[0]}|${v.source}`;
      if (!sourceGroups[key]) sourceGroups[key] = [];
      sourceGroups[key].push(v);
    });
    
    const keys = Object.keys(sourceGroups);
    keys.sort(() => Math.random() - 0.5);
    
    const selectedKey = keys[0];
    const candidates = sourceGroups[selectedKey];
    const video = candidates[Math.floor(Math.random() * candidates.length)];
    
    const idx = remaining.indexOf(video);
    remaining.splice(idx, 1);
    
    result.push(video);
    lastCategory = video.categories[0];
    lastSource = video.source;
  }
  
  return result;
}

  return shuffleVideosIntelligently(unique);
}

function renderVideo(video, onPlay) {
  const article = document.createElement('article');
  article.className = 'video-card';
  article.dataset.videoId = video.videoId;

  article.innerHTML = `
    <div class="video-media">
      <div class="video-thumbnail">
        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
        <button class="play-button" aria-label="Play video">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>
    </div>
    <div class="video-info">
      <div class="video-meta">
        <span class="video-category">${video.categories[0]}</span>
        <span class="video-source">${video.source}</span>
      </div>
      <h3 class="video-title">${video.title}</h3>
      <p class="video-author">${video.author}</p>
      <time class="video-date">${formatDate(video.pubDate)}</time>
    </div>
  `;

  const playBtn = article.querySelector('.play-button');
  const thumbnail = article.querySelector('.video-thumbnail');
  const media = article.querySelector('.video-media');

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playVideo();
  });

  const playVideo = () => {
    media.innerHTML = `<iframe src="https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    if (onPlay) onPlay(video);
  };

  return article;
}

function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMessage = toast.querySelector('.toast-message');
  toastMessage.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

let allVideos = [];
let filteredVideos = [];
let currentCategory = 'all';
let currentSearch = '';
let isLoading = false;
let currentPage = 0;
const VIDEOS_PER_PAGE = 20;

async function initVideos() {
  const videoGrid = document.getElementById('videoGrid');
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  const filterBtns = document.querySelectorAll('.filter-btn');

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

  try {
    allVideos = await fetchAllVideoFeeds();
    filteredVideos = allVideos;
    currentPage = 0;
    renderPage(true);
    setupInfiniteScroll();
  } catch (error) {
    console.error('Error loading videos:', error);
    videoGrid.innerHTML = `<div class="error-state"><h2>Failed to load videos</h2><p>Please check your connection</p><button class="btn btn-primary" onclick="location.reload()">Retry</button></div>`;
  }

  function renderPage(reset = false) {
    if (reset) {
      videoGrid.innerHTML = '';
      currentPage = 0;
    }

    const startIdx = currentPage * VIDEOS_PER_PAGE;
    const endIdx = startIdx + VIDEOS_PER_PAGE;
    const pageVideos = filteredVideos.slice(startIdx, endIdx);
    const hasMore = endIdx < filteredVideos.length;

    if (pageVideos.length === 0 && reset) {
      videoGrid.innerHTML = `<div class="empty-state"><h2>No videos found</h2><p>Try adjusting your filters</p></div>`;
      return;
    }

    pageVideos.forEach(video => {
      videoGrid.appendChild(renderVideo(video, (v) => showToast(`Playing: ${v.title}`)));
    });

    const existingLoader = videoGrid.querySelector('.loading-more');
    if (hasMore && !existingLoader) {
      const loader = document.createElement('div');
      loader.className = 'loading-more';
      loader.id = 'loadingMore';
      loader.innerHTML = '<div class="spinner"></div>';
      videoGrid.appendChild(loader);
    } else if (!hasMore && existingLoader) {
      existingLoader.remove();
    }
  }

  function loadMore() {
    if (isLoading) return;
    
    const hasMore = (currentPage + 1) * VIDEOS_PER_PAGE < filteredVideos.length;
    if (!hasMore) return;
    
    isLoading = true;
    currentPage++;
    
    renderPage(false);
    
    isLoading = false;
  }

  function applyFilters() {
    let filtered = allVideos;

    if (currentCategory !== 'all') {
      filtered = filtered.filter(v => v.categories.includes(currentCategory));
    }

    if (currentSearch) {
      const searchLower = currentSearch.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(searchLower) ||
        v.source.toLowerCase().includes(searchLower)
      );
    }

    filteredVideos = filtered;
    renderPage(true);
  }

  function setupInfiniteScroll() {
    const handleScroll = () => {
      const hasMore = (currentPage + 1) * VIDEOS_PER_PAGE < filteredVideos.length;
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

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      applyFilters();
    });
  });

  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    clearSearch.style.display = currentSearch ? 'block' : 'none';
    applyFilters();
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    currentSearch = '';
    clearSearch.style.display = 'none';
    applyFilters();
    searchInput.focus();
  });

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
    showToast('Failed to logout', 'error');
  }
}

document.addEventListener('DOMContentLoaded', initVideos);
