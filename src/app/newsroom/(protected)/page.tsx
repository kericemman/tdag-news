import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { canEdit } from "@/modules/newsroom/policy";
import { listNewsroomStories } from "@/modules/newsroom/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsroom | TDAG News", robots: { index: false, follow: false } };

const activeQueues = [
  { label: "Drafts", status: "draft" },
  { label: "Editorial Review", status: "editorial_review" },
  { label: "Ready for Owner Review", status: "ready_for_review" },
  { label: "Owner Review", status: "owner_review" },
  { label: "Scheduled", status: "scheduled" },
  { label: "Published", status: "published" },
  { label: "Updated", status: "updated" },
];
export default async function NewsroomPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  const requested = (await searchParams).status;
  const selectedStatus = activeQueues.some((queue) => queue.status === requested) ? requested : undefined;
  const stories = await listNewsroomStories(100);
  const shown = selectedStatus ? stories.filter((story) => story.status === selectedStatus) : stories;

  const count = (status: string) => stories.filter((story) => story.status === status).length;
  return <main className="newsroom-shell newsroom-dashboard">
    <header className="newsroom-top dashboard-heading"><div><p className="eyebrow">EDITORIAL OVERVIEW</p><h1>Good to see you, {actor.name.split(" ")[0]}.</h1><p>Your stories, reviews and publication status in one place.</p></div>{canEdit(actor.role) && <Link className="newsroom-button" href="/newsroom/new">Create story <span aria-hidden="true">↗</span></Link>}</header>
    <section className="dashboard-metrics" aria-label="Story status summary"><Link href="/newsroom?status=draft"><span>Drafts</span><strong>{count("draft")}</strong><small>Work in progress</small></Link><Link href="/newsroom?status=editorial_review"><span>Editorial review</span><strong>{count("editorial_review") + count("ready_for_review") + count("owner_review")}</strong><small>Awaiting a decision</small></Link><Link href="/newsroom?status=scheduled"><span>Scheduled</span><strong>{count("scheduled")}</strong><small>Awaiting manual release</small></Link><Link href="/newsroom?status=published"><span>Published</span><strong>{count("published") + count("updated")}</strong><small>Live coverage</small></Link></section>
    <section aria-labelledby="queue-title">
      <div className="dashboard-section-heading"><div><p className="eyebrow">WORKFLOW</p><h2 id="queue-title">Story queues</h2></div><span>Showing the 100 most recently updated stories</span></div>
      <nav className="newsroom-queues" aria-label="Story queues">
        <Link href="/newsroom" aria-current={!selectedStatus ? "page" : undefined}>All · {stories.length}</Link>
        {activeQueues.map((queue) => <Link key={queue.status} href={`/newsroom?status=${queue.status}`} aria-current={selectedStatus === queue.status ? "page" : undefined}>{queue.label} · {stories.filter((story) => story.status === queue.status).length}</Link>)}
      </nav>
    </section>
    <section aria-labelledby="story-title">
      <div className="dashboard-section-heading"><div><p className="eyebrow">STORY LIST</p><h2 id="story-title">{selectedStatus ? activeQueues.find((queue) => queue.status === selectedStatus)?.label : "All stories"}</h2></div></div>
      {shown.length ? <div className="newsroom-table-wrap"><table className="newsroom-table"><thead><tr><th>Story</th><th>Status</th><th>Category</th><th>Revision</th><th>Updated</th></tr></thead><tbody>{shown.map((story) => <tr key={story.id}><td><Link href={`/newsroom/story/${story.id}`}>{story.headline}</Link></td><td><span className="admin-status-pill">{story.status.replaceAll("_", " ")}</span></td><td>{story.category}</td><td>{story.revision}</td><td>{new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" }).format(new Date(story.updatedAt))}</td></tr>)}</tbody></table></div> : <div className="dashboard-empty"><span aria-hidden="true">✧</span><h3>No stories in this queue</h3><p>New editorial work will appear here when it is created or moved into this stage.</p>{canEdit(actor.role) && <Link href="/newsroom/new">Create a story ↗</Link>}</div>}
    </section>
  </main>;
}
