import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/json-ld";
import type { StorySummary } from "@/modules/publication/repository";

export function PageFrame({ children }: { children: React.ReactNode }) {
  return <><JsonLd data={{ "@context": "https://schema.org", "@type": "NewsMediaOrganization", name: "TDAG News", url: "https://news.thedigitalagame.com", parentOrganization: { "@type": "Organization", name: "The Digital A-Game", url: "https://thedigitalagame.com" } }} /><SiteHeader /><main id="main-content">{children}</main><SiteFooter /></>;
}

export function SiteFooter() {
  return <footer className="site-footer"><div className="site-shell"><div className="footer-top"><div className="footer-intro"><Link className="footer-wordmark" href="/">TDAG <span>NEWS</span></Link><p>Clear, verified technology news and intelligence for Kenya, Africa and the world.</p><a className="footer-parent" href="https://thedigitalagame.com">Part of The Digital A-Game <span aria-hidden="true">↗</span></a></div><nav aria-label="Explore coverage"><h2>Explore</h2><Link href="/latest">Latest stories</Link><Link href="/kenya">Kenya tech</Link><Link href="/africa">Africa tech</Link><Link href="/ai">Artificial intelligence</Link><Link href="/brief">TDAG Brief</Link></nav><nav aria-label="About TDAG News"><h2>About us</h2><Link href="/about">Our newsroom</Link><Link href="/editorial-policy">Editorial policy</Link><Link href="/corrections">Corrections</Link><Link href="/authors">Authors</Link><Link href="/contact">Contact</Link></nav><nav aria-label="Policies"><h2>Information</h2><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/sponsored-content-policy">Sponsored content policy</Link><Link href="/premium">Premium</Link></nav></div><div className="footer-bottom"><span>© {new Date().getFullYear()} TDAG News. All rights reserved.</span><span>Independent reporting. Human editorial approval.</span><Link href="#main-content">Back to top ↑</Link></div></div></footer>;
}

export function PageHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return <header className="page-heading site-shell">{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p>{description}</p>}</header>;
}

export function EmptyCoverage({ title = "No stories published here yet", detail = "TDAG News will show verified coverage here once an editor has approved it." }: { title?: string; detail?: string }) {
  return <div className="empty-coverage"><h2>{title}</h2><p>{detail}</p><Link href="/about">How TDAG News works <span aria-hidden="true">→</span></Link></div>;
}

export function StoryList({ stories }: { stories: StorySummary[] }) {
  if (!stories.length) return <EmptyCoverage />;
  return <div className="story-list">{stories.map((story) => <article className="story-row" key={story.id}><p className="eyebrow">{story.category} · {story.type}</p><h2><Link href={`/article/${story.slug}`}>{story.headline}</Link></h2><p>{story.standfirst}</p><small>{story.authorName} · <time dateTime={story.publishedAt}>{new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeZone: "Africa/Nairobi" }).format(new Date(story.publishedAt))}</time></small></article>)}</div>;
}
