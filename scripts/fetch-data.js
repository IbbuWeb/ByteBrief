const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'js', 'data.json');

async function fetchGitHubTrending() {
  try {
    const queries = [
      'created:>2024-12-01&sort=stars&order=desc',
      'created:>2025-06-01&sort=stars&order=desc',
      'created:>2025-09-01&sort=stars&order=desc'
    ];
    
    let allRepos = [];
    
    for (const query of queries) {
      const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=20`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      if (!response.ok) break;
      const data = await response.json();
      allRepos = [...allRepos, ...(data.items || [])];
    }
    
    const seen = new Set();
    const unique = allRepos.filter(repo => {
      if (seen.has(repo.full_name)) return false;
      seen.add(repo.full_name);
      return true;
    });
    
    return unique.slice(0, 50).map(repo => ({
      name: repo.full_name,
      description: repo.description || '',
      stars: repo.stargazers_count,
      language: repo.language || 'Unknown',
      url: repo.html_url,
      trending: repo.stargazers_count > 50000 ? 'hot' : ''
    }));
  } catch (error) {
    console.error('GitHub fetch error:', error.message);
    return getFallbackRepos();
  }
}

function getFallbackRepos() {
  return [
    { name: 'openclaw/openclaw', description: 'Your own personal AI assistant', stars: 194404, language: 'TypeScript', url: 'https://github.com/openclaw/openclaw', trending: 'hot' },
    { name: 'anomalyco/opencode', description: 'The open source coding agent', stars: 104616, language: 'TypeScript', url: 'https://github.com/anomalyco/opencode', trending: 'hot' },
    { name: 'anthropics/skills', description: 'Public repository for Agent Skills', stars: 69855, language: 'Python', url: 'https://github.com/anthropics/skills', trending: 'hot' },
    { name: 'obra/superpowers', description: 'An agentic skills framework', stars: 51597, language: 'Shell', url: 'https://github.com/obra/superpowers', trending: 'hot' },
    { name: 'remotion-dev/remotion', description: 'Make videos programmatically with React', stars: 36594, language: 'TypeScript', url: 'https://github.com/remotion-dev/remotion', trending: 'hot' }
  ];
}

function getEvents() {
  const year = new Date().getFullYear();
  return [
    { title: 'NVIDIA GTC', date: `March 16-19, ${year}`, description: 'Premier AI conference', link: 'https://www.nvidia.com/gtc/', category: 'conference', icon: 'nvidia' },
    { title: 'Google I/O', date: `May 20-21, ${year}`, description: 'Google Annual Developer Conference', link: 'https://io.google/', category: 'conference', icon: 'google' },
    { title: 'Apple WWDC', date: `June, ${year}`, description: 'Apple Worldwide Developers Conference', link: 'https://developer.apple.com/wwdc/', category: 'conference', icon: 'apple' },
    { title: 'Microsoft Build', date: `May, ${year}`, description: 'Microsoft Developer Conference', link: 'https://build.microsoft.com/', category: 'conference', icon: 'microsoft' },
    { title: 'AWS re:Invent', date: `December, ${year}`, description: 'Amazon Web Services Conference', link: 'https://reinvent.awsevents.com/', category: 'conference', icon: 'aws' },
    { title: 'Black Hat', date: `August, ${year}`, description: 'Security Conference', link: 'https://www.blackhat.com/', category: 'conference', icon: 'security' },
    { title: 'React Conf', date: `May, ${year}`, description: 'React Conference', link: 'https://reactconf.com/', category: 'conference', icon: 'react' },
    { title: 'FOSDEM', date: `January/February, ${year}`, description: 'Free and Open Source Developers European Meeting', link: 'https://fosdem.org/', category: 'conference', icon: 'fosdem' }
  ];
}

function getPodcasts() {
  return [
    { name: 'Acquired', host: 'Ben Thompson & David Perrett', description: 'Deep dives on great tech companies & business strategy', image: 'acquired', link: 'https://www.acquired.fm/', category: 'business' },
    { name: 'The Stack Overflow Podcast', host: 'Stack Overflow', description: 'Conversations about code, development, and the future of tech', image: 'stackoverflow', link: 'https://stackoverflow.blog/podcast/', category: 'programming' },
    { name: 'Lex Fridman Podcast', host: 'Lex Fridman', description: 'AI, robotics, neuroscience, and the future of humanity', image: 'lex', link: 'https://lexfridman.com/podcast/', category: 'ai' },
    { name: 'Changelog', host: 'Jerod Santo & Adam Stacoviak', description: 'Open source, software, and web development', image: 'changelog', link: 'https://changelog.com/podcast', category: 'programming' },
    { name: 'Hard Fork', host: 'Casey Newton & Kevin Roose', description: 'Tech news, culture, and where it all goes next', image: 'hardfork', link: 'https://podcasts.apple.com/us/podcast/hard-fork/id1521431123', category: 'news' },
    { name: 'Waveform', host: 'MKBHD & Andrew', description: 'Tech reviews, deep dives, and behind the scenes', image: 'waveform', link: 'https://www.youtube.com/playlist?list=PLH9cR-NVtXBcxLmlS2J8a2VWGwR5H0tS', category: 'tech' },
    { name: 'Decoder', host: 'Nilay Patel', description: 'Big tech, business, and power', image: 'decoder', link: 'https://www.theverge.com/decoder-podcast', category: 'business' },
    { name: 'Darknet Diaries', host: 'Jack Rhysider', description: 'True stories from the dark side of the internet', image: 'darknet', link: 'https://darknetdiaries.com/', category: 'security' },
    { name: 'Accidental Tech Podcast', host: 'Marco Arment & Casey Liss', description: 'Apple, tech, programming, and coffee', image: 'atp', link: 'https://atp.fm/', category: 'apple' },
    { name: 'Syntax', host: 'Wes Bos & Scott Tolinski', description: 'Web development tips, tutorials, and advice', image: 'syntax', link: 'https://syntax.fm/', category: 'programming' }
  ];
}

function getDeals() {
  const month = new Date().toLocaleString('default', { month: 'short' });
  return [
    { title: 'Apple MacBook Pro M5', store: 'B&H Photo', price: 1549, originalPrice: 1799, discount: '14%', link: 'https://www.bhphotovideo.com/', category: 'laptop', expires: `Feb 28` },
    { title: 'Alienware 16 Area-51 RTX 5070 Ti', store: 'Woot', price: 1999, originalPrice: 3100, discount: '35%', link: 'https://www.woot.com/', category: 'laptop', expires: `Feb 23` },
    { title: 'Lenovo ThinkPad X1 Carbon', store: 'Lenovo', price: 1299, originalPrice: 1919, discount: '32%', link: 'https://www.lenovo.com/', category: 'laptop', expires: `Feb 24` },
    { title: 'Acer Nitro V RTX 4050', store: 'Amazon', price: 649, originalPrice: 899, discount: '28%', link: 'https://www.amazon.com/', category: 'laptop', expires: `Feb 25` },
    { title: 'MSI Thin RTX 4060', store: 'Best Buy', price: 829, originalPrice: 1099, discount: '25%', link: 'https://www.bestbuy.com/', category: 'laptop', expires: `Feb 26` },
    { title: 'ASUS ROG Strix G16 RTX 5060', store: 'Amazon', price: 1399, originalPrice: 1799, discount: '22%', link: 'https://www.amazon.com/', category: 'laptop', expires: `Feb 28` },
    { title: 'Samsung 990 Pro 2TB', store: 'Amazon', price: 149, originalPrice: 199, discount: '25%', link: 'https://www.amazon.com/', category: 'storage', expires: `Feb 25` },
    { title: 'Sony WH-1000XM5', store: 'Amazon', price: 279, originalPrice: 399, discount: '30%', link: 'https://www.amazon.com/', category: 'audio', expires: `Feb 23` },
    { title: 'LG UltraGear 27" 4K', store: 'Best Buy', price: 399, originalPrice: 549, discount: '27%', link: 'https://www.bestbuy.com/', category: 'monitor', expires: `Feb 28` },
    { title: 'Keychron Q1 Pro', store: 'Amazon', price: 159, originalPrice: 199, discount: '20%', link: 'https://www.amazon.com/', category: 'keyboard', expires: `Mar 5` },
    { title: 'Steam Deck OLED', store: 'Valve', price: 499, originalPrice: 549, discount: '9%', link: 'https://store.steampowered.com/', category: 'gaming', expires: `Mar 15` },
    { name: 'Corsair K100 RGB', store: 'Amazon', price: 169, originalPrice: 229, discount: '26%', link: 'https://www.amazon.com/', category: 'keyboard', expires: 'Mar 1' }
  ];
}

async function fetchData() {
  console.log('Fetching real data...');
  
  const github = await fetchGitHubTrending();
  const events = getEvents();
  const podcasts = getPodcasts();
  const deals = getDeals();
  
  const data = {
    events,
    github,
    podcasts,
    deals,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  console.log(`Data updated: ${github.length} repos, ${events.length} events, ${podcasts.length} podcasts, ${deals.length} deals`);
  console.log(`Last updated: ${data.lastUpdated}`);
}

fetchData().catch(console.error);
