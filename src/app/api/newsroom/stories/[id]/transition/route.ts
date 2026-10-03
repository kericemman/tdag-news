import { z } from "zod";
import { editorialStatusSchema } from "@/modules/editorial/contracts";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { transitionStory } from "@/modules/newsroom/store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const body = z.object({ expectedRevision: z.number().int().positive(), to: editorialStatusSchema, reason: z.string().trim().max(1000).optional() }).parse(await readJson(request));
    const story = await transitionStory((await params).id, body.expectedRevision, body.to, auth.actor, body.reason);
    return Response.json({ story }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
    return newsroomError(error);
  }
}
