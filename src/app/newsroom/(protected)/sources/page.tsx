import Link from "next/link";
import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";
import { listFetches, listSources } from "@/modules/collector/store";
import { SourceControls, SourceForm } from "@/components/collector-controls";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sources | TDAG News", robots: { index: false, follow: false } };

export default async function SourcesPage() {
  const actor = await currentStaff();
  if (!actor) redirect("/newsroom/sign-in");
  if (!["super_admin", "editor", "researcher"].includes(actor.role)) redirect("/newsroom");
  const sources = await listSources();
  const histories = await Promise.all(sources.map((source) => listFetches(source.id, 3)));
  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow">TDAG News</p><h1>Source registry</h1><p>Only active approved feeds are collected.</p></div><Link href="/newsroom">Back to newsroom</Link></header><div className="newsroom-editor-grid"><section><h2>Registered sources</h2>{sources.length ? <div className="newsroom-submissions">{sources.map((source, index) => <article className="newsroom-panel" key={source.id}><p className="eyebrow">{source.type} · {source.status} · {source.authority}</p><h2>{source.name}</h2><p><a href={source.homepage} target="_blank" rel="noopener noreferrer">{source.homepage}</a></p><p>{source.region} · {source.topics.join(", ") || "No topics"}</p><p className="newsroom-note">{source.accessNotes || "No access notes recorded."}</p><p>Next fetch: {source.nextFetchAt ? new Date(source.nextFetchAt).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" }) : "Not scheduled"} · failures: {source.failureCount}</p>{["super_admin", "editor"].includes(actor.role) && <SourceControls source={source} />}<details><summary>Recent fetches</summary>{histories[index].length ? <ul>{histories[index].map((fetch) => <li key={fetch.id}>{fetch.at} · {fetch.status} · {fetch.found} found, {fetch.inserted} new{fetch.error && ` · ${fetch.error}`}</li>)}</ul> : <p>No fetches yet.</p>}</details></article>)}</div> : <p>No sources registered. Proposed sources need a human activation decision.</p>}</section><aside><SourceForm /></aside></div></main>;
}
