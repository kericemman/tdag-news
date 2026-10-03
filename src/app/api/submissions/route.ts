import { submissionInputSchema, createSubmission } from "@/modules/newsroom/submission";
import { sameOrigin } from "@/modules/newsroom/security";
import { consumeLoginAttempt } from "@/modules/newsroom/store";

export async function POST(request: Request) {
  if (process.env.SUBMISSIONS_OPEN !== "true") return new Response("Submissions are closed", { status: 503 });
  if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 });
  if (!(request.headers.get("content-type") ?? "").includes("application/x-www-form-urlencoded")) return new Response("Invalid request", { status: 415 });
  const raw = await request.text();
  if (raw.length > 20_000) return new Response("Submission too large", { status: 413 });
  const form = new URLSearchParams(raw);
  if (form.get("website")) return Response.redirect(new URL("/submit?sent=1", request.url), 303);
  const embargoValue = form.get("embargoAt");
  if (embargoValue && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(embargoValue)) return new Response("Invalid embargo time", { status: 400 });
  const embargoDate = embargoValue ? new Date(`${embargoValue}:00+03:00`) : null;
  if (embargoDate && !Number.isFinite(embargoDate.getTime())) return new Response("Invalid embargo time", { status: 400 });
  const parsed = submissionInputSchema.safeParse({ name: form.get("name"), email: form.get("email"), organization: form.get("organization") || undefined,
    storyType: form.get("storyType"), headline: form.get("headline"), description: form.get("description"),
    supportingUrls: form.getAll("supportingUrl").filter(Boolean), embargoAt: embargoDate?.toISOString(),
    notes: form.get("notes") || undefined });
  if (!parsed.success) return new Response("Please review the required fields and URLs", { status: 400 });
  if (!await consumeLoginAttempt(`submission:${parsed.data.email.toLowerCase()}`)) return new Response("Please try again later", { status: 429 });
  await createSubmission(parsed.data);
  return Response.redirect(new URL("/submit?sent=1", request.url), 303);
}
