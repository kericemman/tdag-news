import { z } from "zod";
import { verifyResendWebhook } from "@/modules/email/provider";
import { recordEmailEvent } from "@/modules/email/store";

const eventSchema = z.object({ type: z.string(), data: z.object({ email_id: z.string(), to: z.array(z.email()).min(1) }) });

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 100_000) return new Response("Payload too large", { status: 413 });
  let event: unknown;
  try { event = verifyResendWebhook(raw, request.headers); } catch { return new Response("Invalid signature", { status: 401 }); }
  const parsed = eventSchema.safeParse(event);
  const eventId = request.headers.get("svix-id");
  if (!parsed.success || !eventId) return new Response("Invalid event", { status: 400 });
  await recordEmailEvent(eventId, parsed.data.type, parsed.data.data.email_id, parsed.data.data.to[0]);
  return new Response("ok");
}
