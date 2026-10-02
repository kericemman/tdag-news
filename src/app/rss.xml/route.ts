import { publicationRepository } from "@/modules/publication/repository";
import { renderRss, rssHeaders } from "@/lib/rss";

export const dynamic = "force-dynamic";

export async function GET() {
  const stories = process.env.PUBLICATION_LIVE === "true" ? await publicationRepository.listStories({ limit: 30 }) : [];
  return new Response(renderRss("TDAG News", "Technology, business and Africa — explained.", stories), { headers: rssHeaders });
}
