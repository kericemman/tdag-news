import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame, PageHeading, StoryList } from "@/components/publication-ui";
import { publicationRepository } from "@/modules/publication/repository";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await publicationRepository.getAuthor(slug);
  return author ? { title: `${author.name} | TDAG News`, description: author.biography, alternates: { canonical: `/author/${slug}` }, robots: { index: process.env.PUBLICATION_LIVE === "true" } } : { title: "Author not found", robots: { index: false } };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await publicationRepository.getAuthor(slug);
  if (!author) notFound();
  const stories = await publicationRepository.listStories({ limit: 30 });
  return <PageFrame><PageHeading eyebrow="Author" title={author.name} description={author.biography} /><div className="site-shell standard-content"><StoryList stories={stories.filter((story) => story.authorName === author.name)} /></div></PageFrame>;
}
