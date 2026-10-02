import { publicationRepository } from "@/modules/publication/repository";
import { escapeXml } from "@/lib/xml";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = Date.now();
  const stories = process.env.PUBLICATION_LIVE === "true" ? await publicationRepository.listStories({ limit: 1000 }) : [];
  const recentNews = stories.filter((story) => story.type === "news" && now - Date.parse(story.publishedAt) <= 48 * 60 * 60 * 1000 && Date.parse(story.publishedAt) <= now);
  const urls = recentNews.map((story) => `<url><loc>https://news.thedigitalagame.com/article/${escapeXml(encodeURIComponent(story.slug))}</loc><news:news><news:publication><news:name>TDAG News</news:name><news:language>en</news:language></news:publication><news:publication_date>${escapeXml(story.publishedAt)}</news:publication_date><news:title>${escapeXml(story.headline)}</news:title></news:news></url>`).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300" } });
}
