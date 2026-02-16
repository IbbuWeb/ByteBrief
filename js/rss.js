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
    url: 'https://feeds.arstechnica.com/arstechnica/security',
    source: 'Ars Security',
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
  }
];

const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
];

const CATEGORY_KEYWORDS = {
  ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'chatgpt', 'openai', 'google bard', 'llm', 'gpt', 'neural'],
  programming: ['programming', 'developer', 'code', 'software', 'javascript', 'python', 'react', 'github', 'api', 'web development'],
  hardware: ['hardware', 'chip', 'processor', 'gpu', 'cpu', 'apple', 'microsoft', 'laptop', 'computer', 'device', 'phone', 'android', 'iphone'],
  startups: ['startup', 'venture', 'vc', 'funding', ' Series', 'unicorn', 'founder', 'entrepreneur', 'pitch'],
  cybersecurity: ['security', 'hack', 'breach', 'cyber', 'privacy', 'data', 'malware', 'ransomware', 'encryption', 'vulnerability']
};

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

async function fetchRSSFeed(feedConfig) {
  try {
    const text = await fetchWithProxy(feedConfig.url);
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');

    const parseError = xml.querySelector('parsererror');
    if (parseError) throw new Error('XML parse error');

    let items = Array.from(xml.querySelectorAll('item'));

    if (items.length === 0) {
      items = Array.from(xml.querySelectorAll('entry'));
    }

    return items.slice(0, 30).map(item => {
      const title = item.querySelector('title')?.textContent || 'Untitled';

      let link = '';
      const linkEl = item.querySelector('link');
      if (linkEl) {
        link = linkEl.getAttribute('href') || linkEl.textContent || '';
      }
      if (!link) {
        const linkEls = item.querySelectorAll('link');
        for (const el of linkEls) {
          const href = el.getAttribute('href');
          if (href) { link = href; break; }
        }
      }
      link = link.trim() || '#';

      let description = '';
      const descEl = item.querySelector('description');
      const summaryEl = item.querySelector('summary');
      const contentEncoded = item.getElementsByTagName('content:encoded')[0];
      const contentEl = item.querySelector('content');
      if (descEl) {
        description = descEl.textContent || '';
      } else if (summaryEl) {
        description = summaryEl.textContent || '';
      } else if (contentEncoded) {
        description = contentEncoded.textContent || '';
      } else if (contentEl) {
        description = contentEl.textContent || '';
      }

      const pubDate = item.querySelector('pubDate')?.textContent
        || item.querySelector('published')?.textContent
        || item.querySelector('updated')?.textContent
        || '';

      let thumbnail = null;
      const mediaThumbnail = item.getElementsByTagName('media:thumbnail')[0];
      const mediaContent = item.getElementsByTagName('media:content')[0];
      const enclosure = item.querySelector('enclosure');

      if (mediaThumbnail) {
        thumbnail = mediaThumbnail.getAttribute('url');
      } else if (mediaContent && mediaContent.getAttribute('url')) {
        const medium = mediaContent.getAttribute('medium');
        const type = mediaContent.getAttribute('type');
        if (!medium || medium === 'image' || (type && type.startsWith('image'))) {
          thumbnail = mediaContent.getAttribute('url');
        }
      } else if (enclosure && enclosure.getAttribute('type')?.startsWith('image')) {
        thumbnail = enclosure.getAttribute('url');
      }

      if (!thumbnail) {
        const rawHtml = contentEncoded?.innerHTML
          || contentEl?.innerHTML
          || descEl?.innerHTML
          || summaryEl?.innerHTML
          || contentEncoded?.textContent
          || contentEl?.textContent
          || descEl?.textContent
          || summaryEl?.textContent
          || '';
        const imgMatch = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
          thumbnail = imgMatch[1];
        }
      }

      if (!thumbnail) {
        const cdataHtml = (contentEncoded || contentEl || descEl || summaryEl);
        if (cdataHtml) {
          const raw = new XMLSerializer().serializeToString(cdataHtml);
          const srcMatch = raw.match(/src=["']([^"']+?\.(?:jpg|jpeg|png|gif|webp)[^"']*?)["']/i)
            || raw.match(/src=(?:&quot;|&#34;|")(https?:\/\/[^"&]+?\.(?:jpg|jpeg|png|gif|webp)[^"&]*?)(?:&quot;|&#34;|")/i);
          if (srcMatch) {
            thumbnail = srcMatch[1]
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '')
              .replace(/&#34;/g, '');
          }
        }
      }

      const cleanDescription = description
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
        .slice(0, 200);

      const categories = determineCategories(title, description);

      if (feedConfig.category && !categories.includes(feedConfig.category)) {
        categories.unshift(feedConfig.category);
      }

      return {
        title,
        link,
        description: cleanDescription,
        thumbnail,
        source: feedConfig.source,
        pubDate: parseDate(pubDate),
        categories
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
    .flatMap(r => r.value);

  const seen = new Set();
  const unique = allArticles.filter(article => {
    const key = article.link || article.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => b.pubDate - a.pubDate);

  return unique;
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
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const resp = await fetchWithTimeout(proxyUrl, 5000);
    if (!resp.ok) return null;
    const html = await resp.text();
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (match) return match[1].replace(/&amp;/g, '&');
    return null;
  } catch {
    return null;
  }
}

export { CATEGORY_KEYWORDS };
