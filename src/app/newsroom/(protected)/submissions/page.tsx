import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { listSubmissions } from "@/modules/newsroom/submission";
import { SubmissionActions } from "@/components/submission-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Submissions | TDAG News", robots: { index: false, follow: false } };

export default async function SubmissionsPage() {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const submissions = await listSubmissions();
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">TDAG News</p><h1>Submissions</h1><p>Leads for independent editorial assessment.</p></div><Link href="/newsroom">Back to newsroom</Link></header>{submissions.length ? <div className="newsroom-submissions">{submissions.map((item) => <article className="newsroom-panel" key={item.id}><p className="eyebrow">{item.storyType} · {item.status}</p><h2>{item.headline}</h2><p>{item.description}</p><p>From {item.name}{item.organization && `, ${item.organization}`} · <a href={`mailto:${item.email}`}>{item.email}</a></p>{item.embargoAt && <p>Embargo: <time dateTime={item.embargoAt}>{new Date(item.embargoAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</time></p>}{item.supportingUrls.length > 0 && <ul>{item.supportingUrls.map((url) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>)}</ul>}{item.notes && <p>Notes: {item.notes}</p>}{["super_admin", "editor"].includes(actor.role) && <SubmissionActions id={item.id} status={item.status} />}</article>)}</div> : <p>No submissions received.</p>}</main>;
}
