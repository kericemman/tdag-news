import { unsubscribeEmail } from "@/modules/email/store";
import { sameOrigin } from "@/modules/newsroom/security";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 });
  const raw = await request.text();
  if (raw.length > 1000) return new Response("Invalid request", { status: 413 });
  await unsubscribeEmail(new URLSearchParams(raw).get("token") ?? "");
  return Response.redirect(new URL("/email/unsubscribed", request.url), 303);
}
