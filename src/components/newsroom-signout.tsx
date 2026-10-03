"use client";

export function NewsroomSignOut() {
  return <button type="button" onClick={async () => { const response = await fetch("/api/newsroom/session", { method: "DELETE" }); if (response.ok) window.location.assign("/newsroom/sign-in"); }}>Sign out</button>;
}
