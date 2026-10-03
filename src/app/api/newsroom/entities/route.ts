import { z } from "zod";
import { entityInputSchema, proposeEntity } from "@/modules/collector/entities";
import { readJson, newsroomError, staffMutation } from "@/modules/newsroom/http";

export async function POST(request: Request) {
  const auth = await staffMutation(request);
  if (auth.error) return auth.error;
  try { return Response.json(await proposeEntity(entityInputSchema.parse(await readJson(request)), auth.actor), { status: 201 }); }
  catch (error) { if (error instanceof z.ZodError) return Response.json({ code: "INVALID_INPUT" }, { status: 400 }); return newsroomError(error); }
}
