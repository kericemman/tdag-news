import { getCategory } from "@/modules/publication/categories";
import { publicationRepository } from "@/modules/publication/repository";
import { renderRss, rssHeaders } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return new Response("Not found", { status: 404 });
  const stories = process.env.PUBLICATION_LIVE === "true" ? await publicationRepository.listStories({ category: slug === "latest" ? undefined : slug, limit: 30 }) : [];
  return new Response(renderRss(`${category.label} | TDAG News`, category.description, stories), { headers: rssHeaders });
}
