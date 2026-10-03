import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { listCandidates, listSources, type CandidateRecord } from "@/modules/collector/store";
import { CandidateControls, ManualCandidateForm } from "@/components/collector-controls";
import { latestCandidateClassifications } from "@/modules/ai/classification";

export const dynamic = "force-dynamic";
export const metadata = { title: "Incoming | TDAG News", robots: { index: false, follow: false } };
const statuses: CandidateRecord["status"][] = ["new", "triaged", "researching", "ignored", "rejected", "merged"];

export default async function IncomingPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const requested = (await searchParams).status;
  const status = statuses.includes(requested as CandidateRecord["status"]) ? requested as CandidateRecord["status"] : "new";
  const [candidates, sources] = await Promise.all([listCandidates(status), listSources()]);
  const classifications = await latestCandidateClassifications(candidates.map((candidate) => candidate.id));
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">TDAG News</p><h1>Incoming</h1><p>Source leads are unverified until independently researched.</p></div><Link href="/newsroom">Back to newsroom</Link></header><nav className="newsroom-queues" aria-label="Candidate status">{statuses.map((item) => <Link key={item} href={`/newsroom/incoming?status=${item}`} aria-current={status === item ? "page" : undefined}>{item.replaceAll("_", " ")}</Link>)}</nav><div className="newsroom-editor-grid"><section><h2>{status} leads</h2>{candidates.length ? <div className="newsroom-submissions">{candidates.map((candidate) => { const classification = classifications.get(candidate.id); return <article className="newsroom-panel" key={candidate.id}><p className="eyebrow">{candidate.sourceName} · {candidate.sourceAuthority} · {candidate.region}</p><h2><Link href={`/newsroom/incoming/${candidate.id}`}>{candidate.title}</Link></h2><p>{candidate.summary || "No summary supplied by the source."}</p><p><a href={candidate.canonicalUrl} target="_blank" rel="noopener noreferrer">Open original source</a></p><p className="newsroom-note">Detected {new Date(candidate.detectedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} · {candidate.verificationState} · media {candidate.mediaState}</p>{classification && <div className="candidate-ai-note"><strong>AI triage · unverified</strong><p>{classification.category} · {classification.geography} · {classification.importance} importance{classification.opportunityPotential ? " · possible opportunity" : ""}</p><p>{classification.rationale}</p>{classification.missingEvidence.length > 0 && <p><strong>Still needed:</strong> {classification.missingEvidence.join("; ")}</p>}<small>{classification.model} · {classification.promptVersion}</small></div>}<CandidateControls candidate={candidate} canReject={["super_admin", "editor"].includes(actor.role)} /></article>; })}</div> : <p>No leads in this queue.</p>}</section><aside><ManualCandidateForm sources={sources.filter((source) => source.status === "active" && source.type === "manual")} /></aside></div></main>;
}
