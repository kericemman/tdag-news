import { z } from "zod";
import { currentStaff } from "@/modules/newsroom/auth";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { addSource, listSources, sourceInputSchema } from "@/modules/collector/store";

export async function GET() {
  const actor = await currentStaff();
  if (!actor) return Response.json({ code: "UNAUTHORIZED" }, { status: 401 });
  return Response.json({ sources: await listSources() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const input = sourceInputSchema.parse(await readJson(request));
    const source = await addSource(input, auth.actor);
    return Response.json({ source }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT", issues: error.issues }, { status: 400 });
    return newsroomError(error);
  }
}
