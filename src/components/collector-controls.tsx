"use client";

import { useState } from "react";
import type { CandidateRecord, SourceRecord } from "@/modules/collector/store";

async function post(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error((await response.json()).code ?? "REQUEST_FAILED");
  window.location.reload();
}

export function SourceControls({ source }: { source: SourceRecord }) {
  const [message, setMessage] = useState("");
  return <div><button type="button" onClick={() => void post(`/api/newsroom/sources/${source.id}/status`, { status: source.status === "active" ? "paused" : "active" }).catch((error) => setMessage(error.message))}>{source.status === "active" ? "Pause source" : "Activate source"}</button><p role="status">{message}</p></div>;
}

export function SourceForm() {
  const [message, setMessage] = useState("");
  async function submit(form: FormData) {
    try {
      await post("/api/newsroom/sources", { name: form.get("name"), url: form.get("url"), homepage: form.get("homepage"), type: form.get("type"), region: form.get("region"), topics: String(form.get("topics") ?? "").split(",").map((item) => item.trim()).filter(Boolean), authority: form.get("authority"), intervalMinutes: Number(form.get("intervalMinutes")), accessNotes: form.get("accessNotes") ?? "" });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add source"); }
  }
  return <form className="newsroom-fields newsroom-panel" action={submit}><h2>Propose a source</h2><label>Name<input name="name" required /></label><label>Feed or page URL<input name="url" type="url" required /></label><label>Homepage<input name="homepage" type="url" required /></label><div className="newsroom-field-row"><label>Type<select name="type"><option value="rss">RSS</option><option value="atom">Atom</option><option value="manual">Manual URL</option></select></label><label>Authority<select name="authority"><option value="primary">Primary</option><option value="trusted_secondary">Trusted secondary</option><option value="specialist_secondary">Specialist secondary</option></select></label></div><label>Region<input name="region" defaultValue="Global" required /></label><label>Topics, comma separated<input name="topics" /></label><label>Fetch interval, minutes<input name="intervalMinutes" type="number" min="15" max="10080" defaultValue="120" required /></label><label>Access and robots notes<textarea name="accessNotes" rows={3} /></label><button type="submit">Save proposal</button><p role="status">{message}</p></form>;
}

export function CandidateControls({ candidate, canReject }: { candidate: CandidateRecord; canReject: boolean }) {
  const [message, setMessage] = useState("");
  const [classifying, setClassifying] = useState(false);
  const action = (status: CandidateRecord["status"]) => void post(`/api/newsroom/candidates/${candidate.id}/status`, { expectedStatus: candidate.status, status }).catch((error) => setMessage(error.message));
  const classify = async () => { setClassifying(true); setMessage(""); try { await post(`/api/newsroom/candidates/${candidate.id}/classify`, {}); } catch (error) { setMessage(error instanceof Error && error.message === "AI_BUDGET_EXCEEDED" ? "The daily AI limit has been reached." : error instanceof Error && error.message === "AI_UNAVAILABLE" ? "AI triage is unavailable right now." : "AI triage failed."); setClassifying(false); } };
  return <div className="newsroom-actions"><button type="button" disabled={classifying} onClick={() => void classify()}>{classifying ? "Classifying…" : "AI triage"}</button>{candidate.status === "new" && <button type="button" onClick={() => action("triaged")}>Triage</button>}{["new", "triaged"].includes(candidate.status) && <button type="button" onClick={() => action("researching")}>Research</button>}{canReject && ["new", "triaged", "researching"].includes(candidate.status) && <><button type="button" onClick={() => action("ignored")}>Ignore</button><button type="button" onClick={() => action("rejected")}>Reject</button></>}<p role="status">{message}</p></div>;
}

export function ManualCandidateForm({ sources }: { sources: SourceRecord[] }) {
  const [message, setMessage] = useState("");
  async function submit(form: FormData) {
    try { await post("/api/newsroom/candidates/manual", { sourceId: form.get("sourceId"), url: form.get("url"), title: form.get("title") }); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not add lead"); }
  }
  if (!sources.length) return null;
  return <form className="newsroom-fields newsroom-panel" action={submit}><h2>Add a manual lead</h2><label>Approved source<select name="sourceId">{sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></label><label>Official URL<input name="url" type="url" required /></label><label>Source headline<input name="title" required minLength={5} /></label><button type="submit">Add to incoming</button><p role="status">{message}</p></form>;
}
