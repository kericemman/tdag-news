import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { canEdit } from "@/modules/newsroom/policy";
import { listNewsroomStories } from "@/modules/newsroom/store";
import { NewsroomSignOut } from "@/components/newsroom-signout";

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
const futureQueues = ["Trending", "Research", "Media", "Subscribers", "Premium", "Distribution", "Analytics", "AI Operations", "Settings"];

export default async function NewsroomPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  const requested = (await searchParams).status;
  const selectedStatus = activeQueues.some((queue) => queue.status === requested) ? requested : undefined;
  const stories = await listNewsroomStories(100);
  const shown = selectedStatus ? stories.filter((story) => story.status === selectedStatus) : stories;

  return <main className="newsroom-shell">
    <header className="newsroom-top">
      <div><p className="eyebrow">TDAG News</p><h1>Newsroom</h1><p>Signed in as {actor.name} · {actor.role.replaceAll("_", " ")}</p></div>
      <div className="newsroom-actions">
        {canEdit(actor.role) && <Link className="newsroom-button" href="/newsroom/new">New story</Link>}
        {["super_admin", "editor", "researcher"].includes(actor.role) && <><Link href="/newsroom/incoming">Incoming</Link><Link href="/newsroom/clusters">Clusters</Link><Link href="/newsroom/sources">Sources</Link><Link href="/newsroom/entities">Entities</Link><Link href="/newsroom/opportunities">Opportunities</Link><Link href="/newsroom/collector">Collector health</Link></>}
        {["super_admin", "editor", "researcher"].includes(actor.role) && <Link href="/newsroom/submissions">Submissions</Link>}
        <Link href="/">View site</Link><NewsroomSignOut />
      </div>
    </header>
    <section aria-labelledby="queue-title">
      <h2 id="queue-title">Story queues</h2>
      <nav className="newsroom-queues" aria-label="Story queues">
        <Link href="/newsroom" aria-current={!selectedStatus ? "page" : undefined}>All · {stories.length}</Link>
        {activeQueues.map((queue) => <Link key={queue.status} href={`/newsroom?status=${queue.status}`} aria-current={selectedStatus === queue.status ? "page" : undefined}>{queue.label} · {stories.filter((story) => story.status === queue.status).length}</Link>)}
      </nav>
      <p className="newsroom-note">Additional modules will populate these queues when implemented: {futureQueues.join(", ")}.</p>
    </section>
    <section aria-labelledby="story-title">
      <h2 id="story-title">{selectedStatus ? activeQueues.find((queue) => queue.status === selectedStatus)?.label : "All stories"}</h2>
      {shown.length ? <div className="newsroom-table-wrap"><table className="newsroom-table"><thead><tr><th>Story</th><th>Status</th><th>Category</th><th>Revision</th><th>Updated</th></tr></thead><tbody>{shown.map((story) => <tr key={story.id}><td><Link href={`/newsroom/story/${story.id}`}>{story.headline}</Link></td><td>{story.status.replaceAll("_", " ")}</td><td>{story.category}</td><td>{story.revision}</td><td>{new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" }).format(new Date(story.updatedAt))}</td></tr>)}</tbody></table></div> : <p>No stories in this queue.</p>}
    </section>
  </main>;
}
