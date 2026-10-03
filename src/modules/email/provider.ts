import { Resend } from "resend";
import type { EmailProvider } from "@/modules/providers/contracts";

export class ResendEmailProvider implements EmailProvider {
  private client: Resend;
  constructor(apiKey: string, private from: string) { this.client = new Resend(apiKey); }

  async send(message: { to: string; subject: string; html: string; idempotencyKey: string }): Promise<{ providerMessageId: string }> {
    const { data, error } = await this.client.emails.send({ from: this.from, to: [message.to], subject: message.subject, html: message.html }, { idempotencyKey: message.idempotencyKey });
    if (error || !data?.id) throw new Error(`Resend send failed: ${error?.name ?? "unknown"}`);
    return { providerMessageId: data.id };
  }
}

export function emailProvider(): ResendEmailProvider {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Email provider is not configured");
  return new ResendEmailProvider(apiKey, from);
}

export function verifyResendWebhook(payload: string, headers: Headers): unknown {
  const key = process.env.RESEND_API_KEY;
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!key || !secret) throw new Error("Webhook is not configured");
  return new Resend(key).webhooks.verify({ payload, headers: {
    id: headers.get("svix-id") ?? "", timestamp: headers.get("svix-timestamp") ?? "", signature: headers.get("svix-signature") ?? "",
  }, webhookSecret: secret });
}
