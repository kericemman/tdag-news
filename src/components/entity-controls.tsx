"use client";

import { useState } from "react";

export function EntityForm() {
  const [message, setMessage] = useState("");
  async function submit(form: FormData) {
    const body = { kind: form.get("kind"), name: form.get("name"), aliases: String(form.get("aliases") ?? "").split(",").map((item) => item.trim()).filter(Boolean), officialUrl: form.get("officialUrl") || undefined, provenanceUrl: form.get("provenanceUrl"), notes: form.get("notes") ?? "" };
    const response = await fetch("/api/newsroom/entities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (response.ok) window.location.reload(); else setMessage("Could not save this entity. Check its fields or an existing record.");
  }
  return <form className="newsroom-fields newsroom-panel" action={submit}><h2>Propose an entity</h2><label>Type<select name="kind"><option value="company">Company</option><option value="person">Person</option><option value="product">Product</option><option value="technology">Technology</option><option value="organization">Organization</option><option value="regulator">Regulator</option><option value="country">Country</option><option value="industry">Industry</option></select></label><label>Name<input name="name" required minLength={2} /></label><label>Aliases, comma separated<input name="aliases" /></label><label>Official website, if known<input name="officialUrl" type="url" /></label><label>Provenance URL<input name="provenanceUrl" type="url" required /></label><label>Notes<textarea name="notes" rows={3} /></label><button type="submit">Save proposal</button><p role="status">{message}</p></form>;
}

export function VerifyEntity({ id }: { id: string }) {
  const [message, setMessage] = useState("");
  async function verify() {
    const response = await fetch(`/api/newsroom/entities/${id}/verify`, { method: "POST" });
    if (response.ok) window.location.reload(); else setMessage("Could not verify this entity.");
  }
  return <div><button type="button" onClick={() => void verify()}>Mark verified</button><p role="status">{message}</p></div>;
}
