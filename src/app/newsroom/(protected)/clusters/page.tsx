import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { listClusters } from "@/modules/collector/clusters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Story clusters | TDAG News", robots: { index: false, follow: false } };

export default async function ClustersPage() {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const clusters = await listClusters();
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">Discovery</p><h1>Story clusters</h1><p>Source leads grouped by URL or closely matching headline and publication time. All remain unverified.</p></div><Link href="/newsroom">Back to newsroom</Link></header>{clusters.length ? <div className="newsroom-submissions">{clusters.map((cluster) => <article className="newsroom-panel" key={cluster.id}><p className="eyebrow">{cluster.verificationState} · {cluster.candidateIds.length} {cluster.candidateIds.length === 1 ? "lead" : "leads"} · {cluster.sourceIds.length} {cluster.sourceIds.length === 1 ? "source" : "sources"}</p><h2><Link href={`/newsroom/clusters/${cluster.id}`}>{cluster.title}</Link></h2><p className="newsroom-note">Event date {new Date(cluster.eventAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p></article>)}</div> : <p>No clusters yet. The worker groups new leads after collection.</p>}</main>;
}
