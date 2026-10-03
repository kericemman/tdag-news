import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";

export const metadata = { title: "Editorial access | TDAG News", robots: { index: false, follow: false, noarchive: true } };

export default async function SignIn({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentStaff()) redirect("/newsroom");
  const { error } = await searchParams;
  return <main className="admin-login"><section className="admin-login-story"><div className="admin-login-brand"><span className="admin-brand-mark" aria-hidden="true">A</span><span><strong>TDAG NEWS</strong><small>EDITORIAL STUDIO</small></span></div><div><p className="eyebrow">PRIVATE WORKSPACE</p><h1>Journalism starts<br />with judgment.</h1><p>Research, edit and publish with a clear record of every decision.</p></div><div className="admin-login-foot"><span>TDAG News · The Digital A-Game</span><span>Secure staff access</span></div></section><section className="admin-login-form-wrap"><div className="admin-login-card"><p className="eyebrow">WELCOME BACK</p><h2>Sign in to the newsroom</h2><p>Use your staff credentials to continue.</p>{error && <p role="alert" className="form-error">{error === "rate" ? "Too many attempts. Please try again later." : "Email or password is incorrect."}</p>}<form action="/api/newsroom/session" method="post"><label htmlFor="staff-email">Email address</label><input id="staff-email" name="email" type="email" autoComplete="username" maxLength={254} required /><label htmlFor="staff-password">Password</label><input id="staff-password" name="password" type="password" autoComplete="current-password" maxLength={1024} required /><button type="submit">Sign in <span aria-hidden="true">→</span></button></form><p className="admin-login-help">Access is limited to authorized editorial staff.</p></div></section></main>;
}
