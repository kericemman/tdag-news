import { verifyOpportunity } from "@/modules/collector/opportunities";
import { newsroomError, staffMutation } from "@/modules/newsroom/http";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try { await verifyOpportunity((await params).id, auth.actor); return Response.json({ ok: true }); }
  catch (error) { return newsroomError(error); }
}
