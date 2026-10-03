import Image from "next/image";
import Link from "next/link";
import type { ArticleBlock, PublicSource, PublishedArticle, RichTextPart } from "@/modules/publication/repository";
import { PageFrame } from "./publication-ui";
import { JsonLd } from "./json-ld";

const dateFormatter = new Intl.DateTimeFormat("en-KE", { dateStyle: "long", timeZone: "Africa/Nairobi" });

function InlineParts({ parts, sources }: { parts: RichTextPart[]; sources: PublicSource[] }) {
  const byId = new Map(sources.map((source) => [source.id, source]));
  return <>{parts.map((part, index) => { let content: React.ReactNode = part.text; if (part.marks?.includes("bold")) content = <strong>{content}</strong>; if (part.marks?.includes("italic")) content = <em>{content}</em>; return <span key={`${index}-${part.text.slice(0, 12)}`}>{content}{part.sourceIds?.map((id) => { const source = byId.get(id); return source ? <sup key={id} className="citation"><a href={`#source-${source.number}`} aria-label={`Source ${source.number}: ${source.title}`}>[{source.number}]</a></sup> : null; })}</span>; })}</>;
}

function ArticleContentBlock({ block, sources }: { block: ArticleBlock; sources: PublicSource[] }) {
  switch (block.kind) {
    case "paragraph": return <p id={block.id}><InlineParts parts={block.parts} sources={sources} /></p>;
    case "heading": return block.level === 2 ? <h2 id={block.id}>{block.text}</h2> : <h3 id={block.id}>{block.text}</h3>;
    case "quote": return <blockquote id={block.id}><InlineParts parts={[{ text: block.text, sourceIds: block.sourceIds }]} sources={sources} />{block.attribution && <cite>{block.attribution}</cite>}</blockquote>;
    case "callout": return <aside id={block.id} className="context-panel"><h2>{block.label}</h2><p><InlineParts parts={block.parts} sources={sources} /></p></aside>;
    case "list": return <ul id={block.id}>{block.items.map((parts, index) => <li key={index}><InlineParts parts={parts} sources={sources} /></li>)}</ul>;
    case "media": return <figure id={block.id} className="article-media"><Image src={block.src} alt={block.alt} width={block.width} height={block.height} unoptimized sizes="(max-width: 800px) 100vw, 760px" /><figcaption>{block.caption} · {block.credit}</figcaption></figure>;
  }
}

export function ArticleView({ article }: { article: PublishedArticle }) {
  const canonical = `https://news.thedigitalagame.com/article/${article.slug}`;
  const schema = {
    "@context": "https://schema.org", "@type": article.type === "news" ? "NewsArticle" : "Article",
    headline: article.headline, description: article.standfirst, mainEntityOfPage: canonical,
    datePublished: article.publishedAt, dateModified: article.updatedAt ?? article.publishedAt,
    author: { "@type": article.authorName === "TDAG News Team" ? "Organization" : "Person", name: article.authorName },
    publisher: { "@type": "NewsMediaOrganization", name: "TDAG News", url: "https://news.thedigitalagame.com" },
    ...(article.hero ? { image: [new URL(article.hero.src, canonical).toString()] } : {}),
    citation: article.sources.map((source) => source.url),
  };
  return <PageFrame><JsonLd data={schema} /><div className="site-shell article-layout"><article><header className="article-head"><p className="eyebrow">{article.category} · {article.type}</p><h1>{article.headline}</h1><p className="standfirst">{article.standfirst}</p><div className="article-meta"><span>By {article.authorName}</span><time dateTime={article.publishedAt}>Published {dateFormatter.format(new Date(article.publishedAt))}</time>{article.updatedAt && <time dateTime={article.updatedAt}>Updated {dateFormatter.format(new Date(article.updatedAt))}</time>}<span>{article.readingMinutes} min read</span></div></header>{article.hero && <figure className="article-media hero-media"><Image src={article.hero.src} alt={article.hero.alt} width={article.hero.width} height={article.hero.height} priority unoptimized sizes="(max-width: 800px) 100vw, 760px" />{article.hero.caption && <figcaption>{article.hero.caption}{article.hero.credit && ` · ${article.hero.credit}`}</figcaption>}</figure>}<hr className="article-rule" /><div className="article-body">{article.blocks.map((block) => <ArticleContentBlock key={block.id} block={block} sources={article.sources} />)}</div>{article.correction && <aside className="correction-notice"><h2>Correction</h2><time dateTime={article.correction.publishedAt}>{dateFormatter.format(new Date(article.correction.publishedAt))}</time><p>{article.correction.note}</p></aside>}<section className="sources" aria-labelledby="sources-heading"><h2 id="sources-heading">Sources &amp; further reading</h2>{article.sources.length ? <ol>{article.sources.map((source) => <li key={source.id} id={`source-${source.number}`}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} — {source.title}</a><span>{source.authority}</span></li>)}</ol> : <p>No source records are attached to this article.</p>}</section>{article.topics.length > 0 && <nav className="article-topics" aria-label="Article topics">{article.topics.map((topic) => <Link href={`/topic/${topic.slug}`} key={topic.slug}>{topic.label}</Link>)}</nav>}</article><aside className="article-aside" aria-label="Article context"><h2>Why this story matters</h2><p>TDAG News connects important developments to evidence and explains their relevance to Kenya, Africa and the wider technology world.</p><div className="source-placeholder">{article.sources.length} cited {article.sources.length === 1 ? "source" : "sources"}</div></aside></div></PageFrame>;
}
