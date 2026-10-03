"use client";

import { useState } from "react";

export function OpportunityForm() {
  const [message, setMessage] = useState("");
  async function submit(form: FormData) {
    const deadline = String(form.get("deadlineAt") ?? "");
    const deadlineAt = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deadline) ? new Date(`${deadline}:00+03:00`).toISOString() : "";
    const body = { title: form.get("title"), kind: form.get("kind"), officialUrl: form.get("officialUrl"), eligibility: form.get("eligibility"), location: form.get("location"), deadlineAt, fee: form.get("fee") || "Not stated", funding: form.get("funding") || "Not stated", notes: form.get("notes") || "" };
    const response = await fetch("/api/newsroom/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) window.location.reload(); else setMessage("Could not save this opportunity. Check the deadline and official URL.");
  }
  return <form className="newsroom-fields newsroom-panel" action={submit}><h2>Propose an opportunity</h2><label>Title<input name="title" required minLength={8} /></label><label>Type<select name="kind"><option value="grant">Grant</option><option value="job">Job</option><option value="fellowship">Fellowship</option><option value="accelerator">Accelerator</option><option value="competition">Competition</option><option value="event">Event</option><option value="other">Other</option></select></label><label>Official page<input name="officialUrl" type="url" required /></label><label>Eligibility<textarea name="eligibility" required minLength={10} rows={3} /></label><label>Location<input name="location" required /></label><label>Deadline, Nairobi time<input name="deadlineAt" type="datetime-local" required /></label><label>Fee<input name="fee" placeholder="Not stated" /></label><label>Funding<input name="funding" placeholder="Not stated" /></label><label>Notes<textarea name="notes" rows={3} /></label><button type="submit">Save proposal</button><p role="status">{message}</p></form>;
}

export function VerifyOpportunity({ id }: { id: string }) {
  const [message, setMessage] = useState("");
  async function verify() {
    const response = await fetch(`/api/newsroom/opportunities/${id}/verify`, { method: "POST" });
    if (response.ok) window.location.reload(); else setMessage("Could not verify this opportunity. Check its deadline.");
  }
  return <div><button type="button" onClick={() => void verify()}>Mark official page checked</button><p role="status">{message}</p></div>;
}
