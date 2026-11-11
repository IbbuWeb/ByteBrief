const crypto = require('node:crypto');

const ALLOWED_CATEGORIES = new Set([
  'ai',
  'programming',
  'hardware',
  'startups',
  'cybersecurity',
  'tech',
  'cloud',
  'mobile',
  'gaming',
  'science',
  'opensource',
  'privacy',
  'business'
]);

const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'igshid',
  'ref_src',
  'ref_url'
]);

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  copy: '©',
  reg: '®',
  trade: '™',
  times: '×',
  middot: '·',
  bull: '•'
};

const CATEGORY_KEYWORDS = {
  ai: [
    'ai',
    'artificial intelligence',
    'machine learning',
    'deep learning',
    'llm',
    'llms',
    'gpt',
    'chatgpt',
    'openai',
    'anthropic',
    'claude',
    'gemini',
    'neural network',
    'neural networks',
    'generative',
    'model training',
    'inference'
  ],
  programming: [
    'programming',
    'developer',
    'developers',
    'code',
    'coding',
    'software',
    'javascript',
    'typescript',
    'python',
    'rust',
    'golang',
    'react',
    'github',
    'api',
    'open source',
    'web development',
    'database',
    'devops',
    'kubernetes',
    'framework',
    'compiler'
  ],
  hardware: [
    'hardware',
    'chip',
    'chips',
    'processor',
    'gpu',
    'cpu',
    'apple',
    'iphone',
    'ipad',
    'macbook',
    'android',
    'laptop',
    'device',
    'semiconductor',
    'nvidia',
    'amd',
    'intel',
    'qualcomm',
    'tablet',
    'wearable',
    'robot',
    'robotics'
  ],
  startups: [
    'startup',
    'startups',
    'venture',
    'vc',
    'funding',
    'raises',
    'raised',
    'series a',
    'series b',
    'series c',
    'seed round',
    'unicorn',
    'founder',
    'founders',
    'ipo',
    'acquisition',
    'acquires'
  ],
  cybersecurity: [
    'security',
    'hack',
    'hacked',
    'hacker',
    'hackers',
    'breach',
    'cyber',
    'cybersecurity',
    'privacy',
    'malware',
    'ransomware',
    'encryption',
    'vulnerability',
    'exploit',
    'phishing',
    'zero day',
    'patch'
  ],
  cloud: [
    'cloud',
    'aws',
    'azure',
    'gcp',
    'google cloud',
    'kubernetes',
    'serverless',
    'saas',
    'iaas',
    'paas',
    'data center',
    'datacenter',
    'lambda',
    'containers'
  ],
  mobile: [
    'mobile',
    'smartphone',
    'ios',
    'android',
    'app store',
    'wearable',
    'tablet',
    'iphone',
    'ipad'
  ],
  gaming: [
    'game',
    'games',
    'gaming',
    'esports',
    'playstation',
    'xbox',
    'nintendo',
    'steam',
    'vr',
    'virtual reality'
  ],
  science: [
    'science',
    'research',
    'nasa',
    'space',
    'physics',
    'biology',
    'quantum',
    'telescope',
    'climate',
    'experiment'
  ],
  opensource: [
    'open source',
    'linux',
    'kernel',
    'foss',
    'apache',
    'mozilla',
    'gitlab',
    'github'
  ],
  privacy: [
    'privacy',
    'surveillance',
    'tracking',
    'gdpr',
    'anonymous',
    'data protection'
  ],
  business: [
    'business',
    'earnings',
    'revenue',
    'market',
    'stock',
    'ceo',
    'profit',
    'acquisition'
  ]
};

function decodeEntities(input = '') {
  let text = String(input);
  text = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

  for (let pass = 0; pass < 2; pass += 1) {
    const next = text.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]+);/gi, (match, body) => {
      if (body[0] === '#') {
        const isHex = body[1] === 'x' || body[1] === 'X';
        const code = Number.parseInt(body.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
        try {
          return String.fromCodePoint(code);
        } catch {
          return match;
        }
      }

      return NAMED_ENTITIES[body.toLowerCase()] ?? match;
    });

    if (next === text) break;
    text = next;
  }

  return text;
}

function stripHtml(input = '') {
  return decodeEntities(input)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlToText(input = '') {
  return decodeEntities(input)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t\f\v]+/g, ' ')
    .replace(/\r/g, '')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeUrl(raw = '') {
  if (typeof raw !== 'string') return null;
  const value = decodeEntities(raw).trim();
  if (!value || value.startsWith('//')) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith('utm_') || TRACKING_PARAMS.has(key.toLowerCase())) {
        url.searchParams.delete(key);
      }
    }

    url.hash = '';
    return url.href;
  } catch {
    return null;
  }
}

function hashId(value) {
  return crypto.createHash('sha1').update(value).digest('hex').slice(0, 12);
}

function extractTag(raw, tag) {
  const pattern = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i');
  return raw.match(pattern)?.[1] ?? '';
}

function getAtomLink(raw) {
  const links = [...raw.matchAll(/<link\b([^>]*)\/?>/gi)];
  const preferred =
    links.find(match => /rel=["']alternate["']/i.test(match[1])) || links[0];
  if (!preferred) return null;
  return normalizeUrl(preferred[1].match(/href=["']([^"']+)["']/i)?.[1] ?? '');
}

function getRssLink(raw) {
  return normalizeUrl(extractTag(raw, 'link'));
}

function looksLikeImage(url, extra = '') {
  const type = extra.match(/type=["']([^"']+)["']/i)?.[1] ?? '';
  const medium = extra.match(/medium=["']([^"']+)["']/i)?.[1] ?? '';
  if (/^image\//i.test(type) || /^image$/i.test(medium)) return true;
  return /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(url);
}

function normalizeImage(raw = '', extra = '') {
  const value = decodeEntities(raw).trim();
  if (!value) return null;
  if (value.startsWith('//')) return normalizeUrl(`https:${value}`);
  const url = normalizeUrl(value);
  if (!url) return null;
  return looksLikeImage(url, extra) ? url : null;
}

function getThumbnail(raw) {
  const mediaTags = [...raw.matchAll(/<media:(?:thumbnail|content)\b([^>]*)\/?>/gi)];
  for (const match of mediaTags) {
    const url = match[1].match(/url=["']([^"']+)["']/i)?.[1];
    if (url && looksLikeImage(url, match[1])) return normalizeImage(url, match[1]);
  }

  const enclosure = raw.match(/<enclosure\b([^>]*)\/?>/i);
  if (enclosure) {
    const url = enclosure[1].match(/url=["']([^"']+)["']/i)?.[1];
    if (url && looksLikeImage(url, enclosure[1])) return normalizeImage(url, enclosure[1]);
  }

  const imageTag = raw.match(/<img\b[^>]*src=["']([^"']+)["']/i)?.[1];
  return imageTag ? normalizeImage(imageTag) : null;
}

function getAuthor(raw) {
  const value =
    extractTag(raw, 'dc:creator') ||
    extractTag(raw, 'author') ||
    '';
  return stripHtml(value).slice(0, 80) || null;
}

function extractOgImage(html = '', baseUrl = '') {
  if (typeof html !== 'string' || !html) return null;

  const patterns = [
    /<meta[^>]+(?:property|name)=["']og:image(?::url)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']og:image(?::url)?["']/i,
    /<meta[^>]+(?:property|name)=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']twitter:image(?::src)?["']/i
  ];

  for (const pattern of patterns) {
    const raw = html.match(pattern)?.[1];
    if (!raw) continue;

    try {
      const absolute = new URL(decodeEntities(raw).trim(), baseUrl || undefined).href;
      const normalized = normalizeUrl(absolute);
      if (normalized) return normalized;
    } catch {
      // Try the next metadata tag.
    }
  }

  return null;
}

function parseDate(input) {
  if (!input) return null;
  const value = decodeEntities(String(input)).trim();
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getUTCFullYear();
  if (year < 2000 || year > new Date().getUTCFullYear() + 1) return null;

  return date.toISOString();
}

function detectCategories(text, fallback = 'tech') {
  const haystack = ` ${decodeEntities(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;

  const found = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => haystack.includes(` ${keyword} `))) {
      found.push(category);
    }
  }

  if (found.length === 0 && fallback) found.push(fallback);

  return [...new Set(found)]
    .filter(category => ALLOWED_CATEGORIES.has(category))
    .slice(0, 3);
}

function parseFeed(xml, config = {}) {
  if (typeof xml !== 'string' || !xml) return [];

  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const blocks = isAtom
    ? [...xml.matchAll(/<entry[\s>]([\s\S]*?)<\/entry>/gi)].map(match => match[1])
    : [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)].map(match => match[1]);

  const articles = [];

  for (const raw of blocks) {
    const title = stripHtml(extractTag(raw, 'title')).slice(0, 300);
    const link = isAtom ? getAtomLink(raw) : getRssLink(raw);
    if (!title || !link) continue;

    const descriptionSource =
      extractTag(raw, 'description') ||
      extractTag(raw, 'summary') ||
      extractTag(raw, 'content:encoded') ||
      extractTag(raw, 'content');
    const contentSource =
      extractTag(raw, 'content:encoded') ||
      extractTag(raw, 'content') ||
      descriptionSource;

    const description = stripHtml(descriptionSource).slice(0, 300);
    const content = htmlToText(contentSource).slice(0, 12000);
    const thumbnail = getThumbnail(raw);
    const publishedAt = parseDate(
      extractTag(raw, 'pubDate') ||
        extractTag(raw, 'published') ||
        extractTag(raw, 'updated') ||
        extractTag(raw, 'dc:date')
    );
    const author = getAuthor(raw);
    const feedCategories = [...raw.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)]
      .map(match => stripHtml(match[1]).toLowerCase())
      .filter(category => ALLOWED_CATEGORIES.has(category));

    const detected = detectCategories(`${title} ${description}`, config.category || 'tech');
    const categories = [
      ...new Set([...detected, ...feedCategories, config.category].filter(Boolean))
    ].slice(0, 3);

    articles.push({
      id: hashId(link),
      title,
      link,
      description,
      content,
      thumbnail,
      source: config.source || 'Unknown',
      publishedAt,
      categories: categories.length > 0 ? categories : ['tech'],
      author
    });
  }

  return articles;
}

function normalizeTitle(title = '') {
  return String(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

// Channel RSS carries exact upload dates and view counts.
function parseYouTubeFeed(xml, { limit = 50 } = {}) {
  const videos = [];

  for (const match of String(xml || '').matchAll(/<entry>([\s\S]*?)<\/entry>/gi)) {
    if (videos.length >= limit) break;
    const raw = match[1];
    const videoId = extractTag(raw, 'yt:videoId').trim();
    const title = stripHtml(extractTag(raw, 'title')).slice(0, 300);
    if (!YOUTUBE_ID.test(videoId) || !title) continue;

    const rawViews = raw.match(/<media:statistics\b[^>]*views=["'](\d+)["']/i)?.[1];
    const views = rawViews ? Number(rawViews) : null;

    videos.push({
      videoId,
      title,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hq720.jpg`,
      publishedAt: parseDate(extractTag(raw, 'published')),
      views: Number.isFinite(views) ? views : null
    });
  }

  return videos;
}

function dedupeArticles(articles) {
  const seenLinks = new Set();
  const seenTitles = new Set();

  return articles.filter(article => {
    const link = normalizeUrl(article.link) || article.link;
    const title = normalizeTitle(article.title);

    if (!link || seenLinks.has(link)) return false;
    if (title && seenTitles.has(title)) return false;

    seenLinks.add(link);
    if (title) seenTitles.add(title);
    return true;
  });
}

module.exports = {
  decodeEntities,
  stripHtml,
  htmlToText,
  normalizeUrl,
  parseFeed,
  detectCategories,
  parseDate,
  extractOgImage,
  dedupeArticles,
  parseYouTubeFeed
};
