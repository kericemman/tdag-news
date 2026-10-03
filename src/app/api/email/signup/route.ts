import { emailSchema, requestEmailSubscription } from "@/modules/email/store";
import { emailForSubscriber } from "@/modules/email/store";
import { sendConfirmation } from "@/modules/email/messages";
import { sameOrigin } from "@/modules/newsroom/security";
import { consumeLoginAttempt } from "@/modules/newsroom/store";

export async function POST(request: Request) {
  if (process.env.EMAIL_SIGNUP_OPEN !== "true") return new Response("Email subscriptions are closed", { status: 503 });
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL || !process.env.APP_URL || !process.env.EMAIL_TOKEN_SECRET) return new Response("Email subscriptions are unavailable", { status: 503 });
  if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 });
  if (!(request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded")) return new Response("Invalid request", { status: 415 });
  const raw = await request.text();
  if (raw.length > 4000) return new Response("Request too large", { status: 413 });
  const form = new URLSearchParams(raw);
  const destination = new URL("/?signup=check-email", request.url);
  if (form.get("website")) return Response.redirect(destination, 303);
  if (form.get("consent") !== "yes") return new Response("Consent is required", { status: 400 });
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return new Response("Enter a valid email address", { status: 400 });
  if (!await consumeLoginAttempt(`email-signup:${email.data}`)) return new Response("Try again later", { status: 429 });
  const result = await requestEmailSubscription(email.data);
  if (result.token && result.subscriberId) {
    const to = await emailForSubscriber(result.subscriberId);
    if (to) await sendConfirmation(result.subscriberId, to, result.token);
  }
  return Response.redirect(destination, 303);
}
