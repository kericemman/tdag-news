"use client";

import { useState } from "react";

export function EmbedCandidateButton({ candidateId }: { candidateId: string }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function enqueue() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/newsroom/candidates/${candidateId}/embed`, { method: "POST" });
      if (!response.ok) throw new Error("QUEUE_UNAVAILABLE");
      setMessage("Embedding queued. Refresh this page after the worker finishes.");
    } catch { setMessage("Embedding could not be queued. Check the worker and Redis connection."); }
    finally { setPending(false); }
  }
  return <div><button className="newsroom-button" type="button" disabled={pending} onClick={() => void enqueue()}>{pending ? "Queuing…" : "Build similarity index"}</button><p role="status" className="newsroom-note">{message}</p></div>;
}
