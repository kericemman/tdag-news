import { z } from "zod";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { setSubmissionStatus } from "@/modules/newsroom/submission";

const status = z.enum(["new", "reviewing", "accepted", "rejected"]);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const body = z.object({ expectedStatus: status, status, reason: z.string().max(1000).default("") }).parse(await readJson(request));
    await setSubmissionStatus((await params).id, body.expectedStatus, body.status, body.reason, auth.actor);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
    return newsroomError(error);
  }
}
