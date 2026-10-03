import { staffMutation } from "@/modules/newsroom/http";
import { enqueueCandidateEmbedding } from "@/modules/ai/queue";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const result = await enqueueCandidateEmbedding((await params).id, auth.actor);
    return Response.json(result, { status: 202, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    if (code === "FORBIDDEN") return Response.json({ code }, { status: 403 });
    if (code === "NOT_FOUND") return Response.json({ code }, { status: 404 });
    return Response.json({ code: "QUEUE_UNAVAILABLE" }, { status: 503 });
  }
}
