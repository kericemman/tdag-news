export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <main className="site-shell"><h1>Confirm your email subscription</h1><p>Confirm your request to receive the free TDAG News email briefing.</p><form method="post" action="/api/email/confirm"><input type="hidden" name="token" value={token ?? ""} /><button type="submit">Confirm subscription</button></form></main>;
}
