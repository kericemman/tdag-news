import { z } from "zod";
import { staffMutation, readJson, newsroomError } from "@/modules/newsroom/http";
import { addManualCandidate, getSource } from "@/modules/collector/store";

export async function POST(request: Request) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try {
    const body = z.object({ sourceId: z.uuid(), url: z.url(), title: z.string().trim().min(5).max(300) }).parse(await readJson(request));
    const source = await getSource(body.sourceId);
    if (!source) return Response.json({ code: "NOT_FOUND" }, { status: 404 });
    const candidate = await addManualCandidate(source, body.url, body.title, auth.actor);
    return Response.json({ candidate }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT" }, { status: 400 });
    return newsroomError(error);
  }
}
