import { staffMutation } from "@/modules/newsroom/http";
import { createClusterResearch } from "@/modules/ai/research";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  const id = (await params).id;
  try {
    await createClusterResearch(id, auth.actor);
    return Response.redirect(new URL(`/newsroom/clusters/${encodeURIComponent(id)}?research=ready`, request.url), 303);
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "FORBIDDEN") return Response.json({ code }, { status: 403 });
    if (code === "NOT_FOUND") return Response.json({ code }, { status: 404 });
    if (code === "NO_SOURCE_LEADS") return Response.json({ code }, { status: 422 });
    const reason = code === "AI_BUDGET_EXCEEDED" ? "limit" : code === "Missing required configuration: OPENAI_API_KEY" ? "unavailable" : "failed";
    return Response.redirect(new URL(`/newsroom/clusters/${encodeURIComponent(id)}?research=${reason}`, request.url), 303);
  }
}
