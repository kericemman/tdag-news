import type { Metadata } from "next";
import { PageFrame, PageHeading, StoryList } from "@/components/publication-ui";
import { publicationRepository } from "@/modules/publication/repository";

export const metadata: Metadata = { title: "Search | TDAG News", description: "Search TDAG News coverage.", robots: { index: false, follow: true } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q;
  const query = (typeof raw === "string" ? raw : "").trim().slice(0, 150);
  const stories = query ? await publicationRepository.listStories({ query, limit: 30 }) : [];
  return <PageFrame><PageHeading eyebrow="Search" title="Find what matters" description="Search published TDAG News coverage." /><div className="site-shell standard-content"><form action="/search" method="get" className="search-form" role="search"><label htmlFor="site-search">Search stories</label><div><input id="site-search" name="q" type="search" defaultValue={query} minLength={2} maxLength={150} placeholder="Topic, company or question" /><button type="submit">Search</button></div></form>{query && <section aria-live="polite" className="search-results"><h2>{stories.length} {stories.length === 1 ? "result" : "results"} for “{query}”</h2>{stories.length ? <StoryList stories={stories} /> : <p>No published stories match this search yet. Try a broader topic or browse the <a href="/latest">latest coverage</a>.</p>}</section>}</div></PageFrame>;
}
