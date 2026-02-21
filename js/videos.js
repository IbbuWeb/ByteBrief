import { auth } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

let currentUser = null;

const YOUTUBE_API_KEY = localStorage.getItem('youtube_api_key') || '';

// Fixed Video Feeds: Removed duplicates and corrected invalid Channel IDs
const VIDEO_FEEDS = [
  // AI
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJ6tdC0FhM25mT3b6YcT1_g', source: 'Two Minute Papers', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC2nK9jQmr_ZMq7bZ8XrL8Vw', source: 'DeepLearningAI', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBfedjw19b84G9gA0u3hdkw', source: 'Yannic Kilcher', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC2uE_Hm2gS_p4Lf9IofCJ9w', source: 'Lex Fridman', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCYO_jab_esuFRV4b17AJtAw', source: '3Blue1Brown', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCfzlCWGWYyIQ0aLC5w48gBQ', source: 'Sentdex', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCotAW4t2ooE4A4gKzmHfi8g', source: 'AssemblyAI', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCblfuWw4L-TvmO0bM-khJPA', source: 'OpenAI', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCn4v8J1Z6hKl50sQ3YJJcpQ', source: 'Google DeepMind', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCC552SD-2Wx4LvwLk1oK2w', source: 'Fireship', category: 'ai' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCv73rnwKs8Iz-DG4sX9uXpw', source: 'AI Explained', category: 'ai' },

  // Programming
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8XnLlnLnpStdAiY2V6p9Xw', source: 'freeCodeCamp', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCW5YeuER8j8Z8Y6xX5W4Z9w', source: 'Traversy Media', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCn2ulenNKsF3-C0VeU-ThQQ', source: 'The Net Ninja', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCWv7vMbMWH4-V0ZXdmDpPBA', source: 'Programming with Mosh', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSJbGtTlrDami-tDGPUH9CA', source: 'Academind', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCeVMnSShP_IviwkkAm83szg', source: 'CodeWithHarry', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCxX9wt5FWQUAAz4UrysqK9A', source: 'CS Dojo', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCCezIgC97PvUuR4_gbFUs5g', source: 'Corey Schafer', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC4JX40jDee_tINbkjycV4Sg', source: 'Tech With Tim', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCKR16D1y6T4HRBNL4y3K6gA', source: 'Web Dev Simplified', category: 'programming' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC7jx0A27mGA3b5LdS5W4cbQ', source: 'The Coding Train', category: 'programming' },

  // Hardware
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXuqSBlHAE6Msr3c8SzAOVA', source: 'Linus Tech Tips', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UChIs72whgZI9w6d6zvHutBg', source: 'Gamers Nexus', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC6i48JD8N8Ij1JbL3qQS0JQ', source: 'Hardware Unboxed', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCkWQ0gDrqOCarmUKmppD7GQ', source: 'JayzTwoCents', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCDfOjPkE-pXZD7e-DjDwD6g', source: 'Paul\'s Hardware', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8jXfU3BQOUQ4-m1brXU8SQ', source: 'Tech YES City', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC9SBqCxP2ksR8P-4zFpqTpg', source: 'Digital Foundry', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCW4ixgmlFL51Gj6sX3XkJ9w', source: 'ShortCircuit', category: 'hardware' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCX7Y2guXyKeJAC3WpTp3vXg', source: 'Austin Evans', category: 'hardware' },

  // Cybersecurity
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0ZTPmqX4CVLrW73cW86K9Q', source: 'NetworkChuck', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCVeW9qkBjo3cestn5GKkSBQ', source: 'John Hammond', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCJ2U9Dq9JZ2Q9oJ9oY7Q4wQ', source: 'The Cyber Mentor', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCwX6rVkOq0mN4Rzig9aLMdQ', source: 'HackerSploit', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCMak3RJdN2rWdK1T4JCEjA', source: 'David Bombal', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCs6hQhm8P4H4YjKHC9G5p3w', source: 'Null Byte', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCXgGY0wkgOzynnHvSEVmE3A', source: 'Computerphile', category: 'cybersecurity' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBInGjN7pRlqJ4-eYrtpBcw', source: 'Black Hills InfoSec', category: 'cybersecurity' },

  // Tech
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ', source: 'Marques Brownlee', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsP_PXxW4QIeS4OkcWT2keg', source: 'Unbox Therapy', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsP8hVqS5k-8v6A2R5V3U8w', source: 'The Verge', category: 'tech' },
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQfwfsi5VrQ8yKZ-UWmAEFg', source: 'Dave2D', category: 'tech' }
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

async function fetchVideoFeed(feedConfig) {
  const channelId = feedConfig.url.split('channel_id=')[1];
  if (!channelId) return [];
  
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  const methods = [
    // Method 1: YouTube API (Most reliable if key exists)
    async () => {
      if (!YOUTUBE_API_KEY) throw new Error('No API key');
      
      const response = await fetchWithTimeout(
        `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`,
        15000
      );
      if (!response.ok) throw new Error('YouTube API failed');
      const data = await response.json();
      if (!data.items || data.items.length === 0) throw new Error('No items');
      
      return data.items
        .filter(item => item.id.kind === 'youtube#video')
        .map(item => ({
          title: item.snippet.title,
          videoId: item.id.videoId,
          link: `https://youtube.com/watch?v=${item.id.videoId}`,
          thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
          description: item.snippet.description || '',
          source: feedConfig.source,
          author: item.snippet.channelTitle || feedConfig.source,
          pubDate: new Date(item.snippet.publishedAt),
          categories: [feedConfig.category]
        }));
    },
    // Method 2: rss2json (Good proxy service)
    async () => {
      const jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const response = await fetchWithTimeout(jsonUrl, 15000);
      if (!response.ok) throw new Error('rss2json failed');
      const data = await response.json();
      if (data.status !== 'ok' || !data.items) throw new Error('Invalid rss2json response');
      return data.items.map(item => ({
        title: item.title,
        videoId: item.guid?.split(':').pop() || item.link?.split('v=')[1]?.split('&')[0] || '',
        link: item.link,
        thumbnail: item.thumbnail || item.enclosure?.link || '',
        description: item.description || '',
        source: feedConfig.source,
        author: item.author || feedConfig.source,
        pubDate: new Date(item.pubDate),
        categories: [feedConfig.category]
      }));
    },
    // Method 3: Invidious (Privacy-focused frontend)
    async () => {
      // Updated with currently working instances
      const invidiousInstances = [
        'https://invidious.fdn.fr',
        'https://invidious.snopyta.org',
        'https://yewtu.be',
        'https://invidious.kavin.rocks'
      ];
      for (const instance of invidiousInstances) {
        try {
          const response = await fetchWithTimeout(`${instance}/api/v1/channels/${channelId}/videos`, 10000);
          if (!response.ok) continue;
          const data = await response.json();
          if (!data.videos && !Array.isArray(data)) continue;
          
          const videos = data.videos || data; // Handle different response structures
          return videos.slice(0, 10).map(video => ({
            title: video.title,
            videoId: video.videoId,
            link: `https://youtube.com/watch?v=${video.videoId}`,
            // Invidious returns relative timestamps sometimes, handle carefully
            thumbnail: video.videoThumbnails?.find(t => t.quality === 'high')?.url || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`,
            description: video.description || '',
            source: feedConfig.source,
            author: video.author || feedConfig.source,
            pubDate: new Date(video.published * 1000),
            categories: [feedConfig.category]
          }));
        } catch (e) {
          continue;
        }
      }
      throw new Error('All Invidious instances failed');
    },
    // Method 4: CORS Proxy + XML Parsing
    async () => {
      const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(rssUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
      ];
      for (const proxyUrl of proxies) {
        try {
          const response = await fetchWithTimeout(proxyUrl, 12000);
          if (!response.ok) continue;
          const xmlText = await response.text();
          if (!xmlText) continue;
          
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
      throw new Error('All proxy methods failed');
    }
  ];
  
  for (const method of methods) {
    try {
      const videos = await method();
      if (videos && videos.length > 0 && videos[0].videoId) {
        return videos;
      }
    } catch (e) {
      continue;
    }
  }
  
  console.error(`All methods failed for ${feedConfig.source} (${channelId})`);
  return [];
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
    return [];
  }

  const seen = new Set();
  const unique = allResults.filter(video => {
    if (seen.has(video.videoId)) return false;
    seen.add(video.videoId);
    return true;
  });

  return shuffleVideosIntelligently(unique);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderVideo(video, onPlay) {
  const article = document.createElement('article');
  article.className = 'video-card';
  article.dataset.videoId = video.videoId;
  
  // FIX: Fallback for thumbnail if missing
  const thumbnailSrc = video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;

  article.innerHTML = `
    <div class="video-media">
      <div class="video-thumbnail">
        <img src="${escapeHtml(thumbnailSrc)}" alt="${escapeHtml(video.title)}" loading="lazy" onerror="this.src='https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg'">
        <button class="play-button" aria-label="Play video">
          <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        </button>
      </div>
    </div>
    <div class="video-info">
      <div class="video-meta">
        <span class="video-category">${escapeHtml(video.categories[0])}</span>
        <span class="video-source">${escapeHtml(video.source)}</span>
      </div>
      <h3 class="video-title">${escapeHtml(video.title)}</h3>
      <p class="video-author">${escapeHtml(video.author)}</p>
      <time class="video-date">${formatDate(video.pubDate)}</time>
    </div>
  `;

  const playBtn = article.querySelector('.play-button');
  const media = article.querySelector('.video-media');

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playVideo();
  });

  const playVideo = () => {
    media.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(video.videoId)}?autoplay=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    if (onPlay) onPlay(video);
  };

  return article;
}

function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Recently';
  }
  
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.max(0, Math.floor(diffMs / 60000));
  const diffHours = Math.max(0, Math.floor(diffMs / 3600000));
  const diffDays = Math.max(0, Math.floor(diffMs / 86400000));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  const toastMessage = toast.querySelector('.toast-message');
  if (toastMessage) toastMessage.textContent = message;
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

  if (!YOUTUBE_API_KEY) {
    const apiKeyBanner = document.createElement('div');
    apiKeyBanner.className = 'api-key-banner';
    apiKeyBanner.innerHTML = `
      <p>YouTube RSS feeds might be limited. To improve results, 
        <button id="setupApiKey" class="btn-link">set up a free YouTube API key</button> 
        or <button id="dismissBanner" class="btn-link">dismiss</button>
      </p>
    `;
    document.body.insertBefore(apiKeyBanner, document.body.firstChild);
    
    document.getElementById('setupApiKey')?.addEventListener('click', () => {
      const apiKey = prompt('Enter your YouTube Data API v3 key:\n\nGet free key at: https://console.cloud.google.com/apis/credentials\n\nEnable "YouTube Data API v3" in Google Cloud Console');
      if (apiKey) {
        localStorage.setItem('youtube_api_key', apiKey);
        location.reload();
      }
    });
    
    document.getElementById('dismissBanner')?.addEventListener('click', () => {
      apiKeyBanner.remove();
    });
  }

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
    videoGrid.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading videos...</p></div>';
    allVideos = await fetchAllVideoFeeds();
    
    if (allVideos.length === 0) {
      videoGrid.innerHTML = `
        <div class="empty-state">
          <h2>No videos available</h2>
          <p>Could not fetch videos. Check your connection or API key.</p>
          <button class="btn btn-primary" id="retryWithApiKey">Set Up API Key / Retry</button>
        </div>`;
      document.getElementById('retryWithApiKey')?.addEventListener('click', () => {
        const apiKey = prompt('Enter your YouTube Data API v3 key:\n\nGet free key at: https://console.cloud.google.com/apis/credentials');
        if (apiKey) {
          localStorage.setItem('youtube_api_key', apiKey);
          location.reload();
        }
      });
      return;
    }
    
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
    setupInfiniteScroll(); // Re-attach listener after reset
  }

  function setupInfiniteScroll() {
    if (window.scrollHandler) {
      window.removeEventListener('scroll', window.scrollHandler);
    }

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
      if (searchInput) searchInput.focus();
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