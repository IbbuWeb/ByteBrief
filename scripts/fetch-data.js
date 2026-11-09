const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const {
  parseFeed,
  dedupeArticles,
  stripHtml,
  decodeEntities,
  extractOgImage,
  normalizeUrl,
  parseYouTubeChannel,
  parseYouTubeWatch
} = require('./lib/parse-feed');

const execFileAsync = promisify(execFile);

const DATA_FILE = path.join(__dirname, '..', 'js', 'data.json');
const EVENTS_FILE = path.join(__dirname, 'events.json');

const USER_AGENT =
  'ByteBrief/2.0 (+https://github.com/IbbuWeb/ByteBrief)';
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const MAX_ARTICLES = 240;
const MAX_VIDEO_ARTICLES = 18;
const PER_SOURCE_LIMIT = 15;
const VIDEOS_PER_CHANNEL = 6;
const VIDEO_MAX_AGE_DAYS = 31;
const CONCURRENCY = 6;
const OG_ENRICH_LIMIT = 80;
const OG_ENRICH_CONCURRENCY = 6;

const SOURCES = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'startups' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'tech' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'tech' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', category: 'tech' },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', category: 'ai' },
  { name: 'VentureBeat', url: 'https://feeds.feedburner.com/venturebeat/SZYF', category: 'ai' },
  { name: 'ZDNet', url: 'https://www.zdnet.com/news/rss.xml', category: 'tech' },
  { name: 'The Register', url: 'https://www.theregister.com/headlines.atom', category: 'tech' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', category: 'programming' },
  { name: 'Ars Gadgets', url: 'https://feeds.arstechnica.com/arstechnica/gadgets', category: 'hardware' },
  { name: '9to5Mac', url: 'https://9to5mac.com/feed/', category: 'hardware' },
  { name: 'TC Startups', url: 'https://techcrunch.com/category/startups/feed/', category: 'startups' },
  { name: 'Crunchbase News', url: 'https://news.crunchbase.com/feed/', category: 'startups' },
  { name: 'BBC Technology', url: 'https://www.bbc.com/news/technology/rss.xml', category: 'tech' },
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/', category: 'cybersecurity' },
  { name: 'Threatpost', url: 'https://threatpost.com/feed/', category: 'cybersecurity' },
  { name: 'CNET', url: 'https://www.cnet.com/rss/news/', category: 'tech' },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', category: 'tech' },
  { name: 'CSS-Tricks', url: 'https://css-tricks.com/feed/', category: 'programming' },
  { name: 'Stack Overflow Blog', url: 'https://stackoverflow.blog/feed/', category: 'programming' },
  { name: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'programming' },
  { name: 'The New Stack', url: 'https://thenewstack.io/feed/', category: 'programming' },
  { name: "Tom's Hardware", url: 'https://www.tomshardware.com/feeds/all', category: 'hardware' },
  { name: 'SiliconANGLE', url: 'https://siliconangle.com/feed/', category: 'tech' },
  { name: 'Tech.eu', url: 'https://tech.eu/feed/', category: 'startups' },
  { name: 'AWS News Blog', url: 'https://aws.amazon.com/blogs/aws/feed/', category: 'cloud' },
  { name: 'Azure Blog', url: 'https://azure.microsoft.com/en-us/blog/feed/', category: 'cloud' },
  { name: 'Android Developers', url: 'https://android-developers.googleblog.com/feeds/posts/default?alt=rss', category: 'mobile' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml', category: 'gaming' },
  { name: 'IGN', url: 'https://feeds.ign.com/ign/all', category: 'gaming' },
  { name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', category: 'science' },
  { name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/top.xml', category: 'science' },
  { name: 'EFF Updates', url: 'https://www.eff.org/rss/updates.xml', category: 'privacy' },
  { name: 'Open Source Initiative', url: 'https://opensource.org/feed', category: 'opensource' }
];

const YOUTUBE_CHANNELS = [
  { name: 'Fireship', handle: '@Fireship', category: 'programming' },
  { name: 'Marques Brownlee', handle: '@mkbhd', category: 'mobile' },
  { name: 'Linus Tech Tips', handle: '@LinusTechTips', category: 'hardware' },
  { name: 'Computerphile', handle: '@Computerphile', category: 'programming' },
  { name: 'The Verge', handle: '@TheVerge', category: 'tech' },
  { name: 'Mrwhosetheboss', handle: '@Mrwhosetheboss', category: 'mobile' },
  { name: 'Dave2D', handle: '@Dave2D', category: 'hardware' },
  { name: 'TechLinked', handle: '@TechLinked', category: 'tech' },
  { name: 'Android Authority', handle: '@AndroidAuthority', category: 'mobile' },
  { name: 'ColdFusion', handle: '@ColdFusion', category: 'tech' }
];

const PODCASTS = [
  {
    id: 1050462261,
    name: 'Acquired',
    host: 'Ben Gilbert & David Rosenthal',
    description: 'Deep dives into the companies and deals that shaped tech.',
    category: 'business',
    link: 'https://www.acquired.fm/'
  },
  {
    id: 1483510527,
    name: 'The Stack Overflow Podcast',
    host: 'Stack Overflow',
    description: 'Conversations about code, developers and the future of software.',
    category: 'programming',
    link: 'https://stackoverflow.blog/podcast/'
  },
  {
    id: 1434243584,
    name: 'Lex Fridman Podcast',
    host: 'Lex Fridman',
    description: 'Long-form conversations on AI, science, technology and humanity.',
    category: 'ai',
    link: 'https://lexfridman.com/podcast/'
  },
  {
    id: 341623264,
    name: 'Changelog',
    host: 'Jerod Santo & Adam Stacoviak',
    description: 'Open source, software engineering and the people building it.',
    category: 'programming',
    link: 'https://changelog.com/podcast'
  },
  {
    id: 1528594034,
    name: 'Hard Fork',
    host: 'Kevin Roose & Casey Newton',
    description: 'Tech news, culture and where the industry goes next.',
    category: 'news',
    link: 'https://www.nytimes.com/column/hard-fork'
  },
  {
    id: 1474429475,
    name: 'Waveform',
    host: 'Marques Brownlee & Andrew Manganelli',
    description: 'Tech reviews, deep dives and behind-the-scenes conversations.',
    category: 'tech',
    link: 'https://www.youtube.com/playlist?list=PLH9cR-NVtXBcxLmlS2J8a2VWGwR5H0tS'
  },
  {
    id: 1011668648,
    name: 'Decoder',
    host: 'Nilay Patel',
    description: 'Big tech, business, power and the decisions behind the products.',
    category: 'business',
    link: 'https://www.theverge.com/decoder-podcast'
  },
  {
    id: 1296350485,
    name: 'Darknet Diaries',
    host: 'Jack Rhysider',
    description: 'True stories from the dark side of the internet.',
    category: 'security',
    link: 'https://darknetdiaries.com/'
  },
  {
    id: 617416468,
    name: 'Accidental Tech Podcast',
    host: 'Marco Arment, Casey Liss & John Siracusa',
    description: 'Apple, programming, tech and the occasional coffee tangent.',
    category: 'apple',
    link: 'https://atp.fm/'
  },
  {
    id: 1613894378,
    name: 'Syntax',
    host: 'Wes Bos & Scott Tolinski',
    description: 'Web development tips, tools and practical advice.',
    category: 'programming',
    link: 'https://syntax.fm/'
  }
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchText(url, headers = {}) {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': USER_AGENT,
          Accept:
            'application/rss+xml, application/atom+xml, application/xml, text/xml, application/json, */*',
          ...headers
        }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt === 0) await sleep(800);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError;
}

async function fetchJson(url, headers = {}) {
  const text = await fetchText(url, headers);
  return JSON.parse(text);
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        results[index] = await worker(items[index], index);
      }
    }
  );

  await Promise.all(runners);
  return results;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function cleanDescription(source, description) {
  let value = decodeEntities(description || '').replace(/\s+/g, ' ').trim();

  if (source === 'Hacker News') {
    const points = value.match(/Points:\s*(\d+)/i)?.[1];
    const comments = value.match(/#\s*Comments:\s*(\d+)/i)?.[1];
    value = [points && `${points} points`, comments && `${comments} comments`]
      .filter(Boolean)
      .join(' · ');
  }

  if (source === 'Reddit Technology') {
    value = value
      .replace(/submitted by\s+\/u\/\S+/i, '')
      .replace(/\[link\]|\[comments\]/gi, '')
      .trim();
  }

  return value.slice(0, 300);
}

function isPublisherLink(article) {
  const source = SOURCES.find(entry => entry.name === article.source);
  if (!source) return false;

  try {
    const articleHost = new URL(article.link).hostname.replace(/^www\./, '');
    const feedHost = new URL(source.url).hostname.replace(/^www\./, '');
    return articleHost === feedHost || articleHost.endsWith(`.${feedHost}`);
  } catch {
    return false;
  }
}

async function enrichThumbnails(articles, previous) {
  const cached = new Map(
    (previous.articles || [])
      .filter(article => article.link && article.thumbnail)
      .map(article => [article.link, article.thumbnail])
  );

  const missing = [];
  for (const article of articles) {
    if (article.thumbnail) continue;

    const cachedImage = cached.get(article.link);
    if (cachedImage) {
      article.thumbnail = cachedImage;
      continue;
    }

    // Only fetch pages on the publisher's own host, never arbitrary HN targets.
    if (missing.length < OG_ENRICH_LIMIT && isPublisherLink(article)) {
      missing.push(article);
    }
  }

  if (missing.length === 0) return articles;

  console.log(`  Thumbnails: reading og:image for ${missing.length} stories`);

  await mapLimit(missing, OG_ENRICH_CONCURRENCY, async article => {
    try {
      const html = await fetchText(article.link, {
        Accept: 'text/html,application/xhtml+xml'
      });
      const image = extractOgImage(html, article.link);
      if (image) article.thumbnail = image;
    } catch (error) {
      console.warn(`  ! ${article.source} thumbnail: ${error.message}`);
    }
  });

  return articles;
}

async function fetchYouTubeArticles(previous = {}) {
  const articles = [];
  const minTime = Date.now() - VIDEO_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const ytHeaders = {
    Accept: 'text/html,application/xhtml+xml',
    'Accept-Language': 'en-US,en;q=0.9',
    'User-Agent': BROWSER_UA,
    Cookie: 'CONSENT=YES+cb.20210328-17-p0.en+FX+417; SOCS=CAISHAgBEhJnd3NfMjAyMTAzMjgtMTdfcDAaAmVuIAEaBgiA_LyaBg'
  };

  for (const ch of YOUTUBE_CHANNELS) {
    try {
      const url = `https://www.youtube.com/${ch.handle}/videos?hl=en&gl=US`;
      const res = await fetchText(url, ytHeaders);
      if (!res) continue;
      const channelVideos = parseYouTubeChannel(res, { limit: VIDEOS_PER_CHANNEL * 3 });
      let kept = 0;

      for (const video of channelVideos) {
        if (kept >= VIDEOS_PER_CHANNEL) break;
        const watchUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
        let publishedAt = null;
        try {
          const watchRes = await fetchText(`${watchUrl}&hl=en`, ytHeaders);
          const parsed = parseYouTubeWatch(watchRes);
          if (parsed?.publishedAt) publishedAt = parsed.publishedAt;
        } catch { /* optional enrichment */ }

        if (publishedAt) {
          const publishedTime = Date.parse(publishedAt);
          if (Number.isFinite(publishedTime) && publishedTime < minTime) continue;
        }

        articles.push({
          title: video.title,
          link: watchUrl,
          source: ch.name,
          category: ch.category,
          categories: [ch.category],
          publishedAt,
          thumbnail: video.thumbnail,
          videoId: video.videoId,
          video: true
        });
        kept += 1;
      }
    } catch (e) {
      console.warn(`  ! YouTube fetch for ${ch.name}: ${e.message}`);
    }
  }

  if (articles.length === 0) {
    const cached = (previous.articles || []).filter(article => {
      if (article?.video !== true) return false;
      const link = normalizeUrl(article.link);
      if (!link) return false;
      if (!article.publishedAt) return true;
      const t = Date.parse(article.publishedAt);
      return !Number.isFinite(t) || t >= minTime;
    });
    if (cached.length) console.warn(`  Keeping ${cached.length} cached YouTube videos`);
    return cached;
  }

  console.log(`  YouTube: ${articles.length} videos from ${YOUTUBE_CHANNELS.length} channels`);
  return articles;
}

async function fetchArticles(previous) {
  const failedSources = new Set();
  let freshCount = 0;

  const youtubeResults = await fetchYouTubeArticles(previous);

  const results = await mapLimit(SOURCES, CONCURRENCY, async source => {
    try {
      const xml = await fetchText(source.url);
      const items = parseFeed(xml, {
        source: source.name,
        url: source.url,
        category: source.category
      });

      if (items.length === 0) throw new Error('Feed returned no items');

      freshCount += items.length;

      return items.slice(0, PER_SOURCE_LIMIT).map(article => ({
        ...article,
        description: cleanDescription(source.name, article.description)
      }));
    } catch (error) {
      failedSources.add(source.name);
      console.warn(`  ! ${source.name}: ${error.message}`);
      return [];
    }
  });

  if (freshCount === 0 && youtubeResults.length === 0) {
    throw new Error('Every feed failed; keeping the previous data file untouched');
  }

  let articles = results.flat();
  articles = [...articles, ...youtubeResults];

  for (const sourceName of failedSources) {
    const previousArticles = (previous.articles || []).filter(
      article => article.source === sourceName
    );
    articles.push(...previousArticles);
  }

  articles = dedupeArticles(articles)
    .sort((a, b) => {
      const aTime = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bTime = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bTime - aTime;
    });

  const videos = articles.filter(article => article.video === true).slice(0, MAX_VIDEO_ARTICLES);
  const text = articles.filter(article => article.video !== true);
  const videoLinks = new Set(videos.map(article => article.link));
  articles = [...videos, ...text.filter(article => !videoLinks.has(article.link))].slice(0, MAX_ARTICLES);

  articles = await enrichThumbnails(articles, previous);

  console.log(
    `  Articles: ${articles.length} kept from ${SOURCES.length - failedSources.size}/${SOURCES.length} feeds`
  );

  return articles;
}

function parseGitHubTrending(html) {
  const rows = [
    ...html.matchAll(/<article class="Box-row">([\s\S]*?)<\/article>/g)
  ].map(match => match[1]);

  return rows
    .map(row => {
      const name = row.match(/<h2[^>]*>[\s\S]*?<a[^>]*href="\/([^"]+)"/i)?.[1];
      if (!name) return null;

      const description = stripHtml(
        row.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/i)?.[1] || ''
      );
      const language = stripHtml(
        row.match(/itemprop="programmingLanguage">([^<]+)</i)?.[1] || ''
      );
      const stars = Number(
        (row.match(/stargazers[\s\S]*?<\/svg>\s*([\d,]+)\s*<\/a>/i)?.[1] || '0').replace(
          /,/g,
          ''
        )
      );
      const starsToday = Number(
        (row.match(/([\d,]+)\s+stars today/i)?.[1] || '0').replace(/,/g, '')
      );

      return {
        name,
        description,
        language: language || 'Unknown',
        stars,
        starsToday,
        url: `https://github.com/${name}`
      };
    })
    .filter(Boolean);
}

async function fetchGitHubSearch() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 30);
  const created = since.toISOString().slice(0, 10);

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const url =
    'https://api.github.com/search/repositories?' +
    new URLSearchParams({
      q: `created:>${created} stars:>500 fork:false`,
      sort: 'stars',
      order: 'desc',
      per_page: '12'
    });

  const json = await fetchJson(url, headers);

  return (json.items || []).map(repo => ({
    name: repo.full_name,
    description: repo.description || '',
    language: repo.language || 'Unknown',
    stars: repo.stargazers_count || 0,
    starsToday: 0,
    url: repo.html_url
  }));
}

async function fetchGitHub(previous) {
  let repos = [];

  try {
    const html = await fetchText('https://github.com/trending?since=daily');
    repos = parseGitHubTrending(html);
    console.log(`  GitHub trending: ${repos.length} repos`);
  } catch (error) {
    console.warn(`  ! GitHub trending: ${error.message}`);
  }

  if (repos.length < 6) {
    try {
      const fallback = await fetchGitHubSearch();
      if (fallback.length > repos.length) {
        repos = fallback;
        console.log(`  GitHub search fallback: ${repos.length} repos`);
      }
    } catch (error) {
      console.warn(`  ! GitHub search: ${error.message}`);
    }
  }

  if (repos.length === 0) {
    const cached = previous.github || [];
    console.warn(`  Keeping ${cached.length} cached GitHub repos`);
    return cached;
  }

  const seen = new Set();
  return repos
    .filter(repo => {
      const key = repo.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

async function fetchPodcast(show, previousShow) {
  try {
    const json = await fetchJson(
      `https://itunes.apple.com/lookup?id=${show.id}&entity=podcastEpisode&limit=8`
    );

    const results = json.results || [];
    const collection = results.find(result => result.collectionId === show.id);
    const episodes = results
      .filter(result => result.wrapperType === 'podcastEpisode')
      .sort((a, b) => Date.parse(b.releaseDate) - Date.parse(a.releaseDate));

    const episode = episodes[0];

    return {
      name: show.name,
      host: show.host,
      description: show.description,
      category: show.category,
      link: collection?.collectionViewUrl || show.link,
      artwork: episode?.artworkUrl600 || collection?.artworkUrl600 || null,
      latestEpisode: episode
        ? {
            title: episode.trackName,
            publishedAt: new Date(episode.releaseDate).toISOString(),
            link: episode.trackViewUrl || show.link,
            duration: episode.trackTimeMillis || null
          }
        : previousShow?.latestEpisode || null
    };
  } catch (error) {
    console.warn(`  ! ${show.name}: ${error.message}`);
    return previousShow || null;
  }
}

async function fetchPodcasts(previous) {
  const previousByName = new Map(
    (previous.podcasts || []).map(podcast => [podcast.name, podcast])
  );

  const podcasts = await mapLimit(PODCASTS, 4, show =>
    fetchPodcast(show, previousByName.get(show.name))
  );

  const fresh = podcasts.filter(Boolean);
  console.log(`  Podcasts: ${fresh.length}/${PODCASTS.length} updated`);
  return fresh;
}

function loadEvents(previous) {
  const events = readJson(EVENTS_FILE);
  if (!Array.isArray(events) || events.length === 0) {
    return previous.events || [];
  }

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(
    2,
    '0'
  )}`;

  const sortKey = event =>
    event.status === 'tba'
      ? `${event.startMonth || '9999-12'}-01T00:00:00Z`
      : `${event.startDate || '9999-12-31'}T00:00:00Z`;

  const upcoming = events
    .filter(event => {
      if (event.status === 'tba') {
        return Boolean(event.startMonth) && event.startMonth >= currentMonth;
      }
      if (!event.startDate) return false;

      const end = event.endDate
        ? new Date(`${event.endDate}T23:59:59Z`)
        : new Date(`${event.startDate}T23:59:59Z`);
      return !Number.isNaN(end.getTime()) && end >= today;
    })
    .sort((a, b) => Date.parse(sortKey(a)) - Date.parse(sortKey(b)));

  return upcoming.length > 0 ? upcoming : previous.events || [];
}

async function main() {
  const previous = readJson(DATA_FILE) || {};

  console.log('Refreshing ByteBrief data...');

  const [articles, github, podcasts] = await Promise.all([
    fetchArticles(previous),
    fetchGitHub(previous),
    fetchPodcasts(previous)
  ]);

  const events = loadEvents(previous);

  const data = {
    generatedAt: new Date().toISOString(),
    articles,
    github,
    podcasts,
    events,
    sources: SOURCES.map(source => ({
      name: source.name,
      url: source.url,
      category: source.category
    }))
  };

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`);

  console.log(
    `Done: ${data.articles.length} articles, ${data.github.length} repos, ` +
      `${data.podcasts.length} podcasts, ${data.events.length} events, ` +
      `${data.sources.length} sources`
  );
  console.log(`Updated: ${data.generatedAt}`);
}

main().catch(error => {
  console.error(`Data refresh failed: ${error.message}`);
  process.exit(1);
});

