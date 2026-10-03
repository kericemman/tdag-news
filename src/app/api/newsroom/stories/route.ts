import { z } from "zod";
import { currentStaff } from "@/modules/newsroom/auth";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { canEdit } from "@/modules/newsroom/policy";
import { createStory, listNewsroomStories } from "@/modules/newsroom/store";
import { storyInputSchema } from "@/modules/newsroom/story";

export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await currentStaff();
  if (!actor) return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });
  const stories = await listNewsroomStories();
  return Response.json({ stories: stories.map(({ id, slug, headline, status, revision, updatedAt, category }) => ({ id, slug, headline, status, revision, updatedAt, category })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  if (!canEdit(auth.actor.role)) return Response.json({ code: "FORBIDDEN" }, { status: 403 });
  try {
    const input = storyInputSchema.parse(await readJson(request));
    const story = await createStory(input, auth.actor);
    return Response.json({ story }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT", issues: error.issues.map((issue) => ({ path: issue.path, message: issue.message })) }, { status: 400 });
    return newsroomError(error);
  }
}
