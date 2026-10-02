import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { publicationRepository } from "@/modules/publication/repository";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await publicationRepository.getArticle(slug);
  if (!article) return { title: "Article not found", robots: { index: false } };
  return {
    title: `${article.headline} | TDAG News`, description: article.standfirst,
    alternates: { canonical: `/article/${article.slug}` },
    robots: { index: process.env.PUBLICATION_LIVE === "true", follow: true },
    openGraph: { type: "article", title: article.headline, description: article.standfirst, publishedTime: article.publishedAt, modifiedTime: article.updatedAt ?? article.publishedAt },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await publicationRepository.getArticle(slug);
  if (!article) notFound();
  return <ArticleView article={article} />;
}
