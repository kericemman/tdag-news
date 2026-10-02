import type { StorySummary } from "@/modules/publication/repository";
import { escapeXml } from "@/lib/xml";

const base = "https://news.thedigitalagame.com";

export function renderRss(title: string, description: string, stories: StorySummary[]): string {
  const items = stories.map((story) => {
    const url = `${base}/article/${encodeURIComponent(story.slug)}`;
    return `<item><title>${escapeXml(story.headline)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid><description>${escapeXml(story.standfirst)}</description><pubDate>${new Date(story.publishedAt).toUTCString()}</pubDate></item>`;
  }).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeXml(title)}</title><link>${base}</link><description>${escapeXml(description)}</description><language>en</language>${items}</channel></rss>`;
}

export const rssHeaders = { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300" };
