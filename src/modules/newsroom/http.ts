import { currentStaff } from "./auth";
import { sameOrigin } from "./security";

export async function staffMutation(request: Request) {
  if (!sameOrigin(request)) return { error: Response.json({ code: "BAD_ORIGIN" }, { status: 403 }) };
  const actor = await currentStaff();
  if (!actor?.active) return { error: Response.json({ code: "UNAUTHORIZED" }, { status: 401 }) };
  return { actor };
}

export async function readJson(request: Request): Promise<unknown> {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) throw new Error("INVALID_CONTENT_TYPE");
  const body = await request.text();
  if (body.length > 1_000_000) throw new Error("PAYLOAD_TOO_LARGE");
  return JSON.parse(body);
}

export function newsroomError(error: unknown): Response {
  const code = error instanceof Error ? error.message : "UNKNOWN";
  const status = code === "NOT_FOUND" ? 404 : code === "REVISION_CONFLICT" || code === "NOT_FOUND_OR_EXPIRED" ? 409 : code === "FORBIDDEN" ? 403 : code === "QUALITY_GATE" || code === "STATUS_LOCKED" || code === "REASON_REQUIRED" || code === "EMBARGO_ACTIVE" || code === "SLUG_LOCKED" || code === "INVALID_SCHEDULE" || code === "INVALID_STATUS" || code === "INVALID_DEADLINE" ? 422 : code === "PAYLOAD_TOO_LARGE" ? 413 : code === "INVALID_CONTENT_TYPE" ? 415 : 400;
  if (status === 400 && code !== "UNKNOWN") return Response.json({ code: "INVALID_INPUT" }, { status });
  return Response.json({ code }, { status });
}
