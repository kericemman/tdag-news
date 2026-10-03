import { NextResponse } from "next/server";
import { z } from "zod";
import { staffCookieName } from "@/modules/newsroom/auth";
import { newSessionToken, sameOrigin, verifyPassword } from "@/modules/newsroom/security";
import { clearLoginAttempts, consumeLoginAttempt, createStaffSession, getStaffByEmail, recordSecurityEvent, revokeStaffSession, staffForSession } from "@/modules/newsroom/store";

export const dynamic = "force-dynamic";

const loginSchema = z.object({ email: z.email().max(254), password: z.string().min(1).max(1024) });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 });
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/x-www-form-urlencoded")) return new Response("Invalid request", { status: 415 });
  const form = await request.formData();
  const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  const failure = () => NextResponse.redirect(new URL("/newsroom/sign-in?error=credentials", request.url), { status: 303 });
  if (!parsed.success) return failure();
  const email = parsed.data.email.toLowerCase().trim();
  const key = email;
  if (!await consumeLoginAttempt(key)) return NextResponse.redirect(new URL("/newsroom/sign-in?error=rate", request.url), { status: 303 });
  const user = await getStaffByEmail(email);
  if (!user?.active || !await verifyPassword(parsed.data.password, user.passwordHash)) { await recordSecurityEvent(email, "login_failure", user?.id); return failure(); }
  await clearLoginAttempts(key);
  const token = newSessionToken();
  await createStaffSession(user.id, token);
  await recordSecurityEvent(email, "login_success", user.id);
  const response = NextResponse.redirect(new URL("/newsroom", request.url), { status: 303 });
  response.cookies.set(staffCookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 12 * 60 * 60 });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return new Response("Invalid origin", { status: 403 });
  const token = request.headers.get("cookie")?.match(new RegExp(`(?:^|; )${staffCookieName}=([^;]+)`))?.[1];
  if (token) {
    const actor = await staffForSession(token);
    await revokeStaffSession(token);
    if (actor) await recordSecurityEvent("", "logout", actor.id);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(staffCookieName);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
