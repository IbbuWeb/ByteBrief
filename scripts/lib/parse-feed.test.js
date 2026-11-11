const test = require('node:test');
const assert = require('node:assert/strict');

const {
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
} = require('./parse-feed');

test('decodeEntities handles CDATA, named and numeric entities', () => {
  assert.equal(
    decodeEntities('<![CDATA[AI &amp; the future]]>'),
    'AI & the future'
  );
  assert.equal(decodeEntities('Tom&#39;s &quot;best&quot; &mdash; yet'), 'Tom\'s "best" — yet');
  assert.equal(decodeEntities('Caf&#233; &#x1F680;'), 'Café 🚀');
});

test('stripHtml removes scripts, tags and collapses whitespace', () => {
  const html = '<script>alert(1)</script><p>Hello <b>world</b>&nbsp; now</p>';
  assert.equal(stripHtml(html), 'Hello world now');
});

test('htmlToText keeps paragraph breaks', () => {
  const html = '<p>First <b>paragraph</b>.</p><p>Second paragraph.</p>';
  assert.equal(htmlToText(html), 'First paragraph.\n\nSecond paragraph.');
});

test('parseFeed keeps full feed content when the publisher provides it', () => {
  const xml = `<rss><channel>
    <item>
      <title>Long read</title>
      <link>https://example.com/long</link>
      <description>Short summary.</description>
      <content:encoded><![CDATA[<p>First section.</p><p>Second section.</p>]]></content:encoded>
    </item>
  </channel></rss>`;

  const [article] = parseFeed(xml, { source: 'Example', category: 'tech' });
  assert.equal(article.description, 'Short summary.');
  assert.equal(article.content, 'First section.\n\nSecond section.');
});

test('normalizeUrl keeps http(s) and strips tracking params', () => {
  assert.equal(
    normalizeUrl('https://example.com/post?utm_source=rss&utm_medium=feed&id=7'),
    'https://example.com/post?id=7'
  );
  assert.equal(normalizeUrl('javascript:alert(1)'), null);
  assert.equal(normalizeUrl('//example.com/post'), null);
  assert.equal(normalizeUrl('not a url'), null);
});

test('parseFeed parses RSS with CDATA, media thumbnail and author', () => {
  const xml = `<?xml version="1.0"?>
    <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <channel>
        <item>
          <title><![CDATA[AI &amp; the future]]></title>
          <link>https://example.com/post?utm_source=rss</link>
          <description><![CDATA[<p>Hello <b>world</b>&nbsp;now</p>]]></description>
          <pubDate>Wed, 05 Nov 2026 10:00:00 GMT</pubDate>
          <media:thumbnail url="https://example.com/img.jpg" />
          <dc:creator>Jane Doe</dc:creator>
          <category>AI</category>
        </item>
      </channel>
    </rss>`;

  const [article] = parseFeed(xml, {
    source: 'Example',
    url: 'https://example.com/feed',
    category: 'startups'
  });

  assert.equal(article.title, 'AI & the future');
  assert.equal(article.link, 'https://example.com/post');
  assert.equal(article.description, 'Hello world now');
  assert.equal(article.thumbnail, 'https://example.com/img.jpg');
  assert.equal(article.source, 'Example');
  assert.equal(article.author, 'Jane Doe');
  assert.equal(article.publishedAt, '2026-11-05T10:00:00.000Z');
  assert.ok(article.categories.includes('ai'));
  assert.ok(article.categories.includes('startups'));
  assert.match(article.id, /^[a-f0-9]{12}$/);
});

test('parseFeed keeps extensionless image URLs declared as images', () => {
  const xml = `<rss><channel>
    <item>
      <title>Register story</title>
      <link>https://example.com/story</link>
      <enclosure url="https://image.example.com/?imageId=42&amp;width=800" type="image/jpeg" />
    </item>
  </channel></rss>`;

  const [article] = parseFeed(xml, { source: 'Example', category: 'tech' });
  assert.equal(article.thumbnail, 'https://image.example.com/?imageId=42&width=800');
});

test('parseFeed parses Atom entries', () => {
  const xml = `<?xml version="1.0"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <entry>
        <title>Verge story</title>
        <link rel="alternate" href="https://www.theverge.com/story" />
        <summary>Something happened.</summary>
        <published>2026-11-05T10:00:00Z</published>
        <author><name>Nilay Patel</name></author>
      </entry>
    </feed>`;

  const [article] = parseFeed(xml, {
    source: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'hardware'
  });

  assert.equal(article.title, 'Verge story');
  assert.equal(article.link, 'https://www.theverge.com/story');
  assert.equal(article.description, 'Something happened.');
  assert.equal(article.author, 'Nilay Patel');
  assert.equal(article.publishedAt, '2026-11-05T10:00:00.000Z');
});

test('parseFeed drops items without a safe link', () => {
  const xml = `<rss><channel>
    <item><title>Bad</title><link>javascript:alert(1)</link></item>
    <item><title>Good</title><link>https://example.com/good</link></item>
  </channel></rss>`;

  const articles = parseFeed(xml, { source: 'Example', category: 'tech' });
  assert.equal(articles.length, 1);
  assert.equal(articles[0].title, 'Good');
});

test('parseFeed leaves a missing date as null', () => {
  const xml = `<rss><channel>
    <item><title>No date</title><link>https://example.com/a</link></item>
  </channel></rss>`;

  const [article] = parseFeed(xml, { source: 'Example', category: 'tech' });
  assert.equal(article.publishedAt, null);
});

test('detectCategories uses word boundaries and a fallback', () => {
  assert.deepEqual(detectCategories('OpenAI releases GPT-5 and a new LLM').slice(0, 2), ['ai']);
  assert.ok(detectCategories('Apple launches a new MacBook GPU').includes('hardware'));
  assert.ok(detectCategories('Startup raises a Series A funding round').includes('startups'));
  assert.ok(detectCategories('Critical zero-day exploit hits a browser').includes('cybersecurity'));
  assert.ok(detectCategories('New JavaScript framework for web development').includes('programming'));
  assert.deepEqual(detectCategories('A quiet day', 'tech'), ['tech']);
  assert.deepEqual(detectCategories('The company said it will ship', 'startups'), ['startups']);
});

test('parseDate rejects junk and returns ISO UTC', () => {
  assert.equal(parseDate('not a date'), null);
  assert.equal(parseDate(''), null);
  assert.equal(parseDate('Wed, 05 Nov 2026 10:00:00 GMT'), '2026-11-05T10:00:00.000Z');
});

test('extractOgImage reads social image metadata in either attribute order', () => {
  assert.equal(
    extractOgImage('<meta property="og:image" content="https://example.com/a.jpg">'),
    'https://example.com/a.jpg'
  );
  assert.equal(
    extractOgImage('<meta content="/img/b.jpg" name="og:image">', 'https://example.com/story'),
    'https://example.com/img/b.jpg'
  );
  assert.equal(
    extractOgImage('<meta content="https://example.com/c.jpg" name="twitter:image">'),
    'https://example.com/c.jpg'
  );
  assert.equal(
    extractOgImage('<meta property="og:image" content="data:image/png;base64,abc">'),
    null
  );
  assert.equal(extractOgImage('<p>no image</p>'), null);
});

test('dedupeArticles collapses the same story across sources', () => {
  const base = {
    description: '',
    thumbnail: null,
    source: 'A',
    publishedAt: null,
    categories: ['tech'],
    author: null
  };
  const articles = [
    { ...base, id: 'a', title: 'Same story', link: 'https://example.com/x?utm_source=a' },
    { ...base, id: 'b', title: 'Same story', link: 'https://example.com/x' },
    { ...base, id: 'c', title: 'Other', link: 'https://example.com/y' }
  ];

  assert.equal(dedupeArticles(articles).length, 2);
});

test('parseYouTubeFeed reads exact dates, view counts and skips bad entries', () => {
  const xml = `<feed>
    <entry>
      <yt:videoId>iw9SZgyahqg</yt:videoId>
      <title>The one thing holding CS together &amp; more</title>
      <published>2026-11-09T12:37:47+00:00</published>
      <media:group>
        <media:statistics views="1200000"/>
      </media:group>
    </entry>
    <entry>
      <yt:videoId>k2ruCf_z75I</yt:videoId>
      <title>North Korea stole $6.3 billion</title>
      <published>2026-11-06T08:42:38-08:00</published>
      <media:group>
        <media:statistics views="340000"/>
      </media:group>
    </entry>
    <entry>
      <yt:videoId>bad id</yt:videoId>
      <title>Broken</title>
    </entry>
    <entry>
      <yt:videoId>sh0rtSh0rt1</yt:videoId>
      <title>No stats</title>
      <published>2026-11-05T00:00:00+00:00</published>
    </entry>
  </feed>`;

  assert.deepEqual(parseYouTubeFeed(xml), [
    {
      videoId: 'iw9SZgyahqg',
      title: 'The one thing holding CS together & more',
      thumbnail: 'https://i.ytimg.com/vi/iw9SZgyahqg/hq720.jpg',
      publishedAt: '2026-11-09T12:37:47.000Z',
      views: 1200000
    },
    {
      videoId: 'k2ruCf_z75I',
      title: 'North Korea stole $6.3 billion',
      thumbnail: 'https://i.ytimg.com/vi/k2ruCf_z75I/hq720.jpg',
      publishedAt: '2026-11-06T16:42:38.000Z',
      views: 340000
    },
    {
      videoId: 'sh0rtSh0rt1',
      title: 'No stats',
      thumbnail: 'https://i.ytimg.com/vi/sh0rtSh0rt1/hq720.jpg',
      publishedAt: '2026-11-05T00:00:00.000Z',
      views: null
    }
  ]);
  assert.equal(parseYouTubeFeed(xml, { limit: 1 }).length, 1);
  assert.deepEqual(parseYouTubeFeed('<feed></feed>'), []);
});
