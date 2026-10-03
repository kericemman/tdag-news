import { redirect } from "next/navigation";
import { currentStaff } from "@/modules/newsroom/auth";

export const metadata = { title: "Newsroom sign in | TDAG News", robots: { index: false, follow: false } };

export default async function SignIn({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentStaff()) redirect("/newsroom");
  const { error } = await searchParams;
  return <main className="newsroom-signin"><div className="newsroom-panel"><p className="eyebrow">TDAG News</p><h1>Newsroom sign in</h1><p>For authorized editorial staff only.</p>{error && <p role="alert" className="form-error">{error === "rate" ? "Too many attempts. Try again later." : "Email or password is incorrect."}</p>}<form action="/api/newsroom/session" method="post"><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button type="submit">Sign in</button></form></div></main>;
}
