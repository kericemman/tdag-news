import { staffMutation } from "@/modules/newsroom/http";
import { classifyCandidate } from "@/modules/ai/classification";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    await classifyCandidate((await params).id, auth.actor);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "FORBIDDEN") return Response.json({ code }, { status: 403 });
    if (code === "NOT_FOUND") return Response.json({ code }, { status: 404 });
    if (code === "AI_BUDGET_EXCEEDED") return Response.json({ code }, { status: 429 });
    if (code === "AI_INPUT_TOO_LARGE") return Response.json({ code }, { status: 413 });
    if (code === "Missing required configuration: OPENAI_API_KEY") return Response.json({ code: "AI_UNAVAILABLE" }, { status: 503 });
    return Response.json({ code: "AI_UNAVAILABLE" }, { status: 503 });
  }
}
