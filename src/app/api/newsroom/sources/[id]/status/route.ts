import { z } from "zod";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { setSourceStatus } from "@/modules/collector/store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const { status } = z.object({ status: z.enum(["active", "paused"]) }).parse(await readJson(request));
    await setSourceStatus((await params).id, status, auth.actor);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
    return newsroomError(error);
  }
}
