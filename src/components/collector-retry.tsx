"use client";

import { useState } from "react";

export function CollectorRetry({ queue, id }: { queue: "source-fetch" | "candidate-cluster" | "candidate-embed"; id: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function retry() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/newsroom/collector/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ queue, id }) });
      if (!response.ok) throw new Error("Could not retry this job");
      window.location.reload();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not retry this job"); setBusy(false); }
  }
  return <><button type="button" disabled={busy} onClick={() => void retry()}>Retry job</button><span role="status">{message}</span></>;
}
