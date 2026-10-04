"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { categories } from "@/modules/publication/categories";
import type { StaffRole } from "@/modules/newsroom/policy";
import { checkStoryQuality } from "@/modules/newsroom/quality";
import type { EditorDocument, StoryInput, StoryRecord } from "@/modules/newsroom/story";

type AuditItem = { action: string; at: string; reason?: string };
type Props = { story?: StoryRecord; actorRole: StaffRole; history?: AuditItem[] };
const emptyDocument: EditorDocument = { type: "doc", content: [{ type: "paragraph", content: [] }] };

function initialInput(story?: StoryRecord): StoryInput {
  return story ? { slug: story.slug, headline: story.headline, standfirst: story.standfirst, type: story.type, category: story.category, authorName: story.authorName, document: story.document, sources: story.sources, citations: story.citations, claims: story.claims, hero: story.hero } : {
    slug: "", headline: "", standfirst: "", type: "news", category: "ai", authorName: "TDAG News Team", document: emptyDocument, sources: [], citations: [], claims: [],
  };
}

function blockPreview(node: EditorDocument["content"][number]): string {
  if (node.type === "paragraph" || node.type === "heading") return node.content.map((part) => part.text).join("").slice(0, 100);
  if (node.type === "blockquote") return node.content.map((line) => line.content.map((part) => part.text).join("")).join(" ").slice(0, 100);
  return node.content.map((item) => item.content.map((line) => line.content.map((part) => part.text).join("")).join(" ")).join(" ").slice(0, 100);
}

export function NewsroomEditor({ story, actorRole, history = [] }: Props) {
  const [form, setForm] = useState<StoryInput>(() => initialInput(story));
  const [revision, setRevision] = useState(story?.revision ?? 0);
  const [status, setStatus] = useState(story?.status ?? "draft");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sourcePublisher, setSourcePublisher] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [claimText, setClaimText] = useState("");
  const [reason, setReason] = useState("");
  const [scheduleLocal, setScheduleLocal] = useState("");
  const firstRender = useRef(true);
  const inFlight = useRef(false);
  const revisionRef = useRef(revision);
  const canWrite = ["super_admin", "editor", "writer"].includes(actorRole) && ["draft", "editorial_review", "ready_for_review"].includes(status) || actorRole === "super_admin" && ["published", "updated"].includes(status);
  const editor = useEditor({ extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, codeBlock: false, horizontalRule: false, hardBreak: false, code: false, link: false, strike: false, underline: false })], content: form.document, immediatelyRender: false, editable: canWrite,
    onUpdate: ({ editor }) => setForm((previous) => ({ ...previous, document: editor.getJSON() as EditorDocument })) });

  useEffect(() => { editor?.setEditable(canWrite); }, [editor, canWrite]);

  const update = <K extends keyof StoryInput>(key: K, value: StoryInput[K]) => setForm((previous) => ({ ...previous, [key]: value }));

  async function save(input = form): Promise<number | null> {
    if (inFlight.current) return null;
    inFlight.current = true; setBusy(true); setMessage("Saving…");
    try {
      const response = await fetch(story ? `/api/newsroom/stories/${story.id}` : "/api/newsroom/stories", {
        method: story ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story ? { expectedRevision: revisionRef.current, input } : input),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(response.status === 409 ? "This story changed in another session. Reload before editing again." : result.code === "INVALID_INPUT" ? `Check required fields and editor content. ${result.issues?.[0]?.message ?? ""}` : `Save failed: ${result.code ?? response.status}`);
        return null;
      }
      revisionRef.current = result.story.revision;
      setRevision(result.story.revision);
      setMessage(`Saved revision ${result.story.revision}`);
      if (!story) window.location.assign(`/newsroom/story/${result.story.id}`);
      return result.story.revision;
    } catch { setMessage("Save failed. Your draft remains in this browser; try again."); return null; }
    finally { inFlight.current = false; setBusy(false); }
  }

  useEffect(() => {
    if (!story || !["draft", "editorial_review", "ready_for_review"].includes(status)) return;
    if (firstRender.current) { firstRender.current = false; return; }
    const timer = window.setTimeout(() => { void save(form); }, 2500);
    return () => window.clearTimeout(timer);
    // Autosave follows the current form snapshot; save itself is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, story?.id, status]);

  async function transition(to: string) {
    if (!story || inFlight.current) return;
    const savedRevision = ["draft", "editorial_review", "ready_for_review"].includes(status) ? await save() : revisionRef.current;
    if (!savedRevision) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/newsroom/stories/${story.id}/transition`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedRevision: savedRevision, to, reason: reason.trim() || undefined }) });
      const result = await response.json();
      if (!response.ok) { setMessage(`Transition blocked: ${result.code ?? response.status}. Review sources, citations, claims and media rights.`); return; }
      revisionRef.current = result.story.revision; setRevision(result.story.revision); setStatus(result.story.status); setMessage(`Moved to ${result.story.status.replaceAll("_", " ")}.`);
    } catch { setMessage("Transition failed. Refresh the story status before retrying."); }
    finally { setBusy(false); }
  }

  async function schedule() {
    if (!story || actorRole !== "super_admin" || status !== "approved" || !scheduleLocal) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/newsroom/stories/${story.id}/schedule`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedRevision: revisionRef.current, scheduledAt: new Date(scheduleLocal).toISOString() }) });
      const result = await response.json();
      if (!response.ok) { setMessage(`Scheduling blocked: ${result.code ?? response.status}`); return; }
      revisionRef.current = result.story.revision; setRevision(result.story.revision); setStatus(result.story.status); setMessage("Scheduled for manual owner publication after the selected time.");
    } catch { setMessage("Scheduling failed. Verify the date and retry."); }
    finally { setBusy(false); }
  }

  async function publishCorrection() {
    if (!story || !["published", "updated"].includes(status) || actorRole !== "super_admin" || inFlight.current) return;
    if (reason.trim().length < 10) { setMessage("Describe the correction in at least 10 characters."); return; }
    inFlight.current = true; setBusy(true);
    try {
      const response = await fetch(`/api/newsroom/stories/${story.id}/correction`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedRevision: revisionRef.current, input: form, note: reason.trim() }) });
      const result = await response.json();
      if (!response.ok) { setMessage(`Correction blocked: ${result.code ?? response.status}`); return; }
      revisionRef.current = result.story.revision; setRevision(result.story.revision); setStatus(result.story.status); setMessage("Correction published with a visible notice and preserved history."); setReason("");
    } catch { setMessage("Correction failed. Your edits remain in this browser."); }
    finally { inFlight.current = false; setBusy(false); }
  }

  const qualityIssues = story ? checkStoryQuality({ ...story, ...form }) : [];
  const citableBlocks = form.document.content.map((node, index) => ({ node, index })).filter(({ node }) => node.type !== "heading");

  return <main className="newsroom-shell"><header className="newsroom-top"><div><p className="eyebrow"><Link href="/newsroom">Newsroom</Link> / {story ? "Story" : "New story"}</p><h1>{story ? "Edit story" : "Create a draft"}</h1><p>Status: <strong>{status.replaceAll("_", " ")}</strong> · Revision {revision}</p></div><Link href="/newsroom">Back to newsroom</Link></header><div className="newsroom-editor-grid"><section className="newsroom-panel" aria-label="Story editor"><div className="newsroom-fields"><label>Headline<input value={form.headline} disabled={!canWrite} onChange={(event) => update("headline", event.target.value)} maxLength={180} /></label><label>Slug<input value={form.slug} disabled={!canWrite} onChange={(event) => update("slug", event.target.value.toLowerCase())} pattern="[a-z0-9-]+" /></label><label>Standfirst<textarea value={form.standfirst} disabled={!canWrite} onChange={(event) => update("standfirst", event.target.value)} rows={3} maxLength={500} /></label><div className="newsroom-field-row"><label>Type<select value={form.type} disabled={!canWrite} onChange={(event) => update("type", event.target.value as StoryInput["type"])}><option value="news">News</option><option value="analysis">Analysis</option><option value="explainer">Explainer</option><option value="product_update">Product update</option><option value="opportunity">Opportunity</option><option value="research_report">Research/report</option></select></label><label>Category<select value={form.category} disabled={!canWrite} onChange={(event) => update("category", event.target.value)}>{categories.filter((item) => item.slug !== "latest").map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></label></div><label>Public byline<input value={form.authorName} disabled readOnly /></label></div><h2>Body</h2><div className="newsroom-toolbar" role="toolbar" aria-label="Formatting">{[["Bold", () => editor?.chain().focus().toggleBold().run()], ["Italic", () => editor?.chain().focus().toggleItalic().run()], ["H2", () => editor?.chain().focus().toggleHeading({ level: 2 }).run()], ["H3", () => editor?.chain().focus().toggleHeading({ level: 3 }).run()], ["Quote", () => editor?.chain().focus().toggleBlockquote().run()], ["Bullets", () => editor?.chain().focus().toggleBulletList().run()]].map(([label, action]) => <button key={label as string} type="button" disabled={!canWrite} onClick={action as () => void}>{label as string}</button>)}</div><EditorContent editor={editor} className="newsroom-tiptap" />
    <h2>Sources</h2><p className="newsroom-note">Use original, accessible sources. Each factual paragraph needs a linked source before owner review.</p><ol className="newsroom-source-list">{form.sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} — {source.title}</a> <small>{source.authority}</small></li>)}</ol>{canWrite && <div className="newsroom-field-row"><label>Publisher<input value={sourcePublisher} onChange={(event) => setSourcePublisher(event.target.value)} /></label><label>Source title<input value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} /></label><label>URL<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} /></label><button type="button" onClick={() => { if (!sourcePublisher.trim() || !sourceTitle.trim() || !URL.canParse(sourceUrl)) return; update("sources", [...form.sources, { id: crypto.randomUUID(), publisher: sourcePublisher.trim(), title: sourceTitle.trim(), url: sourceUrl.trim(), authority: "primary", accessState: "accessible", retrievedAt: new Date().toISOString() }]); setSourcePublisher(""); setSourceTitle(""); setSourceUrl(""); }}>Add source</button></div>}
    <h2>Citations</h2>{citableBlocks.length ? <div className="newsroom-citation-list">{citableBlocks.map(({ node, index }) => <label key={index}>Body block {index + 1}: {blockPreview(node)}<select disabled={!canWrite || !form.sources.length} value={form.citations.find((citation) => citation.blockIndex === index)?.sourceId ?? ""} onChange={(event) => update("citations", [...form.citations.filter((citation) => citation.blockIndex !== index), ...(event.target.value ? [{ blockIndex: index, sourceId: event.target.value }] : [])])}><option value="">No source selected</option>{form.sources.map((source) => <option key={source.id} value={source.id}>{source.publisher} — {source.title}</option>)}</select></label>)}</div> : <p>Add a body block to cite.</p>}
    <h2>Important claims</h2><ul>{form.claims.map((claim) => <li key={claim.id}><span>{claim.text}</span><div className="newsroom-field-row"><label>Verification<select disabled={!canWrite} value={claim.status} onChange={(event) => update("claims", form.claims.map((item) => item.id === claim.id ? { ...item, status: event.target.value as typeof claim.status } : item))}><option value="unverified">Unverified</option><option value="partially_verified">Partially verified</option><option value="verified">Verified</option><option value="contested">Contested</option><option value="unsupported">Unsupported</option></select></label><label>Evidence source<select disabled={!canWrite || !form.sources.length} value={claim.sourceIds[0] ?? ""} onChange={(event) => update("claims", form.claims.map((item) => item.id === claim.id ? { ...item, sourceIds: event.target.value ? [event.target.value] : [] } : item))}><option value="">No source</option>{form.sources.map((source) => <option key={source.id} value={source.id}>{source.publisher} — {source.title}</option>)}</select></label></div></li>)}</ul>{canWrite && <div className="newsroom-field-row"><label>Claim to verify<input value={claimText} onChange={(event) => setClaimText(event.target.value)} /></label><button type="button" onClick={() => { if (!claimText.trim()) return; update("claims", [...form.claims, { id: crypto.randomUUID(), text: claimText.trim(), status: "unverified", important: true, sourceIds: [] }]); setClaimText(""); }}>Add claim</button></div>}
    <div className="newsroom-actions">{canWrite && !["published", "updated"].includes(status) && <button type="button" className="newsroom-button" disabled={busy} onClick={() => void save()}>{story ? "Save now" : "Create draft"}</button>}{actorRole === "super_admin" && ["published", "updated"].includes(status) && <button type="button" className="newsroom-button" disabled={busy} onClick={() => void publishCorrection()}>Publish correction</button>}<p role="status">{message}</p></div></section><aside className="newsroom-panel newsroom-side"><h2>Quality gate</h2>{!story ? <p>Save a draft to run publication checks. A story needs a headline, standfirst, body, sources and citations before review.</p> : qualityIssues.length ? <ul>{qualityIssues.map((issue, index) => <li key={`${issue.code}-${index}`}>{issue.message}</li>)}</ul> : <p>No blocking issues in the current draft.</p>}<h2>Review path</h2><p>AI and collected material cannot approve or publish a story. The owner reviews the final source-backed version.</p>{story && <><div className="newsroom-actions">{status === "draft" && canWrite && <button onClick={() => void transition("editorial_review")} disabled={busy}>Send to editor</button>}{status === "editorial_review" && ["editor", "super_admin"].includes(actorRole) && <button onClick={() => void transition("ready_for_review")} disabled={busy}>Ready for owner</button>}{status === "ready_for_review" && actorRole === "super_admin" && <button onClick={() => void transition("owner_review")} disabled={busy}>Start owner review</button>}{status === "owner_review" && actorRole === "super_admin" && <button onClick={() => void transition("approved")} disabled={busy}>Approve</button>}{status === "approved" && actorRole === "super_admin" && <button onClick={() => void transition("published")} disabled={busy}>Publish</button>}{status === "approved" && actorRole === "super_admin" && <><label>Schedule in your local time<input type="datetime-local" value={scheduleLocal} onChange={(event) => setScheduleLocal(event.target.value)} /></label><button onClick={() => void schedule()} disabled={busy || !scheduleLocal}>Schedule</button></>}{status === "scheduled" && actorRole === "super_admin" && <button onClick={() => void transition("published")} disabled={busy}>Publish scheduled story</button>}</div><label>{["published", "updated"].includes(status) ? "Visible correction notice" : "Reason for hold, rejection or archive"}<textarea value={reason} onChange={(event) => setReason(event.target.value)} /></label><h2>Audit trail</h2><p><Link href={`/newsroom/story/${story.id}/history`}>Compare saved revisions</Link></p><ol className="newsroom-audit">{history.map((item, index) => <li key={index}><time dateTime={item.at}>{new Date(item.at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</time> — {item.action}{item.reason && `: ${item.reason}`}</li>)}</ol></>}</aside></div></main>;
}
