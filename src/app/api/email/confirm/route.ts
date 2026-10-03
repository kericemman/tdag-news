import { confirmEmailSubscription } from "@/modules/email/store";
import { sendWelcome } from "@/modules/email/messages";
import { sameOrigin } from "@/modules/newsroom/security";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 });
  const raw = await request.text();
  if (raw.length > 1000) return new Response("Invalid request", { status: 413 });
  const token = new URLSearchParams(raw).get("token") ?? "";
  const subscriber = await confirmEmailSubscription(token);
  if (!subscriber) return new Response("This confirmation link is invalid or expired", { status: 400 });
  await sendWelcome(subscriber.id, subscriber.email);
  return Response.redirect(new URL("/email/confirmed", request.url), 303);
}
