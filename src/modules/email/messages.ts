import { emailProvider } from "@/modules/email/provider";
import { deliveryFinished, deliveryStarted, unsubscribeToken } from "@/modules/email/store";

function siteUrl(path: string): string {
  const base = process.env.APP_URL;
  if (!base) throw new Error("APP_URL is required for email links");
  return new URL(path, base).toString();
}

async function send(id: string, to: string, kind: "confirmation" | "welcome", subject: string, html: string, key: string) {
  await deliveryStarted(id, kind, key);
  try {
    const result = await emailProvider().send({ to, subject, html, idempotencyKey: key });
    await deliveryFinished(key, result.providerMessageId);
  } catch (error) {
    await deliveryFinished(key, undefined, error instanceof Error ? error.message : "Unknown delivery error");
    throw error;
  }
}

export async function sendConfirmation(id: string, to: string, token: string) {
  const link = siteUrl(`/email/confirm?token=${encodeURIComponent(token)}`);
  await send(id, to, "confirmation", "Confirm your TDAG News email subscription", `<p>Confirm your request to receive the free TDAG News email briefing.</p><p><a href="${link}">Confirm subscription</a></p><p>This link expires in 24 hours. If you did not request this, ignore this message.</p>`, `confirm:${id}:${token.slice(0, 16)}`);
}

export async function sendWelcome(id: string, to: string) {
  const link = siteUrl(`/email/unsubscribe?token=${encodeURIComponent(unsubscribeToken(id))}`);
  await send(id, to, "welcome", "Welcome to TDAG News", `<p>Your free TDAG News email subscription is confirmed.</p><p>You can <a href="${link}">unsubscribe at any time</a>.</p>`, `welcome:${id}`);
}
