import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageFrame, PageHeading } from "@/components/publication-ui";
import { publicationRepository } from "@/modules/publication/repository";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brief = await publicationRepository.getBrief(slug);
  return brief ? { title: `${brief.title} | TDAG News`, description: brief.standfirst, alternates: { canonical: `/brief/${slug}` }, robots: { index: process.env.PUBLICATION_LIVE === "true" } } : { title: "Brief not found", robots: { index: false } };
}

export default async function BriefPage({ params }: Props) {
  const { slug } = await params;
  const brief = await publicationRepository.getBrief(slug);
  if (!brief) notFound();
  return <PageFrame><PageHeading eyebrow="TDAG Brief" title={brief.title} description={brief.standfirst} /><div className="site-shell standard-content brief-items"><p className="article-meta"><time dateTime={brief.publishedAt}>{new Intl.DateTimeFormat("en-KE", { dateStyle: "long", timeZone: "Africa/Nairobi" }).format(new Date(brief.publishedAt))}</time></p>{brief.items.map((item, index) => <article key={item.id}><p className="eyebrow">{String(index + 1).padStart(2, "0")}</p><h2>{item.articleSlug ? <Link href={`/article/${item.articleSlug}`}>{item.headline}</Link> : item.headline}</h2><p>{item.summary}</p><h3>Why it matters</h3><p>{item.whyItMatters}</p>{item.sources.length > 0 && <div className="brief-sources"><strong>Sources</strong><ul>{item.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} — {source.title}</a></li>)}</ul></div>}</article>)}</div></PageFrame>;
}
