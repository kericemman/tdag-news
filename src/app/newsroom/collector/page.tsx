import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { collectorOperations } from "@/modules/collector/operations";
import { CollectorRetry } from "@/components/collector-retry";

export const dynamic = "force-dynamic";
export const metadata = { title: "Collector health | TDAG News", robots: { index: false, follow: false } };

export default async function CollectorPage() {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const operations = await collectorOperations().catch(() => null);
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">Operations</p><h1>Collector health</h1><p>Queue status and retained failed jobs. A failed job can be replayed after its cause is fixed.</p></div><Link href="/newsroom">Back to newsroom</Link></header>{operations ? <><div className="newsroom-queues">{operations.health.map((item) => <span key={item.queue}>{item.queue}: {item.waiting} waiting · {item.active} active · {item.delayed} delayed · {item.failed} failed</span>)}</div><h2>Failed jobs</h2>{operations.failed.length ? <div className="newsroom-submissions">{operations.failed.map((job) => <article className="newsroom-panel" key={`${job.queue}:${job.id}`}><p className="eyebrow">{job.queue} · {job.attemptsMade} attempts</p><h3>{job.name}</h3><p>{job.failedReason}</p><p className="newsroom-note">Job {job.id} · {new Date(job.timestamp).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p>{["super_admin", "editor"].includes(actor.role) && <CollectorRetry queue={job.queue} id={job.id} />}</article>)}</div> : <p>No retained failed jobs.</p>}</> : <p role="alert">Queue status is unavailable. Check Redis and the worker process.</p>}</main>;
}
