import type { EditorialStatus } from "./contracts";

export type EditorialActor = "researcher" | "writer" | "editor" | "owner";

const transitions: Partial<Record<EditorialStatus, Partial<Record<EditorialStatus, EditorialActor[]>>>> = {
  idea: { candidate: ["researcher", "writer", "editor", "owner"], archived: ["editor", "owner"] },
  candidate: { researching: ["researcher", "editor", "owner"], draft: ["writer", "editor", "owner"], rejected: ["editor", "owner"] },
  researching: { draft: ["writer", "editor", "owner"], hold: ["editor", "owner"] },
  draft: { editorial_review: ["writer", "editor", "owner"], hold: ["editor", "owner"] },
  editorial_review: { draft: ["editor", "owner"], ready_for_review: ["editor", "owner"], hold: ["editor", "owner"] },
  ready_for_review: { owner_review: ["owner"], editorial_review: ["editor", "owner"] },
  owner_review: { approved: ["owner"], editorial_review: ["owner"], hold: ["owner"], rejected: ["owner"] },
  approved: { scheduled: ["owner"], published: ["owner"], hold: ["owner"] },
  scheduled: { published: ["owner"], hold: ["owner"] },
  published: { updated: ["owner"], archived: ["owner"] },
  updated: { published: ["owner"], archived: ["owner"] },
  hold: { editorial_review: ["editor", "owner"], rejected: ["owner"] },
};

export function mayTransition(from: EditorialStatus, to: EditorialStatus, actor: EditorialActor): boolean {
  return transitions[from]?.[to]?.includes(actor) ?? false;
}

export function assertTransition(from: EditorialStatus, to: EditorialStatus, actor: EditorialActor): void {
  if (!mayTransition(from, to, actor)) throw new Error(`Editorial transition denied: ${from} → ${to}`);
}
