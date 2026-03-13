const RSS_FEEDS = [
  {
    url: 'https://techcrunch.com/feed/',
    source: 'TechCrunch',
    category: 'startups'
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    source: 'The Verge',
    category: 'hardware'
  },
  {
    url: 'https://www.wired.com/feed/rss',
    source: 'Wired',
    category: 'cybersecurity'
  },
  {
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
    source: 'Ars Technica',
    category: 'programming'
  },
  {
    url: 'https://www.technologyreview.com/feed/',
    source: 'MIT Tech Review',
    category: 'ai'
  },
  {
    url: 'https://feeds.feedburner.com/venturebeat/SZYF',
    source: 'VentureBeat',
    category: 'ai'
  },
  {
    url: 'https://www.zdnet.com/news/rss.xml',
    source: 'ZDNet',
    category: 'cybersecurity'
  },
  {
    url: 'https://dev.to/feed/',
    source: 'DEV Community',
    category: 'programming'
  },
  {
    url: 'https://hnrss.org/frontpage',
    source: 'Hacker News',
    category: 'programming'
  },
  {
    url: 'https://feeds.arstechnica.com/arstechnica/gadgets',
    source: 'Ars Gadgets',
    category: 'hardware'
  },
  {
    url: 'https://9to5mac.com/feed/',
    source: '9to5Mac',
    category: 'hardware'
  },
  {
    url: 'https://techcrunch.com/category/startups/feed/',
    source: 'TC Startups',
    category: 'startups'
  },
  {
    url: 'https://news.crunchbase.com/feed/',
    source: 'Crunchbase',
    category: 'startups'
  },
  {
    url: 'https://www.bbc.com/news/technology/rss.xml',
    source: 'BBC Tech',
    category: 'tech'
  },
  {
    url: 'https://www.bleepingcomputer.com/feed/',
    source: 'BleepingComputer',
    category: 'cybersecurity'
  },
  {
    url: 'https://threatpost.com/feed/',
    source: 'Threatpost',
    category: 'cybersecurity'
  },
  {
    url: 'https://www.cnet.com/rss/news/',
    source: 'CNET',
    category: 'hardware'
  },
  {
    url: 'https://www.engadget.com/rss.xml',
    source: 'Engadget',
    category: 'hardware'
  },
  {
    url: 'https://css-tricks.com/feed/',
    source: 'CSS-Tricks',
    category: 'programming'
  },
  {
    url: 'https://stackoverflow.blog/feed/',
    source: 'Stack Overflow Blog',
    category: 'programming'
  },
  {
    url: 'https://github.blog/feed/',
    source: 'GitHub Blog',
    category: 'programming'
  },
  {
    url: 'https://www.techradar.com/rss',
    source: 'TechRadar',
    category: 'hardware'
  },
  {
    url: 'https://www.tomshardware.com/feeds/all',
    source: 'Tom\'s Hardware',
    category: 'hardware'
  },
  {
    url: 'https://siliconangle.com/feed/',
    source: 'SiliconANGLE',
    category: 'startups'
  },
  {
    url: 'https://tech.eu/feed/',
    source: 'Tech.eu',
    category: 'tech'
  },
  {
    url: 'https://www.reddit.com/r/technology/.rss',
    source: 'Reddit Tech',
    category: 'tech'
  }
];

const RSS2JSON_API = 'https://api.rss2json.com/v1/api.json?rss_url=';

const CATEGORY_KEYWORDS = {
  ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'chatgpt', 'openai', 'google bard', 'llm', 'gpt', 'neural'],
  programming: ['programming', 'developer', 'code', 'software', 'javascript', 'python', 'react', 'github', 'api', 'web development'],
  hardware: ['hardware', 'chip', 'processor', 'gpu', 'cpu', 'apple', 'microsoft', 'laptop', 'computer', 'device', 'phone', 'android', 'iphone'],
  startups: ['startup', 'venture', 'vc', 'funding', ' Series', 'unicorn', 'founder', 'entrepreneur', 'pitch'],
  cybersecurity: ['security', 'hack', 'breach', 'cyber', 'privacy', 'data', 'malware', 'ransomware', 'encryption', 'vulnerability']
};

const BLOCKED_SOURCES = ['france 24', 'france24', 'france.tv', 'francetv'];
const BLOCKED_URL_PATTERNS = ['.pdf', 'pagedout.institute', 'journals.sagepub', 'console.cloud.google'];

function isBlocked(article) {
  const text = `${article.title} ${article.source} ${article.description}`.toLowerCase();
  const url = article.link?.toLowerCase() || '';
  
  if (BLOCKED_SOURCES.some(blocked => text.includes(blocked))) return true;
  if (BLOCKED_URL_PATTERNS.some(pattern => url.includes(pattern))) return true;
  return false;
}

function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

async function fetchRSSFeed(feedConfig) {
  try {
    const response = await fetchWithTimeout(RSS2JSON_API + encodeURIComponent(feedConfig.url));
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    if (data.status !== 'ok') throw new Error('RSS2JSON API error');
    
    const items = data.items || [];

    return items.slice(0, 50).map(item => {
      const title = item.title || 'Untitled';
      const link = item.link?.trim() || '#';
      
      const description = (item.description || item.content || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
        .slice(0, 800);

      const author = item.author || '';
      const pubDate = item.pubDate || '';
      
      let thumbnail = item.thumbnail || item.enclosure?.link || null;
      
      if (!thumbnail) {
        const rawHtml = item.content || item.description || '';
        const imgMatch = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
          thumbnail = imgMatch[1];
        }
      }

      const categories = item.categories || [];

      if (feedConfig.category && !categories.includes(feedConfig.category)) {
        categories.unshift(feedConfig.category);
      }

      const finalCategories = categories.length > 0 
        ? categories.map(c => c.toLowerCase()).filter(c => ['ai', 'programming', 'hardware', 'startups', 'cybersecurity', 'tech'].includes(c))
        : determineCategories(title, description);

      return {
        title,
        link,
        description,
        thumbnail,
        source: feedConfig.source,
        pubDate: parseDate(pubDate),
        categories: finalCategories.length > 0 ? finalCategories : ['tech'],
        author: author.replace(/<[^>]*>/g, '').trim() || null
      };
    });
  } catch (error) {
    console.error(`Error fetching ${feedConfig.source}:`, error);
    return [];
  }
}

function determineCategories(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const categories = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      categories.push(category);
    }
  }

  if (categories.length === 0) {
    categories.push('tech');
  }

  return categories;
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

export async function fetchAllFeeds() {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(feed => fetchRSSFeed(feed))
  );

  const allArticles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(article => !isBlocked(article));

  const seen = new Set();
  const unique = allArticles.filter(article => {
    const key = article.link || article.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const shuffled = shuffleArray([...unique]);
  shuffled.sort((a, b) => b.pubDate - a.pubDate);

  return shuffled;
}

export async function fetchFeedsByCategory(category) {
  const allFeeds = await fetchAllFeeds();

  if (category === 'all') {
    return allFeeds;
  }

  return allFeeds.filter(article =>
    article.categories.includes(category)
  );
}

export async function fetchOgImage(url) {
  try {
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    const resp = await fetchWithTimeout(proxyUrl, 5000);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.status === 'ok' && data.items && data.items[0]) {
      return data.items[0].thumbnail || null;
    }
    return null;
  } catch {
    return null;
  }
}

export { CATEGORY_KEYWORDS };
