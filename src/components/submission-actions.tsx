"use client";

import { useState } from "react";

export function SubmissionActions({ id, status }: { id: string; status: "new" | "reviewing" | "accepted" | "rejected" }) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function change(next: "reviewing" | "accepted" | "rejected") {
    setBusy(true);
    try {
      const response = await fetch(`/api/newsroom/submissions/${id}/status`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ expectedStatus: status, status: next, reason }) });
      if (!response.ok) { setMessage("Could not update this submission. Refresh and try again."); return; }
      window.location.reload();
    } catch { setMessage("Network error. Try again."); }
    finally { setBusy(false); }
  }
  return <div className="newsroom-submission-actions"><label>Review note<input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} /></label><div className="newsroom-actions">{status === "new" && <button disabled={busy} onClick={() => void change("reviewing")}>Start review</button>}{status === "reviewing" && <><button disabled={busy} onClick={() => void change("accepted")}>Accept lead</button><button disabled={busy || reason.trim().length < 5} onClick={() => void change("rejected")}>Reject with reason</button></>}</div><p role="status">{message}</p></div>;
}
