import Link from "next/link";
import { PageFrame, StoryList } from "@/components/publication-ui";
import { publicationRepository } from "@/modules/publication/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [stories, briefs] = await Promise.all([
    publicationRepository.listStories({ limit: 12 }),
    publicationRepository.listBriefs(1),
  ]);
  const lead = stories[0];
  return <PageFrame>
    <section className="home-intro site-shell"><p className="eyebrow">Technology news &amp; intelligence</p><h1>Too much is happening in technology.<br /><em>You don&apos;t need all of it.</em></h1><p>TDAG News finds the developments that matter, checks the sources and explains what they mean for Kenya, Africa and you.</p></section>
    <div className="site-shell home-grid"><div><section className="home-lead" aria-labelledby="lead-title"><div className="section-heading"><h2 id="lead-title">The lead</h2><span>Editorial selection</span></div>{lead ? <article><p className="eyebrow">{lead.category}</p><h3><Link href={`/article/${lead.slug}`}>{lead.headline}</Link></h3><p>{lead.standfirst}</p></article> : <div className="home-honest-empty"><p>Our first lead story will appear after editorial review.</p><Link href="/editorial-policy">Read how we work <span aria-hidden="true">→</span></Link></div>}</section><section className="home-latest" aria-labelledby="latest-title"><div className="section-heading"><h2 id="latest-title">Latest</h2><Link href="/latest">View all</Link></div><StoryList stories={stories.slice(lead ? 1 : 0, 7)} /></section></div><aside className="home-side"><section><p className="eyebrow">TDAG Brief</p><h2>Make sense of the day.</h2>{briefs[0] ? <Link href={`/brief/${briefs[0].slug}`}>{briefs[0].title}</Link> : <p>The daily briefing will appear here once the newsroom publishes its first edition.</p>}<Link href="/brief">Explore the brief <span aria-hidden="true">→</span></Link></section><section><p className="eyebrow">Focus</p><h2>What matters to you?</h2><p>Follow the topics and roles that shape your work. Personalization will be available as accounts open.</p><Link href="/for-you">About For You <span aria-hidden="true">→</span></Link></section></aside></div>
    <section className="home-sections site-shell" aria-label="Coverage areas"><div className="section-heading"><h2>Explore our coverage</h2></div><div className="coverage-links"><Link href="/ai">AI</Link><Link href="/africa">Africa Tech</Link><Link href="/kenya">Kenya Tech</Link><Link href="/business">Business</Link><Link href="/developers">Developers</Link><Link href="/opportunities">Opportunities</Link><Link href="/explainers">Explainers</Link></div></section>
    <section className="newsletter-tease"><div className="site-shell"><p className="eyebrow">Free email briefing</p><h2>The important developments, with context.</h2><p>Email subscriptions will open when the newsroom is ready to deliver verified coverage.</p></div></section>
  </PageFrame>;
}
