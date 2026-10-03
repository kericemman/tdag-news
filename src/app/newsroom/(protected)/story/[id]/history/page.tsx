import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { getNewsroomStory, listStoryHistory } from "@/modules/newsroom/store";
import { revisionChanges } from "@/modules/newsroom/revisions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Story history | TDAG News", robots: { index: false, follow: false } };

export default async function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  const { id } = await params;
  const story = await getNewsroomStory(id);
  if (!story) notFound();
  const history = await listStoryHistory(id);
  const revisions = [...history.revisions].reverse();
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">TDAG News / Audit</p><h1>Revision history</h1><p>{story.headline}</p></div><Link href={`/newsroom/story/${id}`}>Back to editor</Link></header><ol className="newsroom-history">{revisions.map((item, index) => <li key={item.revision}><h2>Revision {item.revision}</h2><p><time dateTime={item.at}>{new Date(item.at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</time> · Actor {item.actorId}</p><p>Changed: {revisionChanges(revisions[index - 1]?.snapshot, item.snapshot).join(", ") || "No content fields"}</p><details><summary>View saved body</summary><pre>{JSON.stringify(item.snapshot.document, null, 2)}</pre></details></li>)}</ol></main>;
}
