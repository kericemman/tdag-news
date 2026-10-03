import { z } from "zod";
import { currentStaff } from "@/modules/newsroom/auth";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { getNewsroomStory, listStoryHistory, saveStory } from "@/modules/newsroom/store";
import { storyInputSchema } from "@/modules/newsroom/story";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const actor = await currentStaff();
  if (!actor) return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const story = await getNewsroomStory(id);
  if (!story) return Response.json({ code: "NOT_FOUND" }, { status: 404 });
  const history = await listStoryHistory(id);
  return Response.json({ story, history: { revisions: history.revisions.map(({ revision, actorId, at }) => ({ revision, actorId, at })), audit: history.audit } }, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request, { params }: Context) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const data = z.object({ expectedRevision: z.number().int().positive(), input: storyInputSchema }).parse(await readJson(request));
    const story = await saveStory((await params).id, data.expectedRevision, data.input, auth.actor);
    return Response.json({ story }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT", issues: error.issues.map((issue) => ({ path: issue.path, message: issue.message })) }, { status: 400 });
    return newsroomError(error);
  }
}
