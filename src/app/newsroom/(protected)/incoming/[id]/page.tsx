import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { getCandidate } from "@/modules/collector/store";
import { getCandidateEmbedding, similarCandidates } from "@/modules/ai/vectors";
import { EmbedCandidateButton } from "@/components/embed-candidate-button";

export const dynamic = "force-dynamic";
export const metadata = { title: "Source lead | TDAG News", robots: { index: false, follow: false } };

export default async function CandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const id = (await params).id;
  const candidate = await getCandidate(id);
  if (!candidate) notFound();
  const [embedding, similar] = await Promise.all([getCandidateEmbedding(id), similarCandidates(id)]);
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">UNVERIFIED SOURCE LEAD</p><h1>{candidate.title}</h1><p>{candidate.sourceName} · {candidate.sourceAuthority} · {candidate.region}</p></div><Link href="/newsroom/incoming">Incoming queue</Link></header>
    <div className="newsroom-panel"><p>{candidate.summary || "No summary supplied by the source."}</p><p><a href={candidate.canonicalUrl} target="_blank" rel="noopener noreferrer">Open original source ↗</a></p><p className="newsroom-note">Detected {new Date(candidate.detectedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} · {candidate.status} · {candidate.verificationState}{candidate.clusterId && <> · <Link href={`/newsroom/clusters/${candidate.clusterId}`}>View cluster</Link></>}</p></div>
    <section className="newsroom-panel research-panel" aria-labelledby="similar-title"><div className="research-heading"><div><p className="eyebrow">DISCOVERY AID</p><h2 id="similar-title">Semantically related leads</h2></div><EmbedCandidateButton candidateId={id} /></div><p className="newsroom-note">Similarity helps find possible overlap. It does not prove that two leads describe the same event or verify either source.</p>
      {embedding && <p className="newsroom-note">Vector: {embedding.model} · {embedding.dimensions} dimensions · updated {new Date(embedding.updatedAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p>}
      {similar.status === "missing_embedding" && <p>Build a vector for this lead to search for related items.</p>}{similar.status === "stale_embedding" && <p>This lead changed after its vector was built. Rebuild it before searching for related items.</p>}{similar.status === "index_unavailable" && <p>Atlas Vector Search is not ready. The saved lead and vector remain available.</p>}{similar.status === "ready" && (similar.matches.length ? <ul className="similar-leads">{similar.matches.map(({ candidate: match, score }) => <li key={match.id}><Link href={`/newsroom/incoming/${match.id}`}>{match.title}</Link><span>{match.sourceName} · similarity score {score.toFixed(2)}</span></li>)}</ul> : <p>No related indexed leads found yet.</p>)}
    </section>
  </main>;
}
