import { z } from "zod";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { scheduleStory } from "@/modules/newsroom/store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const body = z.object({ expectedRevision: z.number().int().positive(), scheduledAt: z.iso.datetime({ offset: true }) }).parse(await readJson(request));
    const story = await scheduleStory((await params).id, body.expectedRevision, body.scheduledAt, auth.actor);
    return Response.json({ story }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
    return newsroomError(error);
  }
}
