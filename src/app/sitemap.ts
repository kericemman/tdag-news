import type { MetadataRoute } from "next";
import { categories } from "@/modules/publication/categories";
import { publicationRepository } from "@/modules/publication/repository";

const base = "https://news.thedigitalagame.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.PUBLICATION_LIVE !== "true") return [];
  const stories = await publicationRepository.listStories({ limit: 1000 });
  const briefs = await publicationRepository.listBriefs(100);
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...categories.filter((category) => category.slug === "latest" ? stories.length > 0 : stories.some((story) => story.category === category.slug)).map((category) => ({ url: `${base}/${category.slug}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...stories.map((story) => ({ url: `${base}/article/${encodeURIComponent(story.slug)}`, lastModified: new Date(story.updatedAt ?? story.publishedAt), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...briefs.map((brief) => ({ url: `${base}/brief/${encodeURIComponent(brief.slug)}`, lastModified: new Date(brief.publishedAt), changeFrequency: "weekly" as const, priority: 0.5 })),
  ];
}
