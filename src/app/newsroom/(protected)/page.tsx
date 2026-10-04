import Link from "next/link";
import { redirect } from "next/navigation";
import { readConfig } from "@/lib/config";
import { listSources } from "@/modules/collector/store";
import { currentStaff } from "@/modules/newsroom/auth";
import { canEdit } from "@/modules/newsroom/policy";
import { listNewsroomStories, newsroomStoryCounts } from "@/modules/newsroom/store";
import { countStoryView, resolveStoryView, storyViews } from "@/modules/newsroom/views";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsroom | TDAG News", robots: { index: false, follow: false } };

export default async function NewsroomPage({ searchParams }: { searchParams: Promise<{ view?: string; status?: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  const query = await searchParams;
  const selected = resolveStoryView(query.view, query.status);
  const [stories, counts, sources] = await Promise.all([listNewsroomStories(100, selected.statuses), newsroomStoryCounts(), listSources()]);
  const total = countStoryView(counts, []);
  const activeSources = sources.filter((source) => source.status === "active").length;
  const redisConfigured = Boolean(readConfig().REDIS_URL);
  const canCreate = canEdit(actor.role);
  const shownCount = countStoryView(counts, selected.statuses);

  return <main className="newsroom-shell newsroom-dashboard">
    <header className="newsroom-top dashboard-heading"><div><p className="eyebrow">EDITORIAL DESK</p><h1>Good to see you, {actor.name.split(" ")[0]}.</h1><p>Move each story from reporting to publication with a clear record of the decision.</p></div>{canCreate && <Link className="newsroom-button" href="/newsroom/new">Create story <span aria-hidden="true">↗</span></Link>}</header>

    <section className="dashboard-metrics" aria-label="Story status summary">{storyViews.filter((view) => view.key !== "all").map((view) => <Link key={view.key} href={`/newsroom?view=${view.key}`}><span>{view.label}</span><strong>{countStoryView(counts, view.statuses)}</strong><small>{view.key === "drafts" ? "Work in progress" : view.key === "review" ? "Needs editorial or owner action" : view.key === "scheduled" ? "Awaiting manual release" : "Published or updated"}</small></Link>)}</section>

    {(total === 0 || activeSources === 0 || !redisConfigured) && <section className="dashboard-setup" aria-labelledby="setup-title"><div className="dashboard-setup-heading"><div><p className="eyebrow">GETTING STARTED</p><h2 id="setup-title">Make the newsroom useful</h2><p>These are the next steps for the core editorial workflow. Empty queues will populate only after real work enters the system.</p></div><span>{[total > 0, activeSources > 0, redisConfigured].filter(Boolean).length} of 3 ready</span></div><div className="dashboard-setup-steps"><div className={total > 0 ? "is-ready" : ""}><span className="setup-step-number">01</span><div><strong>{total > 0 ? "Story workflow started" : "Create the first story"}</strong><p>Draft original reporting, then add sources and citations before review.</p>{total === 0 && canCreate && <Link href="/newsroom/new">Open story editor ↗</Link>}</div></div><div className={activeSources > 0 ? "is-ready" : ""}><span className="setup-step-number">02</span><div><strong>{activeSources > 0 ? `${activeSources} active source${activeSources === 1 ? "" : "s"}` : "Approve a source"}</strong><p>Propose an official source and activate it after checking access and editorial value.</p>{activeSources === 0 && <Link href="/newsroom/sources">Open source registry ↗</Link>}</div></div><div className={redisConfigured ? "is-ready" : ""}><span className="setup-step-number">03</span><div><strong>{redisConfigured ? "Redis configured" : "Connect the collector"}</strong><p>{redisConfigured ? "Check worker health before relying on automatic collection." : "Redis and the separate worker are needed for feed collection and clustering."}</p>{redisConfigured && <Link href="/newsroom/collector">Check worker health ↗</Link>}</div></div></div></section>}

    <section aria-labelledby="queue-title"><div className="dashboard-section-heading"><div><p className="eyebrow">WORKFLOW</p><h2 id="queue-title">Story queues</h2></div><span>{shownCount > stories.length ? `Showing ${stories.length} of ${shownCount} stories` : `${shownCount} ${shownCount === 1 ? "story" : "stories"}`}</span></div><nav className="newsroom-queues" aria-label="Story queues">{storyViews.map((view) => <Link key={view.key} href={view.key === "all" ? "/newsroom" : `/newsroom?view=${view.key}`} aria-current={selected.key === view.key ? "page" : undefined}>{view.label} · {countStoryView(counts, view.statuses)}</Link>)}</nav></section>

    <section aria-labelledby="story-title"><div className="dashboard-section-heading"><div><p className="eyebrow">STORY LIST</p><h2 id="story-title">{selected.label}</h2></div></div>{stories.length ? <div className="newsroom-table-wrap"><table className="newsroom-table"><thead><tr><th>Story</th><th>Status</th><th>Category</th><th>Revision</th><th>Updated</th></tr></thead><tbody>{stories.map((story) => <tr key={story.id}><td><Link href={`/newsroom/story/${story.id}`}>{story.headline}</Link></td><td><span className="admin-status-pill">{story.status.replaceAll("_", " ")}</span></td><td>{story.category}</td><td>{story.revision}</td><td>{new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" }).format(new Date(story.updatedAt))}</td></tr>)}</tbody></table></div> : <div className="dashboard-empty"><span aria-hidden="true">✧</span><h3>{selected.key === "all" ? "No stories yet" : `No stories in ${selected.label.toLowerCase()}`}</h3><p>{selected.key === "all" ? "Create a real draft to begin the editorial workflow." : "This queue has no stories. You can check all stories or continue reporting."}</p>{canCreate && selected.key === "all" ? <Link href="/newsroom/new">Create a story ↗</Link> : <Link href="/newsroom">View all stories ↗</Link>}</div>}</section>
  </main>;
}
