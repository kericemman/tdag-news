import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { getCluster } from "@/modules/collector/clusters";
import { latestClusterResearch } from "@/modules/ai/research";

export const dynamic = "force-dynamic";
export const metadata = { title: "Story cluster | TDAG News", robots: { index: false, follow: false } };

export default async function ClusterPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ research?: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const id = (await params).id;
  const data = await getCluster(id);
  if (!data) notFound();
  const pack = await latestClusterResearch(id);
  const result = (await searchParams).research;
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">Unverified story cluster</p><h1>{data.cluster.title}</h1><p>{data.candidates.length} source leads. Grouping is a discovery aid, not fact verification.</p></div><Link href="/newsroom/clusters">All clusters</Link></header>
    <section className="newsroom-panel research-panel" aria-labelledby="research-title"><div className="research-heading"><div><p className="eyebrow">EDITORIAL INTELLIGENCE</p><h2 id="research-title">Research starting point</h2></div><form action={`/api/newsroom/clusters/${encodeURIComponent(id)}/research`} method="post"><button className="newsroom-button" type="submit">{pack ? "Refresh research" : "Generate research"}</button></form></div><p className="newsroom-note">AI suggestions are unverified and require source review. They cannot publish or change a story.</p>
      {result === "unavailable" && <p role="alert" className="form-error">Research is unavailable until the OpenAI API key is configured.</p>}{result === "limit" && <p role="alert" className="form-error">The daily AI request limit has been reached. Try again tomorrow.</p>}{result === "failed" && <p role="alert" className="form-error">Research failed. The leads are still available below; try again later.</p>}
      {pack && <div className="research-result"><p><strong>Synopsis:</strong> {pack.synopsis}</p><h3>Source leads</h3><ul>{pack.sourceLeads.map((lead, index) => { const candidate = data.candidates.find((item) => item.id === lead.candidateId); return <li key={`${lead.candidateId}-${index}`}><strong>{candidate?.sourceName ?? "Source"}:</strong> {lead.relevance} <em>{lead.caveat}</em> {candidate && <a href={candidate.canonicalUrl} target="_blank" rel="noopener noreferrer">Open source ↗</a>}</li>; })}</ul><h3>Open questions</h3><ul>{pack.openQuestions.map((question, index) => <li key={index}>{question}</li>)}</ul><h3>Kenya and Africa relevance</h3><p>{pack.kenyaAfricaAngle}</p><h3>Next reporting steps</h3><ul>{pack.suggestedNextSteps.map((step, index) => <li key={index}>{step}</li>)}</ul><p className="newsroom-note">Generated {new Date(pack.createdAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} · {pack.model} · {pack.promptVersion} · {pack.usage.inputTokens + pack.usage.outputTokens} tokens</p></div>}
    </section><div className="newsroom-submissions">{data.candidates.map((candidate) => <article className="newsroom-panel" key={candidate.id}><p className="eyebrow">{candidate.sourceName} · {candidate.sourceAuthority} · {candidate.region}</p><h2>{candidate.title}</h2><p>{candidate.summary || "No summary supplied by the source."}</p><p><a href={candidate.canonicalUrl} target="_blank" rel="noopener noreferrer">Original source ↗</a></p><p className="newsroom-note">{candidate.publishedAt ? new Date(candidate.publishedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }) : "Publication date unknown"} · {candidate.clusterMatchReason?.replaceAll("_", " ") ?? "unclassified"}</p></article>)}</div></main>;
}
