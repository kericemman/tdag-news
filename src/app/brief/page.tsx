import Link from "next/link";
import { PageFrame, PageHeading, EmptyCoverage } from "@/components/publication-ui";
import { publicationRepository } from "@/modules/publication/repository";

export const dynamic = "force-dynamic";

export const metadata = { title: "TDAG Brief | TDAG News", description: "A concise briefing on the technology developments that matter.", robots: { index: false, follow: true } };

export default async function BriefIndexPage() {
  const briefs = await publicationRepository.listBriefs(30);
  return <PageFrame><PageHeading eyebrow="Daily intelligence" title="TDAG Brief" description="Important developments, with context and links to the original evidence." /><div className="site-shell standard-content">{briefs.length ? <div className="story-list">{briefs.map((brief) => <article className="story-row" key={brief.id}><p className="eyebrow">Daily Brief</p><h2><Link href={`/brief/${brief.slug}`}>{brief.title}</Link></h2><p>{brief.standfirst}</p><time dateTime={brief.publishedAt}>{new Intl.DateTimeFormat("en-KE", { dateStyle: "long", timeZone: "Africa/Nairobi" }).format(new Date(brief.publishedAt))}</time></article>)}</div> : <EmptyCoverage title="The first brief is being prepared" detail="A real, source-backed daily briefing will appear after editorial approval." />}</div></PageFrame>;
}
