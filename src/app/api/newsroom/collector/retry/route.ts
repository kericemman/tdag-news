import { z } from "zod";
import { readJson, newsroomError, staffMutation } from "@/modules/newsroom/http";
import { retryCollectorJob } from "@/modules/collector/operations";

const schema = z.object({ queue: z.enum(["source-fetch", "candidate-cluster"]), id: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  if (!["super_admin", "editor"].includes(auth.actor.role)) return Response.json({ code: "FORBIDDEN" }, { status: 403 });
  try {
    const input = schema.parse(await readJson(request));
    await retryCollectorJob(input.queue, input.id);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
    return newsroomError(error);
  }
}
