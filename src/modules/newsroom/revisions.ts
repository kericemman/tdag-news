import type { StoryRecord } from "./story";

export function revisionChanges(previous: StoryRecord | undefined, current: StoryRecord): string[] {
  if (!previous) return ["Story created"];
  const changes: string[] = [];
  for (const field of ["headline", "slug", "standfirst", "type", "category", "authorName", "status", "publishedAt", "scheduledAt", "correction"] as const) {
    if (JSON.stringify(previous[field]) !== JSON.stringify(current[field])) changes.push(field.replaceAll(/([A-Z])/g, " $1").toLowerCase());
  }
  if (JSON.stringify(previous.document) !== JSON.stringify(current.document)) changes.push("body");
  if (JSON.stringify(previous.sources) !== JSON.stringify(current.sources)) changes.push("sources");
  if (JSON.stringify(previous.citations) !== JSON.stringify(current.citations)) changes.push("citations");
  if (JSON.stringify(previous.claims) !== JSON.stringify(current.claims)) changes.push("claims");
  if (JSON.stringify(previous.hero) !== JSON.stringify(current.hero)) changes.push("hero media");
  return changes;
}
