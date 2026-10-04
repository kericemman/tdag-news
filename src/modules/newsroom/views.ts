import { editorialStatusSchema, type EditorialStatus } from "@/modules/editorial/contracts";

export const storyViews = [
  { key: "all", label: "All stories", statuses: [] },
  { key: "drafts", label: "Drafts", statuses: ["draft"] },
  { key: "review", label: "In review", statuses: ["editorial_review", "ready_for_review", "owner_review", "approved"] },
  { key: "scheduled", label: "Scheduled", statuses: ["scheduled"] },
  { key: "published", label: "Published", statuses: ["published", "updated"] },
] as const satisfies ReadonlyArray<{ key: string; label: string; statuses: readonly EditorialStatus[] }>;

export type StoryView = (typeof storyViews)[number];

export function resolveStoryView(view?: string, status?: string): { key: string; label: string; statuses: EditorialStatus[] } {
  const selected = storyViews.find((item) => item.key === view);
  if (selected) return { key: selected.key, label: selected.label, statuses: [...selected.statuses] };
  const legacy = editorialStatusSchema.safeParse(status);
  if (legacy.success) return { key: `status:${legacy.data}`, label: legacy.data.replaceAll("_", " "), statuses: [legacy.data] };
  return { key: "all", label: "All stories", statuses: [] };
}

export function countStoryView(counts: Partial<Record<EditorialStatus, number>>, statuses: readonly EditorialStatus[]): number {
  return statuses.length ? statuses.reduce((sum, status) => sum + (counts[status] ?? 0), 0) : Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0);
}
