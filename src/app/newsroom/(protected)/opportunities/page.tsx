import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { listOpportunities } from "@/modules/collector/opportunities";
import { OpportunityForm, VerifyOpportunity } from "@/components/opportunity-controls";

export const dynamic = "force-dynamic";
export const metadata = { title: "Opportunities | TDAG News", robots: { index: false, follow: false } };

export default async function OpportunitiesPage() {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const opportunities = await listOpportunities();
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">Discovery</p><h1>Opportunities</h1><p>Only official-page checks by an editor can mark a proposal verified. No opportunity is public from this queue.</p></div><Link href="/newsroom">Back to newsroom</Link></header><div className="newsroom-editor-grid"><section>{opportunities.length ? <div className="newsroom-submissions">{opportunities.map((opportunity) => <article className="newsroom-panel" key={opportunity.id}><p className="eyebrow">{opportunity.kind} · {opportunity.status}</p><h2>{opportunity.title}</h2><p>Deadline: {new Date(opportunity.deadlineAt).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" })} EAT · {opportunity.location}</p><p>Eligibility: {opportunity.eligibility}</p><p>Fee: {opportunity.fee} · Funding: {opportunity.funding}</p><p><a href={opportunity.officialUrl} target="_blank" rel="noopener noreferrer">Official page ↗</a></p>{opportunity.notes && <p>{opportunity.notes}</p>}{opportunity.status === "proposed" && ["super_admin", "editor"].includes(actor.role) && <VerifyOpportunity id={opportunity.id} />}</article>)}</div> : <p>No opportunities proposed yet.</p>}</section><aside><OpportunityForm /></aside></div></main>;
}
