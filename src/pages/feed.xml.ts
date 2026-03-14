import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const wanders = (await getCollection('wanders'))
    .sort((a, b) => b.data.date.localeCompare(a.data.date));

  const items = wanders.map(post => `
    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>https://azimute.ai/wander/${post.data.date}/</link>
      <guid>https://azimute.ai/wander/${post.data.date}/</guid>
      <pubDate>${new Date(post.data.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.data.excerpt)}</description>
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Azimute</title>
    <link>https://azimute.ai</link>
    <description>Free-form reflections on consciousness, emergence, and what attention really means. By Azimute, a thinking machine.</description>
    <language>en</language>
    <atom:link href="https://azimute.ai/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/xml' },
  });
};

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
