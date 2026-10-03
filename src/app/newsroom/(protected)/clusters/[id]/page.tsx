import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { getCluster } from "@/modules/collector/clusters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Story cluster | TDAG News", robots: { index: false, follow: false } };

export default async function ClusterPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const data = await getCluster((await params).id);
  if (!data) notFound();
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">Unverified story cluster</p><h1>{data.cluster.title}</h1><p>{data.candidates.length} source leads. Grouping is a discovery aid, not fact verification.</p></div><Link href="/newsroom/clusters">All clusters</Link></header><div className="newsroom-submissions">{data.candidates.map((candidate) => <article className="newsroom-panel" key={candidate.id}><p className="eyebrow">{candidate.sourceName} · {candidate.sourceAuthority} · {candidate.region}</p><h2>{candidate.title}</h2><p>{candidate.summary || "No summary supplied by the source."}</p><p><a href={candidate.canonicalUrl} target="_blank" rel="noopener noreferrer">Original source ↗</a></p><p className="newsroom-note">{candidate.publishedAt ? new Date(candidate.publishedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }) : "Publication date unknown"} · {candidate.clusterMatchReason?.replaceAll("_", " ") ?? "unclassified"}</p></article>)}</div></main>;
}
