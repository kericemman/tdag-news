import type { EditorialStatus } from "@/modules/editorial/contracts";
import { mayTransition } from "@/modules/editorial/workflow";

export type StaffRole = "super_admin" | "editor" | "writer" | "researcher" | "distribution_manager" | "analyst";
export type StaffActor = { id: string; name: string; role: StaffRole; active: boolean };

export function canEdit(role: StaffRole): boolean {
  return role === "super_admin" || role === "editor" || role === "writer";
}

export function canViewNewsroom(role: StaffRole): boolean {
  return ["super_admin", "editor", "writer", "researcher", "distribution_manager", "analyst"].includes(role);
}

export function canTransition(role: StaffRole, from: EditorialStatus, to: EditorialStatus): boolean {
  const actor = role === "super_admin" ? "owner" : role === "editor" ? "editor" : role === "writer" ? "writer" : role === "researcher" ? "researcher" : null;
  return actor ? mayTransition(from, to, actor) : false;
}

export function requiresQualityGate(to: EditorialStatus): boolean {
  return ["ready_for_review", "owner_review", "approved", "scheduled", "published", "updated"].includes(to);
}
