import { z } from "zod";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { correctStory } from "@/modules/newsroom/store";
import { storyInputSchema } from "@/modules/newsroom/story";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const body = z.object({ expectedRevision: z.number().int().positive(), note: z.string().trim().min(10).max(2000), input: storyInputSchema }).parse(await readJson(request));
    const story = await correctStory((await params).id, body.expectedRevision, body.input, body.note, auth.actor);
    return Response.json({ story }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
    return newsroomError(error);
  }
}
